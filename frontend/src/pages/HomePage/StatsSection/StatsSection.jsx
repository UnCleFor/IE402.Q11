import React from 'react';
import './StatsSection.css';

const StatsSection = () => {
  const stats = [
    {
      icon: 'bi bi-hospital',
      number: '1,247',
      label: 'Bệnh viện',
      description: 'Trên toàn quốc'
    },
    {
      icon: 'bi bi-plus-circle',
      number: '5,892',
      label: 'Phòng khám',
      description: 'Cơ sở y tế tư nhân'
    },
    {
      icon: 'bi bi-shield-check',
      number: '98%',
      label: 'Phủ sóng',
      description: 'Tại 63 tỉnh thành'
    },
    {
      icon: 'bi bi-people',
      number: '2.5M+',
      label: 'Người dùng',
      description: 'Tin tưởng sử dụng'
    }
  ];

  const outbreakStats = [
    {
      province: 'Hà Nội',
      cases: 127,
      trend: 'up'
    },
    {
      province: 'TP.HCM',
      cases: 89,
      trend: 'down'
    },
    {
      province: 'Đà Nẵng',
      cases: 45,
      trend: 'stable'
    },
    {
      province: 'Hải Phòng',
      cases: 32,
      trend: 'up'
    }
  ];

  return (
    <section className="stats-section section section-light">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="section-header text-center mb-5">
              <h2 className="section-title">Thống Kê Y Tế</h2>
              <p className="section-subtitle">
                Cập nhật số liệu mới nhất về hệ thống y tế quốc gia
              </p>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="row mb-5">
          {stats.map((stat, index) => (
            <div key={index} className="col-lg-3 col-md-6 mb-4">
              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <i className={stat.icon}></i>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stat.number}</h3>
                  <h6 className="stat-label">{stat.label}</h6>
                  <p className="stat-description">{stat.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Outbreak Stats */}
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div className="outbreak-stats">
              <h4 className="outbreak-title text-center mb-4">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Tình Hình Dịch Bệnh Nổi Bật
              </h4>
              <div className="outbreak-list">
                {outbreakStats.map((outbreak, index) => (
                  <div key={index} className="outbreak-item">
                    <div className="outbreak-province">
                      <span className="province-name">{outbreak.province}</span>
                      <span className={`trend-indicator ${outbreak.trend}`}>
                        <i className={`bi bi-arrow-${outbreak.trend === 'up' ? 'up' : outbreak.trend === 'down' ? 'down' : 'right'}`}></i>
                      </span>
                    </div>
                    <div className="outbreak-cases">
                      <span className="cases-number">{outbreak.cases}</span>
                      <span className="cases-label">ca nhiễm</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-3">
                <a href="/outbreaks" className="btn btn-outline-primary">
                  Xem chi tiết vùng dịch
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;