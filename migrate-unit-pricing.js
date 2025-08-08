const knex = require('knex');

class UnitPricingMigrator {
  constructor() {
    // Source database (postgres)
    this.sourceDb = knex({
      client: 'postgresql',
      connection: {
        host: 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com',
        port: 5432,
        user: 'postgres',
        password: 'kwpostgres',
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 120000,
        idleTimeoutMillis: 60000,
        query_timeout: 600000,
        statement_timeout: 600000,
      },
      pool: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 60000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 100,
      }
    });

    // Target database (kwsg)
    this.targetDb = knex({
      client: 'postgresql',
      connection: {
        host: 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com',
        port: 5432,
        user: 'postgres',
        password: 'kwpostgres',
        database: 'kwsg',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 120000,
        idleTimeoutMillis: 60000,
        query_timeout: 600000,
        statement_timeout: 600000,
      },
      pool: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 60000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 100,
      }
    });
  }

  async createUnitPricingTable() {
    console.log('🏗️  Creating unit_pricing table in target database...');
    
    try {
      // Check if table already exists
      const tableExists = await this.targetDb.schema.hasTable('unit_pricing');
      if (tableExists) {
        console.log('⚠️  unit_pricing table already exists in target database');
        return;
      }

      // Create the table with the same schema as source
      await this.targetDb.schema.createTable('unit_pricing', (table) => {
        table.increments('id').primary();
        table.integer('project_id').nullable();
        table.string('project_name', 255).nullable();
        table.string('unit_type', 255).nullable();
        table.string('bedrooms', 255).nullable();
        table.string('bathrooms', 255).nullable();
        table.decimal('size_sqft', 10, 2).nullable();
        table.decimal('price_from', 15, 2).nullable();
        table.decimal('price_to', 15, 2).nullable();
        table.decimal('price_per_sqft', 10, 2).nullable();
        table.string('currency', 255).nullable();
        table.string('payment_terms', 255).nullable();
        table.string('discount_info', 255).nullable();
        table.boolean('is_available').nullable();
        table.timestamp('created_at').notNullable();
        table.timestamp('updated_at').notNullable();
      });

      console.log('✅ unit_pricing table created successfully');
    } catch (error) {
      console.error('❌ Error creating unit_pricing table:', error.message);
      throw error;
    }
  }

  // Fetch data in smaller chunks with retry logic
  async fetchDataInChunks(tableName, chunkSize = 500, maxRetries = 3) {
    console.log(`📊 Fetching ${tableName} data in chunks of ${chunkSize}...`);
    let allData = [];
    let offset = 0;
    let hasMore = true;
    
    while (hasMore) {
      let retries = 0;
      let success = false;
      
      while (retries < maxRetries && !success) {
        try {
          console.log(`  Fetching chunk starting at offset ${offset}... (attempt ${retries + 1})`);
          const chunk = await this.sourceDb(tableName)
            .select('*')
            .limit(chunkSize)
            .offset(offset);
          
          if (chunk.length === 0) {
            hasMore = false;
          } else {
            allData = allData.concat(chunk);
            offset += chunkSize;
            console.log(`  ✅ Fetched ${chunk.length} records (total: ${allData.length})`);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          success = true;
        } catch (error) {
          retries++;
          console.error(`❌ Error fetching chunk from ${tableName} at offset ${offset} (attempt ${retries}): ${error.message}`);
          if (retries < maxRetries) {
            console.log(`  🔄 Retrying in ${retries * 2} seconds...`);
            await new Promise(resolve => setTimeout(resolve, retries * 2000));
          } else {
            throw new Error(`Failed to fetch data from ${tableName} after ${maxRetries} attempts`);
          }
        }
      }
    }
    
    console.log(`✅ Completed fetching ${tableName}: ${allData.length} total records`);
    return allData;
  }

  async clearTableData(tableName) {
    console.log(`🗑️  Cleared data from ${tableName}`);
    await this.targetDb(tableName).del();
  }

  async migrateUnitPricing() {
    console.log('\n🔄 Migrating unit_pricing table...');
    
    try {
      // Create the table first
      await this.createUnitPricingTable();
      
      // Clear existing data
      await this.clearTableData('unit_pricing');
      
      // Fetch all data from source
      const sourceData = await this.fetchDataInChunks('unit_pricing', 500);
      console.log(`📊 Found ${sourceData.length} unit pricing records in source`);
      
      if (sourceData.length > 0) {
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < sourceData.length; i++) {
          const unitPricing = sourceData[i];
          try {
            const mappedData = {
              id: unitPricing.id,
              project_id: unitPricing.project_id,
              project_name: unitPricing.project_name,
              unit_type: unitPricing.unit_type,
              bedrooms: unitPricing.bedrooms,
              bathrooms: unitPricing.bathrooms,
              size_sqft: unitPricing.size_sqft,
              price_from: unitPricing.price_from,
              price_to: unitPricing.price_to,
              price_per_sqft: unitPricing.price_per_sqft,
              currency: unitPricing.currency,
              payment_terms: unitPricing.payment_terms,
              discount_info: unitPricing.discount_info,
              is_available: unitPricing.is_available,
              created_at: unitPricing.created_at,
              updated_at: unitPricing.updated_at
            };
            
            await this.targetDb('unit_pricing').insert(mappedData);
            successCount++;
            
            if (successCount % 100 === 0) {
              console.log(`✅ Inserted ${successCount}/${sourceData.length} unit pricing records`);
            }
          } catch (error) {
            errorCount++;
            console.error(`❌ Error inserting unit pricing ${unitPricing.id}: ${error.message}`);
          }
        }
        
        console.log(`✅ Completed unit_pricing migration: ${successCount} successful, ${errorCount} errors`);
      }
    } catch (error) {
      console.error(`❌ Migration failed: ${error.message}`);
      throw error;
    }
  }

  async migrateAll() {
    console.log('🚀 Starting unit_pricing migration from postgres to kwsg...\n');
    
    try {
      await this.migrateUnitPricing();
      
      console.log('\n🎉 Unit pricing migration completed successfully!');
      
    } catch (error) {
      console.error('\n❌ Migration failed:', error.message);
      throw error;
    } finally {
      await this.sourceDb.destroy();
      await this.targetDb.destroy();
    }
  }
}

if (require.main === module) {
  const migrator = new UnitPricingMigrator();
  migrator.migrateAll().catch(console.error);
}
