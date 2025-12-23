import React from 'react';
import './LoginHeader.css';
import LogoImage from '../../../assets/Logo/LogoImage.png';

const LoginHeader = () => {
  return (
    <header className="login-header">
      <nav className="navbar navbar-expand-lg navbar-dark">
        <div className="container-fluid px-4">
          {/* Logo */}
          <a className="navbar-brand d-flex align-items-center" href="/">
            <div className="login-header-logo me-2">
              <img 
                src={LogoImage} 
                alt="Bản đồ Y tế Quốc gia" 
                className="login-logo-image"
              />
            </div>
            <div className="login-brand-text">
              <span className="login-brand-title">BẢN ĐỒ Y TẾ QUỐC GIA</span>
              <small className="login-brand-subtitle">National Health Map</small>
            </div>
          </a>

          {/* Back to Home */}
          <div className="navbar-nav ms-auto">
            <a href="/" className="btn btn-outline-light btn-sm">
              <i className="bi bi-arrow-left me-2"></i>
              Về trang chủ
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default LoginHeader;