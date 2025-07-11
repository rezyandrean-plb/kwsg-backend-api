/**
 * A set of functions called "actions" for `press-articles`
 */

export default {
  // Get all press articles
  async find(ctx) {
    try {
      const knex = strapi.db.connection;
      
      // First, let's check if the table exists and has data
      const tableExists = await knex.schema.hasTable('press_articles');
      console.log('Table exists:', tableExists);
      
      if (!tableExists) {
        return { data: [], message: 'Table does not exist' };
      }
      
      // Get all press articles ordered by date (newest first)
      const data = await knex('press_articles')
        .select('*')
        .orderBy('date', 'desc');
      
      console.log('Found data:', data.length, 'records');
      
      return { data };
    } catch (err) {
      console.error('Error in find method:', err);
      ctx.throw(500, err);
    }
  },

  // Get a single press article by ID
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      
      const data = await knex('press_articles')
        .where('id', id)
        .first();
      
      if (!data) {
        return ctx.notFound('Press article not found');
      }
      
      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Get press article by slug
  async findBySlug(ctx) {
    try {
      const { slug } = ctx.params;
      const knex = strapi.db.connection;
      
      const data = await knex('press_articles')
        .where('slug', slug)
        .first();
      
      if (!data) {
        return ctx.notFound('Press article not found');
      }
      
      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Get press articles by year
  async findByYear(ctx) {
    try {
      const { year } = ctx.params;
      const knex = strapi.db.connection;
      
      const data = await knex('press_articles')
        .where('year', year)
        .orderBy('date', 'desc')
        .select('*');
      
      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Get press articles by source
  async findBySource(ctx) {
    try {
      const { source } = ctx.params;
      const knex = strapi.db.connection;
      
      const data = await knex('press_articles')
        .where('source', source)
        .orderBy('date', 'desc')
        .select('*');
      
      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Create a new press article
  async create(ctx) {
    try {
      const knex = strapi.db.connection;
      const articleData = ctx.request.body;
      
      // Validate required fields
      if (!articleData.title) {
        return ctx.badRequest('Article title is required');
      }
      if (!articleData.description) {
        return ctx.badRequest('Article description is required');
      }
      if (!articleData.imageUrl) {
        return ctx.badRequest('Article image URL is required');
      }
      if (!articleData.link) {
        return ctx.badRequest('Article link is required');
      }
      if (!articleData.date) {
        return ctx.badRequest('Article date is required');
      }
      if (!articleData.year) {
        return ctx.badRequest('Article year is required');
      }
      if (!articleData.source) {
        return ctx.badRequest('Article source is required');
      }
      
      // Insert into press_articles table
      const result = await knex('press_articles').insert(articleData).returning('id');
      const id = Array.isArray(result) ? result[0] : result;
      
      // Fetch the created article
      const data = await knex('press_articles').where('id', id).first();
      
      return { data };
    } catch (err) {
      console.error('Error creating press article:', err);
      ctx.throw(400, err);
    }
  },

  // Update a press article
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      const updateData = ctx.request.body;
      
      // Check if article exists
      const existingArticle = await knex('press_articles').where('id', id).first();
      if (!existingArticle) {
        return ctx.notFound('Press article not found');
      }
      
      // Update the article
      await knex('press_articles')
        .where('id', id)
        .update(updateData);
      
      // Fetch the updated article
      const data = await knex('press_articles').where('id', id).first();
      
      return { data };
    } catch (err) {
      ctx.throw(400, err);
    }
  },

  // Delete a press article
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      
      // Check if article exists
      const existingArticle = await knex('press_articles').where('id', id).first();
      if (!existingArticle) {
        return ctx.notFound('Press article not found');
      }
      
      // Delete from press_articles table
      const deletedCount = await knex('press_articles')
        .where('id', id)
        .del();
      
      return { data: { deleted: deletedCount > 0 } };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Bulk create press articles (for seeding data)
  async bulkCreate(ctx) {
    try {
      const knex = strapi.db.connection;
      const articlesData = ctx.request.body;
      
      if (!Array.isArray(articlesData)) {
        return ctx.badRequest('Request body must be an array of articles');
      }
      
      // Validate each article
      for (const article of articlesData) {
        if (!article.title || !article.description || !article.imageUrl || 
            !article.link || !article.date || !article.year || !article.source) {
          return ctx.badRequest('All required fields must be provided for each article');
        }
      }
      
      // Insert all articles
      const result = await knex('press_articles').insert(articlesData).returning('*');
      
      return { data: result };
    } catch (err) {
      console.error('Error bulk creating press articles:', err);
      ctx.throw(400, err);
    }
  },

  // Search press articles
  async search(ctx) {
    try {
      const { query } = ctx.query;
      const knex = strapi.db.connection;
      
      if (!query) {
        return ctx.badRequest('Search query is required');
      }
      
      const data = await knex('press_articles')
        .where(function() {
          this.where('title', 'like', `%${query}%`)
            .orWhere('description', 'like', `%${query}%`)
            .orWhere('source', 'like', `%${query}%`);
        })
        .orderBy('date', 'desc')
        .select('*');
      
      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  }
}; 