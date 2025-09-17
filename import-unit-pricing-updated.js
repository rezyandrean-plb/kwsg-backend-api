const fs = require('fs');
const csv = require('csv-parser');
const knex = require('knex')({
  client: 'postgresql',
  connection: {
    host: 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com',
    port: 5432,
    user: 'postgres',
    password: 'kwpostgres',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  }
});

async function importUnitPricing() {
  try {
    console.log('🚀 Starting unit pricing import with new columns...');
    
    // Clear existing data
    console.log('🗑️  Clearing existing unit_pricing data...');
    await knex('unit_pricing').del();
    console.log('✅ Cleared existing data');
    
    // Read and parse CSV
    const unitPricingData = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream('unit_pricing.csv')
        .pipe(csv())
        .on('data', (row) => {
          // Map CSV columns to database columns
          const unitPricing = {
            project_name: row.projectName,
            unit_type: row.type,
            size_sqft: row.minArea ? parseFloat(row.minArea) : null,
            price_from: row.minPrice ? parseFloat(row.minPrice) : null,
            price_to: row.maxPrice ? parseFloat(row.maxPrice) : null,
            available_unit: row.availableNum || '',
            total_unit: row.unitNum || '',
            bedrooms: '', // Will be populated based on unit_type
            bathrooms: '', // Will be populated based on unit_type
            price_per_sqft: null, // Will be calculated
            currency: 'SGD',
            payment_terms: '',
            discount_info: '',
            is_available: row.availableNum && parseInt(row.availableNum) > 0,
            created_at: new Date(),
            updated_at: new Date()
          };
          
          // Extract bedrooms and bathrooms from unit_type
          if (row.type) {
            const type = row.type.toLowerCase();
            if (type.includes('1 br') || type.includes('1 bedroom')) {
              unitPricing.bedrooms = '1';
              unitPricing.bathrooms = '1';
            } else if (type.includes('2 br') || type.includes('2 bedroom')) {
              unitPricing.bedrooms = '2';
              unitPricing.bathrooms = '1';
            } else if (type.includes('3 br') || type.includes('3 bedroom')) {
              unitPricing.bedrooms = '3';
              unitPricing.bathrooms = '1';
            } else if (type.includes('4 br') || type.includes('4 bedroom')) {
              unitPricing.bedrooms = '4';
              unitPricing.bathrooms = '2';
            } else if (type.includes('5 br') || type.includes('5 bedroom')) {
              unitPricing.bedrooms = '5';
              unitPricing.bathrooms = '2';
            }
          }
          
          // Calculate price per sqft if we have both price and size
          if (unitPricing.price_from && unitPricing.size_sqft) {
            unitPricing.price_per_sqft = Math.round((unitPricing.price_from / unitPricing.size_sqft) * 100) / 100;
          }
          
          unitPricingData.push(unitPricing);
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`📊 Parsed ${unitPricingData.length} unit pricing records from CSV`);
    
    // Get project IDs for mapping
    const projects = await knex('projects').select('id', 'name');
    const projectMap = new Map();
    projects.forEach(project => {
      projectMap.set(project.name, project.id);
    });
    
    // Add project_id to each record
    unitPricingData.forEach(record => {
      const projectId = projectMap.get(record.project_name);
      if (projectId) {
        record.project_id = projectId;
      }
    });
    
    // Insert data in batches
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < unitPricingData.length; i += batchSize) {
      const batch = unitPricingData.slice(i, i + batchSize);
      await knex('unit_pricing').insert(batch);
      insertedCount += batch.length;
      console.log(`📝 Inserted ${insertedCount}/${unitPricingData.length} records...`);
    }
    
    console.log('✅ Successfully imported unit pricing data with new columns!');
    console.log(`📈 Total records imported: ${insertedCount}`);
    
    // Show sample of imported data
    const sampleData = await knex('unit_pricing')
      .select('project_name', 'unit_type', 'available_unit', 'total_unit', 'price_from', 'price_to')
      .limit(5);
    
    console.log('\n📋 Sample of imported data:');
    sampleData.forEach(record => {
      console.log(`- ${record.project_name} | ${record.unit_type} | Available: ${record.available_unit} | Total: ${record.total_unit} | Price: $${record.price_from} - $${record.price_to}`);
    });
    
  } catch (error) {
    console.error('❌ Error importing unit pricing:', error.message);
    console.error(error.stack);
  } finally {
    await knex.destroy();
  }
}

importUnitPricing();
