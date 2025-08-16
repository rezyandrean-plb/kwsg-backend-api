const knex = require('knex');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Database configuration - using the live database with postgres database name
const dbConfig = {
  client: 'postgresql',
  connection: {
    host: 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com',
    port: 5432,
    user: 'postgres',
    password: 'kwpostgres',
    database: 'postgres',
    ssl: {
      rejectUnauthorized: false
    }
  },
};

const db = knex(dbConfig);

// Function to read CSV file
function readCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// Function to map CSV data to database schema
function mapCSVToImageGallery(csvData) {
  return csvData.map((row, index) => {
    // Handle the specific CSV format: projectId, projectName, image_url
    const projectName = row.projectName || row['projectName'] || '';
    const imageUrl = row.image_url || row['image_url'] || '';
    const projectId = row.projectId || row['projectId'] || '';
    
    // Generate image title from URL if not provided
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1] || 'Image';
    const imageTitle = fileName.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '').replace(/[_-]/g, ' ');
    
    // Determine image category based on URL path or filename
    let imageCategory = 'general';
    const urlLower = imageUrl.toLowerCase();
    if (urlLower.includes('exterior') || urlLower.includes('facade') || urlLower.includes('building')) {
      imageCategory = 'exterior';
    } else if (urlLower.includes('interior') || urlLower.includes('living') || urlLower.includes('bedroom') || urlLower.includes('kitchen')) {
      imageCategory = 'interior';
    } else if (urlLower.includes('pool') || urlLower.includes('gym') || urlLower.includes('amenity') || urlLower.includes('facility')) {
      imageCategory = 'amenities';
    } else if (urlLower.includes('aerial') || urlLower.includes('drone') || urlLower.includes('overview')) {
      imageCategory = 'aerial';
    }

    return {
      project_name: projectName,
      image_title: imageTitle,
      image_url: imageUrl,
      image_description: `Image for ${projectName}`,
      image_category: imageCategory,
      display_order: index + 1, // Use row order as display order
      is_featured: false, // Default to false
      alt_text: `${imageTitle} - ${projectName}`,
      image_size: '', // Will be empty as not provided in CSV
      is_active: true
    };
  }).filter(item => {
    // Filter out rows with missing required fields
    return item.project_name && item.image_url;
  });
}

// Function to validate data
function validateImageGalleryData(data) {
  const errors = [];
  
  data.forEach((item, index) => {
    if (!item.project_name) {
      errors.push(`Row ${index + 1}: Missing projectName`);
    }
    if (!item.image_url) {
      errors.push(`Row ${index + 1}: Missing image_url`);
    }
    
    // Validate URL format
    if (item.image_url && !item.image_url.startsWith('http')) {
      errors.push(`Row ${index + 1}: image_url should be a valid URL starting with http/https`);
    }
  });
  
  return errors;
}

async function importImageGalleryFromCSV(csvFilePath) {
  try {
    console.log('Starting image gallery CSV import...');
    
    // Check if CSV file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`CSV file not found: ${csvFilePath}`);
      process.exit(1);
    }
    
    // Check if table exists
    const tableExists = await db.schema.hasTable('image_galleries');
    if (!tableExists) {
      console.error('image_galleries table does not exist. Please run the migration first.');
      process.exit(1);
    }
    
    // Read CSV file
    console.log(`Reading CSV file: ${csvFilePath}`);
    const csvData = await readCSVFile(csvFilePath);
    console.log(`Found ${csvData.length} rows in CSV file`);
    
    // Map CSV data to database schema
    const mappedData = mapCSVToImageGallery(csvData);
    console.log(`Mapped ${mappedData.length} valid rows`);
    
    // Validate data
    const validationErrors = validateImageGalleryData(mappedData);
    if (validationErrors.length > 0) {
      console.error('Validation errors found:');
      validationErrors.forEach(error => console.error(`- ${error}`));
      process.exit(1);
    }
    
    // Show sample of mapped data
    console.log('\nSample mapped data:');
    mappedData.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. Project: ${item.project_name}, Title: ${item.image_title}, Category: ${item.image_category}`);
    });
    
    // Ask for confirmation
    console.log(`\nReady to import ${mappedData.length} image gallery records.`);
    console.log('Press Ctrl+C to cancel or any key to continue...');
    
    // Wait for user input (simple timeout for automation)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Clear existing data (optional - uncomment if needed)
    // console.log('Clearing existing image gallery data...');
    // await db('image_galleries').del();
    
    // Insert data
    console.log('Inserting image gallery data...');
    const result = await db('image_galleries').insert(mappedData).returning('id');
    
    console.log(`Successfully imported ${result.length} image gallery records`);
    
    // Verify the import
    const count = await db('image_galleries').count('* as total');
    console.log(`Total image gallery records in database: ${count[0].total}`);
    
    // Show summary by project
    const projectSummary = await db('image_galleries')
      .select('project_name')
      .count('* as count')
      .groupBy('project_name')
      .orderBy('project_name');
    
    console.log('\nImport summary by project:');
    projectSummary.forEach(item => {
      console.log(`- ${item.project_name}: ${item.count} images`);
    });
    
    // Show summary by category
    const categorySummary = await db('image_galleries')
      .select('image_category')
      .count('* as count')
      .groupBy('image_category')
      .orderBy('image_category');
    
    console.log('\nImport summary by category:');
    categorySummary.forEach(item => {
      console.log(`- ${item.image_category || 'No category'}: ${item.count} images`);
    });
    
    console.log('\nImport completed successfully!');
    console.log('\nYou can now test the API endpoints:');
    console.log('- GET /api/image-galleries - Get all image galleries');
    console.log('- GET /api/image-galleries/project/[PROJECT_NAME] - Get images for specific project');
    console.log('- GET /api/image-galleries/featured - Get featured images');
    console.log('- GET /api/projects/[ID] - Get project with image gallery data');
    
  } catch (error) {
    console.error('Error importing image gallery from CSV:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Get CSV file path from command line arguments
const csvFilePath = process.argv[2];

if (!csvFilePath) {
  console.error('Usage: node import-image-gallery-from-csv.js <csv-file-path>');
  console.error('Example: node import-image-gallery-from-csv.js ./gallery_images.csv');
  console.error('');
  console.error('Expected CSV columns:');
  console.error('- projectId (optional, for reference)');
  console.error('- projectName (required)');
  console.error('- image_url (required)');
  console.error('');
  console.error('The script will automatically:');
  console.error('- Generate image titles from filenames');
  console.error('- Categorize images based on URL content');
  console.error('- Set display order based on CSV row order');
  console.error('- Create descriptions and alt text');
  process.exit(1);
}

// Run the import
importImageGalleryFromCSV(csvFilePath);
