const knex = require('knex');

/**
 * Script to fix the project_documents_idx index issue in production
 * Run this script if you encounter the index already exists error
 */

async function fixIndexIssue() {
  console.log('🔧 Fixing production index issue...');
  
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
    // Check both 'project' and 'projects' tables
    const tables = ['project', 'projects'];
    
    for (const tableName of tables) {
      console.log(`\n📋 Checking table: ${tableName}`);
      
      // Check if the table exists
      const tableExists = await db.raw(`
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = '${tableName}' 
        AND table_schema = 'public'
      `);
      
      if (tableExists.rows.length === 0) {
        console.log(`ℹ️  Table '${tableName}' does not exist, skipping...`);
        continue;
      }
      
      // Check if the index exists on this table
      const indexExists = await db.raw(`
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'project_documents_idx' 
        AND tablename = '${tableName}'
      `);
      
      if (indexExists.rows.length > 0) {
        console.log(`⚠️  Index project_documents_idx exists on table '${tableName}', dropping it...`);
        
        // Drop the existing index
        await db.raw(`DROP INDEX IF EXISTS project_documents_idx`);
        console.log(`✅ Dropped existing project_documents_idx index from '${tableName}'`);
      } else {
        console.log(`ℹ️  Index project_documents_idx does not exist on '${tableName}'`);
      }
      
      // Check if the required columns exist on this table
      const columnsExist = await db.raw(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '${tableName}' 
        AND column_name IN ('document_id', 'locale', 'published_at')
      `);
      
      const existingColumns = columnsExist.rows.map(row => row.column_name);
      console.log(`📊 Existing columns on '${tableName}':`, existingColumns);
      
      // Only create the index if all required columns exist
      if (existingColumns.includes('document_id') && 
          existingColumns.includes('locale') && 
          existingColumns.includes('published_at')) {
        
        console.log(`🔨 Creating project_documents_idx index on '${tableName}'...`);
        await db.raw(`
          CREATE INDEX project_documents_idx 
          ON ${tableName} (document_id, locale, published_at)
        `);
        console.log(`✅ Successfully created project_documents_idx index on '${tableName}'`);
      } else {
        console.log(`⚠️  Required columns (document_id, locale, published_at) not found on '${tableName}', skipping index creation`);
      }
    }
    
    console.log('\n🎉 Index issue fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing index issue:', error);
    throw error;
  } finally {
    await db.destroy();
  }
}

// Run the fix if this script is executed directly
if (require.main === module) {
  fixIndexIssue()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixIndexIssue };
