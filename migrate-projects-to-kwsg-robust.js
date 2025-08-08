const knex = require('knex');

class ProjectMigrator {
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
        // Increase timeouts for large data transfers
        connectionTimeoutMillis: 60000, // 60 seconds
        idleTimeoutMillis: 30000, // 30 seconds
        query_timeout: 300000, // 5 minutes
        statement_timeout: 300000, // 5 minutes
      },
      pool: {
        min: 1,
        max: 10,
        acquireTimeoutMillis: 60000,
        createTimeoutMillis: 60000,
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
        // Increase timeouts for large data transfers
        connectionTimeoutMillis: 60000,
        idleTimeoutMillis: 30000,
        query_timeout: 300000,
        statement_timeout: 300000,
      },
      pool: {
        min: 1,
        max: 10,
        acquireTimeoutMillis: 60000,
        createTimeoutMillis: 60000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 100,
      }
    });

    // Enum mappings
    this.propertyTypeMapping = {
      'Condo': 'Condominium',
      'Apartment': 'Apartment',
      'Landed': 'Landed',
      'Mixed Development': 'Mixed Development',
      'Commercial': 'Commercial',
      'Industrial': 'Industrial',
      'Residential': 'Residential'
    };

    this.tenureMapping = {
      'Freehold': 'Freehold',
      'Leasehold': 'Leasehold',
      '99-year Leasehold': 'Leasehold',
      '999-year Leasehold': 'Leasehold'
    };

    this.statusMapping = {
      'Available': 'Available',
      'Sold Out': 'Sold Out',
      'Coming Soon': 'Coming Soon',
      'Pre-launch': 'Pre-launch',
      'Under Construction': 'Under Construction'
    };
  }

  async clearTableData(tableName) {
    try {
      await this.targetDb(tableName).del();
      console.log(`🗑️  Cleared data from ${tableName}`);
    } catch (error) {
      console.log(`⚠️  Could not clear ${tableName}: ${error.message}`);
    }
  }

  generateUniqueSlug(project, usedSlugs) {
    let baseSlug = project.slug || project.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `project-${project.id}`;
    baseSlug = baseSlug.replace(/^-+|-+$/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    usedSlugs.add(slug);
    return slug;
  }

  truncateString(str, maxLength) {
    if (!str) return '';
    return str.length > maxLength ? str.substring(0, maxLength) : str;
  }

  mapEnumValue(value, mapping, defaultValue) {
    if (!value) return defaultValue;
    return mapping[value] || defaultValue;
  }

  // Fetch data in chunks to avoid timeouts
  async fetchDataInChunks(tableName, chunkSize = 1000) {
    console.log(`📊 Fetching ${tableName} data in chunks of ${chunkSize}...`);
    
    let allData = [];
    let offset = 0;
    let hasMore = true;
    
    while (hasMore) {
      try {
        console.log(`  Fetching chunk starting at offset ${offset}...`);
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
          
          // Small delay to prevent overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`❌ Error fetching chunk from ${tableName} at offset ${offset}: ${error.message}`);
        throw error;
      }
    }
    
    console.log(`✅ Completed fetching ${tableName}: ${allData.length} total records`);
    return allData;
  }

  async migrateProjects() {
    console.log('\n🔄 Migrating projects table...');
    await this.clearTableData('projects');
    
    try {
      const sourceData = await this.fetchDataInChunks('projects');
      console.log(`📊 Found ${sourceData.length} projects in source`);
      
      if (sourceData.length > 0) {
        const usedSlugs = new Set();
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < sourceData.length; i++) {
          const project = sourceData[i];
          try {
            const uniqueSlug = this.generateUniqueSlug(project, usedSlugs);
            const mappedData = {
              id: project.id,
              name: project.name || project.project_name || '',
              project_name: project.project_name,
              slug: uniqueSlug,
              title: project.title,
              location: project.location,
              address: project.address,
              type: project.type,
              price: project.price,
              price_from: project.price_from,
              price_per_sqft: project.price_per_sqft,
              bedrooms: project.bedrooms,
              bathrooms: project.bathrooms,
              size: project.size,
              units: project.units,
              developer: project.developer,
              completion: this.truncateString(project.completion, 10),
              description: project.description,
              features: project.features,
              district: this.truncateString(project.district, 10),
              tenure: this.mapEnumValue(project.tenure, this.tenureMapping, 'Freehold'),
              property_type: this.mapEnumValue(project.property_type, this.propertyTypeMapping, 'Condominium'),
              status: this.mapEnumValue(project.status, this.statusMapping, 'Available'),
              total_units: project.total_units,
              total_floors: project.total_floors,
              site_area: project.site_area,
              created_at: project.created_at,
              updated_at: project.updated_at,
              image_url_banner: project.image_url_banner,
              latitude: project.latitude,
              longitude: project.longitude
            };
            
            await this.targetDb('projects').insert(mappedData);
            successCount++;
            
            if (successCount % 50 === 0) {
              console.log(`✅ Inserted ${successCount}/${sourceData.length} projects`);
            }
          } catch (error) {
            errorCount++;
            console.error(`❌ Error inserting project ${project.id}: ${error.message}`);
          }
        }
        
        console.log(`✅ Completed projects migration: ${successCount} successful, ${errorCount} errors`);
      }
    } catch (error) {
      console.error(`❌ Migration failed: ${error.message}`);
      throw error;
    }
  }

  async migrateFloorPlans() {
    console.log('\n🔄 Migrating floor_plans table...');
    await this.clearTableData('floor_plans');
    
    try {
      const sourceData = await this.fetchDataInChunks('floor_plans');
      console.log(`📊 Found ${sourceData.length} floor plans in source`);
      
      if (sourceData.length > 0) {
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < sourceData.length; i++) {
          const floorPlan = sourceData[i];
          try {
            const mappedData = {
              id: floorPlan.id,
              project_id: floorPlan.project_id,
              name: floorPlan.name,
              description: floorPlan.description,
              floor_plan_image: floorPlan.floor_plan_image,
              img: floorPlan.img,
              created_at: floorPlan.created_at,
              updated_at: floorPlan.updated_at
            };
            
            await this.targetDb('floor_plans').insert(mappedData);
            successCount++;
            
            if (successCount % 100 === 0) {
              console.log(`✅ Inserted ${successCount}/${sourceData.length} floor plans`);
            }
          } catch (error) {
            errorCount++;
            console.error(`❌ Error inserting floor plan ${floorPlan.id}: ${error.message}`);
          }
        }
        
        console.log(`✅ Completed floor_plans migration: ${successCount} successful, ${errorCount} errors`);
      }
    } catch (error) {
      console.error(`❌ Migration failed: ${error.message}`);
      throw error;
    }
  }

  async migrateBrochures() {
    console.log('\n🔄 Migrating brochures table...');
    await this.clearTableData('brochures');
    
    try {
      const sourceData = await this.fetchDataInChunks('brochures');
      console.log(`📊 Found ${sourceData.length} brochures in source`);
      
      if (sourceData.length > 0) {
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < sourceData.length; i++) {
          const brochure = sourceData[i];
          try {
            const mappedData = {
              id: brochure.id,
              project_id: brochure.project_id,
              name: brochure.name,
              description: brochure.description,
              brochure_url: brochure.brochure_url,
              created_at: brochure.created_at,
              updated_at: brochure.updated_at
            };
            
            await this.targetDb('brochures').insert(mappedData);
            successCount++;
            
            if (successCount % 100 === 0) {
              console.log(`✅ Inserted ${successCount}/${sourceData.length} brochures`);
            }
          } catch (error) {
            errorCount++;
            console.error(`❌ Error inserting brochure ${brochure.id}: ${error.message}`);
          }
        }
        
        console.log(`✅ Completed brochures migration: ${successCount} successful, ${errorCount} errors`);
      }
    } catch (error) {
      console.error(`❌ Migration failed: ${error.message}`);
      throw error;
    }
  }

  async migrateUnitPricing() {
    console.log('\n🔄 Migrating unit_pricing table...');
    await this.clearTableData('unit_pricing');
    
    try {
      const sourceData = await this.fetchDataInChunks('unit_pricing');
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
              unit_type: unitPricing.unit_type,
              price: unitPricing.price,
              size: unitPricing.size,
              bedrooms: unitPricing.bedrooms,
              bathrooms: unitPricing.bathrooms,
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

  async migrateSitePlans() {
    console.log('\n🔄 Migrating site_plans table...');
    await this.clearTableData('site_plans');
    
    try {
      const sourceData = await this.fetchDataInChunks('site_plans');
      console.log(`📊 Found ${sourceData.length} site plans in source`);
      
      if (sourceData.length > 0) {
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < sourceData.length; i++) {
          const sitePlan = sourceData[i];
          try {
            const mappedData = {
              id: sitePlan.id,
              project_id: sitePlan.project_id,
              name: sitePlan.name,
              description: sitePlan.description,
              site_plan_image: sitePlan.site_plan_image,
              created_at: sitePlan.created_at,
              updated_at: sitePlan.updated_at
            };
            
            await this.targetDb('site_plans').insert(mappedData);
            successCount++;
            
            if (successCount % 100 === 0) {
              console.log(`✅ Inserted ${successCount}/${sourceData.length} site plans`);
            }
          } catch (error) {
            errorCount++;
            console.error(`❌ Error inserting site plan ${sitePlan.id}: ${error.message}`);
          }
        }
        
        console.log(`✅ Completed site_plans migration: ${successCount} successful, ${errorCount} errors`);
      }
    } catch (error) {
      console.error(`❌ Migration failed: ${error.message}`);
      throw error;
    }
  }

  async migrateFacilities() {
    console.log('\n🔄 Migrating facilities table...');
    await this.clearTableData('facilities');
    
    try {
      const sourceData = await this.fetchDataInChunks('facilities');
      console.log(`📊 Found ${sourceData.length} facilities in source`);
      
      if (sourceData.length > 0) {
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < sourceData.length; i++) {
          const facility = sourceData[i];
          try {
            const mappedData = {
              id: facility.id,
              name: facility.name,
              description: facility.description,
              icon: facility.icon,
              created_at: facility.created_at,
              updated_at: facility.updated_at
            };
            
            await this.targetDb('facilities').insert(mappedData);
            successCount++;
            
            if (successCount % 100 === 0) {
              console.log(`✅ Inserted ${successCount}/${sourceData.length} facilities`);
            }
          } catch (error) {
            errorCount++;
            console.error(`❌ Error inserting facility ${facility.id}: ${error.message}`);
          }
        }
        
        console.log(`✅ Completed facilities migration: ${successCount} successful, ${errorCount} errors`);
      }
    } catch (error) {
      console.error(`❌ Migration failed: ${error.message}`);
      throw error;
    }
  }

  async migrateProjectFacilities() {
    console.log('\n🔄 Migrating project_facilities table...');
    await this.clearTableData('project_facilities');
    
    try {
      const sourceData = await this.fetchDataInChunks('project_facilities');
      console.log(`📊 Found ${sourceData.length} project facilities in source`);
      
      if (sourceData.length > 0) {
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < sourceData.length; i++) {
          const projectFacility = sourceData[i];
          try {
            const mappedData = {
              id: projectFacility.id,
              project_id: projectFacility.project_id,
              facility_id: projectFacility.facility_id,
              created_at: projectFacility.created_at,
              updated_at: projectFacility.updated_at
            };
            
            await this.targetDb('project_facilities').insert(mappedData);
            successCount++;
            
            if (successCount % 100 === 0) {
              console.log(`✅ Inserted ${successCount}/${sourceData.length} project facilities`);
            }
          } catch (error) {
            errorCount++;
            console.error(`❌ Error inserting project facility ${projectFacility.id}: ${error.message}`);
          }
        }
        
        console.log(`✅ Completed project_facilities migration: ${successCount} successful, ${errorCount} errors`);
      }
    } catch (error) {
      console.error(`❌ Migration failed: ${error.message}`);
      throw error;
    }
  }

  async migrateAllTables() {
    console.log('🚀 Starting migration from postgres to kwsg database...\n');
    
    try {
      await this.migrateProjects();
      await this.migrateFacilities();
      await this.migrateFloorPlans();
      await this.migrateBrochures();
      await this.migrateUnitPricing();
      await this.migrateSitePlans();
      await this.migrateProjectFacilities();
      
      console.log('\n✅ Migration completed successfully!');
    } catch (error) {
      console.error(`\n❌ Migration failed: ${error.message}`);
      throw error;
    } finally {
      await this.sourceDb.destroy();
      await this.targetDb.destroy();
    }
  }
}

if (require.main === module) {
  const migrator = new ProjectMigrator();
  migrator.migrateAllTables().catch(console.error);
}
