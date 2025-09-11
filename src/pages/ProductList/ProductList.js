import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import SearchableSelect from '../../components/SearchableSelect';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2, Eye, Filter } from 'lucide-react';
import './ProductList.scss';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
  const [viewModal, setViewModal] = useState({ isOpen: false, product: null });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [currentPage, searchTerm, categoryFilter, statusFilter]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        category_id: categoryFilter || undefined,
        is_active: statusFilter || undefined,
      };

      const response = await productAPI.getProducts(params);
      setProducts(response.data.data);
      setTotalPages(Math.ceil(response.data.pagination.total / itemsPerPage));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product) => {
    try {
      await productAPI.deleteProduct(product.id);
      toast.success('Product deleted successfully');
      setDeleteModal({ isOpen: false, product: null });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete product';
      toast.error(errorMessage);
      // Don't close modal on error - let user try again
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  if (loading && products.length === 0) {
    return <LoadingSpinner message="Loading products..." />;
  }

  return (
    <div className="product-list-page">
      <div className="container">
        <div className="page-header">
          <div className="page-header-content">
            <div className="page-title-section">
              <h1 className="page-title">Products</h1>
              <p className="page-description">Manage your product catalog with multilingual support</p>
            </div>
            <div className="page-actions">
              <Link to="/products/new" className="btn btn-primary btn-lg">
                <Plus size={20} />
                <span>Add Product</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card card-compact">
          <div className="filters-section">
            <div className="search-section">
              <div className="search-input-wrapper">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input search-input"
                />
              </div>
            </div>

            <div className="filters-grid">
              <div className="filter-group">
                <label className="filter-label">
                  <Filter size={16} />
                  Category
                </label>
                <SearchableSelect
                  options={[
                    { value: '', label: 'All Categories' },
                    ...categories.map(category => ({
                      value: category.id,
                      label: category.name
                    }))
                  ]}
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  placeholder="Select category..."
                  searchPlaceholder="Search categories..."
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">Status</label>
                <SearchableSelect
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' }
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="Select status..."
                />
              </div>

              {(searchTerm || categoryFilter || statusFilter) && (
                <div className="filter-group">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('');
                      setStatusFilter('');
                      setCurrentPage(1);
                    }}
                    className="btn btn-secondary btn-sm clear-filters-btn"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="card">
          {loading ? (
            <LoadingSpinner message="Loading products..." />
          ) : products.length > 0 ? (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="product-image-cell">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="product-thumbnail"
                              />
                            ) : (
                              <div className="product-thumbnail-placeholder">
                                No Image
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="product-name">
                            <div className="name-en">{product.name_en || product.name}</div>
                            {product.name_ar && (
                              <div className="name-ar" dir="rtl">{product.name_ar}</div>
                            )}
                          </div>
                        </td>
                        <td className="sku-cell">{product.sku}</td>
                        <td>{product.category}</td>
                        <td>
                          <span className={`status-badge ${product.is_active ? 'status-active' : 'status-inactive'}`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => setViewModal({ isOpen: true, product })}
                              className="btn btn-secondary btn-sm"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                            <Link
                              to={`/products/edit/${product.id}`}
                              className="btn btn-primary btn-sm"
                              title="Edit Product"
                            >
                              <Edit size={14} />
                            </Link>
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, product })}
                              className="btn btn-danger btn-sm"
                              title="Delete Product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p className="empty-message">No products found</p>
              <Link to="/products/new" className="btn btn-primary">
                Create your first product
              </Link>
            </div>
          )}
        </div>

        {/* View Product Modal */}
        <Modal
          isOpen={viewModal.isOpen}
          onClose={() => setViewModal({ isOpen: false, product: null })}
          title="Product Details"
        >
          {viewModal.product && (
            <div className="product-details">
              <div className="detail-group">
                <strong>Name:</strong> {viewModal.product.name}
              </div>
              <div className="detail-group">
                <strong>SKU:</strong> {viewModal.product.sku}
              </div>
              <div className="detail-group">
                <strong>Category:</strong> {viewModal.product.category}
              </div>
              <div className="detail-group">
                <strong>Status:</strong> {viewModal.product.is_active ? 'Active' : 'Inactive'}
              </div>

              {/* Dual Language Names */}
              <div className="detail-group">
                <strong>Product Names:</strong>
                <div className="language-details">
                  <div><strong>English:</strong> {viewModal.product.name_en || viewModal.product.name}</div>
                  {viewModal.product.name_ar && (
                    <div className="arabic-text" dir="rtl"><strong>Arabic:</strong> {viewModal.product.name_ar}</div>
                  )}
                </div>
              </div>

              {/* Dual Language Descriptions */}
              {(viewModal.product.description_en || viewModal.product.description_ar || viewModal.product.description) && (
                <div className="detail-group">
                  <strong>Descriptions:</strong>
                  <div className="language-details">
                    {(viewModal.product.description_en || viewModal.product.description) && (
                      <div>
                        <strong>English:</strong>
                        <p className="description-text">
                          {viewModal.product.description_en || viewModal.product.description}
                        </p>
                      </div>
                    )}
                    {viewModal.product.description_ar && (
                      <div className="arabic-text" dir="rtl">
                        <strong>Arabic:</strong>
                        <p className="description-text">{viewModal.product.description_ar}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {viewModal.product.image_url && (
                <div className="detail-group">
                  <strong>Image:</strong>
                  <img 
                    src={viewModal.product.image_url} 
                    alt={viewModal.product.name}
                    className="product-detail-image"
                  />
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, product: null })}
          title="Confirm Delete"
        >
          {deleteModal.product && (
            <div className="delete-confirmation">
              <p>Are you sure you want to delete "{deleteModal.product.name}"?</p>
              <p className="warning-text">This action cannot be undone.</p>
              <div className="modal-actions">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, product: null })}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteModal.product)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ProductList;
