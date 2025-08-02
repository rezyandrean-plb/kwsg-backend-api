# Press Articles API - React Form Integration

## Overview

The Press Articles API has been updated to handle the React form data structure seamlessly. The API now supports both camelCase (internal storage) and snake_case (frontend compatibility) field names.

## Field Mapping

| React Form Field | API Internal Field | Description |
|------------------|-------------------|-------------|
| `title` | `title` | Article title (required) |
| `description` | `description` | Article description (required) |
| `image_url` | `imageUrl` | Image URL (required) |
| `link` | `link` | Article link (required) |
| `date` | `date` | Publication date (required) |
| `year` | `year` | Publication year (required) |
| `source` | `source` | Article source (required) |
| `slug` | `slug` | URL slug (auto-generated if not provided) |
| `article_content` | `articleContent` | Full article content (optional) |

## API Endpoints

### 1. Create Press Article
```http
POST /api/press-articles
```

**Request Body (React Form Format):**
```json
{
  "title": "Article Title",
  "description": "Article description",
  "image_url": "https://example.com/image.jpg",
  "link": "https://example.com/article",
  "date": "2024-01-15",
  "year": "2024",
  "source": "The Straits Times",
  "slug": "article-slug",
  "article_content": "<p>Article content...</p>"
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "title": "Article Title",
    "description": "Article description",
    "imageUrl": "https://example.com/image.jpg",
    "image_url": "https://example.com/image.jpg",
    "link": "https://example.com/article",
    "date": "2024-01-15",
    "year": "2024",
    "source": "The Straits Times",
    "slug": "article-slug",
    "articleContent": "<p>Article content...</p>",
    "article_content": "<p>Article content...</p>",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
  }
}
```

### 2. Update Press Article
```http
PUT /api/press-articles/:id
```

**Request Body (React Form Format):**
```json
{
  "title": "Updated Article Title",
  "description": "Updated description",
  "image_url": "https://example.com/updated-image.jpg",
  "link": "https://example.com/updated-article",
  "date": "2024-01-16",
  "year": "2024",
  "source": "Updated Source",
  "slug": "updated-article-slug",
  "article_content": "<p>Updated article content...</p>"
}
```

### 3. Get All Press Articles
```http
GET /api/press-articles
```

### 4. Get Press Article by ID
```http
GET /api/press-articles/:id
```

### 5. Get Press Article by Slug
```http
GET /api/press-articles/slug/:slug
```

### 6. Get Press Articles by Year
```http
GET /api/press-articles/year/:year
```

### 7. Get Press Articles by Source
```http
GET /api/press-articles/source/:source
```

### 8. Search Press Articles
```http
GET /api/press-articles/search?q=search_term
```

**Query Parameters:**
- `q` (required): Search query string
- `year` (optional): Filter by year
- `source` (optional): Filter by source

**Example:**
```http
GET /api/press-articles/search?q=Singapore&year=2024&source=The%20Straits%20Times
```

### 9. Delete Press Article
```http
DELETE /api/press-articles/:id
```

## React Form Integration

### Form Data Structure
Your React form should send data in this exact structure:

```typescript
interface PressArticleFormData {
  title: string;
  description: string;
  image_url: string;
  link: string;
  date: string;
  year: string;
  source: string;
  slug: string;
  article_content: string;
}
```

### Example Usage in React

```typescript
// Create new article
const createArticle = async (formData: PressArticleFormData) => {
  try {
    const response = await fetch('/api/press-articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create article');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error creating article:', error);
    throw error;
  }
};

// Update existing article
const updateArticle = async (id: number, formData: PressArticleFormData) => {
  try {
    const response = await fetch(`/api/press-articles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update article');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error updating article:', error);
    throw error;
  }
};

// Get article for editing
const getArticle = async (id: number) => {
  try {
    const response = await fetch(`/api/press-articles/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch article');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching article:', error);
    throw error;
  }
};
```

## Validation Rules

The API validates the following required fields:
- `title` - Must not be empty
- `description` - Must not be empty
- `image_url` - Must not be empty
- `link` - Must not be empty
- `date` - Must be a valid date
- `year` - Must not be empty
- `source` - Must not be empty

## Auto-Generated Fields

- **Slug**: If not provided, automatically generated from the title
- **Created/Updated timestamps**: Automatically managed by the API

## Testing

Run the test script to verify the API works with your React form:

```bash
# Make sure Strapi is running first
npm run develop

# In another terminal, run the test
./run-press-articles-form-test.sh
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `400` - Bad request (validation errors)
- `404` - Not found
- `500` - Internal server error

Error responses include detailed error messages:

```json
{
  "error": {
    "status": 400,
    "name": "BadRequestError",
    "message": "Article title is required"
  }
}
```

## Database Structure

The API uses a JSONB column to store article data, allowing for flexible field handling while maintaining compatibility with both camelCase and snake_case naming conventions.

## Migration Notes

If you have existing data, the API will automatically handle the field name conversion. The database stores data in camelCase format but returns both formats for maximum compatibility. 