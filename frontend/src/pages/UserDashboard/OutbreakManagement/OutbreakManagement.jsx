import React, { useState, useEffect } from 'react';
import './OutbreakManagement.css';
import outbreakServices from '../../../services/outbreakServices';
import OutbreakMap from '../MapComponents/OutbreakMap/OutbreakMap';

const OutbreakManagement = ({ onAddOutbreak, onEditOutbreak, refreshTrigger  }) => {
  const [outbreaks, setOutbreaks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOutbreak, setSelectedOutbreak] = useState(null);
  const [mapOutbreakId, setMapOutbreakId] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

   useEffect(() => {
    fetchOutbreaks();
  }, [refreshTrigger]); 
  const fetchOutbreaks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await outbreakServices.getAllOutbreaks();
      
      if (response && response.data) {
        const formattedOutbreaks = response.data.map(outbreak => ({
          // Giữ nguyên các trường từ API
          outbreak_id: outbreak.outbreak_id,
          outbreak_name: outbreak.outbreak_name,
          disease_id: outbreak.disease_id,
          disease_cases: outbreak.disease_cases,
          severity_level: outbreak.severity_level,
          start_date: outbreak.start_date,
          end_date: outbreak.end_date,
          area_geom: outbreak.area_geom,
          creator_id: outbreak.creator_id,
          createdAt: outbreak.createdAt,
          updatedAt: outbreak.updatedAt,
          
          // Chỉ thêm các trường tính toán (không đổi tên trường gốc)
          status: getOutbreakStatus(outbreak.start_date, outbreak.end_date),
          formatted_start_date: formatDate(outbreak.start_date),
          formatted_end_date: outbreak.end_date ? formatDate(outbreak.end_date) : null,
          last_updated: getTimeAgo(outbreak.updatedAt),
          
          // Thêm trường thông tin địa lý (nếu cần cho hiển thị)
          province: getProvinceFromGeometry(outbreak.area_geom),
          district: getDistrictFromGeometry(outbreak.area_geom),
        }));
        
        setOutbreaks(formattedOutbreaks);
        console.log('Fetched outbreaks:', formattedOutbreaks);
      }
    } catch (error) {
      console.error('Error fetching outbreaks:', error);
      setError('Không thể tải danh sách vùng dịch. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getOutbreakStatus = (startDate, endDate) => {
    if (endDate) return 'resolved';
    
    const start = new Date(startDate);
    const now = new Date();
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) return 'monitoring';
    return 'active';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      return 'N/A';
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Không xác định';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      return `${diffDays} ngày trước`;
    } catch (error) {
      return 'Không xác định';
    }
  };

  const getProvinceFromGeometry = (geometry) => {
    // Logic giả lập - bạn có thể thay thế bằng logic thực tế
    return 'Hồ Chí Minh';
  };

  const getDistrictFromGeometry = (geometry) => {
    const coordinates = geometry?.coordinates?.[0];
    if (coordinates && coordinates.length > 0) {
      const [lng, lat] = coordinates[0];
      if (lng > 106.65 && lng < 106.67 && lat > 10.75 && lat < 10.76) {
        return 'Quận 5';
      }
    }
    return 'Không xác định';
  };

  // Hàm lọc outbreaks
  const filteredOutbreaks = outbreaks.filter(outbreak => {
    // Lọc theo mức độ nghiêm trọng
    if (severityFilter !== 'all' && outbreak.severity_level !== severityFilter) {
      return false;
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      return (
        outbreak.outbreak_name.toLowerCase().includes(searchLower) ||
        outbreak.disease_id.toLowerCase().includes(searchLower) ||
        outbreak.district.toLowerCase().includes(searchLower) ||
        outbreak.province.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const getSeverityBadge = (severity) => {
    const config = {
      high: { label: 'Cao', class: 'danger' },
      medium: { label: 'Trung bình', class: 'warning' },
      low: { label: 'Thấp', class: 'success' }
    };
    const severityConfig = config[severity] || { label: severity, class: 'secondary' };
    return <span className={`badge bg-${severityConfig.class}`}>{severityConfig.label}</span>;
  };

  const handleEditOutbreak = (outbreak) => {
    // Truyền toàn bộ outbreak data đến form, giữ nguyên field names
    if (onEditOutbreak) {
      onEditOutbreak({
        // Truyền tất cả các trường từ API
        outbreak_id: outbreak.outbreak_id,
        outbreak_name: outbreak.outbreak_name,
        disease_id: outbreak.disease_id,
        disease_cases: outbreak.disease_cases,
        severity_level: outbreak.severity_level,
        start_date: outbreak.start_date,
        end_date: outbreak.end_date,
        area_geom: outbreak.area_geom,
        creator_id: outbreak.creator_id,
        
        // Thêm các trường khác nếu cần
        id: outbreak.outbreak_id, // Thêm id để OutbreakForm có thể dùng
      });
    }
  };

  const handleDeleteOutbreak = async (outbreakId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vùng dịch này?')) {
      try {
        await outbreakServices.deleteOutbreak(outbreakId);
        setOutbreaks(outbreaks.filter(o => o.outbreak_id !== outbreakId));
        fetchOutbreaks();
        
      } catch (error) {
        console.error('Error deleting outbreak:', error);
        alert('Không thể xóa vùng dịch. Vui lòng thử lại.');
      }
    }
  };

  const handleOutbreakCardClick = (outbreak) => {
    // Set outbreakId để map zoom vào
    setMapOutbreakId(outbreak.outbreak_id);
    setSelectedOutbreak(outbreak.outbreak_id);
  };

  const handleMapOutbreakClick = (outbreak) => {
    setMapOutbreakId(outbreak.outbreak_id);
    setSelectedOutbreak(outbreak.outbreak_id);
  };

  // Thống kê nhanh
  const stats = {
    total: outbreaks.length,
    highSeverity: outbreaks.filter(o => o.severity_level === 'high').length,
    mediumSeverity: outbreaks.filter(o => o.severity_level === 'medium').length,
    lowSeverity: outbreaks.filter(o => o.severity_level === 'low').length,
    totalCases: outbreaks.reduce((sum, o) => sum + o.disease_cases, 0)
  };

  if (isLoading) {
    return (
      <div className="outbreak-management">
        <div className="loading-state">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3">Đang tải dữ liệu vùng dịch...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="outbreak-management">
        <div className="error-state">
          <i className="bi bi-exclamation-triangle"></i>
          <h5>Có lỗi xảy ra</h5>
          <p>{error}</p>
          <button className="btn btn-primary mt-3" onClick={fetchOutbreaks}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="outbreak-management">
      <div className="section-header">
        <div className="header-content">
          <h2>Quản Lý Vùng Dịch</h2>
          <p>Theo dõi và quản lý các vùng dịch bệnh trên toàn quốc</p>
          
          {/* Quick Stats */}
          <div className="outbreak-stats-overview">
            <div className="stat-item">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Tổng vùng dịch</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.highSeverity}</div>
              <div className="stat-label">Mức độ cao</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.mediumSeverity}</div>
              <div className="stat-label">Mức độ trung bình</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.lowSeverity}</div>
              <div className="stat-label">Mức độ thấp</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {stats.highSeverity > 0 && (
        <div className="alert alert-warning">
          <div className="alert-content">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>
              <strong>Cảnh báo:</strong> Hiện có <strong>{stats.highSeverity} vùng dịch</strong> ở mức độ cao 
              cần theo dõi chặt chẽ và xử lý kịp thời.
            </div>
          </div>
        </div>
      )}

      {/* Outbreak Map Preview */}
      <div className="outbreak-map-preview">
        <div className="map-header">
          <h5>Bản Đồ Vùng Dịch</h5>
        </div>
        
        <div className="outbreak-map-wrapper">
          {outbreaks.length === 0 ? (
            <div className="map-empty-state">
              <i className="bi bi-map"></i>
              <h6>Chưa có dữ liệu vùng dịch</h6>
              <p>Bản đồ sẽ hiển thị khi có vùng dịch được thêm vào</p>
            </div>
          ) : (
            <OutbreakMap 
              outbreakId={mapOutbreakId}
              onOutbreakClick={handleMapOutbreakClick}
            />
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="outbreak-filters">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="search-box">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, bệnh, địa điểm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="filter-tabs">
              <button
                className={`tab-btn ${severityFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSeverityFilter('all')}
              >
                Tất cả ({stats.total})
              </button>
              <button
                className={`tab-btn ${severityFilter === 'high' ? 'active' : ''}`}
                onClick={() => setSeverityFilter('high')}
              >
                <span className="badge bg-danger me-1"></span>
                Mức cao ({stats.highSeverity})
              </button>
              <button
                className={`tab-btn ${severityFilter === 'medium' ? 'active' : ''}`}
                onClick={() => setSeverityFilter('medium')}
              >
                <span className="badge bg-warning me-1"></span>
                Mức trung bình ({stats.mediumSeverity})
              </button>
              <button
                className={`tab-btn ${severityFilter === 'low' ? 'active' : ''}`}
                onClick={() => setSeverityFilter('low')}
              >
                <span className="badge bg-success me-1"></span>
                Mức thấp ({stats.lowSeverity})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Outbreaks List */}
      <div className="outbreaks-list">
        <div className="list-header">
          <h5>Danh Sách Vùng Dịch ({filteredOutbreaks.length})</h5>
          <div className="header-actions">
            <button 
              className="btn btn-primary me-2"
              onClick={onAddOutbreak}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Thêm Vùng Dịch
            </button>
          </div>
        </div>

        {filteredOutbreaks.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-virus"></i>
            <h5>Không có vùng dịch nào</h5>
            <p>
              {searchTerm 
                ? `Không tìm thấy vùng dịch nào phù hợp với từ khóa "${searchTerm}"`
                : severityFilter !== 'all'
                ? `Không có vùng dịch nào ở mức độ ${severityFilter === 'high' ? 'cao' : severityFilter === 'medium' ? 'trung bình' : 'thấp'}`
                : 'Chưa có vùng dịch nào được thêm vào hệ thống'
              }
            </p>
          </div>
        ) : (
          <div className="outbreaks-grid">
            {filteredOutbreaks.map(outbreak => (
              <div 
                key={outbreak.outbreak_id} 
                id={`outbreak-card-${outbreak.outbreak_id}`}
                className={`outbreak-card ${selectedOutbreak === outbreak.outbreak_id ? 'selected' : ''}`}
                onClick={() => handleOutbreakCardClick(outbreak)}
              >
                <div className="card-header">
                  <h6>
                    {outbreak.outbreak_name}
                    {selectedOutbreak === outbreak.outbreak_id && (
                      <i className="bi bi-geo-alt-fill ms-2 text-primary" title="Đang xem trên bản đồ"></i>
                    )}
                  </h6>
                  <div className="header-badges">
                    {getSeverityBadge(outbreak.severity_level)}
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="outbreak-info">
                    <div className="info-item">
                      <i className="bi bi-geo-alt"></i>
                      <span>{outbreak.district}, {outbreak.province}</span>
                    </div>
                    <div className="info-item">
                      <i className="bi bi-people"></i>
                      <span className="cases-count">{outbreak.disease_cases} ca nhiễm</span>
                    </div>
                    <div className="info-item">
                      <i className="bi bi-calendar"></i>
                      <span>Bắt đầu: {outbreak.formatted_start_date}</span>
                    </div>
                    <div className="info-item">
                      <i className="bi bi-clock"></i>
                      <span>Cập nhật: {outbreak.last_updated}</span>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditOutbreak(outbreak);
                    }}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Chỉnh sửa
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteOutbreak(outbreak.outbreak_id);
                    }}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutbreakManagement;