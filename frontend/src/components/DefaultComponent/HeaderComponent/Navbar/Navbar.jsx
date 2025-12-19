import React from 'react';
import './NavbarStyle.css';

const Navbar= () => {
  // Xác định trang hiện tại để highlight menu active
  const currentPath = window.location.pathname;

  const menuItems = [
    {
      path: '/',
      icon: 'fas fa-home',
      label: 'Trang chủ',
      active: currentPath === '/'
    },
    {
      path: '/map',
      icon: 'fas fa-map',
      label: 'Bản đồ',
      active: currentPath === '/map'
    },
    {
      path: '/pharmacy',
      icon: 'fas fa-prescription-bottle-alt',
      label: 'Nhà thuốc',
      active: currentPath === '/pharmacy'
    },
    {
      path: '/medical-facility',
      icon: 'fas fa-hospital',
      label: 'Cơ sở y tế',
      active: currentPath === '/medical-facility'
    },
    {
      path: '/outbreaks',
      icon: 'fas fa-virus',
      label: 'Vùng dịch',
      active: currentPath === '/outbreak-areas'
    },
    {
      path: '/about',
      icon: 'fas fa-info-circle',
      label: 'Giới thiệu',
      active: currentPath === '/about'
    }
  ];

  return (
    <ul className="navbar-nav me-auto">
      {menuItems.map((item, index) => (
        <li key={index} className="nav-item">
          <a 
            className={`nav-link ${item.active ? 'active' : ''}`} 
            href={item.path}
          >
            <i className={`${item.icon} me-1`}></i>
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default Navbar;