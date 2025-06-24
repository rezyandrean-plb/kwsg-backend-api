/**
 * A set of functions called "actions" for `facilities`
 */

export default {
  // Get all facilities
  async find(ctx) {
    try {
      const knex = strapi.db.connection;
      
      const data = await knex('facilities')
        .select('*')
        .orderBy('name', 'asc');
      
      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Get a single facility by ID
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      
      const data = await knex('facilities')
        .where('id', id)
        .first();
      
      if (!data) {
        return ctx.notFound('Facility not found');
      }
      
      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Create a new facility
  async create(ctx) {
    try {
      const knex = strapi.db.connection;
      const facilityData = ctx.request.body;
      
      console.log('Received data:', facilityData);
      
      // Simple insert with just the required fields
      const insertData = {
        name: facilityData.name,
        description: facilityData.description || null,
        icon: facilityData.icon || null
      };
      
      console.log('Insert data:', insertData);
      
      const result = await knex('facilities').insert(insertData).returning('*');
      
      console.log('Insert result:', result);
      
      return { data: result[0] };
    } catch (err) {
      console.error('Error creating facility:', err);
      ctx.throw(400, err);
    }
  },

  // Update a facility
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      const updateData = ctx.request.body;
      
      // Map the content type fields to database fields
      const dbData = {
        name: updateData.name,
        description: updateData.description,
        icon: updateData.icon, // Use 'icon' instead of 'icon_url'
        updated_at: new Date()
      };
      
      // Remove undefined fields
      Object.keys(dbData).forEach(key => {
        if (dbData[key] === undefined) {
          delete dbData[key];
        }
      });
      
      await knex('facilities')
        .where('id', id)
        .update(dbData);
      
      const data = await knex('facilities').where('id', id).first();
      
      return { data };
    } catch (err) {
      ctx.throw(400, err);
    }
  },

  // Delete a facility
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      
      const data = await knex('facilities')
        .where('id', id)
        .del();
      
      return { data: { deleted: data > 0 } };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Get facilities by category (this would need a category field in the database)
  async findByCategory(ctx) {
    try {
      const { category } = ctx.params;
      const knex = strapi.db.connection;
      
      // Note: The current facilities table doesn't have a category field
      // This is a placeholder for future enhancement
      const data = await knex('facilities')
        .orderBy('name', 'asc')
        .select('*');
      
      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  }
}; 