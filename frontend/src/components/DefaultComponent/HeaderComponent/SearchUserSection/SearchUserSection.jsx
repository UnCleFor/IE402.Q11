import React, { useState, useEffect } from 'react';
import './SearchUserSection.css';
import { Link, useNavigate } from 'react-router-dom'; 

const SearchUserSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Lấy thông tin user từ localStorage khi component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    
    if (userData && token) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }

    // Lắng nghe sự kiện storage để cập nhật khi có thay đổi
    const handleStorageChange = () => {
      const updatedUserData = localStorage.getItem('user');
      const updatedToken = localStorage.getItem('authToken');
      
      if (updatedUserData && updatedToken) {
        try {
          setUser(JSON.parse(updatedUserData));
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Xử lý tìm kiếm ở đây
    console.log('Searching for:', searchQuery);
    // Gọi API tìm kiếm hoặc chuyển hướng đến trang kết quả
  };

  const getUserDisplayName = () => {
    if (!user) return 'Người dùng';
    
    // Ưu tiên hiển thị username, nếu không có thì dùng email
    return user.user_name || user.email || 'Người dùng';
  };

  const getUserAvatar = () => {
    if (!user) return <i className="bi bi-person-fill"></i>;
    
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
    return <i className="bi bi-person-fill"></i>;
  };

  const getUserRole = () => {
    if (!user) return '';
    
    const roleNames = {
      'admin': 'Quản trị viên',
      'super_admin': 'Super Admin',
      'doctor': 'Bác sĩ',
      'nurse': 'Y tá',
      'staff': 'Nhân viên',
      'health_worker': 'Cán bộ y tế',
      'user': 'Người dùng'
    };
    
    return roleNames[user.role] || user.role || '';
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/'); // Sử dụng navigate thay vì window.location
  };

  const handleViewProfile = () => {
    navigate('/profile'); // Sử dụng navigate
  };

  const handleAdminDashboard = () => {
    navigate('/dashboard'); // Sử dụng navigate
  };

  return (
    <div className="d-flex align-items-center">
      {/* Ô tìm kiếm */}
      {/* <div className="search-container me-3">
        <form onSubmit={handleSearch}>
          <div className="input-group">
            <input 
              type="text" 
              className="form-control form-control-sm" 
              placeholder="Tìm kiếm bệnh viện, địa điểm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-light btn-sm" type="submit">
              <i className="bi bi-search"></i>
            </button>
          </div>
        </form>
      </div> */}

      {/* Thông tin user */}
      <div className="dropdown">
        <button 
          className="btn btn-outline-light btn-sm dropdown-toggle d-flex align-items-center" 
          type="button" 
          data-bs-toggle="dropdown"
        >
          <div className="user-avatar me-2">
            {getUserAvatar()}
          </div>
          <span>
            {isAuthenticated ? getUserDisplayName() : 'Đăng nhập'}
          </span>
        </button>
        
        {isAuthenticated ? (
          // Menu khi đã đăng nhập
          <ul className="dropdown-menu dropdown-menu-end user-dropdown-menu">
            {/* User info */}
            <li className="dropdown-item user-info-header">
              <div className="d-flex align-items-center">
                <div className="user-avatar-lg me-2">
                  {getUserAvatar()}
                </div>
                <div className="user-details">
                  <div className="user-name">{getUserDisplayName()}</div>
                  <small className="text-muted">{user?.email}</small>
                  {getUserRole() && (
                    <span className="user-badge">{getUserRole()}</span>
                  )}
                </div>
              </div>
            </li>
            <li><hr className="dropdown-divider" /></li>
            
            {/* Menu items */}
            <li>
              <button className="dropdown-item" onClick={handleViewProfile}>
                <i className="bi bi-person me-2"></i>
                Hồ sơ cá nhân
              </button>
            </li>
            <li>
              <Link className="dropdown-item" to="/my-appointments">
                <i className="bi bi-calendar-check me-2"></i>
                Lịch hẹn của tôi
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to="/favorites">
                <i className="bi bi-heart me-2"></i>
                Đã lưu
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to="/reviews">
                <i className="bi bi-chat-text me-2"></i>
                Đánh giá của tôi
              </Link>
            </li>
            
            {/* Admin menu nếu user là admin */}
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-primary" onClick={handleAdminDashboard}>
                    <i className="bi bi-speedometer2 me-2"></i>
                    Trang quản trị
                  </button>
                </li>
              </>
            )}
            
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Đăng xuất
              </button>
            </li>
          </ul>
        ) : (
          // Menu khi chưa đăng nhập
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <a className="dropdown-item" href="/login">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Đăng nhập
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="/register">
                <i className="bi bi-person-plus me-2"></i>
                Đăng ký
              </a>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchUserSection;