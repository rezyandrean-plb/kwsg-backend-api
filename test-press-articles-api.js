#!/usr/bin/env node

/**
 * Test script for Press Articles API
 * Run this after starting the Strapi server
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:1337/api';

async function testPressArticlesAPI() {
  console.log('🧪 Testing Press Articles API...\n');

  try {
    // Test 1: Get all press articles
    console.log('1. Testing GET /press-articles');
    const allArticles = await axios.get(`${BASE_URL}/press-articles`);
    console.log(`✅ Found ${allArticles.data.data.length} articles\n`);

    // Test 2: Get article by ID (if articles exist)
    if (allArticles.data.data.length > 0) {
      const firstArticle = allArticles.data.data[0];
      console.log(`2. Testing GET /press-articles/${firstArticle.id}`);
      const singleArticle = await axios.get(`${BASE_URL}/press-articles/${firstArticle.id}`);
      console.log(`✅ Retrieved article: "${singleArticle.data.data.title}"\n`);
    }

    // Test 3: Get article by slug
    console.log('3. Testing GET /press-articles/slug/kw-singapore-debuts-with-10m-valuation-pledges-to-disrupt-property-agency-model');
    const articleBySlug = await axios.get(`${BASE_URL}/press-articles/slug/kw-singapore-debuts-with-10m-valuation-pledges-to-disrupt-property-agency-model`);
    console.log(`✅ Retrieved article by slug: "${articleBySlug.data.data.title}"\n`);

    // Test 4: Get articles by year
    console.log('4. Testing GET /press-articles/year/2025');
    const articlesByYear = await axios.get(`${BASE_URL}/press-articles/year/2025`);
    console.log(`✅ Found ${articlesByYear.data.data.length} articles from 2025\n`);

    // Test 5: Get articles by source
    console.log('5. Testing GET /press-articles/source/Tech Coffee House');
    const articlesBySource = await axios.get(`${BASE_URL}/press-articles/source/Tech Coffee House`);
    console.log(`✅ Found ${articlesBySource.data.data.length} articles from Tech Coffee House\n`);

    // Test 6: Search articles
    console.log('6. Testing GET /press-articles/search?query=KW Singapore');
    const searchResults = await axios.get(`${BASE_URL}/press-articles/search?query=KW Singapore`);
    console.log(`✅ Found ${searchResults.data.data.length} articles matching "KW Singapore"\n`);

    // Test 7: Create a new article
    console.log('7. Testing POST /press-articles');
    const newArticle = {
      title: "Test Article",
      description: "This is a test article for API testing",
      imageUrl: "https://example.com/test-image.jpg",
      link: "https://example.com/test-article",
      date: "2025-01-01",
      year: "2025",
      source: "Test Source",
      slug: "test-article",
      articleContent: "<div>Test content</div>"
    };

    const createdArticle = await axios.post(`${BASE_URL}/press-articles`, newArticle);
    console.log(`✅ Created article with ID: ${createdArticle.data.data.id}\n`);

    // Test 8: Update the article
    console.log('8. Testing PUT /press-articles/:id');
    const updateData = {
      title: "Updated Test Article",
      description: "This is an updated test article"
    };

    const updatedArticle = await axios.put(`${BASE_URL}/press-articles/${createdArticle.data.data.id}`, updateData);
    console.log(`✅ Updated article: "${updatedArticle.data.data.title}"\n`);

    // Test 9: Delete the test article
    console.log('9. Testing DELETE /press-articles/:id');
    const deleteResult = await axios.delete(`${BASE_URL}/press-articles/${createdArticle.data.data.id}`);
    console.log(`✅ Deleted article: ${deleteResult.data.data.deleted}\n`);

    console.log('🎉 All tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
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
testPressArticlesAPI(); 