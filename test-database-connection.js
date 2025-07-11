const { Client } = require('pg');

async function testDatabaseConnection() {
  const client = new Client({
    host: 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'kwpostgres',
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Check if table exists
    console.log('\n📊 Checking if press_articles table exists...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'press_articles'
      );
    `);
    console.log('Table exists:', tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
      // Count records
      console.log('\n📈 Counting records...');
      const countResult = await client.query('SELECT COUNT(*) FROM press_articles;');
      console.log('Total records:', countResult.rows[0].count);

      // Get sample data
      console.log('\n📋 Sample data:');
      const sampleData = await client.query(`
        SELECT id, title, source, date 
        FROM press_articles 
        ORDER BY date DESC 
        LIMIT 3;
      `);
      console.log(sampleData.rows);
    }

  } catch (err) {
    console.error('❌ Database connection error:', err);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed.');
  }
}

testDatabaseConnection(); 