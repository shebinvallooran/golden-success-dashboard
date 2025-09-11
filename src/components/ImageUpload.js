import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

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
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />

      {preview ? (
        <div className="image-preview">
          <div className="image-container">
            <img 
              src={preview} 
              alt="Preview" 
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="remove-button"
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClick}
              className="btn btn-secondary"
              style={{ marginTop: '10px', width: '100%' }}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Change Image'}
            </button>
          )}
        </div>
      ) : (
        <div
          className="upload-area"
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{
            border: '2px dashed #ddd',
            borderRadius: '8px',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            backgroundColor: disabled ? '#f5f5f5' : '#fafafa',
            transition: 'all 0.2s',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {uploading ? (
            <div>
              <div style={{
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #007bff',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 10px'
              }}></div>
              <p style={{ color: '#666', margin: 0 }}>Uploading...</p>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '15px' }}>
                {disabled ? (
                  <ImageIcon size={48} color="#ccc" />
                ) : (
                  <Upload size={48} color="#007bff" />
                )}
              </div>
              <p style={{ color: '#666', margin: '0 0 5px 0', fontSize: '16px' }}>
                {disabled ? 'No image' : 'Click to upload or drag and drop'}
              </p>
              {!disabled && (
                <p style={{ color: '#999', margin: 0, fontSize: '14px' }}>
                  JPEG, PNG, GIF, or WebP (max 10MB)
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .image-upload {
          width: 100%;
        }
        
        .image-preview {
          width: 100%;
        }
        
        .image-container {
          position: relative;
          width: 100%;
        }
        
        .upload-area:hover {
          border-color: ${disabled ? '#ddd' : '#007bff'};
          background-color: ${disabled ? '#f5f5f5' : '#f0f8ff'};
        }
        
        .remove-button:hover {
          background: rgba(0, 0, 0, 0.9) !important;
        }
      `}</style>
    </div>
  );
};

export default ImageUpload;
