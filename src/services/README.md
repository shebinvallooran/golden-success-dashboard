# API Service Documentation

This document explains the enhanced Axios instance setup with authentication, token management, and comprehensive API utilities for the Golden Success Dashboard.

## Overview

The API service provides:
- ✅ Centralized Axios instance configuration
- ✅ Automatic token management and persistence
- ✅ Request/response interceptors with logging
- ✅ Automatic token expiration handling
- ✅ Comprehensive error handling
- ✅ Authentication API functions
- ✅ Product and Category API functions
- ✅ File upload utilities
- ✅ Custom React hooks for API state management
- ✅ Utility functions for common operations

## Files Structure

```
src/services/
├── api.js              # Main API service with Axios instance
├── apiUtils.js         # Utility functions for API operations
└── README.md           # This documentation

src/hooks/
└── useApi.js           # Custom hooks for API state management

src/contexts/
└── AuthContext.js      # Authentication context (updated to use API service)

src/examples/
└── ApiUsageExamples.js # Comprehensive usage examples
```

## Quick Start

### 1. Basic API Usage

```javascript
import { productAPI, categoryAPI } from '../services/api';

// Get all products
const response = await productAPI.getProducts();
console.log(response.data);

// Get products with filters
const filteredProducts = await productAPI.getProducts({
  search: 'laptop',
  category: 'electronics',
  page: 1,
  limit: 10
});
```

### 2. Authentication

```javascript
import { authAPI } from '../services/api';

// Login
const result = await authAPI.login('username', 'password');
if (result.success) {
  console.log('Login successful:', result.data);
} else {
  console.error('Login failed:', result.error);
}

// Get user profile
const profile = await authAPI.getProfile();

// Logout
await authAPI.logout();
```

### 3. Using React Hooks

```javascript
import { useApi, usePaginatedApi } from '../hooks/useApi';
import { productAPI } from '../services/api';

function ProductList() {
  // Simple API call with loading states
  const {
    data: products,
    loading,
    error,
    execute: fetchProducts,
    refetch
  } = useApi(productAPI.getProducts, {
    immediate: true, // Fetch on mount
    onSuccess: (data) => console.log('Products loaded:', data),
    onError: (error) => console.error('Error:', error)
  });

  // Paginated API call
  const {
    data: paginatedProducts,
    pagination,
    loading: paginatedLoading,
    nextPage,
    prevPage,
    goToPage
  } = usePaginatedApi(productAPI.getProducts, {
    pageSize: 10,
    immediate: true
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products?.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

## API Configuration

### Environment Variables

```env
REACT_APP_API_URL=http://localhost:8080/api/v1
```

### Axios Instance Configuration

The main API instance is configured with:
- Base URL from environment variable
- 10-second timeout
- JSON content type headers
- Automatic token injection
- Request/response logging (development only)
- Error handling and token expiration management

## Authentication Flow

### Token Management

The API service automatically handles:
1. **Token Storage**: Tokens are stored in localStorage
2. **Token Injection**: Automatically adds Bearer token to requests
3. **Token Expiration**: Redirects to login on 401 responses
4. **Token Persistence**: Restores token from localStorage on app start

### Authentication Context Integration

The AuthContext has been updated to use the API service:

```javascript
import { useAuth } from '../contexts/AuthContext';

function LoginComponent() {
  const { login, logout, user, isAuthenticated, loading } = useAuth();

  const handleLogin = async () => {
    const result = await login('username', 'password');
    if (result.success) {
      // Login successful, user will be redirected
    } else {
      // Handle login error
      console.error(result.error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.username}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

## API Functions

### Authentication API

```javascript
import { authAPI } from '../services/api';

// Login user
const result = await authAPI.login(username, password);

// Get current user profile
const profile = await authAPI.getProfile();

// Logout user
await authAPI.logout();

// Refresh token (if supported by backend)
const refreshResult = await authAPI.refreshToken();

// Verify token validity
const verifyResult = await authAPI.verifyToken();
```

### Product API

```javascript
import { productAPI } from '../services/api';

// Get all products with optional filters
const products = await productAPI.getProducts({
  search: 'laptop',
  category: 'electronics',
  page: 1,
  limit: 10
});

// Get single product
const product = await productAPI.getProduct(productId);

// Create new product
const newProduct = await productAPI.createProduct(productData);

// Update existing product
const updatedProduct = await productAPI.updateProduct(productId, productData);

// Delete product
await productAPI.deleteProduct(productId);
```

### Category API

```javascript
import { categoryAPI } from '../services/api';

// Get all categories
const categories = await categoryAPI.getCategories();

// Get categories with products
const categoriesWithProducts = await categoryAPI.getCategoriesWithProducts();

// CRUD operations
const category = await categoryAPI.getCategory(categoryId);
const newCategory = await categoryAPI.createCategory(categoryData);
const updatedCategory = await categoryAPI.updateCategory(categoryId, categoryData);
await categoryAPI.deleteCategory(categoryId);

// Update category priorities
await categoryAPI.updateCategoryPriorities(categoriesArray);
```

### File API

```javascript
import { fileAPI } from '../services/api';

// Upload single file
const uploadResult = await fileAPI.uploadFile(file, (progressEvent) => {
  const progress = (progressEvent.loaded / progressEvent.total) * 100;
  console.log(`Upload progress: ${progress}%`);
});

// Upload multiple files
const multipleUploadResult = await fileAPI.uploadFiles(filesArray);

// Delete file
await fileAPI.deleteFile(fileId);

// Get file info
const fileInfo = await fileAPI.getFileInfo(fileId);
```

## Utility Functions

### API Utilities

```javascript
import { apiUtils } from '../services/api';

// Check if API is available
const isAvailable = await apiUtils.isApiAvailable();

// Get API base URL
const baseUrl = apiUtils.getBaseURL();

// Check authentication status
const isAuth = apiUtils.isAuthenticated();

// Get current token
const token = apiUtils.getCurrentToken();

// Clear all storage
apiUtils.clearStorage();
```

### Helper Utilities

```javascript
import {
  parseApiError,
  buildQueryParams,
  formatFileSize,
  validateFileType,
  validateFileSize,
  createFormData,
  debounce,
  retryApiCall
} from '../services/apiUtils';

// Parse API errors
const error = parseApiError(axiosError);

// Build query parameters
const params = buildQueryParams({
  search: 'laptop',
  category: 'electronics',
  tags: ['popular', 'featured']
});

// Format file size
const formattedSize = formatFileSize(1024000); // "1 MB"

// Validate file
const isValidType = validateFileType(file, ['image/jpeg', 'image/png']);
const isValidSize = validateFileSize(file, 5 * 1024 * 1024); // 5MB

// Create FormData
const formData = createFormData(
  { name: 'Product', price: 100 },
  [file1, file2],
  'images'
);

// Debounced search
const debouncedSearch = debounce((query) => {
  // Perform search
}, 500);

// Retry API call
const result = await retryApiCall(
  () => productAPI.getProducts(),
  3, // max retries
  1000 // base delay
);
```

## Custom Hooks

### useApi Hook

For simple API calls with loading states:

```javascript
const {
  data,           // Response data
  loading,        // Loading state
  error,          // Error message
  lastFetch,      // Last fetch timestamp
  execute,        // Execute function
  refetch,        // Refetch with same params
  reset           // Reset state
} = useApi(apiFunction, options);
```

### usePaginatedApi Hook

For paginated API calls:

```javascript
const {
  data,           // Current page data
  pagination,     // Pagination info
  loading,        // Loading state
  error,          // Error message
  fetchPage,      // Fetch specific page
  nextPage,       // Go to next page
  prevPage,       // Go to previous page
  goToPage,       // Go to specific page
  refetch,        // Refetch current page
  reset           // Reset state
} = usePaginatedApi(apiFunction, options);
```

### useMultipleApi Hook

For multiple simultaneous API calls:

```javascript
const {
  states,         // Object with all API states
  executeAll,     // Execute all APIs
  execute,        // Execute single API
  reset,          // Reset state(s)
  isLoading,      // Any API loading
  hasError        // Any API has error
} = useMultipleApi(apiCallsObject, options);
```

## Error Handling

The API service provides comprehensive error handling:

1. **Network Errors**: Detected and handled gracefully
2. **Timeout Errors**: 10-second timeout with retry capability
3. **Authentication Errors**: Automatic token cleanup and redirect
4. **Validation Errors**: Parsed and formatted for display
5. **Server Errors**: Logged and reported with user-friendly messages

## Best Practices

1. **Use the provided hooks** for React components
2. **Handle loading and error states** in your UI
3. **Use the apiWrapper function** for consistent error handling
4. **Implement proper error boundaries** in your React app
5. **Use debouncing** for search functionality
6. **Validate files** before uploading
7. **Use environment variables** for configuration
8. **Log errors appropriately** (development vs production)

## Examples

See `src/examples/ApiUsageExamples.js` for comprehensive usage examples covering all features and patterns.

## Migration from Old API

If you're migrating from the old API setup:

1. Replace direct axios imports with API service imports
2. Update authentication logic to use authAPI functions
3. Replace manual token management with the provided utilities
4. Use the custom hooks for better state management
5. Update error handling to use the provided utilities

## Support

For questions or issues with the API service, please refer to the examples file or check the console logs in development mode for detailed request/response information.
