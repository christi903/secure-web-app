import React from 'react';
import './securelogo.css';

const SecureLogo = ({ color }) => {
  return (
    <div className="logo-container">
      <span className="secure-text" style={{ color }}>Secure</span>
    </div>
  );
};

export default SecureLogo;
