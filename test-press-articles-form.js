const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:1337/api';
const TEST_ARTICLE = {
  title: 'Test Article from React Form',
  description: 'This is a test article created from the React form',
  image_url: 'https://example.com/test-image.jpg',
  link: 'https://example.com/test-article',
  date: '2024-01-15',
  year: '2024',
  source: 'Test Source',
  slug: 'test-article-from-react-form',
  article_content: '<p>This is the article content from the React form.</p>'
};

async function testPressArticlesAPI() {
  try {
    console.log('🧪 Testing Press Articles API with React Form Data Structure');
    console.log('=' .repeat(60));

    // Test 1: Create a new article with form data structure
    console.log('\n1️⃣ Testing CREATE with React form data structure...');
    const createResponse = await axios.post(`${API_BASE_URL}/press-articles`, TEST_ARTICLE);
    console.log('✅ Create successful!');
    console.log('Created article ID:', createResponse.data.data.id);
    console.log('Response data:', JSON.stringify(createResponse.data.data, null, 2));

    const articleId = createResponse.data.data.id;

    // Test 2: Get the created article
    console.log('\n2️⃣ Testing GET by ID...');
    const getResponse = await axios.get(`${API_BASE_URL}/press-articles/${articleId}`);
    console.log('✅ Get successful!');
    console.log('Retrieved article:', JSON.stringify(getResponse.data.data, null, 2));

    // Test 3: Update the article with form data structure
    console.log('\n3️⃣ Testing UPDATE with React form data structure...');
    const updateData = {
      title: 'Updated Test Article from React Form',
      description: 'This is an updated test article from the React form',
      image_url: 'https://example.com/updated-test-image.jpg',
      link: 'https://example.com/updated-test-article',
      date: '2024-01-16',
      year: '2024',
      source: 'Updated Test Source',
      slug: 'updated-test-article-from-react-form',
      article_content: '<p>This is the updated article content from the React form.</p>'
    };

    const updateResponse = await axios.put(`${API_BASE_URL}/press-articles/${articleId}`, updateData);
    console.log('✅ Update successful!');
    console.log('Updated article:', JSON.stringify(updateResponse.data.data, null, 2));

    // Test 4: Get all articles to verify the structure
    console.log('\n4️⃣ Testing GET all articles...');
    const getAllResponse = await axios.get(`${API_BASE_URL}/press-articles`);
    console.log('✅ Get all successful!');
    console.log('Total articles:', getAllResponse.data.data.length);
    if (getAllResponse.data.data.length > 0) {
      console.log('Sample article structure:', JSON.stringify(getAllResponse.data.data[0], null, 2));
    }

    // Test 5: Search articles
    console.log('\n5️⃣ Testing SEARCH...');
    const searchResponse = await axios.get(`${API_BASE_URL}/press-articles/search?q=React`);
    console.log('✅ Search successful!');
    console.log('Search results:', searchResponse.data.data.length, 'articles found');

    // Test 5b: Search with year filter
    console.log('\n5️⃣b Testing SEARCH with year filter...');
    const searchYearResponse = await axios.get(`${API_BASE_URL}/press-articles/search?q=Test&year=2024`);
    console.log('✅ Search with year filter successful!');
    console.log('Search results with year filter:', searchYearResponse.data.data.length, 'articles found');

    // Test 5c: Search with source filter
    console.log('\n5️⃣c Testing SEARCH with source filter...');
    const searchSourceResponse = await axios.get(`${API_BASE_URL}/press-articles/search?q=Test&source=Updated%20Test%20Source`);
    console.log('✅ Search with source filter successful!');
    console.log('Search results with source filter:', searchSourceResponse.data.data.length, 'articles found');

    // Test 6: Get by slug
    console.log('\n6️⃣ Testing GET by slug...');
    const slugResponse = await axios.get(`${API_BASE_URL}/press-articles/slug/updated-test-article-from-react-form`);
    console.log('✅ Get by slug successful!');
    console.log('Article by slug:', JSON.stringify(slugResponse.data.data, null, 2));

    // Test 7: Get by year
    console.log('\n7️⃣ Testing GET by year...');
    const yearResponse = await axios.get(`${API_BASE_URL}/press-articles/year/2024`);
    console.log('✅ Get by year successful!');
    console.log('Articles by year:', yearResponse.data.data.length, 'articles found');

    // Test 8: Get by source
    console.log('\n8️⃣ Testing GET by source...');
    const sourceResponse = await axios.get(`${API_BASE_URL}/press-articles/source/Updated%20Test%20Source`);
    console.log('✅ Get by source successful!');
    console.log('Articles by source:', sourceResponse.data.data.length, 'articles found');

    // Test 9: Clean up - Delete the test article
    console.log('\n9️⃣ Testing DELETE...');
    const deleteResponse = await axios.delete(`${API_BASE_URL}/press-articles/${articleId}`);
    console.log('✅ Delete successful!');
    console.log('Deleted article:', deleteResponse.data.data);

    console.log('\n🎉 All tests passed! The API is working correctly with the React form data structure.');
    console.log('\n📋 Summary of field mappings:');
    console.log('   React Form Field → API Field');
    console.log('   title → title');
    console.log('   description → description');
    console.log('   image_url → imageUrl (stored) + image_url (returned)');
    console.log('   link → link');
    console.log('   date → date');
    console.log('   year → year');
    console.log('   source → source');
    console.log('   slug → slug');
    console.log('   article_content → articleContent (stored) + article_content (returned)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testPressArticlesAPI(); 