/**
 * A set of functions called "actions" for `projects`
 */

// Enhanced in-memory cache for projects with better TTL management
const projectsCache = {
  data: null,
  timestamp: null,
  ttl: 10 * 60 * 1000, // Increased to 10 minutes for better cache hit rate
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

// Cache for developers to avoid repeated queries
const developersCache = {
  data: new Map(),
  timestamp: null,
  ttl: 30 * 60 * 1000, // 30 minutes for developers (less frequently changing)
  isExpired() {
    return !this.timestamp || (Date.now() - this.timestamp) > this.ttl;
  },
  set(developers) {
    this.data.clear();
    developers.forEach(dev => {
      this.data.set(dev.name, dev);
    });
    this.timestamp = Date.now();
  },
  get() {
    return this.isExpired() ? null : this.data;
  },
  clear() {
    this.data.clear();
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
      
      // Optimize query by selecting only needed fields
      const selectFields = [
        'id', 'name', 'location', 'price', 'price_from', 'developer', 
        'completion', 'status', 'image_url_banner', 'created_at', 'updated_at',
        'description', 'type', 'bedrooms', 'bathrooms', 'slug'
      ];
      
      // Build base query with pagination and optimized field selection
      let query = knex('projects')
        .select(selectFields)
        .limit(actualLimit)
        .offset(actualOffset);
      
      // Apply sorting with index optimization
      if (sort) {
        const [field, direction] = sort.split(':');
        // Ensure we're using indexed fields for sorting
        const allowedSortFields = ['created_at', 'updated_at', 'name', 'price', 'status'];
        if (allowedSortFields.includes(field)) {
          query = query.orderBy(field, direction || 'asc');
        } else {
          query = query.orderBy('created_at', 'desc');
        }
      } else {
        query = query.orderBy('created_at', 'desc');
      }
      
      // Apply filters with optimization
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          if (typeof filters[key] === 'string') {
            // Use case-insensitive search for better performance
            query = query.whereRaw(`LOWER(${key}) LIKE LOWER(?)`, [`%${filters[key]}%`]);
          } else {
            query = query.where(key, filters[key]);
          }
        }
      });
      
      // Get projects with pagination
      const projects = await query;
      console.log('Projects count:', projects.length);
      
      // Optimize count query by using the same filters
      const countQuery = knex('projects');
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          if (typeof filters[key] === 'string') {
            countQuery.whereRaw(`LOWER(${key}) LIKE LOWER(?)`, [`%${filters[key]}%`]);
          } else {
            countQuery.where(key, filters[key]);
          }
        }
      });
      const totalCount = await countQuery.count('* as total').first();
      
      // Optimize developer lookup with enhanced caching
      let developersMap = new Map();
      if (populate === 'developer' || populate === 'true') {
        try {
          // Check developers cache first
          const cachedDevelopers = developersCache.get();
          if (cachedDevelopers) {
            developersMap = cachedDevelopers;
            console.log('Using cached developers data');
          } else {
            // Get all unique developer names from projects
            const developerNames = Array.from(new Set(projects.map(p => p.developer).filter(Boolean)));
            
            if (developerNames.length > 0) {
              // Fetch all developers in one query with specific fields
              const developers = await knex('developers')
                .whereIn('name', developerNames)
                .select(['id', 'name', 'description', 'logo_url', 'website', 'contact_email', 'contact_phone']);
              
              // Create a map for fast lookup
              developers.forEach(dev => {
                developersMap.set(dev.name, dev);
              });
              
              // Cache the developers
              developersCache.set(developers);
              console.log('Cached developers data');
            }
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
        console.log('Cached projects data');
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
      
      // Apply sorting with index optimization
      if (sort) {
        const [field, direction] = sort.split(':');
        // Ensure we're using indexed fields for sorting
        const allowedSortFields = ['created_at', 'updated_at', 'name', 'price', 'status'];
        if (allowedSortFields.includes(field)) {
          query = query.orderBy(field, direction || 'asc');
        } else {
          query = query.orderBy('created_at', 'desc');
        }
      } else {
        query = query.orderBy('created_at', 'desc');
      }
      
      // Apply filters with optimization
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          if (typeof filters[key] === 'string') {
            // Use case-insensitive search for better performance
            query = query.whereRaw(`LOWER(${key}) LIKE LOWER(?)`, [`%${filters[key]}%`]);
          } else {
            query = query.where(key, filters[key]);
          }
        }
      });
      
      const projects = await query;
      
      // Optimize count query by using the same filters
      const countQuery = knex('projects');
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          if (typeof filters[key] === 'string') {
            countQuery.whereRaw(`LOWER(${key}) LIKE LOWER(?)`, [`%${filters[key]}%`]);
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

  // Get a single project by ID or slug with optimized related data fetching
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      
      // Validate parameter
      if (!id) {
        return ctx.badRequest('Project ID is required');
      }
      
      const knex = strapi.db.connection;
      
      // Determine whether param is numeric ID or slug, then fetch the project
      const idOrSlug = id;
      let project = null as any;
      if (!isNaN(parseInt(idOrSlug))) {
        project = await knex('projects').where('id', idOrSlug).first();
      } else {
        project = await knex('projects').where('slug', idOrSlug).first();
        // Fallback: try by exact name if slug not found
        if (!project) {
          project = await knex('projects').where('name', idOrSlug).first();
        }
      }
      
      if (!project) {
        return ctx.notFound('Project not found');
      }
      
      const projectId = project.id;

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
      let sitePlans = [];
      let unitPricing = [];

      // Use Promise.allSettled to fetch all related data concurrently
      // This reduces the N+1 query problem by running queries in parallel
      const relatedDataPromises = [
        // Project images
        knex('project_images')
          .where('project_id', projectId)
          .orderBy('display_order', 'asc')
          .select(['id', 'image_url', 'display_order', 'alt_text', 'is_primary', 'caption'])
          .catch(() => []),
        
        // Project facilities
        knex('project_facilities')
          .join('facilities', 'project_facilities.facility_id', 'facilities.id')
          .where('project_facilities.project_id', projectId)
          .select(['facilities.id', 'facilities.name', 'facilities.description', 'facilities.icon'])
          .orderBy('facilities.name', 'asc')
          .catch(() => []),
        
        // Project features
        knex('project_features')
          .join('features', 'project_features.feature_id', 'features.id')
          .where('project_features.project_id', projectId)
          .select(['features.id', 'features.name', 'features.description', 'features.icon'])
          .catch(() => []),
        
        // Developer information (use cached data if available)
        (async () => {
          if (project.developer) {
            // Check cache first
            const cachedDevelopers = developersCache.get();
            if (cachedDevelopers && cachedDevelopers.has(project.developer)) {
              return cachedDevelopers.get(project.developer);
            }
            
            // Fetch from database if not cached
            try {
              const dev = await knex('developers')
                .where('name', project.developer)
                .select(['id', 'name', 'description', 'logo_url', 'website', 'contact_email', 'contact_phone'])
                .first();
              
              if (dev) {
                // Update cache
                if (cachedDevelopers) {
                  cachedDevelopers.set(dev.name, dev);
                }
                return dev;
              }
            } catch (err) {
              console.log('developers table not accessible:', err.message);
            }
            
            // Fallback developer object
            return {
              name: project.developer,
              description: null,
              logo_url: null,
              website: null,
              contact_email: null,
              contact_phone: null
            };
          }
          return null;
        })(),
        
        // Nearby amenities
        knex('nearby_amenities')
          .where('project_id', projectId)
          .select(['id', 'name', 'distance', 'type', 'description'])
          .catch(() => []),
        
        // Similar projects
        knex('similar_projects')
          .where('project_id', projectId)
          .select(['id', 'name', 'location', 'price', 'developer', 'completion', 'image_url'])
          .catch(() => []),
        
        // Floor plans
        knex('floor_plans')
          .where('project_name', project.name)
          .where('is_available', true)
          .select(['id', 'project_name', 'floor_plan_name', 'bedrooms', 'bathrooms', 'price', 'img', 'floor_plan_image', 'image_url'])
          .catch(() => []),
        
        // Unit availability
        knex('unit_availability')
          .where('project_id', projectId)
          .select(['id', 'unit_type', 'bedrooms', 'bathrooms', 'price', 'available_units', 'img'])
          .catch(() => []),
        
        // Unit types
        knex('unit_types')
          .where('project_id', projectId)
          .select(['id', 'name', 'description', 'bedrooms', 'bathrooms', 'price_range'])
          .catch(() => []),
        
        // Brochures
        knex('brochures')
          .where('brochure_title', 'like', `%${project.name}%`)
          .where('is_active', true)
          .orderBy('created_at', 'desc')
          .select(['id', 'brochure_title', 'brochure_url', 'file_url', 'is_active', 'created_at'])
          .catch(() => []),
        
        // Image gallery
        knex('image_galleries')
          .where('project_name', project.name)
          .where('is_active', true)
          .orderBy('display_order', 'asc')
          .orderBy('created_at', 'desc')
          .select(['id', 'project_name', 'image_url', 'display_order', 'is_active', 'created_at'])
          .catch(() => []),
        
        // Site plans
        knex('site_plans')
          .where('project_id', projectId)
          .select(['id', 'project_id', 'site_plan_url', 'description'])
          .catch(() => []),
        
        // Unit pricing
        knex('unit_pricing')
          .where('project_id', projectId)
          .where('is_available', true)
          .select(['id', 'unit_type', 'price', 'bedrooms', 'bathrooms'])
          .catch(() => [])
      ];

      // Execute all queries concurrently
      const results = await Promise.allSettled(relatedDataPromises);
      
      // Extract results
      [images, facilities, features, developer, nearbyAmenities, similarProjects, 
       floorPlans, unitAvailability, unitTypes, brochures, imageGallery, sitePlans, unitPricing] = 
        results.map(result => result.status === 'fulfilled' ? result.value : []);

      // Transform floor plans to include proper image URL field
      floorPlans = floorPlans.map(plan => ({
        ...plan,
        image_url: plan.img || plan.floor_plan_image || plan.image_url || null,
        img: plan.img || plan.floor_plan_image || plan.image_url || null
      }));

      // Transform brochures to include proper URL field
      brochures = brochures.map(brochure => ({
        ...brochure,
        file_url: brochure.brochure_url || null,
        brochure_url: brochure.brochure_url || null
      }));

      // Fallback for floor plans by project_name if not found by project.name
      if (floorPlans.length === 0 && project.project_name) {
        try {
          const fallbackFloorPlans = await knex('floor_plans')
            .where('project_name', project.project_name)
            .where('is_available', true)
            .select(['id', 'project_name', 'floor_plan_name', 'bedrooms', 'bathrooms', 'price', 'img', 'floor_plan_image', 'image_url']);
          
          floorPlans = fallbackFloorPlans.map(plan => ({
            ...plan,
            image_url: plan.img || plan.floor_plan_image || plan.image_url || null,
            img: plan.img || plan.floor_plan_image || plan.image_url || null
          }));
        } catch (err) {
          console.log('Fallback floor_plans query failed:', err.message);
        }
      }

      // Fallback for image gallery by project_name if not found by project.name
      if (imageGallery.length === 0 && project.project_name) {
        try {
          imageGallery = await knex('image_galleries')
            .where('project_name', project.project_name)
            .where('is_active', true)
            .orderBy('display_order', 'asc')
            .orderBy('created_at', 'desc')
            .select(['id', 'project_name', 'image_url', 'display_order', 'is_active', 'created_at']);
        } catch (err) {
          console.log('Fallback image_galleries query failed:', err.message);
        }
      }

      // Fallback for site plans by project name if not found by project_id
      if (sitePlans.length === 0) {
        try {
          sitePlans = await knex('site_plans')
            .where('project_name', project.name)
            .select(['id', 'project_name', 'site_plan_url', 'description']);
        } catch (err) {
          console.log('Fallback site_plans query failed:', err.message);
        }
      }

      // Fallback for unit pricing by project name if not found by project_id
      if (unitPricing.length === 0 && project.name) {
        try {
          unitPricing = await knex('unit_pricing')
            .where('project_name', project.name)
            .where('is_available', true)
            .select(['id', 'unit_type', 'price', 'bedrooms', 'bathrooms']);
        } catch (err) {
          console.log('Fallback unit_pricing query failed:', err.message);
        }
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
