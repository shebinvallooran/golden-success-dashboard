import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { productAPI, categoryAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ImageUpload from '../../components/ImageUpload';
import RichTextEditor from '../../components/RichTextEditor';
import SearchableSelect from '../../components/SearchableSelect/SearchableSelect';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Globe } from 'lucide-react';
import './ProductForm.scss';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [categories, setCategories] = useState([]);
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      name_en: '',
      name_ar: '',
      sku: '',
      category_id: '',
      image_url: '',
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

      // Set image URL and descriptions separately
      setImageUrl(product.image_url || '');
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
        category_id: parseInt(data.category_id, 10),
        image_url: imageUrl
      };

      if (isEdit) {
        await productAPI.updateProduct(id, formattedData);
        toast.success('Product updated successfully');
        navigate('/products');
      } else {
        await productAPI.createProduct(formattedData);
        toast.success('Product created successfully');
        navigate('/products');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save product';
      toast.error(errorMessage);
      // Don't navigate on error - let user fix the issue
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading product details..." />;
  }

  return (
    <div className="product-form-page">
      <div className="container">
        <div className="page-header">
          <div className="page-header-content">
            <div className="page-title-section">
              <div className="page-title-with-back">
                <button
                  onClick={() => navigate('/products')}
                  className="btn btn-secondary btn-sm back-button"
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
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label form-label-required">SKU</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., PROD-001"
                    {...register('sku', {
                      required: 'SKU is required',
                      pattern: {
                        value: /^[A-Z0-9-]+$/,
                        message: 'SKU must contain only uppercase letters, numbers, and hyphens'
                      }
                    })}
                  />
                  {errors.sku && <div className="error-message">{errors.sku.message}</div>}
                </div>

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
            </div>

            {/* Product Image */}
            <div className="form-section">
              <h3 className="form-section-title">Product Image</h3>
              <div className="form-group">
                <ImageUpload
                  value={imageUrl}
                  onChange={setImageUrl}
                  disabled={submitting}
                />
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
                    isArabic={true}
                    placeholder="أدخل وصف المنتج بالعربية..."
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Product Status */}
            <div className="form-section">
              <h3 className="form-section-title">Product Status</h3>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    {...register('is_active')}
                  />
                  <span className="checkbox-text">Active Product</span>
                  <span className="checkbox-description">
                    Active products are visible to customers and can be purchased
                  </span>
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="btn btn-secondary btn-lg"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
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
