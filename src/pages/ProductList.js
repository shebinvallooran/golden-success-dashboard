import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchableSelect from '../components/SearchableSelect/SearchableSelect';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2, Eye, Filter } from 'lucide-react';

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
    <div className="dashboard-page">
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

        {/* Search and Filters above the table card, aligned to the end */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          gap: 'var(--space-3)', 
          marginBottom: 'var(--space-4)',
          flexWrap: 'wrap'
        }}>
          {/* Clear Filters Button */}
          {(searchTerm || categoryFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setStatusFilter('');
                setCurrentPage(1);
              }}
              className="btn btn-secondary btn-sm"
              style={{ height: '40px', padding: '0 var(--space-4)' }}
            >
              Clear Filters
            </button>
          )}

          {/* Search Input */}
          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={18} style={{ 
              position: 'absolute', 
              left: 'var(--space-3)', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--gray-400)',
              pointerEvents: 'none'
            }} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 'var(--space-10)', height: '40px' }}
            />
          </div>

          {/* Category Filter Dropdown */}
          <div style={{ width: '200px' }}>
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
              placeholder="All Categories"
              searchPlaceholder="Search categories..."
            />
          </div>

          {/* Status Filter Dropdown */}
          <div style={{ width: '160px' }}>
            <SearchableSelect
              options={[
                { value: '', label: 'All Status' },
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="All Status"
              searchable={false}
            />
          </div>
        </div>

      {/* Products Table */}
      <div className="card">
        {loading ? (
          <LoadingSpinner message="Loading products..." />
        ) : products.length > 0 ? (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '50px',
                          height: '50px',
                          backgroundColor: '#f5f5f5',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#999',
                          fontSize: '12px'
                        }}>
                          No Image
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="product-name">
                        <div className="name-en">{product.name_en || product.name}</div>
                        {product.name_ar && (
                          <div className="name-ar" dir="rtl">{product.name_ar}</div>
                        )}
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>
                      <span className={`status-badge ${product.is_active ? 'status-active' : 'status-inactive'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setViewModal({ isOpen: true, product })}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px' }}
                        >
                          <Eye size={14} />
                        </button>
                        <Link
                          to={`/products/edit/${product.id}`}
                          className="btn btn-primary"
                          style={{ padding: '6px 10px' }}
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, product })}
                          className="btn btn-danger"
                          style={{ padding: '6px 10px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={currentPage === index + 1 ? 'active' : ''}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1rem' }}>
              No products found
            </p>
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
          <div>
            <div className="form-group">
              <strong>Name:</strong> {viewModal.product.name}
            </div>
            <div className="form-group">
              <strong>SKU:</strong> {viewModal.product.sku}
            </div>
            <div className="form-group">
              <strong>Category:</strong> {viewModal.product.category}
            </div>
            <div className="form-group">
              <strong>Status:</strong> {viewModal.product.is_active ? 'Active' : 'Inactive'}
            </div>

            {/* Dual Language Names */}
            <div className="form-group">
              <strong>Product Names:</strong>
              <div style={{ marginTop: '5px' }}>
                <div><strong>English:</strong> {viewModal.product.name_en || viewModal.product.name}</div>
                {viewModal.product.name_ar && (
                  <div style={{ marginTop: '3px' }} dir="rtl"><strong>Arabic:</strong> {viewModal.product.name_ar}</div>
                )}
              </div>
            </div>

            {/* Dual Language Descriptions */}
            {(viewModal.product.description_en || viewModal.product.description_ar || viewModal.product.description) && (
              <div className="form-group">
                <strong>Descriptions:</strong>
                <div style={{ marginTop: '5px' }}>
                  {(viewModal.product.description_en || viewModal.product.description) && (
                    <div>
                      <strong>English:</strong>
                      <p style={{ marginTop: '3px', marginBottom: '8px' }}>
                        {viewModal.product.description_en || viewModal.product.description}
                      </p>
                    </div>
                  )}
                  {viewModal.product.description_ar && (
                    <div dir="rtl">
                      <strong>Arabic:</strong>
                      <p style={{ marginTop: '3px' }}>{viewModal.product.description_ar}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {viewModal.product.image_url && (
              <div className="form-group">
                <strong>Image:</strong>
                <img 
                  src={viewModal.product.image_url} 
                  alt={viewModal.product.name}
                  style={{ maxWidth: '200px', marginTop: '5px', borderRadius: '4px' }}
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
          <div>
            <p>Are you sure you want to delete "{deleteModal.product.name}"?</p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>This action cannot be undone.</p>
            <div className="actions">
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
