/**
 * site-plans controller
 */

export default {
  // Get all site plans
  async find(ctx) {
    try {
      const knex = strapi.db.connection;
      
      const data = await knex('site_plans')
        .select('*')
        .orderBy('created_at', 'desc');
      
      return { data };
    } catch (err) {
      console.error('Error in site-plans find method:', err);
      ctx.throw(500, err);
    }
  },

  // Get a single site plan by ID
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      
      const data = await knex('site_plans')
        .where('id', id)
        .first();
      
      if (!data) {
        return ctx.notFound('Site plan not found');
      }
      
      return { data };
    } catch (err) {
      console.error('Error in site-plans findOne method:', err);
      ctx.throw(500, err);
    }
  },

  // Create a new site plan
  async create(ctx) {
    try {
      const knex = strapi.db.connection;
      const { data } = ctx.request.body;
      
      const [id] = await knex('site_plans').insert(data);
      const created = await knex('site_plans').where('id', id).first();
      
      return { data: created };
    } catch (err) {
      console.error('Error in site-plans create method:', err);
      ctx.throw(500, err);
    }
  },

  // Update a site plan
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      const knex = strapi.db.connection;
      
      await knex('site_plans').where('id', id).update(data);
      const updated = await knex('site_plans').where('id', id).first();
      
      if (!updated) {
        return ctx.notFound('Site plan not found');
      }
      
      return { data: updated };
    } catch (err) {
      console.error('Error in site-plans update method:', err);
      ctx.throw(500, err);
    }
  },

  // Delete a site plan
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      
      const deleted = await knex('site_plans').where('id', id).del();
      
      if (deleted === 0) {
        return ctx.notFound('Site plan not found');
      }
      
      return { data: { deleted: true } };
    } catch (err) {
      console.error('Error in site-plans delete method:', err);
      ctx.throw(500, err);
    }
  }
};
