import React, { useState, useEffect } from 'react';
import './securelogo.css'; // We will define styles here

const SecureLogo = () => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsOpen(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="logo-container">
      <span className="secure-text">Secur</span>
      <span className="lock-container">
        <span className="e-letter">e</span>
        <svg
          viewBox="0 0 24 24"
          className={`lock-icon ${isOpen ? 'open' : 'closed'}`}
        >
          <path d="M17 8h-1V6a4 4 0 10-8 0h2a2 2 0 114 0v2h-6a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2v-8a2 2 0 00-2-2z" />
        </svg>
      </span>
    </div>
  );
};

export default SecureLogo;
