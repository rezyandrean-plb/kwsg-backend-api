# API Performance Optimization Guide

## Overview
This document outlines the performance optimizations implemented for the projects API to improve loading speed on the frontend.

## 🚀 Performance Improvements Made

### 1. **Pagination Implementation**
- **Before**: Loading all projects at once
- **After**: Configurable pagination with `page` and `pageSize` parameters
- **Benefit**: Reduces initial load time and memory usage

**Usage:**
```javascript
// Load first 8 projects
GET /api/projects?page=1&pageSize=8

// Load next page
GET /api/projects?page=2&pageSize=8
```

### 2. **N+1 Query Problem Resolution**
- **Before**: Separate database query for each project's developer information
- **After**: Single query to fetch all developers, then map to projects
- **Benefit**: Dramatically reduces database queries from N+1 to 2 queries

### 3. **Minimal Data Endpoint**
- **New Endpoint**: `/api/projects/minimal`
- **Purpose**: Returns only essential fields for faster loading
- **Fields**: `id`, `name`, `location`, `price`, `price_from`, `developer`, `completion`, `status`, `image_url_banner`, `created_at`

**Usage:**
```javascript
// Fast loading with minimal data
GET /api/projects/minimal?page=1&pageSize=50
```

### 4. **In-Memory Caching**
- **Implementation**: Simple cache with 5-minute TTL
- **Scope**: First page results without filters
- **Benefit**: Subsequent requests return instantly from cache

### 5. **Query Optimization**
- **Selective Field Loading**: Only fetch required fields
- **Efficient Filtering**: Optimized WHERE clauses
- **Proper Indexing**: Leverages database indexes

## 📊 API Endpoints

### 1. **Enhanced Main Endpoint**
```
GET /api/projects
```

**Query Parameters:**
- `page` (default: 1): Page number
- `pageSize` (default: 8): Items per page
- `limit`: Alternative to pageSize
- `offset`: Alternative to page
- `sort` (default: 'created_at:desc'): Sorting field and direction
- `filters`: Object with field filters
- `populate` (default: 'developer'): Include developer data
- `useCache` (default: 'true'): Enable/disable caching

**Example:**
```javascript
GET /api/projects?page=1&pageSize=8&sort=name:asc&filters[status]=active
```

### 2. **Minimal Data Endpoint**
```
GET /api/projects/minimal
```

**Query Parameters:**
- `page` (default: 1): Page number
- `pageSize` (default: 8): Items per page
- `sort` (default: 'created_at:desc'): Sorting field and direction
- `filters`: Object with field filters

**Example:**
```javascript
GET /api/projects/minimal?page=1&pageSize=8&sort=created_at:desc
```

## 🔧 Frontend Integration

### Recommended Implementation

```javascript
// For initial page load (fast)
const loadProjectsList = async (page = 1, pageSize = 8) => {
  try {
    const response = await fetch(`/api/projects/minimal?page=${page}&pageSize=${pageSize}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading projects:', error);
  }
};

// For detailed project view
const loadProjectDetails = async (projectId) => {
  try {
    const response = await fetch(`/api/projects/${projectId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading project details:', error);
  }
};

// For search/filtered results
const searchProjects = async (filters, page = 1, pageSize = 8) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      filters: JSON.stringify(filters)
    });
    
    const response = await fetch(`/api/projects?${queryParams}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching projects:', error);
  }
};
```

### Pagination Component Example

```javascript
const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="pagination">
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Previous
      </button>
      
      <span>Page {currentPage} of {totalPages}</span>
      
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </button>
    </div>
  );
};
```

## 🧪 Performance Testing

### Running Performance Tests

1. **Install dependencies:**
```bash
npm install axios
```

2. **Run the performance test:**
```bash
node test-api-performance.js
```

3. **Expected Results:**
- Minimal endpoint should be 50-80% faster than full endpoint
- Cached responses should be 90%+ faster
- Pagination should improve initial load time significantly

### Manual Testing

```bash
# Test minimal endpoint
curl "http://localhost:1337/api/projects/minimal?page=1&pageSize=10"

# Test full endpoint with pagination
curl "http://localhost:1337/api/projects?page=1&pageSize=10"

# Test with filters
curl "http://localhost:1337/api/projects?filters[status]=active&page=1&pageSize=20"
```

## 📈 Expected Performance Gains

| Optimization | Expected Improvement |
|--------------|---------------------|
| Pagination | 60-80% faster initial load |
| N+1 Query Fix | 70-90% fewer database queries |
| Minimal Endpoint | 50-80% faster response time |
| Caching | 90%+ faster for cached data |
| **Combined** | **80-95% overall improvement** |

## 🔍 Monitoring and Debugging

### Cache Status
Check cache hit/miss rates in server logs:
```
Returning cached projects data  // Cache hit
Projects find method called     // Cache miss
```

### Database Query Monitoring
Monitor database performance:
```sql
-- Check query execution time
EXPLAIN ANALYZE SELECT * FROM projects LIMIT 20;

-- Monitor slow queries
SHOW PROCESSLIST;
```

### Response Time Monitoring
Use browser dev tools or API monitoring tools to track:
- Time to First Byte (TTFB)
- Total response time
- Network transfer time

## 🚨 Troubleshooting

### Common Issues

1. **Cache not working:**
   - Check if `useCache=true` parameter is set
   - Verify cache TTL (5 minutes)
   - Clear cache: `projectsCache.clear()`

2. **Slow pagination:**
   - Ensure proper database indexes
   - Check query execution plan
   - Verify pageSize is reasonable (20-50)

3. **Memory issues:**
   - Reduce pageSize for large datasets
   - Implement cursor-based pagination for very large datasets
   - Monitor memory usage

### Performance Checklist

- [ ] Database indexes on frequently queried fields
- [ ] Proper pagination implementation
- [ ] Caching enabled for appropriate endpoints
- [ ] Minimal endpoint used for list views
- [ ] Frontend implements lazy loading
- [ ] Images optimized and compressed
- [ ] CDN configured for static assets

## 🔄 Future Optimizations

1. **Database Indexing:**
   ```sql
   CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
   CREATE INDEX idx_projects_status ON projects(status);
   CREATE INDEX idx_projects_location ON projects(location);
   ```

2. **Redis Caching:**
   - Replace in-memory cache with Redis
   - Implement cache invalidation strategies
   - Add cache warming mechanisms

3. **CDN Integration:**
   - Serve static assets via CDN
   - Implement API response caching at CDN level

4. **Database Optimization:**
   - Query optimization
   - Connection pooling
   - Read replicas for read-heavy workloads

## 📞 Support

For questions or issues with the performance optimizations:
1. Check server logs for error messages
2. Run performance tests to identify bottlenecks
3. Monitor database query performance
4. Review this documentation for troubleshooting steps
