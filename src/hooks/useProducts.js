import { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const fetchProducts = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productAPI.getProducts({ ...filters, ...params });
      setProducts(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err);
      console.error('Error fetching products:', err);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData) => {
    try {
      const response = await productAPI.createProduct(productData);
      toast.success('Product created successfully');
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create product';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const response = await productAPI.updateProduct(id, productData);
      toast.success('Product updated successfully');
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update product';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await productAPI.deleteProduct(id);
      toast.success('Product deleted successfully');
      // Refresh the products list
      fetchProducts();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete product';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts
  };
};

export const useProduct = (id) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await productAPI.getProduct(id);
        setProduct(response.data.data);
      } catch (err) {
        setError(err);
        console.error('Error fetching product:', err);
        toast.error('Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
};
