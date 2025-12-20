import React from 'react';
import './HeaderStyle.css';
import Logo from './Logo/Logo';
import EmergencyBanner from './EmergencyBanner/EmergencyBanner';
import Navbar from './Navbar/Navbar';
import SearchUserSection from './SearchUserSection/SearchUserSection';

const HeaderComponent = () => {
  return (
    <header className="health-map-header">
      <nav className="navbar navbar-expand-lg navbar-dark custom-header-gradient">
        <div className="container-fluid">
          {/* Logo và Tên hệ thống */}
          <Logo />
          
          {/* Nút toggle cho mobile */}
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarMain"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Menu chính */}
          <div className="collapse navbar-collapse" id="navbarMain">
            {/* Navigation Menu */}
            <Navbar />
            
            {/* Phần bên phải: Tìm kiếm và User */}
            <SearchUserSection />
          </div>
        </div>
      </nav>

      {/* Banner thông báo khẩn cấp */}
      {/* <EmergencyBanner /> */}
    </header>
  );
};

export default HeaderComponent;