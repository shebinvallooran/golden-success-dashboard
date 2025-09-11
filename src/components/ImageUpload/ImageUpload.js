import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import './ImageUpload.scss';

const ImageUpload = ({ value, onChange, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const uploadFile = async (file) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:8080/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      const imageUrl = `http://localhost:8080${data.url}`;
      
      setPreview(imageUrl);
      onChange(imageUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="image-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="file-input"
        disabled={disabled || uploading}
      />

      {preview ? (
        <div className="image-preview">
          <div className="image-container">
            <img 
              src={preview} 
              alt="Preview" 
              className="preview-image"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="remove-button"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClick}
              className="btn btn-secondary change-button"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Change Image'}
            </button>
          )}
        </div>
      ) : (
        <div
          className={`upload-area ${disabled ? 'disabled' : ''} ${uploading ? 'uploading' : ''}`}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {uploading ? (
            <div className="upload-loading">
              <div className="spinner"></div>
              <p>Uploading...</p>
            </div>
          ) : (
            <div className="upload-content">
              <div className="upload-icon">
                {disabled ? (
                  <ImageIcon size={48} />
                ) : (
                  <Upload size={48} />
                )}
              </div>
              <p className="upload-text">
                {disabled ? 'No image' : 'Click to upload or drag and drop'}
              </p>
              {!disabled && (
                <p className="upload-hint">
                  JPEG, PNG, GIF, or WebP (max 10MB)
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
