/**
 * A set of functions called "actions" for `floor-plans`
 */

export default {
  // Get all floor plans
  async find(ctx) {
    try {
      const knex = strapi.db.connection;
      
      const data = await knex('floor_plans')
        .select('*')
        .orderBy('unit_type', 'asc');
      
      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Get a single floor plan by ID
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      
      const data = await knex('floor_plans')
        .where('id', id)
        .first();
      
      if (!data) {
        return ctx.notFound('Floor plan not found');
      }
      
      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Create a new floor plan
  async create(ctx) {
    try {
      const knex = strapi.db.connection;
      const floorPlanData = ctx.request.body;
      
      const [id] = await knex('floor_plans').insert(floorPlanData);
      
      const data = await knex('floor_plans').where('id', id).first();
      
      return { data };
    } catch (err) {
      ctx.throw(400, err);
    }
  },

  // Update a floor plan
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      const updateData = ctx.request.body;
      
      await knex('floor_plans')
        .where('id', id)
        .update(updateData);
      
      const data = await knex('floor_plans').where('id', id).first();
      
      return { data };
    } catch (err) {
      ctx.throw(400, err);
    }
  },

  // Delete a floor plan
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      
      const data = await knex('floor_plans')
        .where('id', id)
        .del();
      
      return { data: { deleted: data > 0 } };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Get floor plans by project ID
  async findByProject(ctx) {
    try {
      const { projectId } = ctx.params;
      const knex = strapi.db.connection;
      
      const data = await knex('floor_plans')
        .where('project_id', projectId)
        .where('is_available', true)
        .orderBy('unit_type', 'asc')
        .select('*');
      
      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Get floor plans by unit type
  async findByUnitType(ctx) {
    try {
      const { unitType } = ctx.params;
      const knex = strapi.db.connection;
      
      const data = await knex('floor_plans')
        .where('unit_type', unitType)
        .where('is_available', true)
        .orderBy('size_sqft', 'asc')
        .select('*');
      
      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  }
}; 