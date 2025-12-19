import React, { useState, useEffect, useRef } from 'react';
import './OutbreakManagement.css';
import outbreakServices from '../../../services/outbreakServices';
import OutbreakMap from '../MapComponents/OutbreakMap/OutbreakMap';

const OutbreakManagement = ({ onAddOutbreak, onEditOutbreak, refreshTrigger }) => {
  const [outbreaks, setOutbreaks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOutbreak, setSelectedOutbreak] = useState(null);
  
  // Thêm ref để theo dõi lần click trước
  const lastClickRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  
  // Các state cho bộ lọc
  const [severityFilter, setSeverityFilter] = useState('all');
  const [diseaseFilter, setDiseaseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Danh sách bệnh dịch
  const diseaseTypes = [
    { id: 'DENGUE', name: 'Sốt xuất huyết', color: '#e74c3c' },
    { id: 'INFLUENZA', name: 'Cúm', color: '#3498db' },
    { id: 'HFMD', name: 'Tay chân miệng', color: '#f39c12' },
    { id: 'COVID', name: 'COVID-19', color: '#9b59b6' },
    { id: 'MALARIA', name: 'Sốt rét', color: '#e67e22' },
    { id: 'OTHER', name: 'Khác', color: '#95a5a6' }
  ];

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
          outbreak_id: outbreak.outbreak_id,
          outbreak_name: outbreak.outbreak_name,
          disease_id: outbreak.disease_id,
          disease_name: diseaseTypes.find(d => d.id === outbreak.disease_id)?.name || 'Khác',
          disease_cases: outbreak.disease_cases,
          severity_level: outbreak.severity_level,
          start_date: outbreak.start_date,
          end_date: outbreak.end_date,
          area_geom: outbreak.area_geom,
          creator_id: outbreak.creator_id,
          createdAt: outbreak.createdAt,
          updatedAt: outbreak.updatedAt,
          
          status: getOutbreakStatus(outbreak.start_date, outbreak.end_date),
          formatted_start_date: formatDate(outbreak.start_date),
          formatted_end_date: outbreak.end_date ? formatDate(outbreak.end_date) : null,
          last_updated: getTimeAgo(outbreak.updatedAt),
          
          province: 'Hồ Chí Minh',
          district: getDistrictFromGeometry(outbreak.area_geom),
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
    return 'Hồ Chí Minh';
  };

  const getDistrictFromGeometry = (geometry) => {
    const coordinates = geometry?.coordinates?.[0];
    if (coordinates && coordinates.length > 0) {
      const [lng, lat] = coordinates[0];
      if (lng > 106.65 && lng < 106.67 && lat > 10.75 && lat < 10.76) {
        return 'Quận 5';
      }
      if (lng > 106.63 && lng < 106.65 && lat > 10.76 && lat < 10.78) {
        return 'Quận 3';
      }
    }
    return 'Không xác định';
  };

  // Hàm lọc outbreaks
  const filteredOutbreaks = outbreaks.filter(outbreak => {
    if (severityFilter !== 'all' && outbreak.severity_level !== severityFilter) {
      return false;
    }
    
    if (diseaseFilter !== 'all' && outbreak.disease_id !== diseaseFilter) {
      return false;
    }
    
    if (statusFilter !== 'all' && outbreak.status !== statusFilter) {
      return false;
    }
    
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      return (
        outbreak.outbreak_name.toLowerCase().includes(searchLower) ||
        outbreak.disease_name.toLowerCase().includes(searchLower) ||
        outbreak.district.toLowerCase().includes(searchLower) ||
        outbreak.province.toLowerCase().includes(searchLower)
      );
    }
    
    if (dateRange.start) {
      const outbreakStart = new Date(outbreak.start_date);
      const filterStart = new Date(dateRange.start);
      if (outbreakStart < filterStart) return false;
    }
    
    if (dateRange.end) {
      const outbreakStart = new Date(outbreak.start_date);
      const filterEnd = new Date(dateRange.end);
      if (outbreakStart > filterEnd) return false;
    }
    
    return true;
  });

  // Hàm hiển thị badge mức độ
  const getSeverityBadge = (severity) => {
    const config = {
      high: { label: 'Cao', class: 'danger', icon: 'bi-exclamation-triangle-fill' },
      medium: { label: 'Trung bình', class: 'warning', icon: 'bi-exclamation-triangle' },
      low: { label: 'Thấp', class: 'success', icon: 'bi-info-circle' }
    };
    const severityConfig = config[severity] || { label: severity, class: 'secondary', icon: 'bi-question-circle' };
    
    return (
      <span className={`badge bg-${severityConfig.class} severity-badge`}>
        <i className={`bi ${severityConfig.icon} me-1`}></i>
        {severityConfig.label}
      </span>
    );
  };

  // Hàm hiển thị badge trạng thái
  const getStatusBadge = (status) => {
    const config = {
      active: { label: 'Đang diễn ra', class: 'danger' },
      monitoring: { label: 'Theo dõi', class: 'warning' },
      resolved: { label: 'Đã kết thúc', class: 'success' }
    };
    const statusConfig = config[status] || { label: status, class: 'secondary' };
    
    return <span className={`badge bg-${statusConfig.class}`}>{statusConfig.label}</span>;
  };

  // Hàm reset bộ lọc
  const resetFilters = () => {
    setSeverityFilter('all');
    setDiseaseFilter('all');
    setStatusFilter('all');
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
  };

  const handleEditOutbreak = (outbreak) => {
    if (onEditOutbreak) {
      onEditOutbreak({
        outbreak_id: outbreak.outbreak_id,
        outbreak_name: outbreak.outbreak_name,
        disease_id: outbreak.disease_id,
        disease_cases: outbreak.disease_cases,
        severity_level: outbreak.severity_level,
        start_date: outbreak.start_date,
        end_date: outbreak.end_date,
        area_geom: outbreak.area_geom,
        creator_id: outbreak.creator_id,
        id: outbreak.outbreak_id,
      });
    }
  };

  const handleDeleteOutbreak = async (outbreakId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vùng dịch này?')) {
      try {
        await outbreakServices.deleteOutbreak(outbreakId);
        fetchOutbreaks();
        alert('Đã xóa vùng dịch thành công!');
      } catch (error) {
        console.error('Error deleting outbreak:', error);
        alert('Không thể xóa vùng dịch. Vui lòng thử lại.');
      }
    }
  };

  // Sửa hàm xử lý click card - THÊM CHỨC NĂNG DESELECT
  const handleOutbreakCardClick = (outbreak) => {
    const outbreakId = outbreak.outbreak_id;
    const now = Date.now();
    
    // Kiểm tra double click (trong vòng 300ms)
    if (lastClickRef.current === outbreakId && (now - (clickTimeoutRef.current || 0)) < 300) {
      // Double click - reset selection
      setSelectedOutbreak(null);
      lastClickRef.current = null;
      clearTimeout(clickTimeoutRef.current);
    } else {
      // Single click - toggle selection
      if (selectedOutbreak === outbreakId) {
        // Click vào card đang chọn - bỏ chọn
        setSelectedOutbreak(null);
      } else {
        // Click vào card khác - chọn card này
        setSelectedOutbreak(outbreakId);
      }
      lastClickRef.current = outbreakId;
      clickTimeoutRef.current = now;
    }
  };

  // Sửa hàm xử lý click trên bản đồ - BỎ SCROLL
  const handleMapOutbreakClick = (outbreak) => {
    const outbreakId = outbreak.outbreak_id;
    
    // Toggle selection - nếu đang chọn thì bỏ chọn, nếu không thì chọn
    if (selectedOutbreak === outbreakId) {
      setSelectedOutbreak(null);
    } else {
      setSelectedOutbreak(outbreakId);
    }
    
    // KHÔNG scroll đến card nữa - chỉ highlight trên bản đồ
    const element = document.getElementById(`outbreak-card-${outbreakId}`);
    if (element) {
      // Chỉ highlight mà không scroll
      element.classList.add('highlighted');
      setTimeout(() => element.classList.remove('highlighted'), 1000);
    }
  };

  // Thêm hàm reset map view
  const handleResetMapView = () => {
    setSelectedOutbreak(null);
  };

  // Thống kê
  const stats = {
    total: outbreaks.length,
    active: outbreaks.filter(o => o.status === 'active').length,
    highSeverity: outbreaks.filter(o => o.severity_level === 'high').length,
    totalCases: outbreaks.reduce((sum, o) => sum + o.disease_cases, 0),
    filteredTotal: filteredOutbreaks.length,
    filteredActive: filteredOutbreaks.filter(o => o.status === 'active').length,
    filteredHighSeverity: filteredOutbreaks.filter(o => o.severity_level === 'high').length,
    filteredTotalCases: filteredOutbreaks.reduce((sum, o) => sum + o.disease_cases, 0)
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
          
          <div className="outbreak-stats-overview">
            <div className="stat-item">
              <div className="stat-value">{stats.filteredTotal}</div>
              <div className="stat-label">
                Vùng dịch
                {stats.filteredTotal !== stats.total && (
                  <span className="stat-sub"> / {stats.total}</span>
                )}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.filteredHighSeverity}</div>
              <div className="stat-label">
                Mức độ cao
                {stats.filteredHighSeverity !== stats.highSeverity && (
                  <span className="stat-sub"> / {stats.highSeverity}</span>
                )}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.filteredActive}</div>
              <div className="stat-label">
                Đang diễn ra
                {stats.filteredActive !== stats.active && (
                  <span className="stat-sub"> / {stats.active}</span>
                )}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.filteredTotalCases}</div>
              <div className="stat-label">
                Ca nhiễm
                {stats.filteredTotalCases !== stats.totalCases && (
                  <span className="stat-sub"> / {stats.totalCases}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {stats.filteredHighSeverity > 0 && (
        <div className="alert alert-warning">
          <div className="alert-content">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>
              <strong>Cảnh báo:</strong> Hiện có <strong>{stats.filteredHighSeverity} vùng dịch</strong> ở mức độ cao 
              {stats.filteredHighSeverity !== stats.highSeverity && ` (${stats.highSeverity} tổng cộng)`}
               cần theo dõi chặt chẽ và xử lý kịp thời.
            </div>
          </div>
        </div>
      )}

      {/* Outbreak Map Preview */}
      <div className="outbreak-map-preview">
        <div className="map-header">
          <h5>Bản Đồ Vùng Dịch</h5>
          <div className="map-header-badge">
            <span className="badge bg-primary">
              {filteredOutbreaks.length} vùng đang hiển thị
            </span>
            {selectedOutbreak && (
              <button 
                className="btn btn-sm btn-outline-secondary ms-2"
                onClick={handleResetMapView}
                title="Xóa chọn và xem tất cả"
              >
                <i className="bi bi-x-lg me-1"></i>
                Xóa chọn
              </button>
            )}
          </div>
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
              outbreaks={filteredOutbreaks}
              onOutbreakClick={handleMapOutbreakClick}
              selectedOutbreakId={selectedOutbreak}
              showLoading={isLoading}
              enableReset={true}
            />
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="outbreak-filters">
        <div className="filters-header">
          <h6>Bộ Lọc Vùng Dịch</h6>
          
        </div>
        
        <div className="card filter-card">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-lg-4">
                <div className="search-box">
                  <i className="bi bi-search"></i>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm theo tên, bệnh, địa điểm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-lg-3">
                <select
                  className="form-select"
                  value={diseaseFilter}
                  onChange={(e) => setDiseaseFilter(e.target.value)}
                >
                  <option value="all">Tất cả loại bệnh</option>
                  {diseaseTypes.map(disease => (
                    <option key={disease.id} value={disease.id}>
                      {disease.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-lg-2">
                <select
                  className="form-select"
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <option value="all">Tất cả mức độ</option>
                  <option value="high">Cao</option>
                  <option value="medium">Trung bình</option>
                  <option value="low">Thấp</option>
                </select>
              </div>

              <div className="col-lg-2">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang diễn ra</option>
                  <option value="monitoring">Theo dõi</option>
                  <option value="resolved">Đã kết thúc</option>
                </select>
              </div>

              <div className="col-lg-1">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={resetFilters}
                  title="Xóa tất cả bộ lọc"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
            </div>

            <div className="row g-3 mt-3">
              <div className="col-md-6">
                <label className="form-label">Từ ngày</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Đến ngày</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  min={dateRange.start}
                />
              </div>
            </div>

            <div className="filter-summary mt-3">
              <small>
                Đang hiển thị <strong>{filteredOutbreaks.length}</strong> trong tổng số <strong>{stats.total}</strong> vùng dịch
                {severityFilter !== 'all' && ` • Mức độ: ${severityFilter === 'high' ? 'Cao' : severityFilter === 'medium' ? 'Trung bình' : 'Thấp'}`}
                {diseaseFilter !== 'all' && ` • Bệnh: ${diseaseTypes.find(d => d.id === diseaseFilter)?.name}`}
                {statusFilter !== 'all' && ` • Trạng thái: ${statusFilter === 'active' ? 'Đang diễn ra' : statusFilter === 'monitoring' ? 'Theo dõi' : 'Đã kết thúc'}`}
                {selectedOutbreak && ` • Đang chọn: 1 vùng dịch`}
              </small>
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
            {selectedOutbreak && (
              <button 
                className="btn btn-outline-secondary"
                onClick={handleResetMapView}
              >
                <i className="bi bi-x-lg me-1"></i>
                Xóa chọn
              </button>
            )}
          </div>
        </div>

        {filteredOutbreaks.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-virus"></i>
            <h5>Không tìm thấy vùng dịch nào</h5>
            <p>
              {searchTerm 
                ? `Không tìm thấy vùng dịch nào phù hợp với từ khóa "${searchTerm}"`
                : severityFilter !== 'all' || diseaseFilter !== 'all' || statusFilter !== 'all' || dateRange.start || dateRange.end
                ? `Không có vùng dịch nào phù hợp với bộ lọc hiện tại`
                : 'Chưa có vùng dịch nào được thêm vào hệ thống'
              }
            </p>
            <button className="btn btn-outline-primary mt-2" onClick={resetFilters}>
              <i className="bi bi-arrow-clockwise me-1"></i>
              Xóa bộ lọc
            </button>
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
                      <i className="bi bi-geo-alt-fill ms-2 text-primary" title="Đang hiển thị trên bản đồ"></i>
                    )}
                  </h6>
                  <div className="header-badges">
                    {getSeverityBadge(outbreak.severity_level)}
                    {getStatusBadge(outbreak.status)}
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="outbreak-info">
                    <div className="info-item">
                      <i className="bi bi-virus" style={{ color: diseaseTypes.find(d => d.id === outbreak.disease_id)?.color || '#95a5a6' }}></i>
                      <span>{outbreak.disease_name}</span>
                    </div>
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