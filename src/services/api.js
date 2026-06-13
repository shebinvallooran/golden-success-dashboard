import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.goldensuccessksa.com/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  // Don't set default Content-Type - let each request set its own
});

// Token management
let authToken = null;

// Set auth token
export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // Also set it in localStorage for persistence
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Get auth token
export const getAuthToken = () => {
  return authToken || localStorage.getItem('token');
};

// Initialize token from localStorage on app start
const initializeToken = () => {
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
    setAuthToken(storedToken);
  }
};

// Initialize token
initializeToken();

// Request interceptor for adding auth token and request logging
api.interceptors.request.use(
  (config) => {
    // Ensure token is always fresh from localStorage
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and token expiration
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Handle token expiration
    if (error.response?.status === 401) {
      // Token expired or invalid
      setAuthToken(null);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network Error: Please check your internet connection');
    }

    return Promise.reject(error);
  }
);

// Authentication API functions
export const authAPI = {
  // Login user
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const { token, user } = response.data.data;

      // Set the token in our API instance
      setAuthToken(token);

      return {
        success: true,
        data: { token, user }
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Login failed'
      };
    }
  },

  // Logout user
  logout: async () => {
    try {
      // Call logout endpoint if it exists
      await api.post('/auth/logout', {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear token
      setAuthToken(null);
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to get profile'
      };
    }
  },

  // Refresh token (if your backend supports it)
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh', {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const { token } = response.data.data;

      setAuthToken(token);

      return {
        success: true,
        data: { token }
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Token refresh failed'
      };
    }
  },

  // Verify token validity
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Token verification failed'
      };
    }
  }
};

// Product API functions
export const productAPI = {
  // Get all products with optional filters
  getProducts: (params = {}) => {
    return api.get('/products', { params });
  },

  // Get single product by ID
  getProduct: (id) => {
    return api.get(`/products/${id}`);
  },

  // Create new product
  createProduct: async (productData, imageFile = null) => {
    try {
      // Always use FormData for consistency
      const formData = new FormData();

      // Add all text fields to FormData
      console.log('Product data being sent:', productData);
      Object.keys(productData).forEach(key => {
        const value = productData[key];
        if (value !== null && value !== undefined && value !== '') {
          console.log(`Adding to FormData: ${key} = ${value} (type: ${typeof value})`);
          formData.append(key, String(value));
        }
      });

      // Debug: Log all FormData entries
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      // Add image file if provided
      if (imageFile) {
        formData.append('image', imageFile);
      }

      // Send multipart request (don't set Content-Type - browser will set it with boundary)
      const response = await api.post('/products', formData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Create product error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create product'
      };
    }
  },

  // Update existing product
  updateProduct: async (id, productData, imageFile = null) => {
    try {
      if (imageFile) {
        // Create FormData for multipart request with image
        const formData = new FormData();

        // Add all text fields to FormData
        Object.keys(productData).forEach(key => {
          const value = productData[key];
          if (value !== null && value !== undefined && value !== '') {
            formData.append(key, String(value));
          }
        });

        // Add image file
        formData.append('image', imageFile);

        // Send multipart request (don't set Content-Type - browser will set it with boundary)
        const response = await api.put(`/products/${id}`, formData);
        return {
          success: true,
          data: response.data.data
        };
      } else {
        // Send JSON request for products without images
        const response = await api.put(`/products/${id}`, productData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        return {
          success: true,
          data: response.data.data
        };
      }
    } catch (error) {
      console.error('Update product error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update product'
      };
    }
  },

  // Delete product
  deleteProduct: (id) => {
    return api.delete(`/products/${id}`);
  },
};

// Category API functions
export const categoryAPI = {
  // Get all categories
  getCategories: (params = {}) => {
    return api.get('/categories', { params });
  },

  // Get categories with products
  getCategoriesWithProducts: (params = {}) => {
    return api.get('/categories/with-products', { params });
  },

  // Get single category by ID
  getCategory: (id, params = {}) => {
    return api.get(`/categories/${id}`, { params });
  },

  // Create new category
  createCategory: async (categoryData, imageFile = null) => {
    try {
      if (imageFile) {
        // Create FormData for multipart request with image
        const formData = new FormData();

        // Add all text fields to FormData
        Object.keys(categoryData).forEach(key => {
          const value = categoryData[key];
          if (value !== null && value !== undefined && value !== '') {
            formData.append(key, String(value));
          }
        });

        // Add image file
        formData.append('image', imageFile);

        // Send multipart request (don't set Content-Type - browser will set it with boundary)
        const response = await api.post('/categories', formData);
        return {
          success: true,
          data: response.data.data
        };
      } else {
        // Send JSON request for categories without images
        const response = await api.post('/categories', categoryData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        return {
          success: true,
          data: response.data.data
        };
      }
    } catch (error) {
      console.error('Create category error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create category'
      };
    }
  },

  // Update existing category
  updateCategory: async (id, categoryData, imageFile = null) => {
    try {
      if (imageFile) {
        // Create FormData for multipart request with image
        const formData = new FormData();

        // Add all text fields to FormData
        Object.keys(categoryData).forEach(key => {
          const value = categoryData[key];
          if (value !== null && value !== undefined && value !== '') {
            formData.append(key, String(value));
          }
        });

        // Add image file
        formData.append('image', imageFile);

        // Send multipart request (don't set Content-Type - browser will set it with boundary)
        const response = await api.put(`/categories/${id}`, formData);
        return {
          success: true,
          data: response.data.data
        };
      } else {
        // Send JSON request for categories without images
        const response = await api.put(`/categories/${id}`, categoryData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        return {
          success: true,
          data: response.data.data
        };
      }
    } catch (error) {
      console.error('Update category error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update category'
      };
    }
  },

  // Delete category
  deleteCategory: (id) => {
    return api.delete(`/categories/${id}`);
  },

  
  // Update category priorities
  updateCategoryPriorities: (categories) => {
    return api.put('/categories/priorities', { categories }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
};

// Statistics API functions
export const statisticsAPI = {
  // Get dashboard statistics
  getStatistics: () => {
    return api.get('/statistics');
  }
};

// Quote/Enquiry API functions
export const quoteAPI = {
  // Get all enquiries
  getQuotes: () => {
    return api.get('/quotes');
  },
  // Update enquiry status
  updateQuoteStatus: (id, status) => {
    return api.put(`/quotes/${id}/status`, { status }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  // Delete enquiry
  deleteQuote: (id) => {
    return api.delete(`/quotes/${id}`);
  }
};

// Settings API functions
export const settingsAPI = {
  // Get notification settings
  getNotificationSettings: () => {
    return api.get('/settings/notification');
  },
  // Update notification settings
  updateNotificationSettings: (settingsData) => {
    return api.put('/settings/notification', settingsData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// Health check
export const healthCheck = () => {
  return api.get('/health');
};

// File upload API functions
export const fileAPI = {
  // Upload single file
  uploadFile: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/files/upload', formData, {
      // Don't set Content-Type for FormData - let browser set it with boundary
      onUploadProgress,
    });
  },

  // Upload multiple files
  uploadFiles: (files, onUploadProgress) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    return api.post('/files/upload-multiple', formData, {
      // Don't set Content-Type for FormData - let browser set it with boundary
      onUploadProgress,
    });
  },

  // Delete file
  deleteFile: (fileId) => {
    return api.delete(`/files/${fileId}`);
  },

  // Get file info
  getFileInfo: (fileId) => {
    return api.get(`/files/${fileId}`);
  },
};

// Utility functions
export const apiUtils = {
  // Check if API is available
  isApiAvailable: async () => {
    try {
      await healthCheck();
      return true;
    } catch (error) {
      return false;
    }
  },

  // Get API base URL
  getBaseURL: () => {
    return API_BASE_URL;
  },

  // Get current auth token
  getCurrentToken: () => {
    return getAuthToken();
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  },

  // Clear all stored data
  clearStorage: () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
  },
};

// Export the main API instance
export { api };
export default api;
