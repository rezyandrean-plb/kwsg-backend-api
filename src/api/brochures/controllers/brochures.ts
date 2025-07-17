/**
 * A set of functions called "actions" for `brochures`
 */

export default {
  // Get all brochures
  async find(ctx) {
    try {
      const knex = strapi.db.connection;
      
      // Check if brochures table exists
      const tableExists = await knex.schema.hasTable('brochures');
      if (!tableExists) {
        return { data: [], message: 'Brochures table does not exist' };
      }
      
      // Get all active brochures
      const data = await knex('brochures')
        .where('is_active', true)
        .orderBy('created_at', 'desc');
      
      return { data };
    } catch (err) {
      console.error('Error in brochures find method:', err);
      ctx.throw(500, err);
    }
  },

  // Get brochures by project name
  async findByProject(ctx) {
    try {
      const { projectName } = ctx.params;
      const knex = strapi.db.connection;
      
      // Check if brochures table exists
      const tableExists = await knex.schema.hasTable('brochures');
      if (!tableExists) {
        return { data: [], message: 'Brochures table does not exist' };
      }
      
      // Get brochures for specific project
      const data = await knex('brochures')
        .where('project_name', projectName)
        .where('is_active', true)
        .orderBy('created_at', 'desc');
      
      return { data };
    } catch (err) {
      console.error('Error in brochures findByProject method:', err);
      ctx.throw(500, err);
    }
  },

  // Create a new brochure
  async create(ctx) {
    try {
      const knex = strapi.db.connection;
      const brochureData = ctx.request.body;
      
      // Validate required fields
      if (!brochureData.project_name || !brochureData.brochure_url) {
        return ctx.badRequest('Project name and brochure URL are required');
      }
      
      // Insert into brochures table
      const result = await knex('brochures').insert(brochureData).returning('*');
      const data = Array.isArray(result) ? result[0] : result;
      
      return { data };
    } catch (err) {
      console.error('Error creating brochure:', err);
      ctx.throw(400, err);
    }
  },

  // Update a brochure
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      const updateData = ctx.request.body;
      
      // Update the brochure
      await knex('brochures')
        .where('id', id)
        .update(updateData);
      
      // Fetch the updated brochure
      const data = await knex('brochures').where('id', id).first();
      
      return { data };
    } catch (err) {
      ctx.throw(400, err);
    }
  },

  // Delete a brochure
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      
      // Soft delete by setting is_active to false
      const data = await knex('brochures')
        .where('id', id)
        .update({ is_active: false });
      
      return { data: { deleted: data > 0 } };
    } catch (err) {
      ctx.throw(400, err);
    }
  },

  // Test database connection
  async test(ctx) {
    try {
      const knex = strapi.db.connection;
      
      // Check if brochures table exists
      const tableExists = await knex.schema.hasTable('brochures');
      
      // Try to get data from brochures
      let brochuresData = [];
      if (tableExists) {
        brochuresData = await knex('brochures').select('*').limit(3);
      }
      
      return {
        data: {
          tableExists,
          brochuresCount: brochuresData.length,
          sampleData: brochuresData
        }
      };
    } catch (err) {
      console.error('Error in brochures test method:', err);
      return { error: err.message };
    }
  },

  // Get a single brochure by ID
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;

      const data = await knex('brochures')
        .where('id', id)
        .where('is_active', true)
        .first();

      if (!data) {
        return ctx.notFound('Brochure not found');
      }

      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  }
}; 