import React from 'react';
import CategoryCard from './CategoryCard';

const CategoryTable = ({ 
  categories, 
  onEdit, 
  onDelete, 
  onPriorityChange 
}) => {
  return (
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
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
              totalCategories={categories.length}
              onEdit={onEdit}
              onDelete={onDelete}
              onPriorityChange={onPriorityChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;
