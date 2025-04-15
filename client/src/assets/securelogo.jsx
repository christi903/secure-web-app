import React from 'react';
import './securelogo.css';

const SecureLogo = ({ color }) => {
  return (
    <div className="logo-container">
      <div className="line-dot-wrapper">
        <div className="red-line" />
        <div className="red-dot" />
      </div>

      <span className="secure-text">
        secur<span className="e-letter">e</span>
      </span>
    </div>
  );
};

export default SecureLogo;
