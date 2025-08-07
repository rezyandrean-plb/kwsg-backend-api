const knex = require('knex');
const fs = require('fs');
const csv = require('csv-parser');

// Database configuration
const dbConfig = {
  client: 'postgresql',
  connection: {
    host: 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com',
    port: 5432,
    user: 'postgres',
    password: 'kwpostgres',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  },
};

class UnitPricingImporter {
  constructor() {
    this.db = knex(dbConfig);
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  // Ensure unit_pricing table exists
  async ensureUnitPricingTable() {
    const tableExists = await this.db.schema.hasTable('unit_pricing');
    if (!tableExists) {
      this.log('Creating unit_pricing table...');
      await this.db.schema.createTable('unit_pricing', (table) => {
        table.increments('id').primary();
        table.integer('project_id').unsigned().references('id').inTable('projects').onDelete('CASCADE');
        table.string('project_id_external'); // Your CSV projectId
        table.string('project_name'); // Your CSV projectName
        table.string('unit_type').notNullable(); // 1 BR, 2 BR, etc.
        table.decimal('min_area', 10, 2);
        table.decimal('max_area', 10, 2);
        table.decimal('min_price', 15, 2);
        table.decimal('max_price', 15, 2);
        table.integer('available_units').defaultTo(0);
        table.string('price_range'); // Formatted price range
        table.string('area_range'); // Formatted area range
        table.boolean('is_available').defaultTo(true);
        table.timestamps(true, true);
        
        table.index('project_id');
        table.index('project_id_external');
        table.index('project_name');
        table.index('unit_type');
      });
      this.log('✅ Unit pricing table created successfully', 'success');
    } else {
      this.log('✅ Unit pricing table already exists');
    }
  }

  // Clear existing unit pricing data
  async clearUnitPricingData() {
    try {
      const result = await this.db('unit_pricing').del();
      this.log(`🗑️  Cleared ${result} existing unit pricing records`);
    } catch (error) {
      this.log(`⚠️  No existing unit pricing data to clear: ${error.message}`, 'warning');
    }
  }

  // Import unit pricing from CSV
  async importUnitPricingFromCSV(csvFilePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
          // Transform CSV data to match existing database schema
          const unitPricing = {
            project_name: data.projectName || '',
            unit_type: data.type || '',
            bedrooms: this.extractBedrooms(data.type),
            bathrooms: this.extractBathrooms(data.type),
            size_sqft: data.minArea ? parseFloat(data.minArea) : null,
            price_from: data.minPrice ? parseFloat(data.minPrice) : null,
            price_to: data.maxPrice ? parseFloat(data.maxPrice) : null,
            price_per_sqft: this.calculatePricePerSqft(data.minPrice, data.minArea),
            currency: 'SGD',
            payment_terms: '',
            discount_info: '',
            is_available: data.availableNum ? parseInt(data.availableNum) > 0 : false
          };
          
          results.push(unitPricing);
        })
        .on('end', () => {
          this.log(`Parsed ${results.length} unit pricing records from CSV`, 'success');
          resolve(results);
        })
        .on('error', (error) => {
          this.log(`Error parsing CSV: ${error.message}`, 'error');
          reject(error);
        });
    });
  }

  // Extract bedrooms from unit type
  extractBedrooms(unitType) {
    if (!unitType) return '';
    const match = unitType.match(/(\d+)\s*(?:BR|Bedroom|Bed)/i);
    return match ? match[1] : '';
  }

  // Extract bathrooms from unit type
  extractBathrooms(unitType) {
    if (!unitType) return '';
    // Default to 1 bathroom for most unit types
    const match = unitType.match(/(\d+)\s*(?:BR|Bedroom|Bed)/i);
    if (match) {
      const bedrooms = parseInt(match[1]);
      return Math.max(1, Math.floor(bedrooms / 2)).toString();
    }
    return '1';
  }

  // Calculate price per sqft
  calculatePricePerSqft(price, area) {
    if (!price || !area) return null;
    const priceNum = parseFloat(price);
    const areaNum = parseFloat(area);
    return areaNum > 0 ? priceNum / areaNum : null;
  }

  // Format price range
  formatPriceRange(minPrice, maxPrice) {
    if (!minPrice && !maxPrice) return 'Price on request';
    if (!maxPrice) return `From $${this.formatNumber(minPrice)}`;
    if (!minPrice) return `Up to $${this.formatNumber(maxPrice)}`;
    if (minPrice === maxPrice) return `$${this.formatNumber(minPrice)}`;
    return `$${this.formatNumber(minPrice)} - $${this.formatNumber(maxPrice)}`;
  }

  // Format area range
  formatAreaRange(minArea, maxArea) {
    if (!minArea && !maxArea) return '';
    if (!maxArea) return `${minArea} sqft`;
    if (!minArea) return `Up to ${maxArea} sqft`;
    if (minArea === maxArea) return `${minArea} sqft`;
    return `${minArea} - ${maxArea} sqft`;
  }

  // Format number with commas
  formatNumber(num) {
    if (!num) return '0';
    return parseFloat(num).toLocaleString();
  }

  // Link unit pricing to projects
  async linkUnitPricingToProjects(unitPricingData) {
    this.log('🔗 Linking unit pricing to projects...');
    
    const linkedData = [];
    let linkedCount = 0;
    let unlinkedCount = 0;

    for (const pricing of unitPricingData) {
      // Try to find project by project name
      let project = null;
      
      if (pricing.project_name) {
        // Try to find by project name (exact match first, then partial)
        project = await this.db('projects')
          .where('name', pricing.project_name)
          .orWhere('project_name', pricing.project_name)
          .orWhere('name', 'ILIKE', `%${pricing.project_name}%`)
          .orWhere('project_name', 'ILIKE', `%${pricing.project_name}%`)
          .first();
      }

      if (project) {
        pricing.project_id = project.id;
        linkedData.push(pricing);
        linkedCount++;
      } else {
        // Keep the record but mark it as unlinked
        pricing.project_id = null;
        linkedData.push(pricing);
        unlinkedCount++;
        this.log(`⚠️  Could not link pricing for project: ${pricing.project_name} (${pricing.project_id_external})`, 'warning');
      }
    }

    this.log(`✅ Linked ${linkedCount} unit pricing records to projects`, 'success');
    if (unlinkedCount > 0) {
      this.log(`⚠️  ${unlinkedCount} unit pricing records could not be linked to projects`, 'warning');
    }

    return linkedData;
  }

  // Main import method
  async importUnitPricing(csvFilePath) {
    try {
      this.log('🚀 Starting unit pricing import...');
      
      // Step 1: Ensure table structure
      await this.ensureUnitPricingTable();
      
      // Step 2: Clear existing data
      await this.clearUnitPricingData();
      
      // Step 3: Import from CSV
      this.log('📥 Importing unit pricing from CSV...');
      const unitPricingData = await this.importUnitPricingFromCSV(csvFilePath);
      
      // Step 4: Link to projects
      const linkedData = await this.linkUnitPricingToProjects(unitPricingData);
      
      // Step 5: Insert into database
      if (linkedData.length > 0) {
        const insertedData = await this.db('unit_pricing').insert(linkedData).returning('*');
        this.log(`✅ Successfully imported ${insertedData.length} unit pricing records`, 'success');
        
        // Step 6: Update project pricing summary
        await this.updateProjectPricingSummary();
        
        // Step 7: Summary
        this.log('📊 Unit Pricing Import Summary:', 'success');
        this.log(`   - Total records imported: ${insertedData.length}`, 'success');
        this.log(`   - Linked to projects: ${linkedData.filter(d => d.project_id).length}`, 'success');
        this.log(`   - Unlinked records: ${linkedData.filter(d => !d.project_id).length}`, 'warning');
        
        this.log('🎉 Unit pricing import completed successfully!', 'success');
      } else {
        this.log('❌ No unit pricing data to import', 'error');
      }
      
    } catch (error) {
      this.log(`❌ Import failed: ${error.message}`, 'error');
      throw error;
    } finally {
      await this.db.destroy();
    }
  }

  // Update project pricing summary
  async updateProjectPricingSummary() {
    this.log('📊 Updating project pricing summaries...');
    
    try {
      // Get pricing summary for each project
      const pricingSummary = await this.db('unit_pricing')
        .select('project_id')
        .select(this.db.raw(`
          MIN(price_from) as min_price,
          MAX(price_to) as max_price,
          COUNT(*) as unit_types,
          SUM(CASE WHEN is_available THEN 1 ELSE 0 END) as total_available
        `))
        .whereNotNull('project_id')
        .groupBy('project_id');

      // Update projects table with pricing info
      for (const summary of pricingSummary) {
        const priceRange = this.formatPriceRange(summary.min_price, summary.max_price);
        
        await this.db('projects')
          .where('id', summary.project_id)
          .update({
            price: priceRange,
            price_from: summary.min_price ? `$${this.formatNumber(summary.min_price)}` : '',
            units: summary.total_available ? summary.total_available.toString() : ''
          });
      }

      this.log(`✅ Updated pricing for ${pricingSummary.length} projects`, 'success');
    } catch (error) {
      this.log(`⚠️  Error updating project pricing: ${error.message}`, 'warning');
    }
  }
}

// Main execution
async function main() {
  const csvFilePath = process.argv[2] || 'unit-pricing.csv';
  
  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ CSV file not found: ${csvFilePath}`);
    process.exit(1);
  }

  const importer = new UnitPricingImporter();
  await importer.importUnitPricing(csvFilePath);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = UnitPricingImporter;
