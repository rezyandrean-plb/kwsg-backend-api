const knex = require('knex');

/**
 * Final deployment verification - Critical issues only
 * This script checks only the specific issues that caused deployment failures
 */

async function finalDeploymentVerification() {
  console.log('🎯 Running final deployment verification...\n');
  
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
    let criticalIssues = [];
    
    // Critical Issue 1: Project table (singular) conflict
    console.log('🔍 Critical Issue 1: Checking for project table (singular) conflict...');
    const projectTableExists = await db.raw(`
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'project' 
      AND table_schema = 'public'
    `);
    
    if (projectTableExists.rows.length > 0) {
      criticalIssues.push('Project table (singular) still exists - will cause index conflicts');
      console.log('❌ CRITICAL: Project table (singular) exists');
    } else {
      console.log('✅ Project table (singular) successfully removed');
    }
    
    // Critical Issue 2: Project documents index conflicts
    console.log('\n🔍 Critical Issue 2: Checking for project_documents_idx conflicts...');
    const problematicIndexes = await db.raw(`
      SELECT indexname, tablename FROM pg_indexes 
      WHERE indexname LIKE '%project_documents%'
    `);
    
    if (problematicIndexes.rows.length > 0) {
      criticalIssues.push('Project documents indexes still exist - will cause deployment errors');
      console.log('❌ CRITICAL: Found problematic indexes:');
      problematicIndexes.rows.forEach(idx => {
        console.log(`   - ${idx.indexname} on table ${idx.tablename}`);
      });
    } else {
      console.log('✅ No problematic project_documents indexes found');
    }
    
    // Critical Issue 3: Press articles duplicate columns
    console.log('\n🔍 Critical Issue 3: Checking press_articles schema conflicts...');
    const pressArticlesColumns = await db.raw(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'press_articles' 
      AND table_schema = 'public'
    `);
    
    const existingColumns = pressArticlesColumns.rows.map(col => col.column_name);
    const duplicateImageFields = existingColumns.filter(col => col.includes('image'));
    
    if (duplicateImageFields.length > 1) {
      criticalIssues.push('Press articles has duplicate image fields - will cause column conflicts');
      console.log('❌ CRITICAL: Found duplicate image fields:', duplicateImageFields);
    } else {
      console.log('✅ Press articles image fields are clean');
    }
    
    // Critical Issue 4: Collection name mismatches
    console.log('\n🔍 Critical Issue 4: Checking collection name alignment...');
    const projectsTableExists = await db.raw(`
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'projects' 
      AND table_schema = 'public'
    `);
    
    if (projectsTableExists.rows.length === 0) {
      criticalIssues.push('Projects table (plural) does not exist - schema mismatch');
      console.log('❌ CRITICAL: Projects table (plural) does not exist');
    } else {
      console.log('✅ Projects table (plural) exists and aligned with schema');
    }
    
    // Critical Issue 5: Database connectivity
    console.log('\n🔍 Critical Issue 5: Testing database connectivity...');
    try {
      await db.raw('SELECT 1 as test');
      console.log('✅ Database connection successful');
    } catch (error) {
      criticalIssues.push('Database connection failed - deployment will fail');
      console.log('❌ CRITICAL: Database connection failed:', error.message);
    }
    
    // Final assessment
    console.log('\n' + '='.repeat(60));
    console.log('🎯 FINAL DEPLOYMENT VERIFICATION RESULTS');
    console.log('='.repeat(60));
    
    if (criticalIssues.length === 0) {
      console.log('✅ ALL CRITICAL ISSUES RESOLVED!');
      console.log('\n🚀 DEPLOYMENT READY - No known blocking issues');
      console.log('\n📋 Critical fixes applied:');
      console.log('   ✅ Removed conflicting project table (singular)');
      console.log('   ✅ Eliminated project_documents_idx conflicts');
      console.log('   ✅ Fixed press_articles duplicate field definitions');
      console.log('   ✅ Aligned collection names with database tables');
      console.log('   ✅ Verified database connectivity');
      
      console.log('\n📊 Data Status:');
      const projectsCount = await db.raw('SELECT COUNT(*) as count FROM projects');
      const pressArticlesCount = await db.raw('SELECT COUNT(*) as count FROM press_articles');
      console.log(`   - Projects: ${projectsCount.rows[0].count} records`);
      console.log(`   - Press Articles: ${pressArticlesCount.rows[0].count} records`);
      
      console.log('\n🎉 Your application should deploy successfully!');
      
    } else {
      console.log('❌ CRITICAL ISSUES FOUND - Deployment will fail');
      console.log('\n🔧 Issues that must be resolved:');
      criticalIssues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
      
      console.log('\n💡 Run the appropriate fix scripts before deploying');
    }
    
  } catch (error) {
    console.error('❌ Error during final verification:', error);
    throw error;
  } finally {
    await db.destroy();
  }
}

// Run the verification if this script is executed directly
if (require.main === module) {
  finalDeploymentVerification()
    .then(() => {
      console.log('\n✅ Final deployment verification completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Final deployment verification failed:', error);
      process.exit(1);
    });
}

module.exports = { finalDeploymentVerification };
