import React, { useState, useEffect } from 'react';
import './UserHeader.css';

const UserHeader = ({ toggleSidebar, sidebarCollapsed }) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Có báo cáo dịch mới',
      message: 'Báo cáo dịch sốt xuất huyết tại quận Ba Đình',
      time: '5 phút trước',
      read: false,
      type: 'outbreak'
    },
    {
      id: 2,
      title: 'Yêu cầu xác minh',
      message: 'Cơ sở y tế mới cần xác minh thông tin',
      time: '1 giờ trước',
      read: false,
      type: 'facility'
    },
    {
      id: 3,
      title: 'Cập nhật hệ thống',
      message: 'Phiên bản mới 2.1.0 đã sẵn sàng',
      time: '2 giờ trước',
      read: true,
      type: 'system'
    }
  ]);

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

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const getUserDisplayName = () => {
    if (!user) return 'Người dùng';
    
    // Ưu tiên hiển thị username, nếu không có thì dùng email
    return user.user_name || user.name || user.email || 'Người dùng';
  };

  const getUserAvatar = () => {
    if (!user) return <i className="bi bi-person-circle"></i>;
    
    // Nếu user có avatar URL
    if (user.avatar) {
      return <img src={user.avatar} alt={getUserDisplayName()} />;
    }
    
    // Nếu có tên, hiển thị chữ cái đầu
    if (user.name || user.username) {
      const name = user.name || user.username;
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
      return <span className="avatar-initials">{initials.substring(0, 2)}</span>;
    }
    
    // Mặc định
    return <i className="bi bi-person-circle"></i>;
  };

  const getUserRole = () => {
    if (!user) return '';
    
    const roleNames = {
      'admin': 'Quản trị viên',
      'doctor': 'Bác sĩ',
      'nurse': 'Y tá',
      'staff': 'Nhân viên',
      'user': 'Người dùng'
    };
    
    return roleNames[user.role] || user.role || '';
  };

  const handleLogout = () => {
    // Xóa token và user info khỏi localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Chuyển hướng về trang login
    window.location.href = '/login';
  };

  return (
    <header className="user-header">
      <div className="container-fluid">
        <div className="row align-items-center">
          <div className="col">
            {/* Sidebar Toggle */}
            <button 
              className="btn sidebar-toggle"
              onClick={toggleSidebar}
            >
              <i className={`bi ${sidebarCollapsed ? 'bi-list' : 'bi-layout-sidebar'}`}></i>
            </button>

            {/* Breadcrumb */}
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <a href="/">
                    <i className="bi bi-house me-1"></i>
                    Trang chủ
                  </a>
                </li>
                <li className="breadcrumb-item active">Bảng điều khiển</li>
              </ol>
            </nav>
          </div>

          <div className="col-auto">
            <div className="header-actions">
   
              {/* Notifications */}
              <div className="dropdown notification-dropdown">
                <button 
                  className="btn notification-btn"
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-bell"></i>
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>
                <div className="dropdown-menu dropdown-menu-end notification-menu">
                  <div className="notification-header">
                    <h6>Thông báo</h6>
                    {unreadCount > 0 && (
                      <button 
                        className="btn btn-sm btn-link"
                        onClick={markAllAsRead}
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>
                  <div className="notification-list">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className={`notification-icon ${notification.type}`}>
                          <i className={`bi bi-${
                            notification.type === 'outbreak' ? 'virus' : 
                            notification.type === 'facility' ? 'hospital' : 'gear'
                          }`}></i>
                        </div>
                        <div className="notification-content">
                          <h6>{notification.title}</h6>
                          <p>{notification.message}</p>
                          <small>{notification.time}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="notification-footer">
                    <a href="/notifications" className="btn btn-sm btn-outline-primary w-100">
                      Xem tất cả
                    </a>
                  </div>
                </div>
              </div>

              {/* User Menu */}
              <div className="dropdown user-dropdown">
                <button 
                  className="btn user-btn"
                  data-bs-toggle="dropdown"
                >
                  <div className="user-avatar-sm">
                    {getUserAvatar()}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{getUserDisplayName()}</span>
                    {getUserRole() && (
                      <span className="user-role">{getUserRole()}</span>
                    )}
                  </div>
                  <i className="bi bi-chevron-down"></i>
                </button>
                <div className="dropdown-menu dropdown-menu-end user-menu">
                  <div className="user-menu-header">
                    <div className="user-avatar-lg">
                      {getUserAvatar()}
                    </div>
                    <div className="user-info-lg">
                      <h6>{getUserDisplayName()}</h6>
                      <small className="text-muted">{user?.email}</small>
                      {getUserRole() && (
                        <span className="user-badge">{getUserRole()}</span>
                      )}
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href="/profile">
                    <i className="bi bi-person me-2"></i>
                    Hồ sơ cá nhân
                  </a>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item text-danger" 
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;