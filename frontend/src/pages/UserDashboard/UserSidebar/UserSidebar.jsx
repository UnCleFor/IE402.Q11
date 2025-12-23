import React, { useState, useEffect } from 'react';
import './UserSidebar.css';
import LogoImage from '../../../assets/Logo/LogoImage.png';

const UserSidebar = ({ activeSection, setActiveSection, collapsed }) => {
  const [user, setUser] = useState(null);

  // Lấy thông tin user từ localStorage khi component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Định nghĩa các mục menu
  const menuItems = [
    {
      id: 'dashboard',
      icon: 'bi bi-speedometer2',
      label: 'Tổng quan',
      badge: null
    },
    {
      id: 'users',
      icon: 'bi bi-people',
      label: 'Quản lý người dùng',
      badge: null
    },
    {
      id: 'facilities',
      icon: 'bi bi-hospital',
      label: 'Cơ sở y tế',
      badge: '12'
    },
    {
      id: 'pharmacies',
      icon: 'bi bi-capsule',
      label: 'Nhà thuốc',
      badge: null
    },
    {
      id: 'outbreak',
      icon: 'bi bi-virus',
      label: 'Quản lý dịch',
      badge: '3'
    },
    {
      id: 'reports',
      icon: 'bi bi-graph-up',
      label: 'Báo cáo',
      badge: null
    },
    {
      id: 'map-tools',
      icon: 'bi bi-geo-alt',
      label: 'Công cụ bản đồ',
      badge: null
    }
  ];

  // Hàm lấy tên hiển thị của user
  const getUserDisplayName = () => {
    if (!user) return 'Người dùng';
    return user.user_name || user.name || user.email || 'Người dùng';
  };

  // Hàm lấy avatar của user
  const getUserAvatar = () => {
    if (!user) return <i className="bi bi-person-circle"></i>;
    if (user.avatar) {
      return <img src={user.avatar} alt={getUserDisplayName()} />;
    }
    if (user.name || user.username) {
      const name = user.name || user.username;
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
      return <span className="avatar-initials">{initials.substring(0, 2)}</span>;
    }
    return <i className="bi bi-person-circle"></i>;
  };

  // Hàm lấy vai trò của user
  const getUserRole = () => {
    if (!user) return 'Người dùng';
    const roleNames = {
      'admin': 'Quản trị viên',
      'super_admin': 'Super Admin',
      'doctor': 'Bác sĩ',
      'nurse': 'Y tá',
      'staff': 'Nhân viên',
      'health_worker': 'Cán bộ y tế',
      'user': 'Người dùng'
    };

    return roleNames[user.role] || user.role || 'Người dùng';
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className={`user-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src={LogoImage} alt="Logo" className="logo-img" />
          {!collapsed && (
            <div className="logo-text">
              <span className="logo-title">BẢN ĐỒ Y TẾ</span>
              <small className="logo-subtitle">Quản trị</small>
            </div>
          )}
        </div>
      </div>

      {/* Main Menu */}
      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => setActiveSection(item.id)}
          >
            <div className="menu-icon">
              <i className={item.icon}></i>
            </div>
            {!collapsed && (
              <>
                <span className="menu-label">{item.label}</span>

              </>
            )}
          </button>
        ))}
      </div>

      {/* Bottom Menu */}
      <div className="sidebar-bottom">
        

        {/* Logout Button */}
        <button
          className="menu-item logout-btn"
          onClick={handleLogout}
        >
          <div className="menu-icon">
            <i className="bi bi-box-arrow-right"></i>
          </div>
          {!collapsed && (
            <span className="menu-label">Đăng xuất</span>
          )}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="sidebar-user">
          <div className="user-avatar">
            {getUserAvatar()}
          </div>
          <div className="user-info">
            <div className="user-name">{getUserDisplayName()}</div>
            <div className="user-role">{getUserRole()}</div>
          </div>
        </div>
      )}

      {/* Collapsed User Info */}
      {collapsed && (
        <div className="sidebar-user-collapsed">
          <div className="user-avatar-sm" title={getUserDisplayName()}>
            {getUserAvatar()}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSidebar;