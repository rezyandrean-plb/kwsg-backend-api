/**
 * A set of functions called "actions" for `projects`
 */

// Simple in-memory cache for projects
const projectsCache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000, // 5 minutes
  isExpired() {
    return !this.timestamp || (Date.now() - this.timestamp) > this.ttl;
  },
  set(data) {
    this.data = data;
    this.timestamp = Date.now();
  },
  get() {
    return this.isExpired() ? null : this.data;
  },
  clear() {
    this.data = null;
    this.timestamp = null;
  }
};

export default {
  // Get all projects with optimized performance
  async find(ctx) {
    try {
      console.log('Projects find method called');
      
      // Check cache first (only for first page without filters)
      const { 
        page = '1', 
        pageSize = '8', 
        limit, 
        offset,
        sort = 'created_at:desc',
        filters = {},
        populate = 'developer',
        useCache = 'true'
      } = ctx.query;
      
      // Use cache only for first page without filters
      if (useCache === 'true' && page === '1' && Object.keys(filters).length === 0) {
        const cachedData = projectsCache.get();
        if (cachedData) {
          console.log('Returning cached projects data');
          return cachedData;
        }
      }
      
      // Calculate pagination
      const actualLimit = limit ? parseInt(limit) : parseInt(pageSize);
      const actualOffset = offset ? parseInt(offset) : ((parseInt(page) - 1) * actualLimit);
      
      // Get database connection
      const knex = strapi.db.connection;
      console.log('Database connection obtained');
      
      // Build base query with pagination
      let query = knex('projects')
        .select('*')
        .limit(actualLimit)
        .offset(actualOffset);
      
      // Apply sorting
      if (sort) {
        const [field, direction] = sort.split(':');
        query = query.orderBy(field, direction || 'asc');
      } else {
        query = query.orderBy('created_at', 'desc');
      }
      
      // Apply filters
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          if (typeof filters[key] === 'string') {
            query = query.where(key, 'like', `%${filters[key]}%`);
          } else {
            query = query.where(key, filters[key]);
          }
        }
      });
      
      // Get projects with pagination
      const projects = await query;
      console.log('Projects count:', projects.length);
      
      // Get total count for pagination metadata
      const countQuery = knex('projects');
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          if (typeof filters[key] === 'string') {
            countQuery.where(key, 'like', `%${filters[key]}%`);
          } else {
            countQuery.where(key, filters[key]);
          }
        }
      });
      const totalCount = await countQuery.count('* as total').first();
      
      // Optimize developer lookup - fetch all developers at once
      let developersMap = new Map();
      if (populate === 'developer' || populate === 'true') {
        try {
          // Get all unique developer names from projects
          const developerNames = Array.from(new Set(projects.map(p => p.developer).filter(Boolean)));
          
          if (developerNames.length > 0) {
            // Fetch all developers in one query
            const developers = await knex('developers')
              .whereIn('name', developerNames)
              .select('*');
            
            // Create a map for fast lookup
            developers.forEach(dev => {
              developersMap.set(dev.name, dev);
            });
          }
        } catch (err) {
          console.log('developers table not accessible:', err.message);
        }
      }
      
      // Enhance projects with developer information using the map
      const data = projects.map(project => {
        let developer = null;
        
        if (project.developer && developersMap.has(project.developer)) {
          developer = developersMap.get(project.developer);
        } else if (project.developer) {
          // Fallback: create basic developer object
          developer = {
            name: project.developer,
            description: null,
            logo_url: null,
            website: null,
            contact_email: null,
            contact_phone: null
          };
        }
        
        return {
          ...project,
          developer
        };
      });
      
      // Prepare response
      const response = { 
        data,
        meta: {
          pagination: {
            page: parseInt(page),
            pageSize: actualLimit,
            pageCount: Math.ceil(Number(totalCount.total) / actualLimit),
            total: totalCount.total
          }
        }
      };
      
      // Cache the result for first page without filters
      if (useCache === 'true' && page === '1' && Object.keys(filters).length === 0) {
        projectsCache.set(response);
      }
      
      return response;
    } catch (err) {
      console.error('Error in find method:', err);
      ctx.throw(500, err);
    }
  },

  // Get projects with minimal data for faster loading
  async findMinimal(ctx) {
    try {
      console.log('Projects findMinimal method called');
      
      const { 
        page = '1', 
        pageSize = '8', 
        limit, 
        offset,
        sort = 'created_at:desc',
        filters = {}
      } = ctx.query;
      
      // Calculate pagination
      const actualLimit = limit ? parseInt(limit) : parseInt(pageSize);
      const actualOffset = offset ? parseInt(offset) : ((parseInt(page) - 1) * actualLimit);
      
      const knex = strapi.db.connection;
      
      // Select only essential fields for faster query
      let query = knex('projects')
        .select([
          'id',
          'name',
          'location',
          'price',
          'price_from',
          'developer',
          'completion',
          'status',
          'image_url_banner',
          'created_at'
        ])
        .limit(actualLimit)
        .offset(actualOffset);
      
      // Apply sorting
      if (sort) {
        const [field, direction] = sort.split(':');
        query = query.orderBy(field, direction || 'asc');
      } else {
        query = query.orderBy('created_at', 'desc');
      }
      
      // Apply filters
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          if (typeof filters[key] === 'string') {
            query = query.where(key, 'like', `%${filters[key]}%`);
          } else {
            query = query.where(key, filters[key]);
          }
        }
      });
      
      const projects = await query;
      
      // Get total count
      const countQuery = knex('projects');
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          if (typeof filters[key] === 'string') {
            countQuery.where(key, 'like', `%${filters[key]}%`);
          } else {
            countQuery.where(key, filters[key]);
          }
        }
      });
      const totalCount = await countQuery.count('* as total').first();
      
      return { 
        data: projects,
        meta: {
          pagination: {
            page: parseInt(page),
            pageSize: actualLimit,
            pageCount: Math.ceil(Number(totalCount.total) / actualLimit),
            total: totalCount.total
          }
        }
      };
    } catch (err) {
      console.error('Error in findMinimal method:', err);
      ctx.throw(500, err);
    }
  },

  // Get a single project by ID with detailed related data
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      
      // Validate ID parameter
      if (!id) {
        return ctx.badRequest('Project ID is required');
      }
      
      // Check if ID is numeric
      if (isNaN(parseInt(id))) {
        return ctx.notFound('Invalid project ID format');
      }
      
      const knex = strapi.db.connection;
      
      // Get the main project data from projects table
      const project = await knex('projects')
        .where('id', id)
        .first();
      
      if (!project) {
        return ctx.notFound('Project not found');
      }

      // Initialize related data objects
      let images = [];
      let facilities = [];
      let features = [];
      let developer = null;
      let nearbyAmenities = [];
      let similarProjects = [];
      let floorPlans = [];
      let unitAvailability = [];
      let unitTypes = [];
      let brochures = [];
      let imageGallery = [];

      try {
        // Get project images (if table exists)
        images = await knex('project_images')
          .where('project_id', id)
          .orderBy('display_order', 'asc')
          .select('*');
      } catch (err) {
        console.log('project_images table not accessible:', err.message);
      }

      try {
        // Get project facilities through junction table (if tables exist)
        facilities = await knex('project_facilities')
          .join('facilities', 'project_facilities.facility_id', 'facilities.id')
          .where('project_facilities.project_id', id)
          .select('facilities.id', 'facilities.name', 'facilities.description', 'facilities.icon')
          .orderBy('facilities.name', 'asc');
      } catch (err) {
        console.log('facilities tables not accessible:', err.message);
        facilities = [];
      }

      try {
        // Get project features through junction table (if tables exist)
        features = await knex('project_features')
          .join('features', 'project_features.feature_id', 'features.id')
          .where('project_features.project_id', id)
          .select('features.*');
      } catch (err) {
        console.log('features tables not accessible:', err.message);
      }

      try {
        // Get developer information (if table exists)
        if (project.developer) {
          // First try exact match
          developer = await knex('developers')
            .where('name', project.developer)
            .first();
          
          // If no exact match, try partial match
          if (!developer) {
            developer = await knex('developers')
              .where('name', 'like', `%${project.developer}%`)
              .orWhere('name', 'like', `%${project.developer.split(' ')[0]}%`)
              .first();
          }
          
          // If still no match, create a basic developer object with the name
          if (!developer) {
            developer = {
              name: project.developer,
              description: null,
              logo_url: null,
              website: null,
              contact_email: null,
              contact_phone: null
            };
          }
        }
      } catch (err) {
        console.log('developers table not accessible:', err.message);
        // If table is not accessible, still provide developer name if available
        if (project.developer) {
          developer = {
            name: project.developer,
            description: null,
            logo_url: null,
            website: null,
            contact_email: null,
            contact_phone: null
          };
        }
      }

      try {
        // Get nearby amenities (if table exists)
        nearbyAmenities = await knex('nearby_amenities')
          .where('project_id', id)
          .select('*');
      } catch (err) {
        console.log('nearby_amenities table not accessible:', err.message);
      }

      try {
        // Get similar projects (if table exists)
        similarProjects = await knex('similar_projects')
          .where('project_id', id)
          .select('id', 'name', 'location', 'price', 'developer', 'completion', 'image_url');
      } catch (err) {
        console.log('similar_projects table not accessible:', err.message);
      }

      try {
        // Get floor plans (if table exists) - floor_plans table uses project_name, not project_id
        floorPlans = await knex('floor_plans')
          .where('project_name', project.name)
          .select('*');
        
        // If no floor plans found by project.name, try by project.project_name
        if (floorPlans.length === 0) {
          floorPlans = await knex('floor_plans')
            .where('project_name', project.project_name)
            .select('*');
        }
        
        // Transform floor plans to include proper image URL field
        floorPlans = floorPlans.map(plan => ({
          ...plan,
          image_url: plan.img || plan.floor_plan_image || plan.image_url || null, // Primary image URL field
          img: plan.img || plan.floor_plan_image || plan.image_url || null // Keep img field for backward compatibility
        }));
      } catch (err) {
        console.log('floor_plans table not accessible:', err.message);
      }

      try {
        // Get unit availability (if table exists)
        unitAvailability = await knex('unit_availability')
          .where('project_id', id)
          .select('*');
      } catch (err) {
        console.log('unit_availability table not accessible:', err.message);
      }

      try {
        // Get unit types (if table exists)
        unitTypes = await knex('unit_types')
          .where('project_id', id)
          .select('*');
      } catch (err) {
        console.log('unit_types table not accessible:', err.message);
      }

      try {
        // Get brochures for this project (if table exists) - brochures are linked by project name in brochure_title
        brochures = await knex('brochures')
          .where('brochure_title', 'like', `%${project.name}%`)
          .where('is_active', true)
          .orderBy('created_at', 'desc')
          .select('*');
        
        // Transform brochures to include proper URL field
        brochures = brochures.map(brochure => ({
          ...brochure,
          file_url: brochure.brochure_url || null, // Primary file URL field
          brochure_url: brochure.brochure_url || null // Keep original field for backward compatibility
        }));
      } catch (err) {
        console.log('brochures table not accessible:', err.message);
      }

      try {
        // Get image gallery for this project (if table exists) - image_galleries are linked by project_name
        imageGallery = await knex('image_galleries')
          .where('project_name', project.name)
          .where('is_active', true)
          .orderBy('display_order', 'asc')
          .orderBy('created_at', 'desc')
          .select('*');
        
        // If no image gallery found by project.name, try by project.project_name
        if (imageGallery.length === 0) {
          imageGallery = await knex('image_galleries')
            .where('project_name', project.project_name)
            .where('is_active', true)
            .orderBy('display_order', 'asc')
            .orderBy('created_at', 'desc')
            .select('*');
        }
      } catch (err) {
        console.log('image_galleries table not accessible:', err.message);
      }

      // Get site plans and unit pricing
      let sitePlans = [];
      let unitPricing = [];

      try {
        // Get site plans for this project (if table exists)
        sitePlans = await knex('site_plans')
          .where('project_id', id)
          .select('*');
        
        // If no site plans found by project_id, try by project name
        if (sitePlans.length === 0) {
          sitePlans = await knex('site_plans')
            .where('project_name', project.name)
            .select('*');
        }
      } catch (err) {
        console.log('site_plans table not accessible:', err.message);
      }

      try {
        // Get unit pricing for this project (if table exists)
        unitPricing = await knex('unit_pricing')
          .where('project_id', id)
          .select('*');
      } catch (err) {
        console.log('unit_pricing table not accessible:', err.message);
      }

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
        imageGallery,
        sitePlans,
        unitPricing,
      };
      
      return { data: detailedProject };
    } catch (err) {
      console.error('Error in findOne method:', err);
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
      
      // Validate location parameter
      if (!location) {
        return ctx.badRequest('Location parameter is required');
      }
      
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

  // Search projects by various criteria
  async search(ctx) {
    try {
      const { name, developer, location, type, status } = ctx.query;
      const knex = strapi.db.connection;
      
      let query = knex('projects');
      
      // Add search conditions based on provided parameters
      if (name) {
        query = query.where('name', 'like', `%${name}%`);
      }
      
      if (developer) {
        query = query.where('developer', 'like', `%${developer}%`);
      }
      
      if (location) {
        query = query.where('location', 'like', `%${location}%`);
      }
      
      if (type) {
        query = query.where('type', 'like', `%${type}%`);
      }
      
      if (status) {
        query = query.where('status', 'like', `%${status}%`);
      }
      
      const data = await query
        .select('*')
        .orderBy('created_at', 'desc');
      
      return { data };
    } catch (err) {
      console.error('Error in search method:', err);
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

  // Ultra simple test - no database, no complex logic
  async ultraSimpleTest(ctx) {
    try {
      console.log('Ultra simple test called');
      return { 
        message: 'Ultra simple test successful',
        timestamp: new Date().toISOString(),
        status: 'OK',
        server: 'running'
      };
    } catch (err) {
      console.error('Ultra simple test error:', err);
      return { 
        error: err.message,
        status: 'ERROR'
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
