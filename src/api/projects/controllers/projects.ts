/**
 * A set of functions called "actions" for `projects`
 */

export default {
  // Get all projects
  async find(ctx) {
    try {
      const knex = strapi.db.connection;
      
      const data = await knex('projects')
        .select('*')
        .orderBy('created_at', 'desc');
      
      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Get a single project by ID with detailed related data
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      
      // Get the main project data from projects table
      const project = await knex('projects')
        .where('id', id)
        .first();
      
      if (!project) {
        return ctx.notFound('Project not found');
      }

      // Get related data using raw SQL queries for better performance
      
      // Get project images
      const images = await knex('project_images')
        .where('project_id', id)
        .orderBy('display_order', 'asc')
        .select('*');

      // Get project facilities through junction table
      const facilities = await knex('project_facilities')
        .join('facilities', 'project_facilities.facility_id', 'facilities.id')
        .where('project_facilities.project_id', id)
        .select('facilities.*');

      // Get project features through junction table
      const features = await knex('project_features')
        .join('features', 'project_features.feature_id', 'features.id')
        .where('project_features.project_id', id)
        .select('features.*');

      // Get developer information
      const developer = await knex('developers')
        .where('name', project.developer)
        .first();

      // Get nearby amenities (if any)
      const nearbyAmenities = await knex('nearby_amenities')
        .where('project_id', id)
        .select('*');

      // Get similar projects (if any)
      const similarProjects = await knex('similar_projects')
        .where('project_id', id)
        .select('id', 'name', 'location', 'price', 'developer', 'completion', 'image_url');

      // Get floor plans (if any)
      const floorPlans = await knex('floor_plans')
        .where('project_id', id)
        .select('*');

      // Get unit availability (if any)
      const unitAvailability = await knex('unit_availability')
        .where('project_id', id)
        .select('*');

      // Get unit types (if any)
      const unitTypes = await knex('unit_types')
        .where('project_id', id)
        .select('*');

      // Combine all data
      const detailedProject = {
        ...project,
        images,
        facilities,
        features,
        developer,
        nearbyAmenities,
        similarProjects,
        floorPlans,
        unitAvailability,
        unitTypes,
      };
      
      return { data: detailedProject };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Create a new project
  async create(ctx) {
    try {
      const knex = strapi.db.connection;
      const projectData = ctx.request.body;
      
      // Insert into projects table
      const result = await knex('projects').insert(projectData).returning('id');
      const id = Array.isArray(result) ? result[0] : result;
      
      // Fetch the created project
      const data = await knex('projects').where('id', id).first();
      
      return { data };
    } catch (err) {
      ctx.throw(400, err);
    }
  },

  // Update a project
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      const updateData = ctx.request.body;
      
      // Update the project in projects table
      await knex('projects')
        .where('id', id)
        .update(updateData);
      
      // Fetch the updated project
      const data = await knex('projects').where('id', id).first();
      
      return { data };
    } catch (err) {
      ctx.throw(400, err);
    }
  },

  // Delete a project
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      
      // Delete from projects table
      const data = await knex('projects')
        .where('id', id)
        .del();
      
      return { data: { deleted: data > 0 } };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Custom action to get projects by location
  async findByLocation(ctx) {
    try {
      const { location } = ctx.params;
      const knex = strapi.db.connection;
      
      const data = await knex('projects')
        .where('location', 'like', `%${location}%`)
        .orderBy('created_at', 'desc')
        .select('*');
      
      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // exampleAction: async (ctx, next) => {
  //   try {
  //     ctx.body = 'ok';
  //   } catch (err) {
  //     ctx.body = err;
  //   }
  // }
};
