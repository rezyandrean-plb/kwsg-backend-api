/**
 * A set of functions called "actions" for `projects`
 */

export default {
  // Get all projects
  async find(ctx) {
    try {
      console.log('Projects find method called');
      
      // Get database connection
      const knex = strapi.db.connection;
      console.log('Database connection obtained');
      
      // Get actual projects data
      const data = await knex('projects')
        .select('*')
        .orderBy('created_at', 'desc');
      
      console.log('Projects count:', data.length);
      
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

      // Get floor plans (if any) - check both project_id and project_name
      let floorPlans = [];
      
      // First try to get by project_id
      floorPlans = await knex('floor_plans')
        .where('project_id', id)
        .select('*');
      
      // If no floor plans found by project_id, try by project name
      if (floorPlans.length === 0) {
        floorPlans = await knex('floor_plans')
          .where('project_name', project.name)
          .select('*');
      }
      
      // If still no floor plans, try by project_name field
      if (floorPlans.length === 0) {
        floorPlans = await knex('floor_plans')
          .where('project_name', project.project_name)
          .select('*');
      }
      
      // Transform floor plans to include img field
      floorPlans = floorPlans.map(plan => ({
        ...plan,
        img: plan.img || plan.image_url || null // Use img field, fallback to image_url
      }));

      // Get unit availability (if any)
      const unitAvailability = await knex('unit_availability')
        .where('project_id', id)
        .select('*');

      // Get unit types (if any)
      const unitTypes = await knex('unit_types')
        .where('project_id', id)
        .select('*');

      // Get brochures for this project (if any)
      const brochures = await knex('brochures')
        .where('project_name', project.name)
        .where('is_active', true)
        .orderBy('created_at', 'desc')
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
        brochures,
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

  // Test route to verify database connection
  async test(ctx) {
    try {
      console.log('Testing database connection...');
      const knex = strapi.db.connection;
      
      // Simple test query
      const result = await knex.raw('SELECT 1 as test');
      console.log('Database connection test result:', result.rows);
      
      // Test projects table
      const projectsCount = await knex('projects').count('* as total');
      console.log('Projects count:', projectsCount[0].total);
      
      return { 
        message: 'Database connection successful',
        projectsCount: projectsCount[0].total,
        testResult: result.rows[0]
      };
    } catch (err) {
      console.error('Test method error:', err);
      return { 
        error: err.message,
        stack: err.stack 
      };
    }
  },

  // Simple test without database
  async simpleTest(ctx) {
    try {
      console.log('Simple test without database...');
      return { 
        message: 'Simple test successful',
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error('Simple test error:', err);
      return { 
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
