import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Package, Image as ImageIcon } from 'lucide-react';
import './CategoryList.scss';

// CategoryRow component for individual category rows
const CategoryRow = ({ category, index, totalCategories, onEdit, onDelete, onPriorityChange }) => {
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:8080${imageUrl}`;
  };

  return (
    <tr className="category-row">
      {/* Priority Column */}
      <td className="priority-cell">
        <div className="priority-controls">
          <span className="priority-number">{category.priority}</span>
          <div className="priority-buttons">
            <button
              onClick={() => onPriorityChange(category.id, 'up')}
              disabled={index === 0}
              className="priority-btn priority-btn-up"
              title="Move up"
            >
              <ArrowUp size={12} />
            </button>
            <button
              onClick={() => onPriorityChange(category.id, 'down')}
              disabled={index === totalCategories - 1}
              className="priority-btn priority-btn-down"
              title="Move down"
            >
              <ArrowDown size={12} />
            </button>
          </div>
        </div>
      </td>

      {/* Image Column */}
      <td className="image-cell">
        <div className="category-image-container">
          {category.image_url ? (
            <img 
              src={getImageUrl(category.image_url)} 
              alt={category.name_en || category.name}
              className="category-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="category-image-placeholder" 
            style={{ display: category.image_url ? 'none' : 'flex' }}
          >
            <ImageIcon size={20} />
          </div>
        </div>
      </td>

      {/* Category Info Column */}
      <td>
        <div className="category-info">
          <div className="category-name">
            <div className="name-en">{category.name_en || category.name}</div>
            {category.name_ar && (
              <div className="name-ar" dir="rtl">{category.name_ar}</div>
            )}
          </div>
          <div className="category-meta">ID: {category.id}</div>
        </div>
      </td>

      {/* Descriptions Column */}
      <td>
        <div className="category-descriptions">
          {/* Regular Description */}
          {/* {(category.description_en || category.description) && (
            <div className="description-section">
              <div className="description-label">Description:</div>
              <div className="desc-en">{category.description_en || category.description}</div>
              {category.description_ar && (
                <div className="desc-ar" dir="rtl">{category.description_ar}</div>
              )}
            </div>
          )} */}

          {/* Home Description */}
          {(category.home_description_en || category.home_description_ar) && (
            <div className="description-section home-description">
              {/* <div className="description-label">Home Description:</div> */}
              {category.home_description_en && (
                <div className="desc-en">{category.home_description_en}</div>
              )}
              {category.home_description_ar && (
                <div className="desc-ar" dir="rtl">{category.home_description_ar}</div>
              )}
            </div>
          )}

          {/* No descriptions message */}
          {!(category.description_en || category.description) &&
           !(category.home_description_en || category.home_description_ar) && (
            <span className="no-description">No descriptions</span>
          )}
        </div>
      </td>

      {/* Products Count Column */}
      <td className="products-cell">
        <div className="product-count">
          <Package size={16} className="product-icon" />
          <span className="count-number">{category.product_count}</span>
          <span className="count-label">product{category.product_count !== 1 ? 's' : ''}</span>
        </div>
      </td>

      {/* Status Column */}
      <td className="status-cell">
        <span className={`status-badge ${category.is_active ? 'status-active' : 'status-inactive'}`}>
          {category.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>

      {/* Actions Column */}
      <td>
        <div className="action-buttons">
          <button
            onClick={() => onEdit(category)}
            className="btn btn-primary btn-sm"
            title="Edit category"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="btn btn-danger btn-sm"
            disabled={category.product_count > 0}
            title={category.product_count > 0 ? `Cannot delete: ${category.product_count} products assigned` : 'Delete category'}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState({ isOpen: false, category: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, category: null });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getCategoriesWithProducts({ include_inactive: 'true' });
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditModal({ isOpen: true, category: null });
  };

  const handleEdit = (category) => {
    setEditModal({ isOpen: true, category });
  };

  const handleDeleteClick = (category) => {
    setDeleteModal({ isOpen: true, category });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.category) return;
    
    try {
      await categoryAPI.deleteCategory(deleteModal.category.id);
      toast.success('Category deleted successfully');
      setDeleteModal({ isOpen: false, category: null });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete category';
      toast.error(errorMessage);
    }
  };

  const handleSave = async (categoryData, imageFile) => {
    try {
      // Transform bullet points arrays into individual fields for backend
      const transformedData = { ...categoryData };

      // Convert description_points_en array to individual point fields
      if (categoryData.description_points_en && Array.isArray(categoryData.description_points_en)) {
        transformedData.point1_en = categoryData.description_points_en[0] || '';
        transformedData.point2_en = categoryData.description_points_en[1] || '';
        transformedData.point3_en = categoryData.description_points_en[2] || '';
        delete transformedData.description_points_en; // Remove the array field
      }

      // Convert description_points_ar array to individual point fields
      if (categoryData.description_points_ar && Array.isArray(categoryData.description_points_ar)) {
        transformedData.point1_ar = categoryData.description_points_ar[0] || '';
        transformedData.point2_ar = categoryData.description_points_ar[1] || '';
        transformedData.point3_ar = categoryData.description_points_ar[2] || '';
        delete transformedData.description_points_ar; // Remove the array field
      }



      let result;
      if (editModal.category) {
        result = await categoryAPI.updateCategory(editModal.category.id, transformedData, imageFile);
        if (result.success) {
          toast.success('Category updated successfully');
          setEditModal({ isOpen: false, category: null });
          fetchCategories();
        } else {
          const errorMessage = result.error || 'Failed to update category';
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      } else {
        result = await categoryAPI.createCategory(transformedData, imageFile);
        if (result.success) {
          toast.success('Category created successfully');
          setEditModal({ isOpen: false, category: null });
          fetchCategories();
        } else {
          const errorMessage = result.error || 'Failed to create category';
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      if (!error.message.includes('Failed to')) {
        const errorMessage = error.response?.data?.error || 'Failed to save category';
        toast.error(errorMessage);
      }
    }
  };

  const handlePriorityChange = async (categoryId, direction) => {
    const currentIndex = categories.findIndex(cat => cat.id === categoryId);
    if (currentIndex === -1) return;

    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= newCategories.length) return;

    // Swap priorities
    const temp = newCategories[currentIndex].priority;
    newCategories[currentIndex].priority = newCategories[targetIndex].priority;
    newCategories[targetIndex].priority = temp;

    // Swap positions in array
    [newCategories[currentIndex], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[currentIndex]];

    try {
      const priorityUpdates = [
        { id: newCategories[currentIndex].id, priority: newCategories[currentIndex].priority },
        { id: newCategories[targetIndex].id, priority: newCategories[targetIndex].priority }
      ];

      await categoryAPI.updateCategoryPriorities(priorityUpdates);
      setCategories(newCategories);
      toast.success('Category priorities updated');
    } catch (error) {
      console.error('Error updating priorities:', error);
      toast.error('Failed to update category priorities');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading categories..." />;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="page-header">
          <div className="page-header-content">
            <div className="page-title-section">
              <h1 className="page-title">Categories</h1>
              <p className="page-description">Organize your products with multilingual categories and set display priorities</p>
            </div>
            <div className="page-actions">
              <button onClick={handleCreate} className="btn btn-primary btn-lg">
                <Plus size={20} />
                <span>Add Category</span>
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          {categories && categories.length > 0 ? (
            <div className="table-container">
              <table className="table category-table">
                <thead>
                  <tr>
                    <th>Priority</th>
                    <th>Image</th>
                    <th>Category Name</th>
                    <th>Description</th>
                    <th>Products</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => (
                    <CategoryRow
                      key={category.id}
                      category={category}
                      index={index}
                      totalCategories={categories.length}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                      onPriorityChange={handlePriorityChange}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p className="empty-message">No categories found</p>
              <button onClick={handleCreate} className="btn btn-primary">
                Create your first category
              </button>
            </div>
          )}
        </div>

        {/* Edit/Create Modal */}
        <CategoryModal
          isOpen={editModal.isOpen}
          category={editModal.category}
          onClose={() => setEditModal({ isOpen: false, category: null })}
          onSave={handleSave}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, category: null })}
          title="Confirm Delete"
        >
          {deleteModal.category && (
            <div>
              <p className="delete-message">
                Are you sure you want to delete "{deleteModal.category.name_en || deleteModal.category.name}"?
              </p>

              {deleteModal.category.product_count > 0 ? (
                <div className="alert alert-danger">
                  <div className="alert-header">
                    <span>⚠️ Cannot Delete</span>
                  </div>
                  <p>
                    This category has <strong>{deleteModal.category.product_count} product{deleteModal.category.product_count !== 1 ? 's' : ''}</strong> assigned to it.
                  </p>
                  <p className="alert-subtext">
                    Please move or delete all products from this category before deleting it.
                  </p>
                </div>
              ) : (
                <div className="alert alert-warning">
                  <p>
                    ⚠️ This action cannot be undone. The category will be permanently deleted.
                  </p>
                </div>
              )}

              <div className="modal-actions">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, category: null })}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="btn btn-danger"
                  disabled={deleteModal.category.product_count > 0}
                >
                  {deleteModal.category.product_count > 0 ? 'Cannot Delete' : 'Delete Category'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

// CategoryModal component for creating/editing categories
const CategoryModal = ({ isOpen, category, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    description_points_en: ['', '', ''],
    description_points_ar: ['', '', ''],
    home_description_en: '',
    home_description_ar: '',
    is_active: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Helper function to convert individual point fields to arrays
  const parsePointsFromCategory = (category, language) => {
    return [
      category[`point1_${language}`] || '',
      category[`point2_${language}`] || '',
      category[`point3_${language}`] || ''
    ];
  };

  useEffect(() => {
    if (category) {


      setFormData({
        name_en: category.name_en || '',
        name_ar: category.name_ar || '',
        description_en: category.description_en || '',
        description_ar: category.description_ar || '',
        description_points_en: parsePointsFromCategory(category, 'en'),
        description_points_ar: parsePointsFromCategory(category, 'ar'),
        home_description_en: category.home_description_en || '',
        home_description_ar: category.home_description_ar || '',
        is_active: category.is_active !== undefined ? category.is_active : true
      });
      if (category.image_url) {
        const imageUrl = category.image_url.startsWith('http')
          ? category.image_url
          : `http://localhost:8080${category.image_url}`;
        setImagePreview(imageUrl);
      }
    } else {
      setFormData({
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        description_points_en: ['', '', ''],
        description_points_ar: ['', '', ''],
        home_description_en: '',
        home_description_ar: '',
        is_active: true
      });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [category, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name_en.trim()) {
      toast.error('English name is required');
      return;
    }

    setUploading(true);
    try {
      await onSave(formData, imageFile);
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Edit Category' : 'Create New Category'}
      size="large"
    >
      <form onSubmit={handleSubmit} className="category-form">
        {/* Basic Information Section */}
        <div className="form-section">
          <h3 className="form-section-title">Basic Information</h3>
          <div className="form-grid">
            {/* English Name */}
            <div className="form-group">
              <label htmlFor="name_en" className="form-label required">
                Category Name (English)
              </label>
              <input
                type="text"
                id="name_en"
                name="name_en"
                value={formData.name_en}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter category name in English"
                required
              />
            </div>

            {/* Arabic Name */}
            <div className="form-group">
              <label htmlFor="name_ar" className="form-label">
                Category Name (Arabic)
              </label>
              <input
                type="text"
                id="name_ar"
                name="name_ar"
                value={formData.name_ar}
                onChange={handleInputChange}
                className="form-input"
                placeholder="أدخل اسم الفئة بالعربية"
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {/* Description Bullet Points */}
        <div className="form-section">
          <h3 className="form-section-title">Category Description (3 Key Points)</h3>

          <div className="form-grid">
            {/* English Bullet Points */}
            <div className="form-group">
              <label className="form-label">Description Points (English)</label>
              <div className="bullet-points-container">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="bullet-point-input">
                    <span className="bullet-indicator">{index + 1}</span>
                    <input
                      type="text"
                      value={formData.description_points_en?.[index] || ''}
                      onChange={(e) => {
                        const newPoints = [...(formData.description_points_en || ['', '', ''])];
                        newPoints[index] = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          description_points_en: newPoints
                        }));
                      }}
                      className="form-input bullet-input"
                      placeholder={`Enter key point ${index + 1} in English`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Arabic Bullet Points */}
            <div className="form-group">
              <label className="form-label">Description Points (Arabic)</label>
              <div className="bullet-points-container">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="bullet-point-input">
                    <span className="bullet-indicator">{index + 1}</span>
                    <input
                      type="text"
                      value={formData.description_points_ar?.[index] || ''}
                      onChange={(e) => {
                        const newPoints = [...(formData.description_points_ar || ['', '', ''])];
                        newPoints[index] = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          description_points_ar: newPoints
                        }));
                      }}
                      className="form-input bullet-input"
                      placeholder={`أدخل النقطة الرئيسية ${index + 1} بالعربية`}
                      dir="rtl"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Home Page Descriptions */}
        <div className="form-section">
          <h3 className="form-section-title">Home Page Descriptions</h3>
          <div className="form-grid">
            {/* English Home Description */}
            <div className="form-group">
              <label htmlFor="home_description_en" className="form-label">
                Home Description (English)
              </label>
              <textarea
                id="home_description_en"
                name="home_description_en"
                value={formData.home_description_en}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Enter home page description in English"
                rows="3"
              />
            </div>

            {/* Arabic Home Description */}
            <div className="form-group">
              <label htmlFor="home_description_ar" className="form-label">
                Home Description (Arabic)
              </label>
              <textarea
                id="home_description_ar"
                name="home_description_ar"
                value={formData.home_description_ar}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="أدخل وصف الصفحة الرئيسية بالعربية"
                dir="rtl"
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="form-section">
          <h3 className="form-section-title">Category Image</h3>
          <div className="form-group">
            <div className="image-upload-container">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="image-input"
                id="category-image"
              />
              <label htmlFor="category-image" className="image-upload-label">
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Category preview" />
                    <div className="image-overlay">
                      <span>Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="image-placeholder">
                    <ImageIcon size={48} />
                    <span>Click to upload category image</span>
                    <small style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                      Recommended: 400x300px, JPG or PNG
                    </small>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="form-section">
          <h3 className="form-section-title">Category Settings</h3>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="checkbox-input"
              />
              <span className="checkbox-text">Active Category (visible to customers)</span>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={uploading || !formData.name_en.trim()}
          >
            {uploading ? (
              <>
                <div className="spinner"></div>
                Saving...
              </>
            ) : (
              <>
                {category ? 'Update Category' : 'Create Category'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryList;
