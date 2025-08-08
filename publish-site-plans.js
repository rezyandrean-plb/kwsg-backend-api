const knex = require('knex');

async function publishSitePlans() {
  console.log('📋 PUBLISHING SITE PLANS\n');
  console.log('=' .repeat(60));

  // Target database (kwsg)
  const targetDb = knex({
    client: 'postgresql',
    connection: {
      host: 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com',
      port: 5432,
      user: 'postgres',
      password: 'kwpostgres',
      database: 'kwsg',
      ssl: { rejectUnauthorized: false }
    }
  });

  try {
    // Check current status
    console.log('\n📊 CURRENT STATUS:');
    console.log('-'.repeat(40));
    
    const unpublishedCount = await targetDb('site_plans').whereNull('published_at').count('* as count').first();
    const publishedCount = await targetDb('site_plans').whereNotNull('published_at').count('* as count').first();
    
    console.log(`Unpublished Site Plans: ${unpublishedCount.count}`);
    console.log(`Published Site Plans: ${publishedCount.count}`);

    if (unpublishedCount.count === 0) {
      console.log('\n✅ All site plans are already published!');
      return;
    }

    // Publish all unpublished site plans
    console.log('\n🔄 PUBLISHING SITE PLANS...');
    console.log('-'.repeat(40));
    
    const now = new Date();
    const result = await targetDb('site_plans')
      .whereNull('published_at')
      .update({
        published_at: now,
        updated_at: now
      });

    console.log(`✅ Published ${result} site plans`);

    // Verify the update
    console.log('\n📊 VERIFICATION:');
    console.log('-'.repeat(40));
    
    const newUnpublishedCount = await targetDb('site_plans').whereNull('published_at').count('* as count').first();
    const newPublishedCount = await targetDb('site_plans').whereNotNull('published_at').count('* as count').first();
    
    console.log(`Unpublished Site Plans: ${newUnpublishedCount.count}`);
    console.log(`Published Site Plans: ${newPublishedCount.count}`);

    if (newUnpublishedCount.count === 0) {
      console.log('\n🎉 All site plans are now published!');
      console.log('💡 The /api/site-plans endpoint should now return data.');
    }

  } catch (error) {
    console.error('❌ Error publishing site plans:', error.message);
  } finally {
    await targetDb.destroy();
  }
}

if (require.main === module) {
  publishSitePlans();
}
