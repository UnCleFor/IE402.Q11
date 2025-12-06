import React, { useState, useEffect } from 'react';
import './UsersList.css';

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
      // Simulate API call - replace with actual API
      const mockUsers = [
        {
          user_id: 1,
          user_name: 'admin_user',
          email: 'admin@ytek.vn',
          role: 'admin',
          created_at: '2024-01-15T08:30:00Z',
          status: 'active'
        },
        {
          user_id: 2,
          user_name: 'john_doe',
          email: 'john@example.com',
          role: 'user',
          created_at: '2024-01-14T10:15:00Z',
          status: 'active'
        },
        {
          user_id: 3,
          user_name: 'jane_smith',
          email: 'jane@example.com',
          role: 'user',
          created_at: '2024-01-13T14:20:00Z',
          status: 'inactive'
        },
        {
          user_id: 4,
          user_name: 'dr_williams',
          email: 'dr.williams@hospital.com',
          role: 'doctor',
          created_at: '2024-01-12T09:45:00Z',
          status: 'active'
        },
        {
          user_id: 5,
          user_name: 'nurse_jones',
          email: 'nurse.jones@clinic.com',
          role: 'nurse',
          created_at: '2024-01-11T16:30:00Z',
          status: 'pending'
        }
      ];
      
      // Simulate API delay
      setTimeout(() => {
        setUsers(mockUsers);
        setIsLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Không thể tải danh sách người dùng');
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' || 
      user.status === activeTab ||
      user.role === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { label: 'Quản trị viên', class: 'danger', icon: 'bi-shield-check' },
      user: { label: 'Người dùng', class: 'primary', icon: 'bi-person' },
      doctor: { label: 'Bác sĩ', class: 'success', icon: 'bi-heart-pulse' },
      nurse: { label: 'Y tá', class: 'info', icon: 'bi-thermometer' },
      staff: { label: 'Nhân viên', class: 'warning', icon: 'bi-briefcase' }
    };
    
    const config = roleConfig[role] || { 
      label: role, 
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Hoạt động', class: 'success' },
      pending: { label: 'Chờ duyệt', class: 'warning' },
      inactive: { label: 'Ngừng hoạt động', class: 'danger' }
    };
    
    const config = statusConfig[status] || { label: status, class: 'secondary' };
    return <span className={`badge bg-${config.class}`}>{config.label}</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${userName}"?`)) {
      try {
        // Call API to delete user
        console.log('Deleting user:', userId);
        // Simulate API call
        setUsers(users.filter(user => user.user_id !== userId));
        alert('Đã xóa người dùng thành công!');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Không thể xóa người dùng. Vui lòng thử lại.');
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa';
    
    if (window.confirm(`Bạn có chắc chắn muốn ${action} người dùng này?`)) {
      try {
        // Call API to update status
        console.log('Updating user status:', userId, newStatus);
        
        // Update local state
        setUsers(users.map(user => 
          user.user_id === userId 
            ? { ...user, status: newStatus }
            : user
        ));
        
        alert(`Đã ${action} người dùng thành công!`);
      } catch (error) {
        console.error('Error updating user status:', error);
        alert('Không thể cập nhật trạng thái. Vui lòng thử lại.');
      }
    }
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
        <div className="col-md-3 col-sm-6">
          <div className="quick-stat">
            <div className="stat-icon">
              <i className="bi bi-people-fill"></i>
            </div>
            <div className="stat-info">
              <h4>{users.length}</h4>
              <span>Tổng người dùng</span>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="quick-stat">
            <div className="stat-icon">
              <i className="bi bi-shield-check"></i>
            </div>
            <div className="stat-info">
              <h4>{users.filter(u => u.role === 'admin').length}</h4>
              <span>Quản trị viên</span>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="quick-stat">
            <div className="stat-icon">
              <i className="bi bi-person-check"></i>
            </div>
            <div className="stat-info">
              <h4>{users.filter(u => u.status === 'active').length}</h4>
              <span>Đang hoạt động</span>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="quick-stat">
            <div className="stat-icon">
              <i className="bi bi-clock-history"></i>
            </div>
            <div className="stat-info">
              <h4>{users.filter(u => u.status === 'pending').length}</h4>
              <span>Chờ duyệt</span>
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
              <button
                className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                onClick={() => setActiveTab('active')}
              >
                Đang hoạt động
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
                    <th>Trạng thái</th>
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
                        {getStatusBadge(user.status)}
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
                            className={`btn btn-sm btn-outline-${user.status === 'active' ? 'warning' : 'success'}`}
                            title={user.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                            onClick={() => handleToggleStatus(user.user_id, user.status)}
                          >
                            <i className={`bi bi-${user.status === 'active' ? 'slash-circle' : 'check-circle'}`}></i>
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