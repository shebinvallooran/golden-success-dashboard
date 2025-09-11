import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const CategoryModal = ({ isOpen, category, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    home_description_en: '',
    home_description_ar: '',
    point1_en: '',
    point1_ar: '',
    point2_en: '',
    point2_ar: '',
    point3_en: '',
    point3_ar: '',
    image_url: '',
    priority: 0,
    is_active: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name_en: category.name_en || category.name || '',
        name_ar: category.name_ar || '',
        description_en: category.description_en || category.description || '',
        description_ar: category.description_ar || '',
        home_description_en: category.home_description_en || '',
        home_description_ar: category.home_description_ar || '',
        point1_en: category.point1_en || '',
        point1_ar: category.point1_ar || '',
        point2_en: category.point2_en || '',
        point2_ar: category.point2_ar || '',
        point3_en: category.point3_en || '',
        point3_ar: category.point3_ar || '',
        image_url: category.image_url || '',
        priority: category.priority || 0,
        is_active: category.is_active !== undefined ? category.is_active : true
      });
      setImagePreview(category.image_url ? `http://localhost:8080${category.image_url}` : null);
    } else {
      setFormData({
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        home_description_en: '',
        home_description_ar: '',
        point1_en: '',
        point1_ar: '',
        point2_en: '',
        point2_ar: '',
        point3_en: '',
        point3_ar: '',
        image_url: '',
        priority: 0,
        is_active: true
      });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [category, isOpen]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name_en.trim()) {
      toast.error('English category name is required');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData, imageFile);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;

    if (type === 'checkbox') {
      processedValue = checked;
    } else if (type === 'number') {
      processedValue = parseInt(value) || 0;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Edit Category' : 'Create Category'}
      size="large"
    >
      <form onSubmit={handleSubmit} className="category-form">
        {/* Image Upload Section */}
        <div className="form-section">
          <h3 className="section-title">Category Image</h3>
          <div className="image-upload-section">
            {imagePreview ? (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="remove-image-btn"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="image-upload-placeholder">
                <ImageIcon size={32} />
                <p>No image selected</p>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="image-input"
              id="category-image"
              disabled={saving}
            />
            <label htmlFor="category-image" className="image-upload-btn">
              <Upload size={16} />
              <span>Select Image</span>
            </label>
            <p className="image-help-text">
              Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
            </p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name_en">Category Name (English) *</label>
              <input
                type="text"
                id="name_en"
                name="name_en"
                value={formData.name_en}
                onChange={handleChange}
                required
                disabled={saving}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="name_ar">Category Name (Arabic)</label>
              <input
                type="text"
                id="name_ar"
                name="name_ar"
                value={formData.name_ar}
                onChange={handleChange}
                disabled={saving}
                className="form-control"
                dir="rtl"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description_en">Description (English)</label>
              <textarea
                id="description_en"
                name="description_en"
                value={formData.description_en}
                onChange={handleChange}
                disabled={saving}
                className="form-control"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description_ar">Description (Arabic)</label>
              <textarea
                id="description_ar"
                name="description_ar"
                value={formData.description_ar}
                onChange={handleChange}
                disabled={saving}
                className="form-control"
                rows="3"
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="form-section">
          <h3 className="section-title">Settings</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <input
                type="number"
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={saving}
                className="form-control"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  disabled={saving}
                />
                <span>Active</span>
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : (category ? 'Update Category' : 'Create Category')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;
