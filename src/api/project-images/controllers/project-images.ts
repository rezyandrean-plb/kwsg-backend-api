/**
 * A set of functions called "actions" for `project-images`
 */

export default {
  // Get all project images
  async find(ctx) {
    try {
      const knex = strapi.db.connection;
      
      const data = await knex('project_images')
        .select('*')
        .orderBy('display_order', 'asc');
      
      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Get a single project image by ID
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      
      const data = await knex('project_images')
        .where('id', id)
        .first();
      
      if (!data) {
        return ctx.notFound('Project image not found');
      }
      
      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Create a new project image
  async create(ctx) {
    try {
      const knex = strapi.db.connection;
      const imageData = ctx.request.body;
      
      const [id] = await knex('project_images').insert(imageData);
      
      const data = await knex('project_images').where('id', id).first();
      
      return { data };
    } catch (err) {
      ctx.throw(400, err);
    }
  },

  // Update a project image
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      const updateData = ctx.request.body;
      
      await knex('project_images')
        .where('id', id)
        .update(updateData);
      
      const data = await knex('project_images').where('id', id).first();
      
      return { data };
    } catch (err) {
      ctx.throw(400, err);
    }
  },

  // Delete a project image
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      
      const data = await knex('project_images')
        .where('id', id)
        .del();
      
      return { data: { deleted: data > 0 } };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Get images by project ID
  async findByProject(ctx) {
    try {
      const { projectId } = ctx.params;
      const knex = strapi.db.connection;
      
      const data = await knex('project_images')
        .where('project_id', projectId)
        .orderBy('display_order', 'asc')
        .select('*');
      
      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  }
}; 