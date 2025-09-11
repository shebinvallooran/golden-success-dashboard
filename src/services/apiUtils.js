/**
 * API Utilities
 * Helper functions for API operations and error handling
 */

// API Response status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// API Error types
export const API_ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

/**
 * Parse API error and return standardized error object
 * @param {Error} error - Axios error object
 * @returns {Object} Standardized error object
 */
export const parseApiError = (error) => {
  if (!error.response) {
    // Network error
    return {
      type: API_ERROR_TYPES.NETWORK_ERROR,
      message: 'Network error. Please check your internet connection.',
      status: null,
      data: null,
    };
  }

  const { status, data } = error.response;
  let type = API_ERROR_TYPES.UNKNOWN_ERROR;
  let message = 'An unexpected error occurred.';

  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      type = API_ERROR_TYPES.VALIDATION_ERROR;
      message = data?.error || data?.message || 'Invalid request data.';
      break;
    case HTTP_STATUS.UNAUTHORIZED:
      type = API_ERROR_TYPES.AUTHENTICATION_ERROR;
      message = data?.error || data?.message || 'Authentication required.';
      break;
    case HTTP_STATUS.FORBIDDEN:
      type = API_ERROR_TYPES.AUTHORIZATION_ERROR;
      message = data?.error || data?.message || 'Access denied.';
      break;
    case HTTP_STATUS.NOT_FOUND:
      type = API_ERROR_TYPES.NOT_FOUND_ERROR;
      message = data?.error || data?.message || 'Resource not found.';
      break;
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      type = API_ERROR_TYPES.VALIDATION_ERROR;
      message = data?.error || data?.message || 'Validation failed.';
      break;
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      type = API_ERROR_TYPES.SERVER_ERROR;
      message = data?.error || data?.message || 'Server error. Please try again later.';
      break;
    default:
      message = data?.error || data?.message || `Request failed with status ${status}.`;
  }

  return {
    type,
    message,
    status,
    data: data || null,
  };
};

/**
 * Create a standardized API response wrapper
 * @param {Promise} apiCall - The API call promise
 * @returns {Promise<Object>} Standardized response object
 */
export const apiWrapper = async (apiCall) => {
  try {
    const response = await apiCall;
    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Success',
      status: response.status,
    };
  } catch (error) {
    const parsedError = parseApiError(error);
    return {
      success: false,
      error: parsedError.message,
      errorType: parsedError.type,
      status: parsedError.status,
      data: parsedError.data,
    };
  }
};

/**
 * Build query parameters for API requests
 * @param {Object} params - Parameters object
 * @returns {URLSearchParams} URL search parameters
 */
export const buildQueryParams = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item));
      } else {
        searchParams.append(key, value);
      }
    }
  });
  
  return searchParams;
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate file type
 * @param {File} file - File object
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {boolean} Whether file type is valid
 */
export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 * @param {File} file - File object
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {boolean} Whether file size is valid
 */
export const validateFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

/**
 * Create FormData for file uploads
 * @param {Object} data - Data object
 * @param {File|Array<File>} files - File(s) to upload
 * @param {string} fileFieldName - Field name for files
 * @returns {FormData} FormData object
 */
export const createFormData = (data, files, fileFieldName = 'files') => {
  const formData = new FormData();
  
  // Add regular data fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  });
  
  // Add files
  if (files) {
    if (Array.isArray(files)) {
      files.forEach(file => {
        formData.append(fileFieldName, file);
      });
    } else {
      formData.append(fileFieldName, files);
    }
  }
  
  return formData;
};

/**
 * Debounce function for API calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Retry API call with exponential backoff
 * @param {Function} apiCall - API call function
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} API call result
 */
export const retryApiCall = async (apiCall, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Check if error is a network error
 * @param {Error} error - Error object
 * @returns {boolean} Whether error is a network error
 */
export const isNetworkError = (error) => {
  return !error.response && error.code !== 'ECONNABORTED';
};

/**
 * Check if error is a timeout error
 * @param {Error} error - Error object
 * @returns {boolean} Whether error is a timeout error
 */
export const isTimeoutError = (error) => {
  return error.code === 'ECONNABORTED';
};

/**
 * Get user-friendly error message
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyErrorMessage = (error) => {
  if (isNetworkError(error)) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  if (isTimeoutError(error)) {
    return 'Request timed out. Please try again.';
  }
  
  const parsedError = parseApiError(error);
  return parsedError.message;
};
