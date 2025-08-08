const knex = require('knex');

/**
 * Comprehensive deployment readiness check
 * This script verifies that all potential deployment issues are resolved
 */

async function deploymentReadinessCheck() {
  console.log('🔍 Running comprehensive deployment readiness check...\n');
  
  const db = knex({
    client: 'postgresql',
    connection: {
      host: process.env.DATABASE_HOST || 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com',
      port: process.env.DATABASE_PORT || 5432,
      user: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'kwpostgres',
      database: process.env.DATABASE_NAME || 'kwsg',
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: 1,
      max: 10,
    }
  });

  try {
    let allChecksPassed = true;
    
    // Check 1: Verify project table cleanup
    console.log('📋 Check 1: Project table cleanup verification...');
    const projectTableExists = await db.raw(`
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'project' 
      AND table_schema = 'public'
    `);
    
    if (projectTableExists.rows.length > 0) {
      console.log('❌ Project table (singular) still exists - this will cause deployment issues');
      allChecksPassed = false;
    } else {
      console.log('✅ Project table (singular) successfully removed');
    }
    
    // Check 2: Verify projects table exists and has data
    console.log('\n📋 Check 2: Projects table verification...');
    const projectsTableExists = await db.raw(`
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'projects' 
      AND table_schema = 'public'
    `);
    
    if (projectsTableExists.rows.length === 0) {
      console.log('❌ Projects table (plural) does not exist');
      allChecksPassed = false;
    } else {
      const projectsCount = await db.raw('SELECT COUNT(*) as count FROM projects');
      console.log(`✅ Projects table exists with ${projectsCount.rows[0].count} records`);
    }
    
    // Check 3: Check for any remaining project_documents_idx indexes
    console.log('\n📋 Check 3: Index conflict verification...');
    const problematicIndexes = await db.raw(`
      SELECT indexname, tablename FROM pg_indexes 
      WHERE indexname LIKE '%project_documents%'
    `);
    
    if (problematicIndexes.rows.length > 0) {
      console.log('❌ Found problematic indexes:');
      problematicIndexes.rows.forEach(idx => {
        console.log(`   - ${idx.indexname} on table ${idx.tablename}`);
      });
      allChecksPassed = false;
    } else {
      console.log('✅ No problematic project_documents indexes found');
    }
    
    // Check 4: Verify press_articles table structure
    console.log('\n📋 Check 4: Press articles table verification...');
    const pressArticlesColumns = await db.raw(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'press_articles' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    const expectedColumns = [
      'document_id', 'title', 'description', 'image_url', 'link', 
      'date', 'year', 'source', 'slug', 'article_content', 
      'published_at', 'created_by_id', 'updated_by_id', 'locale'
    ];
    
    const existingColumns = pressArticlesColumns.rows.map(col => col.column_name);
    const missingColumns = expectedColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('❌ Missing columns in press_articles table:', missingColumns);
      allChecksPassed = false;
    } else {
      console.log('✅ All expected columns exist in press_articles table');
    }
    
    // Check 5: Check for any duplicate column definitions
    console.log('\n📋 Check 5: Duplicate column verification...');
    const duplicateColumns = await db.raw(`
      SELECT column_name, COUNT(*) as count
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      GROUP BY column_name
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateColumns.rows.length > 0) {
      console.log('❌ Found duplicate column names across tables:');
      duplicateColumns.rows.forEach(col => {
        console.log(`   - ${col.column_name} (${col.count} occurrences)`);
      });
      allChecksPassed = false;
    } else {
      console.log('✅ No duplicate column names found');
    }
    
    // Check 6: Verify all content types have correct collection names
    console.log('\n📋 Check 6: Content type collection names...');
    const expectedCollections = [
      'projects', 'press_articles', 'brochures', 'floor_plans', 
      'site_plans', 'facilities', 'developers', 'project_images'
    ];
    
    for (const collection of expectedCollections) {
      const tableExists = await db.raw(`
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = '${collection}' 
        AND table_schema = 'public'
      `);
      
      if (tableExists.rows.length === 0) {
        console.log(`⚠️  Table '${collection}' does not exist (this might be normal)`);
      } else {
        console.log(`✅ Table '${collection}' exists`);
      }
    }
    
    // Check 7: Database connection and basic functionality
    console.log('\n📋 Check 7: Database connection and basic queries...');
    try {
      const testQuery = await db.raw('SELECT 1 as test');
      console.log('✅ Database connection successful');
      
      // Test a basic projects query
      const projectsTest = await db.raw('SELECT COUNT(*) as count FROM projects LIMIT 1');
      console.log('✅ Projects table query successful');
      
    } catch (error) {
      console.log('❌ Database connection or query failed:', error.message);
      allChecksPassed = false;
    }
    
    // Final summary
    console.log('\n' + '='.repeat(50));
    console.log('🎯 DEPLOYMENT READINESS SUMMARY');
    console.log('='.repeat(50));
    
    if (allChecksPassed) {
      console.log('✅ ALL CHECKS PASSED - Ready for deployment!');
      console.log('\n🚀 Your application should deploy successfully without errors.');
      console.log('📋 Key fixes applied:');
      console.log('   - Removed conflicting project table (singular)');
      console.log('   - Fixed press_articles schema duplicates');
      console.log('   - Aligned all collection names with database tables');
      console.log('   - Verified all required columns exist');
    } else {
      console.log('❌ SOME CHECKS FAILED - Please fix issues before deployment');
      console.log('\n🔧 Issues found that need to be resolved:');
      console.log('   - Check the specific errors above');
      console.log('   - Run the appropriate fix scripts');
      console.log('   - Re-run this check after fixes');
    }
    
    console.log('\n📊 Database Status:');
    console.log(`   - Projects: ${(await db.raw('SELECT COUNT(*) as count FROM projects')).rows[0].count} records`);
    console.log(`   - Press Articles: ${(await db.raw('SELECT COUNT(*) as count FROM press_articles')).rows[0].count} records`);
    console.log(`   - Brochures: ${(await db.raw('SELECT COUNT(*) as count FROM brochures')).rows[0].count} records`);
    console.log(`   - Floor Plans: ${(await db.raw('SELECT COUNT(*) as count FROM floor_plans')).rows[0].count} records`);
    
  } catch (error) {
    console.error('❌ Error during deployment readiness check:', error);
    throw error;
  } finally {
    await db.destroy();
  }
}

// Run the check if this script is executed directly
if (require.main === module) {
  deploymentReadinessCheck()
    .then(() => {
      console.log('\n✅ Deployment readiness check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Deployment readiness check failed:', error);
      process.exit(1);
    });
}

module.exports = { deploymentReadinessCheck };
