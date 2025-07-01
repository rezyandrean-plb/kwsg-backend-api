/**
 * A set of functions called "actions" for `projects`
 */

export default {
  // Get all projects
  async find(ctx) {
    try {
      const knex = strapi.db.connection;
      
      // Get projects with unit availability price information
      const data = await knex('projects as p')
        .select(
          'p.*',
          knex.raw(`
            CASE 
              WHEN MIN(ua.price) IS NOT NULL AND MIN(ua.price) != '' 
              THEN CONCAT(MIN(ua.price), ' - ', MAX(ua.price))
              ELSE p.price 
            END as display_price
          `),
          knex.raw(`
            CASE 
              WHEN MIN(ua.price) IS NOT NULL AND MIN(ua.price) != '' 
              THEN MIN(ua.price) 
              ELSE p.price_from 
            END as price_reference
          `),
          knex.raw(`
            COUNT(DISTINCT ua.unit_type) as unit_types_count,
            SUM(ua.available_units) as total_available_units
          `)
        )
        .leftJoin('unit_availability as ua', 'p.id', 'ua.project_id')
        .groupBy('p.id')
        .orderBy('p.created_at', 'desc');
      
      return { data };
    } catch (err) {
      console.error('Error in find method:', err);
      ctx.throw(500, err);
    }
  },

  // Get a single project by ID with detailed related data
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      
      // Get the main project data from projects table with unit availability price info
      const project = await knex('projects as p')
        .select(
          'p.*',
          knex.raw(`
            CASE 
              WHEN MIN(ua.price) IS NOT NULL AND MIN(ua.price) != '' 
              THEN CONCAT(MIN(ua.price), ' - ', MAX(ua.price))
              ELSE p.price 
            END as display_price
          `),
          knex.raw(`
            CASE 
              WHEN MIN(ua.price) IS NOT NULL AND MIN(ua.price) != '' 
              THEN MIN(ua.price) 
              ELSE p.price_from 
            END as price_reference
          `),
          knex.raw(`
            COUNT(DISTINCT ua.unit_type) as unit_types_count,
            SUM(ua.available_units) as total_available_units
          `)
        )
        .leftJoin('unit_availability as ua', 'p.id', 'ua.project_id')
        .where('p.id', id)
        .groupBy('p.id')
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
      
      // Validate required fields
      if (!projectData.name) {
        return ctx.badRequest('Project name is required');
      }
      
      // Extract images from projectData to handle separately
      const { images, ...projectFields } = projectData;
      
      // Insert into projects table (excluding images field)
      const result = await knex('projects').insert(projectFields).returning('id');
      const id = Array.isArray(result) ? result[0] : result;
      
      // Handle images if provided
      if (images && Array.isArray(images) && images.length > 0) {
        const imageRecords = images.map((image, index) => ({
          project_id: id,
          image_url: image.url || image,
          display_order: image.display_order || index,
          alt_text: image.alt_text || '',
          is_primary: image.is_primary || false,
          caption: image.caption || ''
        }));
        
        await knex('project_images').insert(imageRecords);
      }
      
      // Fetch the created project with related data
      const data = await knex('projects').where('id', id).first();
      
      return { data };
    } catch (err) {
      console.error('Error creating project:', err);
      ctx.throw(400, err);
    }
  },

  // Update a project
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const knex = strapi.db.connection;
      const updateData = ctx.request.body;
      
      // Extract images from updateData to handle separately
      const { images, ...projectFields } = updateData;
      
      // Update the project in projects table (excluding images field)
      await knex('projects')
        .where('id', id)
        .update(projectFields);
      
      // Handle images if provided
      if (images !== undefined) {
        // Delete existing images for this project
        await knex('project_images').where('project_id', id).del();
        
        // Insert new images if provided
        if (Array.isArray(images) && images.length > 0) {
          const imageRecords = images.map((image, index) => ({
            project_id: id,
            image_url: image.url || image,
            display_order: image.display_order || index,
            alt_text: image.alt_text || '',
            is_primary: image.is_primary || false,
            caption: image.caption || ''
          }));
          
          await knex('project_images').insert(imageRecords);
        }
      }
      
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
      
      const data = await knex('projects as p')
        .select(
          'p.*',
          knex.raw(`
            CASE 
              WHEN MIN(ua.price) IS NOT NULL AND MIN(ua.price) != '' 
              THEN CONCAT(MIN(ua.price), ' - ', MAX(ua.price))
              ELSE p.price 
            END as display_price
          `),
          knex.raw(`
            CASE 
              WHEN MIN(ua.price) IS NOT NULL AND MIN(ua.price) != '' 
              THEN MIN(ua.price) 
              ELSE p.price_from 
            END as price_reference
          `),
          knex.raw(`
            COUNT(DISTINCT ua.unit_type) as unit_types_count,
            SUM(ua.available_units) as total_available_units
          `)
        )
        .leftJoin('unit_availability as ua', 'p.id', 'ua.project_id')
        .where('p.location', 'like', `%${location}%`)
        .groupBy('p.id')
        .orderBy('p.created_at', 'desc');
      
      return { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Test method to verify database connection
  async test(ctx) {
    try {
      console.log('Test method called');
      
      const knex = strapi.db.connection;
      
      // Simple query to test connection
      const result = await knex('projects').select('id', 'name').limit(3);
      
      console.log('Test result:', result);
      
      ctx.body = {
        success: true,
        data: result,
        message: 'Database connection working'
      };
    } catch (err) {
      console.error('Test method error:', err);
      ctx.body = {
        success: false,
        error: err.message
      };
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
