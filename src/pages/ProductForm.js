import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { productAPI, categoryAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import RichTextEditor from '../components/RichTextEditor';
import SearchableSelect from '../components/SearchableSelect';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Globe, Image as ImageIcon } from 'lucide-react';
import './ProductForm/ProductForm.scss';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    defaultValues: {
      name_en: '',
      name_ar: '',
      category_id: '',
      is_active: true
    }
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [id, isEdit]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProduct(id);
      const product = response.data.data;
      
      // Set form values
      Object.keys(product).forEach(key => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
          setValue(key, product[key]);
        }
      });

      // Set image preview and descriptions separately
      if (product.image_url) {
        const fullImageUrl = product.image_url.startsWith('http')
          ? product.image_url
          : `http://localhost:8080${product.image_url}`;
        setImagePreview(fullImageUrl);
      }
      setDescriptionEn(product.description_en || '');
      setDescriptionAr(product.description_ar || '');
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to fetch product details');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);

      // Format data with dual language descriptions
      const formattedData = {
        ...data,
        description_en: descriptionEn,
        description_ar: descriptionAr,
        category_id: parseInt(data.category_id, 10)
      };

      if (isEdit) {
        const result = await productAPI.updateProduct(id, formattedData, imageFile);
        if (result.success) {
          toast.success('Product updated successfully');
          navigate('/products');
        } else {
          const errorMessage = result.error || 'Failed to update product';
          toast.error(errorMessage);
        }
      } else {
        const result = await productAPI.createProduct(formattedData, imageFile);
        if (result.success) {
          toast.success('Product created successfully');
          navigate('/products');
        } else {
          const errorMessage = result.error || 'Failed to create product';
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save product';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
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

  if (loading) {
    return <LoadingSpinner message="Loading product details..." />;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="page-header">
          <div className="page-header-content">
            <div className="page-title-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
                <button
                  onClick={() => navigate('/products')}
                  className="btn btn-secondary btn-sm"
                >
                  <ArrowLeft size={18} />
                </button>
                <h1 className="page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
              </div>
              <p className="page-description">
                {isEdit ? 'Update product information and settings' : 'Create a new product with multilingual support'}
              </p>
            </div>
          </div>
        </div>

        <div className="card card-spacious">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Dual Language Name Fields */}
            <div className="form-section">
              <h3 className="form-section-title">
                <Globe size={20} />
                Product Names
              </h3>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label form-label-required">Product Name (English)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter product name in English"
                    {...register('name_en', {
                      required: 'English product name is required',
                      minLength: { value: 1, message: 'Name must be at least 1 character' },
                      maxLength: { value: 255, message: 'Name must be less than 255 characters' }
                    })}
                  />
                  {errors.name_en && <div className="error-message">{errors.name_en.message}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Product Name (Arabic)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="أدخل اسم المنتج بالعربية"
                    dir="rtl"
                    {...register('name_ar', {
                      maxLength: { value: 255, message: 'Name must be less than 255 characters' }
                    })}
                  />
                  {errors.name_ar && <div className="error-message">{errors.name_ar.message}</div>}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="form-section">
              <h3 className="form-section-title">Product Details</h3>
              <div className="form-group">
                <label className="form-label form-label-required">Category</label>
                <SearchableSelect
                  options={categories.map(category => ({
                    value: category.id,
                    label: category.name
                  }))}
                  value={watch('category_id')}
                  onChange={(value) => setValue('category_id', value)}
                  placeholder="Select a category..."
                  searchPlaceholder="Search categories..."
                  error={!!errors.category_id}
                />
                {errors.category_id && <div className="error-message">Category is required</div>}
              </div>
            </div>

            {/* Product Image */}
            <div className="form-section">
              <h3 className="form-section-title">Product Image</h3>
              <div className="form-group">
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="image-input"
                    id="product-image"
                  />
                  <label htmlFor="product-image" className="image-upload-label">
                    {imagePreview ? (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Product preview" />
                        <div className="image-overlay">
                          <span>Change Image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="image-placeholder">
                        <ImageIcon size={48} />
                        <span>Click to upload product image</span>
                        <small style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                          Recommended: 400x300px, JPG or PNG
                        </small>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Dual Language Descriptions */}
            <div className="form-section">
              <h3 className="form-section-title">
                <Globe size={20} />
                Product Descriptions
              </h3>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">Description (English)</label>
                  <RichTextEditor
                    value={descriptionEn}
                    onChange={setDescriptionEn}
                    placeholder="Enter product description in English..."
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Arabic)</label>
                  <RichTextEditor
                    value={descriptionAr}
                    onChange={setDescriptionAr}
                    placeholder="أدخل وصف المنتج بالعربية..."
                    isArabic={true}
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Product Status */}
            <div className="form-section">
              <h3 className="form-section-title">Product Settings</h3>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    {...register('is_active')}
                  />
                  <span className="checkbox-text">Active Product (visible to customers)</span>
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="btn btn-secondary"
                disabled={submitting}
              >
                <ArrowLeft size={20} />
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="spinner"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>{isEdit ? 'Update Product' : 'Create Product'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
