import React from 'react';
import './MapSection.css';

const MapSection = () => {
  return (
    <section id="map" className="map-section section section-light">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="section-header text-center mb-5">
              <h2 className="section-title">Bản Đồ Y Tế Trực Tuyến</h2>
              <p className="section-subtitle">
                Theo dõi các cơ sở y tế và vùng dịch trên toàn quốc
              </p>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-12">
            <div className="map-container">
              <div className="map-placeholder">
                <div className="placeholder-content">
                  <i className="bi bi-map placeholder-icon"></i>
                  <h4>Bản Đồ Đang Được Tải</h4>
                  <p>Hệ thống đang hiển thị bản đồ tương tác...</p>
                  <div className="map-legend">
                    <div className="legend-item">
                      <div className="legend-color hospital"></div>
                      <span>Bệnh viện</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color clinic"></div>
                      <span>Phòng khám</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color outbreak"></div>
                      <span>Vùng dịch</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Map controls */}
              <div className="map-controls">
                <button className="btn btn-outline-primary btn-sm me-2">
                  <i className="bi bi-geo-alt me-1"></i>
                  Vị trí của tôi
                </button>
                <button className="btn btn-outline-primary btn-sm me-2">
                  <i className="bi bi-funnel me-1"></i>
                  Lọc
                </button>
                <button className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-download me-1"></i>
                  Xuất bản đồ
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="row mt-4">
          <div className="col-md-4">
            <div className="map-stat-card">
              <i className="bi bi-hospital stat-icon"></i>
              <div className="stat-content">
                <h4>1,247</h4>
                <p>Bệnh viện</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="map-stat-card">
              <i className="bi bi-plus-circle stat-icon"></i>
              <div className="stat-content">
                <h4>5,892</h4>
                <p>Phòng khám</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="map-stat-card">
              <i className="bi bi-exclamation-triangle stat-icon"></i>
              <div className="stat-content">
                <h4>23</h4>
                <p>Vùng dịch đang hoạt động</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;