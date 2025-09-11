import { useState, useCallback, useRef, useEffect } from 'react';
import { apiWrapper, getUserFriendlyErrorMessage } from '../services/apiUtils';

/**
 * Custom hook for managing API calls with loading states and error handling
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} API state and methods
 */
export const useApi = (apiFunction, options = {}) => {
  const {
    immediate = false,
    onSuccess,
    onError,
    transform,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  
  const cancelTokenRef = useRef(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
    };
  }, []);

  const execute = useCallback(async (...args) => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const result = await apiWrapper(() => apiFunction(...args));
      
      if (!mountedRef.current) return;

      if (result.success) {
        const transformedData = transform ? transform(result.data) : result.data;
        setData(transformedData);
        setLastFetch(new Date());
        
        if (onSuccess) {
          onSuccess(transformedData, result);
        }
        
        return { success: true, data: transformedData };
      } else {
        setError(result.error);
        
        if (onError) {
          onError(result.error, result);
        }
        
        return { success: false, error: result.error };
      }
    } catch (err) {
      if (!mountedRef.current) return;
      
      const errorMessage = getUserFriendlyErrorMessage(err);
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage, err);
      }
      
      return { success: false, error: errorMessage };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFunction, transform, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLastFetch(null);
  }, []);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    data,
    loading,
    error,
    lastFetch,
    execute,
    refetch,
    reset,
  };
};

/**
 * Custom hook for managing paginated API calls
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} Paginated API state and methods
 */
export const usePaginatedApi = (apiFunction, options = {}) => {
  const {
    pageSize = 10,
    immediate = false,
    onSuccess,
    onError,
    transform,
  } = options;

  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchPage = useCallback(async (page = 1, params = {}) => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const result = await apiWrapper(() => 
        apiFunction({
          page,
          pageSize,
          ...params,
        })
      );

      if (!mountedRef.current) return;

      if (result.success) {
        const responseData = result.data;
        const transformedData = transform ? transform(responseData.data || responseData) : (responseData.data || responseData);
        
        setData(transformedData);
        setPagination({
          page: responseData.page || page,
          pageSize: responseData.pageSize || pageSize,
          total: responseData.total || transformedData.length,
          totalPages: responseData.totalPages || Math.ceil((responseData.total || transformedData.length) / pageSize),
          hasNext: responseData.hasNext || page < Math.ceil((responseData.total || transformedData.length) / pageSize),
          hasPrev: responseData.hasPrev || page > 1,
        });
        setLastFetch(new Date());

        if (onSuccess) {
          onSuccess(transformedData, result);
        }

        return { success: true, data: transformedData };
      } else {
        setError(result.error);
        
        if (onError) {
          onError(result.error, result);
        }
        
        return { success: false, error: result.error };
      }
    } catch (err) {
      if (!mountedRef.current) return;
      
      const errorMessage = getUserFriendlyErrorMessage(err);
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage, err);
      }
      
      return { success: false, error: errorMessage };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFunction, pageSize, transform, onSuccess, onError]);

  const nextPage = useCallback((params = {}) => {
    if (pagination.hasNext) {
      return fetchPage(pagination.page + 1, params);
    }
  }, [fetchPage, pagination.hasNext, pagination.page]);

  const prevPage = useCallback((params = {}) => {
    if (pagination.hasPrev) {
      return fetchPage(pagination.page - 1, params);
    }
  }, [fetchPage, pagination.hasPrev, pagination.page]);

  const goToPage = useCallback((page, params = {}) => {
    if (page >= 1 && page <= pagination.totalPages) {
      return fetchPage(page, params);
    }
  }, [fetchPage, pagination.totalPages]);

  const reset = useCallback(() => {
    setData([]);
    setPagination({
      page: 1,
      pageSize,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    });
    setError(null);
    setLastFetch(null);
  }, [pageSize]);

  const refetch = useCallback((params = {}) => {
    return fetchPage(pagination.page, params);
  }, [fetchPage, pagination.page]);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      fetchPage(1);
    }
  }, [immediate, fetchPage]);

  return {
    data,
    pagination,
    loading,
    error,
    lastFetch,
    fetchPage,
    nextPage,
    prevPage,
    goToPage,
    refetch,
    reset,
  };
};

/**
 * Custom hook for managing multiple API calls
 * @param {Object} apiCalls - Object with API call functions
 * @param {Object} options - Configuration options
 * @returns {Object} Multiple API states and methods
 */
export const useMultipleApi = (apiCalls, options = {}) => {
  const { immediate = false } = options;
  
  const [states, setStates] = useState(() => {
    const initialStates = {};
    Object.keys(apiCalls).forEach(key => {
      initialStates[key] = {
        data: null,
        loading: false,
        error: null,
        lastFetch: null,
      };
    });
    return initialStates;
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const executeAll = useCallback(async (params = {}) => {
    if (!mountedRef.current) return;

    // Set all to loading
    setStates(prev => {
      const newStates = { ...prev };
      Object.keys(apiCalls).forEach(key => {
        newStates[key] = { ...newStates[key], loading: true, error: null };
      });
      return newStates;
    });

    const results = {};
    
    try {
      const promises = Object.entries(apiCalls).map(async ([key, apiFunction]) => {
        try {
          const result = await apiWrapper(() => apiFunction(params[key] || {}));
          return { key, result };
        } catch (error) {
          return { key, error: getUserFriendlyErrorMessage(error) };
        }
      });

      const responses = await Promise.allSettled(promises);
      
      if (!mountedRef.current) return;

      responses.forEach(({ value }) => {
        if (value) {
          const { key, result, error } = value;
          results[key] = result || { success: false, error };
          
          setStates(prev => ({
            ...prev,
            [key]: {
              data: result?.success ? result.data : null,
              loading: false,
              error: result?.success ? null : (result?.error || error),
              lastFetch: result?.success ? new Date() : prev[key].lastFetch,
            },
          }));
        }
      });

      return results;
    } catch (err) {
      if (!mountedRef.current) return;
      
      const errorMessage = getUserFriendlyErrorMessage(err);
      setStates(prev => {
        const newStates = { ...prev };
        Object.keys(apiCalls).forEach(key => {
          newStates[key] = { ...newStates[key], loading: false, error: errorMessage };
        });
        return newStates;
      });
      
      return { error: errorMessage };
    }
  }, [apiCalls]);

  const execute = useCallback(async (key, ...args) => {
    if (!apiCalls[key] || !mountedRef.current) return;

    setStates(prev => ({
      ...prev,
      [key]: { ...prev[key], loading: true, error: null },
    }));

    try {
      const result = await apiWrapper(() => apiCalls[key](...args));
      
      if (!mountedRef.current) return;

      setStates(prev => ({
        ...prev,
        [key]: {
          data: result.success ? result.data : null,
          loading: false,
          error: result.success ? null : result.error,
          lastFetch: result.success ? new Date() : prev[key].lastFetch,
        },
      }));

      return result;
    } catch (err) {
      if (!mountedRef.current) return;
      
      const errorMessage = getUserFriendlyErrorMessage(err);
      setStates(prev => ({
        ...prev,
        [key]: { ...prev[key], loading: false, error: errorMessage },
      }));
      
      return { success: false, error: errorMessage };
    }
  }, [apiCalls]);

  const reset = useCallback((key) => {
    if (key) {
      setStates(prev => ({
        ...prev,
        [key]: { data: null, loading: false, error: null, lastFetch: null },
      }));
    } else {
      setStates(() => {
        const resetStates = {};
        Object.keys(apiCalls).forEach(k => {
          resetStates[k] = { data: null, loading: false, error: null, lastFetch: null };
        });
        return resetStates;
      });
    }
  }, [apiCalls]);

  // Execute all immediately if requested
  useEffect(() => {
    if (immediate) {
      executeAll();
    }
  }, [immediate, executeAll]);

  return {
    states,
    executeAll,
    execute,
    reset,
    isLoading: Object.values(states).some(state => state.loading),
    hasError: Object.values(states).some(state => state.error),
  };
};
