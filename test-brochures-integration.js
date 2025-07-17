const { Client } = require('pg');

// Database configuration for live database
const dbConfig = {
  host: 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'kwpostgres',
  ssl: {
    rejectUnauthorized: false
  }
};

async function testBrochuresIntegration() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Test 1: Check brochures table
    console.log('\n📊 Test 1: Checking brochures table...');
    const brochuresCount = await client.query('SELECT COUNT(*) FROM brochures WHERE is_active = true');
    console.log(`✅ Found ${brochuresCount.rows[0].count} active brochures`);

    // Test 2: Check unique projects with brochures
    console.log('\n📊 Test 2: Checking unique projects with brochures...');
    const uniqueProjects = await client.query('SELECT COUNT(DISTINCT project_name) FROM brochures WHERE is_active = true');
    console.log(`✅ Found ${uniqueProjects.rows[0].count} unique projects with brochures`);

    // Test 3: Check if projects table exists and has data
    console.log('\n📊 Test 3: Checking projects table...');
    const projectsCount = await client.query('SELECT COUNT(*) FROM projects');
    console.log(`✅ Found ${projectsCount.rows[0].count} projects in database`);

    // Test 4: Find projects that have both project data and brochures
    console.log('\n📊 Test 4: Finding projects with both data and brochures...');
    const matchingProjects = await client.query(`
      SELECT p.name, COUNT(b.id) as brochure_count
      FROM projects p
      INNER JOIN brochures b ON p.name = b.project_name
      WHERE b.is_active = true
      GROUP BY p.name
      ORDER BY brochure_count DESC
      LIMIT 10
    `);
    
    console.log('✅ Projects with brochures:');
    matchingProjects.rows.forEach(row => {
      console.log(`   - ${row.name}: ${row.brochure_count} brochures`);
    });

    // Test 5: Find projects that have project data but no brochures
    console.log('\n📊 Test 5: Finding projects without brochures...');
    const projectsWithoutBrochures = await client.query(`
      SELECT p.name
      FROM projects p
      LEFT JOIN brochures b ON p.name = b.project_name AND b.is_active = true
      WHERE b.id IS NULL
      LIMIT 10
    `);
    
    console.log('⚠️  Projects without brochures:');
    projectsWithoutBrochures.rows.forEach(row => {
      console.log(`   - ${row.name}`);
    });

    // Test 6: Find brochures for projects that don't exist in projects table
    console.log('\n📊 Test 6: Finding brochures for non-existent projects...');
    const orphanedBrochures = await client.query(`
      SELECT DISTINCT b.project_name
      FROM brochures b
      LEFT JOIN projects p ON b.project_name = p.name
      WHERE p.id IS NULL AND b.is_active = true
      LIMIT 10
    `);
    
    if (orphanedBrochures.rows.length > 0) {
      console.log('⚠️  Brochures for non-existent projects:');
      orphanedBrochures.rows.forEach(row => {
        console.log(`   - ${row.project_name}`);
      });
    } else {
      console.log('✅ All brochures are linked to existing projects');
    }

    // Test 7: Sample brochure data
    console.log('\n📊 Test 7: Sample brochure data...');
    const sampleBrochures = await client.query(`
      SELECT project_name, brochure_title, brochure_url
      FROM brochures
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log('✅ Sample brochures:');
    sampleBrochures.rows.forEach(row => {
      console.log(`   - ${row.project_name}: ${row.brochure_title || 'No title'}`);
      console.log(`     URL: ${row.brochure_url.substring(0, 80)}...`);
    });

    console.log('\n🎉 Integration test completed successfully!');

  } catch (error) {
    console.error('❌ Error during integration test:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the test
testBrochuresIntegration().catch(console.error); 