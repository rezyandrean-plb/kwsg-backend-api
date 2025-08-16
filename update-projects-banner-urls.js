const knex = require('knex');
const fs = require('fs');
const csv = require('csv-parser');

// Database configuration
const dbConfig = {
  client: 'postgresql',
  connection: {
    host: 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com',
    port: 5432,
    user: 'postgres',
    password: 'kwpostgres',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  },
};

class ProjectsBannerUpdater {
  constructor() {
    this.db = knex(dbConfig);
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  // Read banner URLs from CSV
  async readBannerUrlsFromCSV(csvFilePath) {
    return new Promise((resolve, reject) => {
      const bannerData = [];
      
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
          // Skip header row if it exists
          if (data.projectName && data.projectName !== 'projectName') {
            bannerData.push({
              projectName: data.projectName.trim(),
              projectId: data.projectId,
              image_banner_url: data.image_banner_url
            });
          }
        })
        .on('end', () => {
          this.log(`Read ${bannerData.length} banner URLs from CSV`);
          resolve(bannerData);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  // Update banner URLs in projects table
  async updateBannerUrls(bannerData) {
    let updatedCount = 0;
    let notFoundCount = 0;
    const notFoundProjects = [];

    for (const banner of bannerData) {
      try {
        // Try to find project by exact name match
        let project = await this.db('projects')
          .where('name', banner.projectName)
          .orWhere('project_name', banner.projectName)
          .first();

        // If not found, try case-insensitive match
        if (!project) {
          project = await this.db('projects')
            .whereRaw('LOWER(name) = LOWER(?)', [banner.projectName])
            .orWhereRaw('LOWER(project_name) = LOWER(?)', [banner.projectName])
            .first();
        }

        if (project) {
          // Update the banner URL
          await this.db('projects')
            .where('id', project.id)
            .update({
              image_url_banner: banner.image_banner_url,
              updated_at: new Date()
            });

          this.log(`Updated banner URL for project: ${banner.projectName}`, 'success');
          updatedCount++;
        } else {
          this.log(`Project not found: ${banner.projectName}`, 'warning');
          notFoundCount++;
          notFoundProjects.push(banner.projectName);
        }
      } catch (error) {
        this.log(`Error updating project ${banner.projectName}: ${error.message}`, 'error');
      }
    }

    return { updatedCount, notFoundCount, notFoundProjects };
  }

  // Main execution function
  async run(csvFilePath) {
    try {
      this.log('Starting banner URL update process...');
      
      // Check if CSV file exists
      if (!fs.existsSync(csvFilePath)) {
        throw new Error(`CSV file not found: ${csvFilePath}`);
      }

      // Read banner data from CSV
      this.log('Reading banner URLs from CSV...');
      const bannerData = await this.readBannerUrlsFromCSV(csvFilePath);
      
      if (bannerData.length === 0) {
        this.log('No banner data found in CSV file', 'warning');
        return;
      }

      // Update banner URLs in database
      this.log('Updating banner URLs in projects table...');
      const result = await this.updateBannerUrls(bannerData);

      // Summary
      this.log('=== UPDATE SUMMARY ===', 'success');
      this.log(`Total projects in CSV: ${bannerData.length}`, 'success');
      this.log(`Successfully updated: ${result.updatedCount}`, 'success');
      this.log(`Not found: ${result.notFoundCount}`, 'warning');

      if (result.notFoundProjects.length > 0) {
        this.log('Projects not found in database:', 'warning');
        result.notFoundProjects.forEach(project => {
          this.log(`  - ${project}`, 'warning');
        });
      }

      this.log('Banner URL update process completed!', 'success');

    } catch (error) {
      this.log(`Error in banner URL update process: ${error.message}`, 'error');
      throw error;
    } finally {
      await this.db.destroy();
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const csvFilePath = process.argv[2] || 'banner_url.csv';
  
  const updater = new ProjectsBannerUpdater();
  updater.run(csvFilePath)
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = ProjectsBannerUpdater;

