import React, { useState, useEffect } from 'react';
import './UsersList.css';
import authService from '../../../services/authService';

const UsersList = ({ onAddUser, onEditUser }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Call actual API from authService
      const response = await authService.getAllUsers();
      
      // Transform API response to match component structure
      const formattedUsers = response.map(user => ({
        user_id: user.id || user.user_id,
        user_name: user.user_name || user.username || user.email,
        email: user.email,
        role: user.role || 'user',
        created_at: user.created_at || user.createdDate || new Date().toISOString(),
      }));
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.user_name && user.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = 
      activeTab === 'all' || 
      user.role === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { label: 'Quản trị viên', class: 'danger', icon: 'bi-shield-check' },
      user: { label: 'Người dùng', class: 'primary', icon: 'bi-person' },
    };
    
    const config = roleConfig[role] || { 
      label: role || 'Người dùng', 
      class: 'secondary', 
      icon: 'bi-person' 
    };
    
    return (
      <span className={`badge bg-${config.class}`}>
        <i className={`bi ${config.icon} me-1`}></i>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${userName}"?`)) {
      try {
        // Call API to delete user
        await authService.deleteUser(userId);
        
        // Update local state
        setUsers(users.filter(user => user.user_id !== userId));
        alert('Đã xóa người dùng thành công!');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Không thể xóa người dùng. Vui lòng thử lại.');
      }
    }
  };

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    user: users.filter(u => u.role === 'user').length,
  };

  return (
    <div className="users-list">
      <div className="section-header">
        <div className="header-content">
          <h2>Quản Lý Người Dùng</h2>
          <p>Quản lý tài khoản người dùng và phân quyền truy cập</p>
        </div>
        <button className="btn btn-primary" onClick={onAddUser}>
          <i className="bi bi-person-plus me-2"></i>
          Thêm Người Dùng
        </button>
      </div>

      {/* Quick Stats */}
      <div className="row mb-4">
        <div className="col-md-4 col-sm-6">
          <div className="quick-stat">
            <div className="stat-icon">
              <i className="bi bi-people-fill"></i>
            </div>
            <div className="stat-info">
              <h4>{stats.total}</h4>
              <span>Tổng người dùng</span>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-sm-6">
          <div className="quick-stat">
            <div className="stat-icon">
              <i className="bi bi-shield-check"></i>
            </div>
            <div className="stat-info">
              <h4>{stats.admin}</h4>
              <span>Quản trị viên</span>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-sm-6">
          <div className="quick-stat">
            <div className="stat-icon">
              <i className="bi bi-person"></i>
            </div>
            <div className="stat-info">
              <h4>{stats.user}</h4>
              <span>Người dùng thường</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="users-controls">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="search-box">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email hoặc vai trò..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="filter-tabs">
              <button
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                Tất cả
              </button>
              <button
                className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                Quản trị
              </button>
              <button
                className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}
                onClick={() => setActiveTab('user')}
              >
                Người dùng
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3">Đang tải danh sách người dùng...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <i className="bi bi-exclamation-triangle"></i>
            <h5>Có lỗi xảy ra</h5>
            <p>{error}</p>
            <button className="btn btn-primary mt-3" onClick={fetchUsers}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Thử lại
            </button>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table users-table">
                <thead>
                  <tr>
                    <th>Tên đăng nhập</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.user_id}>
                      <td>
                        <div className="user-name">
                          <strong>{user.user_name}</strong>
                          {user.role === 'admin' && (
                            <i className="bi bi-shield-check-fill admin-badge" title="Quản trị viên"></i>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="user-email">
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td>
                        {getRoleBadge(user.role)}
                      </td>
                      <td>
                        <div className="user-date">
                          {formatDate(user.created_at)}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-sm btn-outline-primary" 
                            title="Chỉnh sửa"
                            onClick={() => onEditUser(user)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            title="Xóa"
                            onClick={() => handleDeleteUser(user.user_id, user.user_name)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="empty-state">
                <i className="bi bi-people"></i>
                <h5>Không tìm thấy người dùng nào</h5>
                <p>Thử thay đổi điều kiện tìm kiếm hoặc thêm người dùng mới</p>
                <button className="btn btn-primary mt-3" onClick={onAddUser}>
                  <i className="bi bi-person-plus me-2"></i>
                  Thêm Người Dùng Đầu Tiên
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UsersList;