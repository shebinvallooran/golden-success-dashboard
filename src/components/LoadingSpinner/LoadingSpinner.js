import React from 'react';
import './LoadingSpinner.scss';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-spinner">
      <div className="spinner-container">
        <div className="spinner"></div>
        <p className="spinner-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
