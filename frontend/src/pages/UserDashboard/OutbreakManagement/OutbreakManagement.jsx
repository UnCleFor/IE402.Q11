import React, { useState, useEffect } from 'react';
import './OutbreakManagement.css';
import outbreakServices from '../../../services/outbreakServices';
import OutbreakMap from '../MapComponents/OutbreakMap/OutbreakMap';

const OutbreakManagement = ({ onAddOutbreak, onEditOutbreak }) => {
  const [outbreaks, setOutbreaks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOutbreak, setSelectedOutbreak] = useState(null);
  const [mapOutbreakId, setMapOutbreakId] = useState(null); // ID để zoom trên map
  const [severityFilter, setSeverityFilter] = useState('all'); // Lọc theo mức độ
  const [searchTerm, setSearchTerm] = useState(''); // Tìm kiếm

  // Fetch outbreaks from API
  useEffect(() => {
    fetchOutbreaks();
  }, []);

  const fetchOutbreaks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await outbreakServices.getAllOutbreaks();
      
      if (response && response.data) {
        const formattedOutbreaks = response.data.map(outbreak => ({
          id: outbreak.outbreak_id,
          name: outbreak.outbreak_name,
          disease_id: outbreak.disease_id,
          diseaseType: getDiseaseType(outbreak.disease_id),
          cases: outbreak.disease_cases,
          severity: outbreak.severity_level,
          status: getOutbreakStatus(outbreak.start_date, outbreak.end_date),
          startDate: formatDate(outbreak.start_date),
          endDate: outbreak.end_date ? formatDate(outbreak.end_date) : null,
          area_geom: outbreak.area_geom,
          creator_id: outbreak.creator_id,
          createdAt: formatDate(outbreak.createdAt),
          updatedAt: formatDate(outbreak.updatedAt),
          lastUpdated: getTimeAgo(outbreak.updatedAt),
          // Thêm thông tin mặc định cho các trường không có trong API
          province: getProvinceFromGeometry(outbreak.area_geom),
          district: getDistrictFromGeometry(outbreak.area_geom),
          preventiveMeasures: getPreventiveMeasures(outbreak.disease_id, outbreak.severity_level),
          contactPerson: getDefaultContactPerson()
        }));
        
        setOutbreaks(formattedOutbreaks);
      }
    } catch (error) {
      console.error('Error fetching outbreaks:', error);
      setError('Không thể tải danh sách vùng dịch. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getDiseaseType = (diseaseId) => {
    const diseaseMap = {
      'DENGUE': 'dengue_fever',
      'INFLUENZA': 'influenza',
      'HFMD': 'hand_foot_mouth',
      'COVID': 'covid_19',
      'MALARIA': 'malaria'
    };
    return diseaseMap[diseaseId] || 'unknown';
  };

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
    // Đây là hàm mẫu, cần tích hợp với GIS service thực tế
    return 'Hồ Chí Minh';
  };

  const getDistrictFromGeometry = (geometry) => {
    // Đây là hàm mẫu, cần tích hợp với GIS service thực tế
    const coordinates = geometry?.coordinates?.[0];
    if (coordinates && coordinates.length > 0) {
      // Giả sử tọa độ đầu tiên là trong Quận 5
      const [lng, lat] = coordinates[0];
      if (lng > 106.65 && lng < 106.67 && lat > 10.75 && lat < 10.76) {
        return 'Quận 5';
      }
    }
    return 'Không xác định';
  };

  const getPreventiveMeasures = (diseaseId, severity) => {
    const measures = {
      'DENGUE': ['Phun thuốc khử trùng', 'Diệt lăng quăng', 'Theo dõi sức khỏe'],
      'INFLUENZA': ['Tiêm chủng', 'Cách ly', 'Đeo khẩu trang'],
      'HFMD': ['Vệ sinh trường học', 'Rửa tay thường xuyên', 'Kiểm tra y tế'],
      'COVID': ['Cách ly xã hội', 'Xét nghiệm', 'Tiêm vaccine'],
      'MALARIA': ['Phun thuốc diệt muỗi', 'Ngủ mùng', 'Theo dõi triệu chứng']
    };
    
    const baseMeasures = measures[diseaseId] || ['Theo dõi sức khỏe', 'Báo cáo y tế'];
    
    if (severity === 'high') {
      baseMeasures.unshift('Cách ly khu vực', 'Khẩn cấp');
    }
    
    return baseMeasures;
  };

  const getDefaultContactPerson = () => {
    return {
      name: 'Trung tâm Y tế Dự phòng',
      phone: '19009095',
      email: 'yte@example.com'
    };
  };

  // Hàm lọc outbreaks
  const filteredOutbreaks = outbreaks.filter(outbreak => {
    // Lọc theo mức độ nghiêm trọng
    if (severityFilter !== 'all' && outbreak.severity !== severityFilter) {
      return false;
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      return (
        outbreak.name.toLowerCase().includes(searchLower) ||
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
    setSelectedOutbreak(outbreak);
    if (onEditOutbreak) {
      onEditOutbreak(outbreak);
    }
  };

  const handleDeleteOutbreak = async (outbreakId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vùng dịch này?')) {
      try {
        await outbreakServices.deleteOutbreak(outbreakId);
        setOutbreaks(outbreaks.filter(o => o.id !== outbreakId));
        alert('Đã xóa vùng dịch thành công!');
      } catch (error) {
        console.error('Error deleting outbreak:', error);
        alert('Không thể xóa vùng dịch. Vui lòng thử lại.');
      }
    }
  };

  const handleViewStatistics = (outbreak) => {
    console.log('Viewing statistics for:', outbreak);
    alert(`Mở thống kê cho: ${outbreak.name}`);
  };

  const handleSendAlert = () => {
    if (window.confirm('Gửi cảnh báo đến tất cả người dân trong khu vực?')) {
      console.log('Sending alert to all users');
      alert('Đã gửi cảnh báo thành công!');
    }
  };

  const handleExportReport = () => {
    console.log('Exporting outbreak report');
    alert('Đã xuất báo cáo thành công!');
  };

  const handleDailyReport = () => {
    console.log('Creating daily report');
    alert('Đã tạo báo cáo hàng ngày!');
  };

  const handlePreventiveMeasures = () => {
    console.log('Viewing preventive measures');
    alert('Mở danh sách biện pháp phòng ngừa');
  };

  const handleOutbreakCardClick = (outbreak) => {
    // Set outbreakId để map zoom vào
    setMapOutbreakId(outbreak.id);

    // Highlight card được chọn
    setSelectedOutbreak(outbreak.id);
  };

  const handleMapOutbreakClick = (outbreak) => {
    setMapOutbreakId(outbreak.id);
    setSelectedOutbreak(outbreak.id);
  };

  // Thống kê nhanh
  const stats = {
    total: outbreaks.length,
    highSeverity: outbreaks.filter(o => o.severity === 'high').length,
    mediumSeverity: outbreaks.filter(o => o.severity === 'medium').length,
    lowSeverity: outbreaks.filter(o => o.severity === 'low').length,
    totalCases: outbreaks.reduce((sum, o) => sum + o.cases, 0)
  };

  // Thống kê theo bộ lọc hiện tại
  const filteredStats = {
    showing: filteredOutbreaks.length,
    total: outbreaks.length
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
        <div className="header-actions">
          <button 
            className="btn btn-primary me-2"
            onClick={onAddOutbreak}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Thêm Vùng Dịch
          </button>
          <button 
            className="btn btn-outline-primary"
            onClick={handleExportReport}
          >
            <i className="bi bi-download me-2"></i>
            Xuất Báo Cáo
          </button>
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
        
        {/* Map Component */}
        <div className="outbreak-map-wrapper">
          {isLoading ? (
            <div className="map-loading">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-3">Đang tải bản đồ...</p>
            </div>
          ) : error ? (
            <div className="map-error">
              <i className="bi bi-exclamation-triangle"></i>
              <p>Không thể tải bản đồ</p>
              <button 
                className="btn btn-sm btn-outline-primary mt-2"
                onClick={fetchOutbreaks}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Thử lại
              </button>
            </div>
          ) : outbreaks.length === 0 ? (
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

        {/* Map Controls */}
        <div className="map-controls">
          <div className="btn-group">
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setMapOutbreakId(null)}
              title="Xem tất cả vùng dịch"
              disabled={!mapOutbreakId}
            >
              <i className="bi bi-fullscreen"></i>
            </button>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={fetchOutbreaks}
              title="Làm mới bản đồ"
            >
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
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
        
        {/* Results summary */}
        <div className="filter-summary">
          <small>
            Đang hiển thị <strong>{filteredStats.showing}</strong> trong tổng số <strong>{filteredStats.total}</strong> vùng dịch
            {searchTerm && ` - Kết quả tìm kiếm cho: "${searchTerm}"`}
            {severityFilter !== 'all' && ` - Lọc theo mức độ: ${severityFilter === 'high' ? 'Cao' : severityFilter === 'medium' ? 'Trung bình' : 'Thấp'}`}
          </small>
        </div>
      </div>

      {/* Outbreaks List */}
      <div className="outbreaks-list">
        <div className="list-header">
          <h5>Danh Sách Vùng Dịch ({filteredOutbreaks.length})</h5>
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
            <button className="btn btn-primary mt-3" onClick={onAddOutbreak}>
              <i className="bi bi-plus-circle me-2"></i>
              Thêm Vùng Dịch Đầu Tiên
            </button>
          </div>
        ) : (
          <div className="outbreaks-grid">
            {filteredOutbreaks.map(outbreak => (
              <div 
                key={outbreak.id} 
                id={`outbreak-card-${outbreak.id}`}
                className={`outbreak-card ${selectedOutbreak === outbreak.id ? 'selected' : ''}`}
                onClick={() => handleOutbreakCardClick(outbreak)}
              >
                <div className="card-header">
                  <h6>
                    {outbreak.name}
                    {selectedOutbreak === outbreak.id && (
                      <i className="bi bi-geo-alt-fill ms-2 text-primary" title="Đang xem trên bản đồ"></i>
                    )}
                  </h6>
                  <div className="header-badges">
                    {getSeverityBadge(outbreak.severity)}
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
                      <span className="cases-count">{outbreak.cases} ca nhiễm</span>
                    </div>
                    <div className="info-item">
                      <i className="bi bi-calendar"></i>
                      <span>Bắt đầu: {outbreak.startDate}</span>
                    </div>
                    <div className="info-item">
                      <i className="bi bi-clock"></i>
                      <span>Cập nhật: {outbreak.lastUpdated}</span>
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
                    className="btn btn-sm btn-outline-info"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewStatistics(outbreak);
                    }}
                  >
                    <i className="bi bi-graph-up me-1"></i>
                    Thống kê
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteOutbreak(outbreak.id);
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

      {/* Quick Actions */}
      <div className="quick-actions-outbreak">
        <h5>Hành Động Nhanh</h5>
        <div className="action-buttons">
          <button 
            className="btn btn-outline-primary"
            onClick={handleSendAlert}
          >
            <i className="bi bi-send me-2"></i>
            Gửi cảnh báo
          </button>
          <button 
            className="btn btn-outline-warning"
            onClick={handleDailyReport}
          >
            <i className="bi bi-clipboard-data me-2"></i>
            Báo cáo hàng ngày
          </button>
          <button 
            className="btn btn-outline-info"
            onClick={handlePreventiveMeasures}
          >
            <i className="bi bi-shield-check me-2"></i>
            Biện pháp phòng ngừa
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutbreakManagement;