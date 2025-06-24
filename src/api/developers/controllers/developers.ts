/**
 * A set of functions called "actions" for `developers`
 */

export default {
  // Get all developers
  async find(ctx) {
    try {
      const knex = strapi.db.connection;
      
      const data = await knex('developers')
        .select('*')
        .orderBy('name', 'asc');
      
      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Get a single developer by ID
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      
      const data = await knex('developers')
        .where('id', id)
        .first();
      
      if (!data) {
        return ctx.notFound('Developer not found');
      }
      
      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Create a new developer
  async create(ctx) {
    try {
      const knex = strapi.db.connection;
      const developerData = ctx.request.body;
      
      // Map the content type fields to database fields
      const dbData = {
        name: developerData.name,
        description: developerData.description,
        logo_url: developerData.logo_url,
        website: developerData.website,
        contact_email: developerData.contact_email,
        contact_phone: developerData.contact_phone,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const [id] = await knex('developers').insert(dbData);
      
      const data = await knex('developers').where('id', id).first();
      
      return { data };
    } catch (err) {
      ctx.throw(400, err);
    }
  },

  // Update a developer
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      const updateData = ctx.request.body;
      
      // Map the content type fields to database fields
      const dbData = {
        name: updateData.name,
        description: updateData.description,
        logo_url: updateData.logo_url,
        website: updateData.website,
        contact_email: updateData.contact_email,
        contact_phone: updateData.contact_phone,
        updated_at: new Date()
      };
      
      // Remove undefined fields
      Object.keys(dbData).forEach(key => {
        if (dbData[key] === undefined) {
          delete dbData[key];
        }
      });
      
      await knex('developers')
        .where('id', id)
        .update(dbData);
      
      const data = await knex('developers').where('id', id).first();
      
      return { data };
    } catch (err) {
      ctx.throw(400, err);
    }
  },

  // Delete a developer
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      
      const data = await knex('developers')
        .where('id', id)
        .del();
      
      return { data: { deleted: data > 0 } };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Get developer by name
  async findByName(ctx) {
    try {
      const { name } = ctx.params;
      const knex = strapi.db.connection;
      
      const data = await knex('developers')
        .where('name', 'like', `%${name}%`)
        .first();
      
      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  }
}; 