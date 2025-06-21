import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', text = 'Cargando...', className = '' }) => {
  const sizeClasses = {
    small: 'loading-spinner--small',
    medium: 'loading-spinner--medium',
    large: 'loading-spinner--large'
  };

  return (
    <div className={`loading-spinner ${sizeClasses[size]} ${className}`}>
      <div className="loading-spinner__circle">
        <div className="loading-spinner__dot"></div>
        <div className="loading-spinner__dot"></div>
        <div className="loading-spinner__dot"></div>
        <div className="loading-spinner__dot"></div>
      </div>
      {text && <p className="loading-spinner__text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;