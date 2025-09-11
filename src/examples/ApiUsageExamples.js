/**
 * API Usage Examples
 * This file demonstrates how to use the enhanced API service and hooks
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi, usePaginatedApi, useMultipleApi } from '../hooks/useApi';
import { productAPI, categoryAPI, authAPI, apiUtils } from '../services/api';
import { parseApiError, buildQueryParams, formatFileSize } from '../services/apiUtils';

const ApiUsageExamples = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Example 1: Simple API call with useApi hook
  const {
    data: products,
    loading: productsLoading,
    error: productsError,
    execute: fetchProducts,
    refetch: refetchProducts,
  } = useApi(productAPI.getProducts, {
    immediate: true, // Fetch immediately on mount
    onSuccess: (data) => {
      console.log('Products loaded successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to load products:', error);
    },
    transform: (data) => {
      // Transform data if needed
      return data.map(product => ({
        ...product,
        formattedPrice: `$${product.price.toFixed(2)}`,
      }));
    },
  });

  // Example 2: Paginated API call
  const {
    data: paginatedProducts,
    pagination,
    loading: paginatedLoading,
    error: paginatedError,
    fetchPage,
    nextPage,
    prevPage,
    goToPage,
  } = usePaginatedApi(productAPI.getProducts, {
    pageSize: 5,
    immediate: true,
  });

  // Example 3: Multiple API calls
  const {
    states: multipleStates,
    executeAll: fetchAllData,
    execute: executeSingle,
    isLoading: multipleLoading,
    hasError: multipleHasError,
  } = useMultipleApi({
    products: productAPI.getProducts,
    categories: categoryAPI.getCategories,
    statistics: () => ({ data: { totalProducts: 100, totalCategories: 10 } }), // Mock API
  }, {
    immediate: false, // Don't fetch immediately
  });

  // Example 4: Manual API calls with error handling
  const [manualData, setManualData] = useState(null);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState(null);

  const handleManualFetch = async () => {
    setManualLoading(true);
    setManualError(null);

    try {
      const response = await productAPI.getProducts({ search: searchTerm });
      setManualData(response.data);
    } catch (error) {
      const parsedError = parseApiError(error);
      setManualError(parsedError.message);
    } finally {
      setManualLoading(false);
    }
  };

  // Example 5: Authentication examples
  const handleLogin = async () => {
    const result = await authAPI.login('admin', 'admin123');
    if (result.success) {
      console.log('Login successful:', result.data);
    } else {
      console.error('Login failed:', result.error);
    }
  };

  const handleLogout = async () => {
    await authAPI.logout();
    console.log('Logged out successfully');
  };

  const handleGetProfile = async () => {
    const result = await authAPI.getProfile();
    if (result.success) {
      console.log('Profile:', result.data);
    } else {
      console.error('Failed to get profile:', result.error);
    }
  };

  // Example 6: File upload example
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('File size:', formatFileSize(file.size));

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Using the API directly
      const response = await fetch(`${apiUtils.getBaseURL()}/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiUtils.getCurrentToken()}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('File uploaded successfully:', result);
      } else {
        console.error('File upload failed');
      }
    } catch (error) {
      console.error('File upload error:', error);
    }
  };

  // Example 7: Search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        fetchProducts({ search: searchTerm });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchProducts]);

  // Example 8: Query parameters building
  const buildSearchQuery = () => {
    const params = {
      search: searchTerm,
      category: 'electronics',
      minPrice: 10,
      maxPrice: 1000,
      tags: ['popular', 'featured'],
    };

    const queryParams = buildQueryParams(params);
    console.log('Query string:', queryParams.toString());
    return queryParams;
  };

  return (
    <div className="api-examples">
      <h1>API Usage Examples</h1>
      
      {/* Authentication Status */}
      <div className="auth-status">
        <h2>Authentication Status</h2>
        <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        {user && <p>User: {user.username}</p>}
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleLogout}>Logout</button>
        <button onClick={handleGetProfile}>Get Profile</button>
      </div>

      {/* Search */}
      <div className="search-section">
        <h2>Search Products</h2>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={buildSearchQuery}>Build Query</button>
      </div>

      {/* Simple API Call Example */}
      <div className="simple-api">
        <h2>Simple API Call (useApi Hook)</h2>
        <button onClick={() => fetchProducts()}>Fetch Products</button>
        <button onClick={refetchProducts}>Refetch Products</button>
        
        {productsLoading && <p>Loading products...</p>}
        {productsError && <p>Error: {productsError}</p>}
        {products && (
          <div>
            <p>Found {products.length} products</p>
            <ul>
              {products.slice(0, 3).map(product => (
                <li key={product.id}>
                  {product.name} - {product.formattedPrice}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Paginated API Call Example */}
      <div className="paginated-api">
        <h2>Paginated API Call</h2>
        
        {paginatedLoading && <p>Loading...</p>}
        {paginatedError && <p>Error: {paginatedError}</p>}
        
        {paginatedProducts && (
          <div>
            <p>
              Page {pagination.page} of {pagination.totalPages} 
              ({pagination.total} total items)
            </p>
            
            <div className="pagination-controls">
              <button 
                onClick={prevPage} 
                disabled={!pagination.hasPrev}
              >
                Previous
              </button>
              <button 
                onClick={nextPage} 
                disabled={!pagination.hasNext}
              >
                Next
              </button>
              <button onClick={() => goToPage(1)}>Go to Page 1</button>
            </div>
            
            <ul>
              {paginatedProducts.slice(0, 3).map(product => (
                <li key={product.id}>{product.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Multiple API Calls Example */}
      <div className="multiple-api">
        <h2>Multiple API Calls</h2>
        <button onClick={fetchAllData}>Fetch All Data</button>
        <button onClick={() => executeSingle('products')}>Fetch Products Only</button>
        
        {multipleLoading && <p>Loading multiple APIs...</p>}
        {multipleHasError && <p>Some APIs failed</p>}
        
        <div className="api-states">
          {Object.entries(multipleStates).map(([key, state]) => (
            <div key={key}>
              <h4>{key}</h4>
              <p>Loading: {state.loading ? 'Yes' : 'No'}</p>
              <p>Error: {state.error || 'None'}</p>
              <p>Data: {state.data ? 'Loaded' : 'None'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Manual API Call Example */}
      <div className="manual-api">
        <h2>Manual API Call</h2>
        <button onClick={handleManualFetch} disabled={manualLoading}>
          {manualLoading ? 'Loading...' : 'Manual Fetch'}
        </button>
        
        {manualError && <p>Error: {manualError}</p>}
        {manualData && <p>Manual data loaded: {manualData.length} items</p>}
      </div>

      {/* File Upload Example */}
      <div className="file-upload">
        <h2>File Upload</h2>
        <input type="file" onChange={handleFileUpload} />
      </div>

      {/* API Utils Example */}
      <div className="api-utils">
        <h2>API Utilities</h2>
        <p>Base URL: {apiUtils.getBaseURL()}</p>
        <p>Has Token: {apiUtils.isAuthenticated() ? 'Yes' : 'No'}</p>
        <button onClick={() => console.log('API Available:', apiUtils.isApiAvailable())}>
          Check API Availability
        </button>
        <button onClick={apiUtils.clearStorage}>Clear Storage</button>
      </div>
    </div>
  );
};

export default ApiUsageExamples;
