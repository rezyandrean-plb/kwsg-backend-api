# Press Articles API Documentation

This document describes the Press Articles API endpoints for managing press articles and news coverage about KW Singapore.

## Base URL
```
http://localhost:1337/api
```

## Endpoints

### 1. Get All Press Articles
**GET** `/press-articles`

Returns all press articles ordered by date (newest first).

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "KW Singapore Debuts with $10M Valuation...",
      "description": "KW Singapore launches with a $10 million valuation...",
      "imageUrl": "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/news.jpg",
      "link": "https://techcoffeehouse.com/2025/07/07/...",
      "date": "2025-07-07",
      "year": "2025",
      "source": "Tech Coffee House",
      "slug": "kw-singapore-debuts-with-10m-valuation-pledges-to-disrupt-property-agency-model",
      "articleContent": "<div class=\"article-content\">...",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Get Single Press Article by ID
**GET** `/press-articles/:id`

Returns a specific press article by its ID.

**Response:**
```json
{
  "data": {
    "id": 1,
    "title": "KW Singapore Debuts with $10M Valuation...",
    "description": "KW Singapore launches with a $10 million valuation...",
    "imageUrl": "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/news.jpg",
    "link": "https://techcoffeehouse.com/2025/07/07/...",
    "date": "2025-07-07",
    "year": "2025",
    "source": "Tech Coffee House",
    "slug": "kw-singapore-debuts-with-10m-valuation-pledges-to-disrupt-property-agency-model",
    "articleContent": "<div class=\"article-content\">...",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

### 3. Get Press Article by Slug
**GET** `/press-articles/slug/:slug`

Returns a specific press article by its slug.

**Response:** Same as single article response.

### 4. Get Press Articles by Year
**GET** `/press-articles/year/:year`

Returns all press articles from a specific year.

**Response:** Same as all articles response.

### 5. Get Press Articles by Source
**GET** `/press-articles/source/:source`

Returns all press articles from a specific source.

**Response:** Same as all articles response.

### 6. Create New Press Article
**POST** `/press-articles`

Creates a new press article.

**Request Body:**
```json
{
  "title": "New Article Title",
  "description": "Article description",
  "imageUrl": "https://example.com/image.jpg",
  "link": "https://example.com/article",
  "date": "2025-01-01",
  "year": "2025",
  "source": "News Source",
  "slug": "new-article-slug",
  "articleContent": "<div>Article content...</div>"
}
```

**Required Fields:**
- `title` (string)
- `description` (string)
- `imageUrl` (string)
- `link` (string)
- `date` (date)
- `year` (string)
- `source` (string)

**Optional Fields:**
- `slug` (string) - auto-generated from title if not provided
- `articleContent` (string)

**Response:** Returns the created article.

### 7. Update Press Article
**PUT** `/press-articles/:id`

Updates an existing press article.

**Request Body:** Same as create, but all fields are optional.

**Response:** Returns the updated article.

### 8. Delete Press Article
**DELETE** `/press-articles/:id`

Deletes a press article.

**Response:**
```json
{
  "data": {
    "deleted": true
  }
}
```

### 9. Bulk Create Press Articles
**POST** `/press-articles/bulk`

Creates multiple press articles at once.

**Request Body:**
```json
[
  {
    "title": "Article 1",
    "description": "Description 1",
    "imageUrl": "https://example.com/image1.jpg",
    "link": "https://example.com/article1",
    "date": "2025-01-01",
    "year": "2025",
    "source": "News Source"
  },
  {
    "title": "Article 2",
    "description": "Description 2",
    "imageUrl": "https://example.com/image2.jpg",
    "link": "https://example.com/article2",
    "date": "2025-01-02",
    "year": "2025",
    "source": "News Source"
  }
]
```

**Response:** Returns array of created articles.

### 10. Search Press Articles
**GET** `/press-articles/search?query=search_term`

Searches press articles by title, description, or source.

**Response:** Same as all articles response.

## Database Schema

The `press_articles` table has the following structure:

```sql
CREATE TABLE press_articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  imageUrl VARCHAR NOT NULL,
  link VARCHAR NOT NULL,
  date DATE NOT NULL,
  year VARCHAR NOT NULL,
  source VARCHAR NOT NULL,
  slug VARCHAR UNIQUE,
  articleContent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_press_articles_date ON press_articles(date);
CREATE INDEX idx_press_articles_year ON press_articles(year);
CREATE INDEX idx_press_articles_source ON press_articles(source);
CREATE INDEX idx_press_articles_slug ON press_articles(slug);
```

## Setup Instructions

1. **Run Database Migrations:**
   ```bash
   npm run strapi develop
   ```
   The migrations will run automatically when Strapi starts.

2. **Seed Data (Optional):**
   The seed migration will automatically populate the database with the provided press articles data.

3. **Test the API:**
   ```bash
   # Get all articles
   curl http://localhost:1337/api/press-articles
   
   # Get article by ID
   curl http://localhost:1337/api/press-articles/1
   
   # Get article by slug
   curl http://localhost:1337/api/press-articles/slug/kw-singapore-debuts-with-10m-valuation-pledges-to-disrupt-property-agency-model
   
   # Get articles by year
   curl http://localhost:1337/api/press-articles/year/2025
   
   # Get articles by source
   curl http://localhost:1337/api/press-articles/source/Tech%20Coffee%20House
   
   # Search articles
   curl "http://localhost:1337/api/press-articles/search?query=KW%20Singapore"
   ```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

Error responses include a message describing the issue:
```json
{
  "error": {
    "message": "Press article not found"
  }
}
``` 