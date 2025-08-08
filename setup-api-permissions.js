const knex = require('knex');

class PermissionSetup {
  constructor() {
    // Target database (kwsg)
    this.targetDb = knex({
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
  }

  async setupPermissions() {
    console.log('🔐 SETTING UP API PERMISSIONS\n');
    console.log('=' .repeat(60));

    try {
      // Step 1: Check current permissions
      console.log('\n📋 Step 1: Check current permissions');
      console.log('-'.repeat(40));
      
      const currentPermissions = await this.targetDb('up_permissions').select('*');
      console.log(`📊 Total permissions: ${currentPermissions.length}`);
      
      // Find public role
      const publicRole = await this.targetDb('up_roles').where('type', 'public').first();
      if (publicRole) {
        console.log(`✅ Found public role: ${publicRole.name} (ID: ${publicRole.id})`);
      } else {
        console.log('❌ Public role not found');
        return;
      }

      // Step 2: Check existing permissions for brochures and site_plans
      console.log('\n📋 Step 2: Check existing permissions for content types');
      console.log('-'.repeat(40));
      
      const brochuresPermissions = await this.targetDb('up_permissions')
        .where('action', 'like', '%brochure%')
        .select('*');
      
      const sitePlansPermissions = await this.targetDb('up_permissions')
        .where('action', 'like', '%site-plan%')
        .select('*');
      
      console.log(`📄 Brochures permissions: ${brochuresPermissions.length}`);
      console.log(`🗺️  Site plans permissions: ${sitePlansPermissions.length}`);

      // Step 3: Create permissions if they don't exist
      console.log('\n📋 Step 3: Create missing permissions');
      console.log('-'.repeat(40));
      
      const permissionsToCreate = [
        { action: 'api::brochure.brochure.find', subject: 'api::brochure.brochure' },
        { action: 'api::brochure.brochure.findOne', subject: 'api::brochure.brochure' },
        { action: 'api::brochure.brochure.findMany', subject: 'api::brochure.brochure' },
        { action: 'api::site-plan.site-plan.find', subject: 'api::site-plan.site-plan' },
        { action: 'api::site-plan.site-plan.findOne', subject: 'api::site-plan.site-plan' },
        { action: 'api::site-plan.site-plan.findMany', subject: 'api::site-plan.site-plan' },
        { action: 'api::unit-pricing.unit-pricing.find', subject: 'api::unit-pricing.unit-pricing' },
        { action: 'api::unit-pricing.unit-pricing.findOne', subject: 'api::unit-pricing.unit-pricing' },
        { action: 'api::unit-pricing.unit-pricing.findMany', subject: 'api::unit-pricing.unit-pricing' }
      ];

      let createdCount = 0;
      for (const permission of permissionsToCreate) {
        const existing = await this.targetDb('up_permissions')
          .where('action', permission.action)
          .first();
        
        if (!existing) {
          const [newPermission] = await this.targetDb('up_permissions')
            .insert({
              action: permission.action,
              subject: permission.subject,
              properties: '{}',
              conditions: '[]',
              role: publicRole.id
            })
            .returning('*');
          
          console.log(`✅ Created permission: ${permission.action}`);
          createdCount++;
        } else {
          console.log(`⚠️  Permission already exists: ${permission.action}`);
        }
      }

      console.log(`\n📊 Created ${createdCount} new permissions`);

      // Step 4: Assign permissions to public role
      console.log('\n📋 Step 4: Assign permissions to public role');
      console.log('-'.repeat(40));
      
      const allPermissions = await this.targetDb('up_permissions')
        .whereIn('action', permissionsToCreate.map(p => p.action))
        .select('*');
      
      let assignedCount = 0;
      for (const permission of allPermissions) {
        const existingRolePermission = await this.targetDb('up_permissions_role_links')
          .where({
            permission_id: permission.id,
            role_id: publicRole.id
          })
          .first();
        
        if (!existingRolePermission) {
          await this.targetDb('up_permissions_role_links').insert({
            permission_id: permission.id,
            role_id: publicRole.id
          });
          console.log(`✅ Assigned permission to public role: ${permission.action}`);
          assignedCount++;
        } else {
          console.log(`⚠️  Permission already assigned: ${permission.action}`);
        }
      }

      console.log(`\n📊 Assigned ${assignedCount} permissions to public role`);

      // Step 5: Verify setup
      console.log('\n📋 Step 5: Verify permission setup');
      console.log('-'.repeat(40));
      
      const publicRolePermissions = await this.targetDb('up_permissions_role_links')
        .join('up_permissions', 'up_permissions_role_links.permission_id', 'up_permissions.id')
        .where('up_permissions_role_links.role_id', publicRole.id)
        .select('up_permissions.action');
      
      console.log(`📊 Public role has ${publicRolePermissions.length} permissions`);
      
      const brochurePermissions = publicRolePermissions.filter(p => p.action.includes('brochure'));
      const sitePlanPermissions = publicRolePermissions.filter(p => p.action.includes('site-plan'));
      const unitPricingPermissions = publicRolePermissions.filter(p => p.action.includes('unit-pricing'));
      
      console.log(`📄 Brochures permissions: ${brochurePermissions.length}`);
      console.log(`🗺️  Site plans permissions: ${sitePlanPermissions.length}`);
      console.log(`💰 Unit pricing permissions: ${unitPricingPermissions.length}`);

      console.log('\n🎉 Permission setup completed!');
      console.log('=' .repeat(60));
      console.log('\n💡 Next steps:');
      console.log('1. Restart Strapi to apply the new permissions');
      console.log('2. Test the API endpoints:');
      console.log('   - GET /api/brochures');
      console.log('   - GET /api/site-plans');
      console.log('   - GET /api/unit-pricings');
      console.log('3. Check project details API for related data');

    } catch (error) {
      console.error('❌ Error setting up permissions:', error.message);
    } finally {
      await this.targetDb.destroy();
    }
  }
}

if (require.main === module) {
  const setup = new PermissionSetup();
  setup.setupPermissions().catch(console.error);
}
