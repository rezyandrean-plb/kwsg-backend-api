/**
 * A set of functions called "actions" for `press-articles`
 */

export default {
  // Get all press articles
  async find(ctx) {
    try {
      const knex = strapi.db.connection;
      
      // Check if press_articles table exists
      const tableExists = await knex.schema.hasTable('press_articles');
      console.log('press_articles table exists:', tableExists);
      
      if (!tableExists) {
        return { data: [], message: 'Table does not exist' };
      }
      
      // Get all press articles and parse the JSON data
      const rawData = await knex('press_articles')
        .select('*')
        .orderBy('created_at', 'desc');
      
      // Parse the JSON data field and merge with other fields
      const data = rawData.map(row => {
        const jsonData = row.data ? JSON.parse(row.data) : {};
        return {
          id: row.id,
          ...jsonData,
          created_at: row.created_at,
          updated_at: row.updated_at
        };
      });
      
      console.log('Found data:', data.length, 'records');
      if (data.length > 0) {
        console.log('Sample record:', data[0]);
      }
      
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
      
      const rawData = await knex('press_articles')
        .where('id', id)
        .first();
      
      if (!rawData) {
        return ctx.notFound('Press article not found');
      }
      
      // Parse the JSON data field and merge with other fields
      const jsonData = rawData.data ? JSON.parse(rawData.data) : {};
      const data = {
        id: rawData.id,
        ...jsonData,
        created_at: rawData.created_at,
        updated_at: rawData.updated_at
      };
      
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
      
      const rawData = await knex('press_articles')
        .whereRaw("data->>'slug' = ?", [slug])
        .first();
      
      if (!rawData) {
        return ctx.notFound('Press article not found');
      }
      
      // Parse the JSON data field and merge with other fields
      const jsonData = rawData.data ? JSON.parse(rawData.data) : {};
      const data = {
        id: rawData.id,
        ...jsonData,
        created_at: rawData.created_at,
        updated_at: rawData.updated_at
      };
      
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
      
      const rawData = await knex('press_articles')
        .whereRaw("data->>'year' = ?", [year])
        .orderBy('created_at', 'desc')
        .select('*');
      
      // Parse the JSON data field for each record
      const data = rawData.map(row => {
        const jsonData = row.data ? JSON.parse(row.data) : {};
        return {
          id: row.id,
          ...jsonData,
          created_at: row.created_at,
          updated_at: row.updated_at
        };
      });
      
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
      
      const rawData = await knex('press_articles')
        .whereRaw("data->>'source' = ?", [source])
        .orderBy('created_at', 'desc')
        .select('*');
      
      // Parse the JSON data field for each record
      const data = rawData.map(row => {
        const jsonData = row.data ? JSON.parse(row.data) : {};
        return {
          id: row.id,
          ...jsonData,
          created_at: row.created_at,
          updated_at: row.updated_at
        };
      });
      
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
      
      // Generate slug if not provided
      if (!articleData.slug) {
        articleData.slug = articleData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      
      // Prepare the JSON data
      const jsonData = {
        title: articleData.title,
        description: articleData.description,
        imageUrl: articleData.imageUrl,
        link: articleData.link,
        date: articleData.date,
        year: articleData.year,
        source: articleData.source,
        slug: articleData.slug,
        articleContent: articleData.articleContent || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Insert into press_articles table without specifying ID
      const result = await knex('press_articles').insert({
        data: jsonData
      }).returning('*');
      
      const insertedRow = Array.isArray(result) ? result[0] : result;
      
      // Parse the JSON data and return formatted response
      const jsonDataParsed = insertedRow.data ? JSON.parse(insertedRow.data) : {};
      const data = {
        id: insertedRow.id,
        ...jsonDataParsed,
        created_at: insertedRow.created_at,
        updated_at: insertedRow.updated_at
      };
      
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
      
      // Parse existing data
      const existingJsonData = existingArticle.data ? JSON.parse(existingArticle.data) : {};
      
      // Generate slug if title is being updated and slug is not provided
      if (updateData.title && !updateData.slug) {
        updateData.slug = updateData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      
      // Merge with update data, preserving existing fields that aren't being updated
      const updatedJsonData = {
        ...existingJsonData,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      // Update the article
      const result = await knex('press_articles')
        .where('id', id)
        .update({ data: updatedJsonData })
        .returning('*');
      
      const updatedRow = Array.isArray(result) ? result[0] : result;
      
      // Parse the JSON data and return formatted response
      const jsonDataParsed = updatedRow.data ? JSON.parse(updatedRow.data) : {};
      const data = {
        id: updatedRow.id,
        ...jsonDataParsed,
        created_at: updatedRow.created_at,
        updated_at: updatedRow.updated_at
      };
      
      return { data };
    } catch (err) {
      console.error('Error updating press article:', err);
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
      
      // Prepare JSON data for each article
      const jsonDataArray = articlesData.map(article => ({
        title: article.title,
        description: article.description,
        imageUrl: article.imageUrl,
        link: article.link,
        date: article.date,
        year: article.year,
        source: article.source,
        slug: article.slug,
        articleContent: article.articleContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      // Insert all articles
      const insertData = jsonDataArray.map(jsonData => ({ data: jsonData }));
      const result = await knex('press_articles').insert(insertData).returning('*');
      
      // Format the response
      const data = result.map(row => {
        const jsonData = row.data ? JSON.parse(row.data) : {};
        return {
          id: row.id,
          ...jsonData,
          created_at: row.created_at,
          updated_at: row.updated_at
        };
      });
      
      return { data };
    } catch (err) {
      console.error('Error bulk creating press articles:', err);
      ctx.throw(400, err);
    }
  },

  // Search press articles
  async search(ctx) {
    try {
      console.log('Search method called with query:', ctx.query);
      const { query } = ctx.query;
      const knex = strapi.db.connection;
      
      if (!query) {
        return ctx.badRequest('Search query is required');
      }
      
      console.log('Searching for query:', query);
      
      // Get all articles and filter in JavaScript
      const rawData = await knex('press_articles')
        .orderBy('created_at', 'desc')
        .select('*');
      
      console.log('Found raw data:', rawData.length, 'records');
      
      // Parse the JSON data field and filter
      const data = rawData
        .map(row => {
          const jsonData = row.data ? JSON.parse(row.data) : {};
          return {
            id: row.id,
            ...jsonData,
            created_at: row.created_at,
            updated_at: row.updated_at
          };
        })
        .filter(article => {
          const searchTerm = query.toLowerCase();
          return (
            article.title?.toLowerCase().includes(searchTerm) ||
            article.description?.toLowerCase().includes(searchTerm) ||
            article.source?.toLowerCase().includes(searchTerm)
          );
        });
      
      console.log('Filtered data:', data.length, 'records');
      return { data };
    } catch (err) {
      console.error('Error in search method:', err);
      ctx.throw(500, err);
    }
  },

  // Test database connection
  async testDb(ctx) {
    try {
      const knex = strapi.db.connection;
      
      // Get database info
      const dbInfo = await knex.raw('SELECT current_database(), current_user');
      
      // List all tables
      const tables = await knex.raw(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      // Check press_articles table
      const tableExists = await knex.schema.hasTable('press_articles');
      
      // Try to get data from press_articles
      let pressArticlesData = [];
      if (tableExists) {
        const rawData = await knex('press_articles').select('*').limit(3);
        pressArticlesData = rawData.map(row => {
          const jsonData = row.data ? JSON.parse(row.data) : {};
          return {
            id: row.id,
            ...jsonData,
            created_at: row.created_at,
            updated_at: row.updated_at
          };
        });
      }
      
      return {
        data: {
          database: dbInfo.rows[0],
          tables: tables.rows.map(r => r.table_name),
          pressArticlesTableExists: tableExists,
          pressArticlesCount: pressArticlesData.length,
          sampleData: pressArticlesData
        }
      };
    } catch (err) {
      console.error('Error in testDb method:', err);
      return { error: err.message };
    }
  }
}; 