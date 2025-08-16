/**
 * A set of functions called "actions" for `image-gallery`
 */

export default {
  // Get all image galleries
  async find(ctx) {
    try {
      console.log('=== Image gallery find method called ===');
      const knex = strapi.db.connection;
      
      // Test basic query first
      const testQuery = await knex('image_galleries').select('*').limit(5);
      console.log(`Test query found: ${testQuery.length} records`);
      
      const data = await knex('image_galleries')
        .select('*')
        .where('is_active', true)
        .orderBy('display_order', 'asc')
        .orderBy('created_at', 'desc');
      
      console.log(`Final query found: ${data.length} image galleries`);
      console.log('=== End of find method ===');
      return { data };
    } catch (err) {
      console.error('Error in image-gallery find method:', err);
      ctx.throw(500, err);
    }
  },

  // Get a single image gallery by ID
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      
      if (!id) {
        return ctx.badRequest('Image gallery ID is required');
      }
      
      if (isNaN(parseInt(id))) {
        return ctx.notFound('Invalid image gallery ID format');
      }
      
      const knex = strapi.db.connection;
      
      const data = await knex('image_galleries')
        .where('id', id)
        .where('is_active', true)
        .first();
      
      if (!data) {
        return ctx.notFound('Image gallery not found');
      }
      
      return { data };
    } catch (err) {
      console.error('Error in image-gallery findOne method:', err);
      ctx.throw(500, err);
    }
  },

  // Get image galleries by project name
  async findByProject(ctx) {
    try {
      const { projectName } = ctx.params;
      
      if (!projectName) {
        return ctx.badRequest('Project name is required');
      }
      
      const knex = strapi.db.connection;
      
      const data = await knex('image_galleries')
        .where('project_name', projectName)
        .where('is_active', true)
        .orderBy('display_order', 'asc')
        .orderBy('created_at', 'desc')
        .select('*');
      
      return { data };
    } catch (err) {
      console.error('Error in image-gallery findByProject method:', err);
      ctx.throw(500, err);
    }
  },

  // Create a new image gallery
  async create(ctx) {
    try {
      const knex = strapi.db.connection;
      const imageData = ctx.request.body;
      
      // Validate required fields
      if (!imageData.project_name) {
        return ctx.badRequest('Project name is required');
      }
      
      if (!imageData.image_title) {
        return ctx.badRequest('Image title is required');
      }
      
      if (!imageData.image_url) {
        return ctx.badRequest('Image URL is required');
      }
      
      // Insert into image_galleries table
      const result = await knex('image_galleries').insert(imageData).returning('id');
      const id = Array.isArray(result) ? result[0] : result;
      
      // Fetch the created image gallery
      const data = await knex('image_galleries').where('id', id).first();
      
      return { data };
    } catch (err) {
      console.error('Error creating image gallery:', err);
      ctx.throw(400, err);
    }
  },

  // Update an image gallery
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      const updateData = ctx.request.body;
      
      // Update the image gallery
      await knex('image_galleries')
        .where('id', id)
        .update(updateData);
      
      // Fetch the updated image gallery
      const data = await knex('image_galleries').where('id', id).first();
      
      return { data };
    } catch (err) {
      console.error('Error updating image gallery:', err);
      ctx.throw(400, err);
    }
  },

  // Delete an image gallery
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      
      // Soft delete by setting is_active to false
      const data = await knex('image_galleries')
        .where('id', id)
        .update({ is_active: false });
      
      return { data: { deleted: data > 0 } };
    } catch (err) {
      console.error('Error deleting image gallery:', err);
      ctx.throw(500, err);
    }
  },

  // Get featured images
  async getFeatured(ctx) {
    try {
      const knex = strapi.db.connection;
      
      const data = await knex('image_galleries')
        .where('is_featured', true)
        .where('is_active', true)
        .orderBy('display_order', 'asc')
        .orderBy('created_at', 'desc')
        .select('*');
      
      return { data };
    } catch (err) {
      console.error('Error in image-gallery getFeatured method:', err);
      ctx.throw(500, err);
    }
  },

  // Get images by category
  async getByCategory(ctx) {
    try {
      const { category } = ctx.params;
      
      if (!category) {
        return ctx.badRequest('Category is required');
      }
      
      const knex = strapi.db.connection;
      
      const data = await knex('image_galleries')
        .where('image_category', category)
        .where('is_active', true)
        .orderBy('display_order', 'asc')
        .orderBy('created_at', 'desc')
        .select('*');
      
      return { data };
    } catch (err) {
      console.error('Error in image-gallery getByCategory method:', err);
      ctx.throw(500, err);
    }
  }
};
