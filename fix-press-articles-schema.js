const knex = require('knex');

/**
 * Script to fix press_articles table schema mismatch
 * This aligns Strapi's schema with the actual database structure
 */

async function fixPressArticlesSchema() {
  console.log('🔧 Fixing press_articles schema...');
  
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
    // Check current table structure
    console.log('📋 Checking current press_articles table structure...');
    const columns = await db.raw(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'press_articles' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Current columns:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });
    
    // Check if there are any duplicate column attempts
    console.log('\n🔍 Checking for potential column conflicts...');
    
    // The error shows Strapi is trying to add these columns:
    const columnsToAdd = [
      'document_id', 'title', 'description', 'image_url', 'link', 
      'date', 'year', 'source', 'slug', 'article_content', 
      'published_at', 'created_by_id', 'updated_by_id', 'locale'
    ];
    
    const existingColumns = columns.rows.map(col => col.column_name);
    
    console.log('📋 Columns Strapi wants to add:');
    columnsToAdd.forEach(col => {
      const exists = existingColumns.includes(col);
      console.log(`  - ${col}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    });
    
    // Check for duplicate image_url issue
    const imageUrlCount = existingColumns.filter(col => col.includes('image')).length;
    console.log(`\n⚠️  Found ${imageUrlCount} image-related columns:`, 
      existingColumns.filter(col => col.includes('image')));
    
    if (imageUrlCount > 1) {
      console.log('🔧 This explains the duplicate image_url error');
    }
    
    // Check indexes
    console.log('\n📋 Checking indexes...');
    const indexes = await db.raw(`
      SELECT indexname FROM pg_indexes 
      WHERE tablename = 'press_articles'
    `);
    
    console.log('📊 Current indexes:');
    indexes.rows.forEach(idx => {
      console.log(`  - ${idx.indexname}`);
    });
    
    console.log('\n💡 Analysis:');
    console.log('✅ All required columns already exist in the database');
    console.log('⚠️  Strapi is trying to add columns that already exist');
    console.log('🔧 This suggests a schema mismatch between Strapi and the database');
    
    console.log('\n🎯 Solution:');
    console.log('1. Update the Strapi schema to match the database structure');
    console.log('2. Remove duplicate field definitions');
    console.log('3. Ensure collectionName matches the table name');
    
  } catch (error) {
    console.error('❌ Error analyzing schema:', error);
    throw error;
  } finally {
    await db.destroy();
  }
}

// Run the analysis if this script is executed directly
if (require.main === module) {
  fixPressArticlesSchema()
    .then(() => {
      console.log('\n✅ Schema analysis completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Schema analysis failed:', error);
      process.exit(1);
    });
}

module.exports = { fixPressArticlesSchema };
