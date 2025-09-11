import React from 'react';
import { Edit, Trash2, ArrowUp, ArrowDown, Package, Image as ImageIcon } from 'lucide-react';

const CategoryCard = ({ 
  category, 
  index, 
  totalCategories,
  onEdit, 
  onDelete, 
  onPriorityChange 
}) => {
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

      {/* Description Column */}
      <td>
        <div className="category-description">
          {(category.description_en || category.description) ? (
            <div>
              {(category.description_en || category.description) && (
                <div className="desc-en">{category.description_en || category.description}</div>
              )}
              {category.description_ar && (
                <div className="desc-ar" dir="rtl">{category.description_ar}</div>
              )}
            </div>
          ) : (
            <span className="no-description">No description</span>
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

export default CategoryCard;
