#!/usr/bin/env node

/**
 * Test script for Live Press Articles API
 * Update the BASE_URL to your actual Strapi Cloud URL
 */

const axios = require('axios');

// Update this URL to your actual Strapi Cloud URL
const BASE_URL = 'https://striking-hug-052e89dfad.strapiapp.com/api'; // Replace with your actual URL

async function testLivePressArticlesAPI() {
  console.log('🧪 Testing Live Press Articles API...\n');
  console.log(`📍 Testing against: ${BASE_URL}\n`);

  try {
    // Test 1: Get all press articles
    console.log('1. Testing GET /press-articles');
    const allArticles = await axios.get(`${BASE_URL}/press-articles`);
    console.log(`✅ Found ${allArticles.data.data.length} articles`);
    if (allArticles.data.data.length > 0) {
      console.log(`   First article: "${allArticles.data.data[0].title}"`);
    }
    console.log('');

    // Test 2: Get article by ID (if articles exist)
    if (allArticles.data.data.length > 0) {
      const firstArticle = allArticles.data.data[0];
      console.log(`2. Testing GET /press-articles/${firstArticle.id}`);
      const singleArticle = await axios.get(`${BASE_URL}/press-articles/${firstArticle.id}`);
      console.log(`✅ Retrieved article: "${singleArticle.data.data.title}"`);
      console.log(`   Source: ${singleArticle.data.data.source}`);
      console.log(`   Date: ${singleArticle.data.data.date}`);
      console.log('');
    }

    // Test 3: Get article by slug
    console.log('3. Testing GET /press-articles/slug/kw-singapore-debuts-with-10m-valuation-pledges-to-disrupt-property-agency-model');
    const articleBySlug = await axios.get(`${BASE_URL}/press-articles/slug/kw-singapore-debuts-with-10m-valuation-pledges-to-disrupt-property-agency-model`);
    console.log(`✅ Retrieved article by slug: "${articleBySlug.data.data.title}"`);
    console.log(`   Source: ${articleBySlug.data.data.source}`);
    console.log('');

    // Test 4: Get articles by year
    console.log('4. Testing GET /press-articles/year/2025');
    const articlesByYear = await axios.get(`${BASE_URL}/press-articles/year/2025`);
    console.log(`✅ Found ${articlesByYear.data.data.length} articles from 2025`);
    console.log('');

    // Test 5: Get articles by source
    console.log('5. Testing GET /press-articles/source/Tech Coffee House');
    const articlesBySource = await axios.get(`${BASE_URL}/press-articles/source/Tech Coffee House`);
    console.log(`✅ Found ${articlesBySource.data.data.length} articles from Tech Coffee House`);
    console.log('');

    // Test 6: Search articles
    console.log('6. Testing GET /press-articles/search?query=KW Singapore');
    const searchResults = await axios.get(`${BASE_URL}/press-articles/search?query=KW Singapore`);
    console.log(`✅ Found ${searchResults.data.data.length} articles matching "KW Singapore"`);
    console.log('');

    // Test 7: Create a new article (test)
    console.log('7. Testing POST /press-articles');
    const newArticle = {
      title: "Test Article - Live API",
      description: "This is a test article for live API testing",
      imageUrl: "https://example.com/test-image.jpg",
      link: "https://example.com/test-article",
      date: "2025-01-01",
      year: "2025",
      source: "Test Source",
      slug: "test-article-live-api",
      articleContent: "<div>Test content for live API</div>"
    };

    const createdArticle = await axios.post(`${BASE_URL}/press-articles`, newArticle);
    console.log(`✅ Created article with ID: ${createdArticle.data.data.id}`);
    console.log(`   Title: "${createdArticle.data.data.title}"`);
    console.log('');

    // Test 8: Update the article
    console.log('8. Testing PUT /press-articles/:id');
    const updateData = {
      title: "Updated Test Article - Live API",
      description: "This is an updated test article for live API testing"
    };

    const updatedArticle = await axios.put(`${BASE_URL}/press-articles/${createdArticle.data.data.id}`, updateData);
    console.log(`✅ Updated article: "${updatedArticle.data.data.title}"`);
    console.log('');

    // Test 9: Delete the test article
    console.log('9. Testing DELETE /press-articles/:id');
    const deleteResult = await axios.delete(`${BASE_URL}/press-articles/${createdArticle.data.data.id}`);
    console.log(`✅ Deleted article: ${deleteResult.data.data.deleted}`);
    console.log('');

    // Test 10: Test bulk create
    console.log('10. Testing POST /press-articles/bulk');
    const bulkArticles = [
      {
        title: "Bulk Test Article 1",
        description: "First bulk test article",
        imageUrl: "https://example.com/bulk1.jpg",
        link: "https://example.com/bulk1",
        date: "2025-01-01",
        year: "2025",
        source: "Bulk Test Source"
      },
      {
        title: "Bulk Test Article 2",
        description: "Second bulk test article",
        imageUrl: "https://example.com/bulk2.jpg",
        link: "https://example.com/bulk2",
        date: "2025-01-02",
        year: "2025",
        source: "Bulk Test Source"
      }
    ];

    const bulkResult = await axios.post(`${BASE_URL}/press-articles/bulk`, bulkArticles);
    console.log(`✅ Created ${bulkResult.data.data.length} articles in bulk`);
    console.log('');

    // Clean up bulk test articles
    console.log('🧹 Cleaning up bulk test articles...');
    for (const article of bulkResult.data.data) {
      await axios.delete(`${BASE_URL}/press-articles/${article.id}`);
    }
    console.log('✅ Cleanup completed');
    console.log('');

    console.log('🎉 All tests passed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - Total articles in database: ${allArticles.data.data.length}`);
    console.log(`   - Articles from 2025: ${articlesByYear.data.data.length}`);
    console.log(`   - Articles from Tech Coffee House: ${articlesBySource.data.data.length}`);
    console.log(`   - Search results for "KW Singapore": ${searchResults.data.data.length}`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 403) {
      console.error('💡 This might be due to authentication. Try adding an API token to your requests.');
    }
    process.exit(1);
  }
}

// Check if axios is available
try {
  require('axios');
} catch (error) {
  console.error('❌ axios is not installed. Please install it first:');
  console.error('npm install axios');
  process.exit(1);
}

// Run the tests
testLivePressArticlesAPI(); 