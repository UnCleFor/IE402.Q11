import React from 'react';
import './LoginSidebar.css';

const LoginSidebar = () => {
  const features = [
    {
      icon: 'bi bi-hospital',
      title: 'Quản lý Bệnh viện',
      description: 'Thêm, sửa, xóa thông tin các cơ sở y tế trên toàn quốc'
    },
    {
      icon: 'bi bi-map',
      title: 'Theo dõi Vùng dịch',
      description: 'Giám sát và cập nhật thông tin các vùng dịch bệnh'
    },
    {
      icon: 'bi bi-graph-up',
      title: 'Báo cáo Thống kê',
      description: 'Phân tích dữ liệu y tế với biểu đồ trực quan'
    },
    {
      icon: 'bi bi-shield-check',
      title: 'Bảo mật Cao',
      description: 'Hệ thống được bảo vệ với công nghệ mã hóa tiên tiến'
    }
  ];

  return (
    <div className="login-sidebar">
      <div className="sidebar-content">
        <h3 className="sidebar-title">Quản lý Hệ thống Y tế Thông minh</h3>
        <p className="sidebar-subtitle">
          Truy cập vào bảng điều khiển quản trị để quản lý toàn bộ hệ thống 
          Bản đồ Y tế Quốc gia một cách hiệu quả.
        </p>

        {/* Features List */}
        <div className="features-list">
          {features.map((feature, index) => (
            <div key={index} className="feature-item">
              <div className="feature-icon">
                <i className={feature.icon}></i>
              </div>
              <div className="feature-content">
                <h6 className="feature-title">{feature.title}</h6>
                <p className="feature-description">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="sidebar-footer">
          <div className="support-info">
            <i className="bi bi-headset me-2"></i>
            <span>Hỗ trợ 24/7: <strong>1900 9095</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSidebar;