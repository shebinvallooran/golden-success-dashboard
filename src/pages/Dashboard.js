import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statisticsAPI, productAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Package, Plus, FolderOpen, BarChart3, ShoppingCart } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalProducts: 0,
    totalActiveProducts: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Try to fetch statistics from backend, fallback to manual calculation if not available
      try {
        const statsResponse = await statisticsAPI.getStatistics();
        const statisticsData = statsResponse.data.data;

        setStats({
          totalCategories: statisticsData.total_categories,
          totalProducts: statisticsData.total_products,
          totalActiveProducts: statisticsData.total_active_products
        });
      } catch (statsError) {
        console.warn('Statistics API not available, calculating manually:', statsError);

        // Fallback: Calculate statistics manually
        const [productsResponse, categoriesResponse] = await Promise.all([
          productAPI.getProducts({ limit: 1000 }),
          // Use a different API call for categories
          fetch('http://localhost:8080/api/v1/categories').then(res => res.json())
        ]);

        const products = productsResponse.data.data;
        const categories = categoriesResponse.data;

        setStats({
          totalCategories: categories.length,
          totalProducts: products.length,
          totalActiveProducts: products.filter(p => p.is_active).length
        });
      }

      // Get recent products (last 5)
      const productsResponse = await productAPI.getProducts({ limit: 5, sort: 'created_at', order: 'desc' });
      setRecentProducts(productsResponse.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header Section */}
        <div className="page-header">
          <div className="page-header-content">
            <div className="page-title-section">
              <h1 className="page-title">Dashboard</h1>
              <p className="page-description">
                Welcome back! Here's what's happening with your inventory today.
              </p>
            </div>
            <div className="page-actions">
              <Link to="/categories" className="btn btn-secondary">
                <FolderOpen size={18} />
                <span>Categories</span>
              </Link>
              <Link to="/products/new" className="btn btn-primary">
                <Plus size={18} />
                <span>Add Product</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-icon stat-icon-purple">
                <FolderOpen size={24} />
              </div>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalCategories}</div>
              <div className="stat-label">Total Categories</div>
              <div className="stat-description">Product categories in your system</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-icon stat-icon-blue">
                <Package size={24} />
              </div>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalProducts}</div>
              <div className="stat-label">Total Products</div>
              <div className="stat-description">All products in your inventory</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-icon stat-icon-green">
                <ShoppingCart size={24} />
              </div>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalActiveProducts}</div>
              <div className="stat-label">Active Products</div>
              <div className="stat-description">Products currently available</div>
            </div>
          </div>
        </div>

        {/* Recent Products */}
        <div className="recent-products-section">
          <div className="section-header">
            <div className="section-title">
              <h2 className="section-heading">Recent Products</h2>
              <p className="section-description">Latest additions to your inventory</p>
            </div>
            <Link to="/products" className="btn btn-secondary">
              <BarChart3 size={18} />
              <span>View All</span>
            </Link>
          </div>

          <div className="card card-spacious">
            {recentProducts.length > 0 ? (
              <div className="products-grid">
                {recentProducts.map((product) => (
                  <div key={product.id} className="product-card">
                    <div className="product-card-header">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="product-card-image"
                        />
                      ) : (
                        <div className="product-card-placeholder">
                          <Package size={32} />
                        </div>
                      )}
                      <div className="product-card-badge">
                        <span className={`status-badge ${product.is_active ? 'status-active' : 'status-inactive'}`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="product-card-content">
                      <h3 className="product-card-title">{product.name}</h3>
                      <p className="product-card-sku">{product.sku}</p>

                      <div className="product-card-details">
                        <div className="product-detail">
                          <span className="detail-label">SKU</span>
                          <span className="detail-value">{product.sku}</span>
                        </div>
                        <div className="product-detail">
                          <span className="detail-label">Category</span>
                          <span className="detail-value">{product.category}</span>
                        </div>
                        <div className="product-detail">
                          <span className="detail-label">Status</span>
                          <span className={`detail-value ${product.is_active ? 'status-active' : 'status-inactive'}`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Package size={64} />
                </div>
                <h3 className="empty-state-title">No Products Yet</h3>
                <p className="empty-state-description">
                  Start building your inventory by adding your first product
                </p>
                <Link to="/products/new" className="btn btn-primary btn-lg">
                  <Plus size={20} />
                  <span>Create First Product</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
