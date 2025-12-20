import React, { useState, useEffect } from 'react';
import './OutbreakPage.css';
import outbreakServices from '../../services/outbreakServices';
import OutbreakMap from '../../pages/UserDashboard/MapComponents/OutbreakMap/OutbreakMap';
import provinceService from '../../services/provinceService';

const OutbreakPage = () => {
  const [outbreaks, setOutbreaks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOutbreak, setSelectedOutbreak] = useState(null);
  
  // Các state cho bộ lọc
  const [severityFilter, setSeverityFilter] = useState('all');
  const [diseaseFilter, setDiseaseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // State cho view mode (list/map)
  const [viewMode, setViewMode] = useState('list');
  
  // Danh sách bệnh dịch
  const diseaseTypes = [
    { id: 'DENGUE', name: 'Sốt xuất huyết', color: '#e74c3c' },
    { id: 'INFLUENZA', name: 'Cúm', color: '#3498db' },
    { id: 'HFMD', name: 'Tay chân miệng', color: '#f39c12' },
    { id: 'COVID', name: 'COVID-19', color: '#9b59b6' },
    { id: 'MALARIA', name: 'Sốt rét', color: '#e67e22' },
    { id: 'OTHER', name: 'Khác', color: '#95a5a6' }
  ];

  // Fetch dữ liệu outbreaks
  useEffect(() => {
    fetchOutbreaks();
  }, []);

  const fetchOutbreaks = async () => {
  try {
    setIsLoading(true);
    setError(null);
    
    const response = await outbreakServices.getAllOutbreaks();
    if (response && response.data) {
      // Tạo mảng promises
      const outbreaksWithProvinces = await Promise.all(
        response.data.map(async (outbreak) => {
          const provinceName = await getProvinceName(outbreak.province_id);
          
          return {
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
            province_id: outbreak.province_id,
            province_name: provinceName 
          };
        })
      );
      
      console.log('Formatted outbreaks:', outbreaksWithProvinces);
      setOutbreaks(outbreaksWithProvinces);
    }
  } catch (error) {
    console.error('Error fetching outbreaks:', error);
    setError('Không thể tải danh sách vùng dịch. Vui lòng thử lại sau.');
  } finally {
    setIsLoading(false);
  }
};
  // Lấy tên tỉnh từ outbreak_id
    const getProvinceName = async (id) => {
    try {
      const res = await provinceService.searchProvinces(id);
      if (Array.isArray(res) && res.length > 0) {
        const province = res[0]; // Lấy phần tử đầu tiên
        return province.province_name || 'N/A';
      }
      return null;
    } catch (error) {
      console.error('Error in getProvinceName:', error);
      return null;
    }
  }
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


  // Hàm lọc outbreaks - QUAN TRỌNG: dùng cho cả list và map
  const filteredOutbreaks = outbreaks.filter(outbreak => {
    // Lọc theo mức độ nghiêm trọng
    if (severityFilter !== 'all' && outbreak.severity_level !== severityFilter) {
      return false;
    }
    
    // Lọc theo loại bệnh
    if (diseaseFilter !== 'all' && outbreak.disease_id !== diseaseFilter) {
      return false;
    }
    
    // Lọc theo trạng thái
    if (statusFilter !== 'all' && outbreak.status !== statusFilter) {
      return false;
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      return (
        outbreak.outbreak_name.toLowerCase().includes(searchLower) ||
        outbreak.disease_name.toLowerCase().includes(searchLower) ||
        outbreak.province_name.toLowerCase().includes(searchLower) ||
        (outbreak.description && outbreak.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Lọc theo khoảng thời gian
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

  // Thêm hàm để highlight outbreak được chọn trên bản đồ
  const handleOutbreakClick = (outbreakId) => {
    setSelectedOutbreak(outbreakId);
  };

  // Thêm hàm để xử lý khi click trên bản đồ
  const handleMapOutbreakClick = (outbreak) => {
    setSelectedOutbreak(outbreak.outbreak_id);
    // Nếu đang ở chế độ list, cuộn đến card tương ứng
    if (viewMode === 'list') {
      const element = document.getElementById(`outbreak-card-${outbreak.outbreak_id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Thêm hiệu ứng highlight
        element.classList.add('highlighted');
        setTimeout(() => element.classList.remove('highlighted'), 2000);
      }
    }
  };

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

  // Thống kê dựa trên outbreaks đã filter
  const stats = {
    total: outbreaks.length,
    active: outbreaks.filter(o => o.status === 'active').length,
    highSeverity: outbreaks.filter(o => o.severity_level === 'high').length,
    totalCases: outbreaks.reduce((sum, o) => sum + o.disease_cases, 0),
    filteredTotal: filteredOutbreaks.length, // Thêm thống kê cho filtered outbreaks
    filteredActive: filteredOutbreaks.filter(o => o.status === 'active').length,
    filteredHighSeverity: filteredOutbreaks.filter(o => o.severity_level === 'high').length,
    filteredTotalCases: filteredOutbreaks.reduce((sum, o) => sum + o.disease_cases, 0)
  };

  // Thêm useEffect để đồng bộ selected outbreak khi filter thay đổi
  useEffect(() => {
    // Nếu outbreak đang chọn không còn trong filtered list, reset selected
    if (selectedOutbreak && !filteredOutbreaks.find(o => o.outbreak_id === selectedOutbreak)) {
      setSelectedOutbreak(null);
    }
  }, [filteredOutbreaks, selectedOutbreak]);

  if (isLoading) {
    return (
      <div className="outbreak-page loading">
        <div className="container">
          <div className="loading-state">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3">Đang tải dữ liệu vùng dịch...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="outbreak-page error">
        <div className="container">
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
      </div>
    );
  }

  return (
    <div className="outbreak-page">
      {/* Hero Section */}
      <div className="outbreak-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Thông Tin Vùng Dịch</h1>
            <p className="hero-subtitle">
              Cập nhật thông tin mới nhất về các vùng dịch bệnh
            </p>
          </div>
          
          {/* Quick Stats - Hiển thị thống kê theo bộ lọc */}
          <div className="hero-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-virus"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.filteredTotal}</div>
                <div className="stat-label">
                  Vùng dịch 
                  {stats.filteredTotal !== stats.total && (
                    <span className="stat-sub"> / {stats.total}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-activity"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.filteredActive}</div>
                <div className="stat-label">
                  Đang diễn ra
                  {stats.filteredActive !== stats.active && (
                    <span className="stat-sub"> / {stats.active}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-exclamation-triangle"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.filteredHighSeverity}</div>
                <div className="stat-label">
                  Mức độ cao
                  {stats.filteredHighSeverity !== stats.highSeverity && (
                    <span className="stat-sub"> / {stats.highSeverity}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-people"></i>
              </div>
              <div className="stat-content">
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
      </div>

      {/* Main Content */}
      <div className="container outbreak-container">
        {/* View Toggle */}
        <div className="view-toggle mb-4">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('list')}
            >
              <i className="bi bi-list-ul me-2"></i>
              Danh sách
            </button>
            <button
              type="button"
              className={`btn ${viewMode === 'map' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('map')}
            >
              <i className="bi bi-map me-2"></i>
              Bản đồ
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="filters-section mb-4">
          <div className="card filter-card">
            <div className="card-body">
              <div className="row g-3">
                {/* Search */}
                <div className="col-lg-4">
                  <div className="search-box">
                    <i className="bi bi-search"></i>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Tìm kiếm vùng dịch, bệnh, địa điểm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Disease Filter */}
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

                {/* Severity Filter */}
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

                {/* Status Filter */}
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

                {/* Reset Button */}
                <div className="col-lg-1">
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={resetFilters}
                    title="Xóa bộ lọc"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>

              {/* Date Range Filter */}
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

              {/* Results Summary */}
              <div className="filter-summary mt-3">
                <small>
                  Đang hiển thị <strong>{filteredOutbreaks.length}</strong> trong tổng số <strong>{stats.total}</strong> vùng dịch
                  {severityFilter !== 'all' && ` • Mức độ: ${severityFilter === 'high' ? 'Cao' : severityFilter === 'medium' ? 'Trung bình' : 'Thấp'}`}
                  {diseaseFilter !== 'all' && ` • Bệnh: ${diseaseTypes.find(d => d.id === diseaseFilter)?.name}`}
                  {statusFilter !== 'all' && ` • Trạng thái: ${statusFilter === 'active' ? 'Đang diễn ra' : statusFilter === 'monitoring' ? 'Theo dõi' : 'Đã kết thúc'}`}
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'map' ? (
          /* Map View - QUAN TRỌNG: truyền filteredOutbreaks thay vì outbreaks */
          <div className="map-view">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  <i className="bi bi-map me-2"></i>
                  Bản đồ vùng dịch
                  <span className="badge bg-primary ms-2">
                    {filteredOutbreaks.length} vùng
                  </span>
                </h5>
                <div className="outbreak-map-container">
                  <OutbreakMap 
                    outbreaks={filteredOutbreaks} // QUAN TRỌNG: Truyền filteredOutbreaks
                    onOutbreakClick={handleMapOutbreakClick}
                    selectedOutbreakId={selectedOutbreak}
                  />
                </div>
                
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="list-view">
            {filteredOutbreaks.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-virus"></i>
                <h5>Không tìm thấy vùng dịch nào</h5>
                <p>Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            ) : (
              <div className="row">
                {filteredOutbreaks.map(outbreak => (
                  <div 
                    key={outbreak.outbreak_id} 
                    id={`outbreak-card-${outbreak.outbreak_id}`}
                    className="col-lg-6 mb-4"
                  >
                    <div 
                      className={`outbreak-card card h-100 ${selectedOutbreak === outbreak.outbreak_id ? 'selected' : ''}`}
                      onClick={() => handleOutbreakClick(outbreak.outbreak_id)}
                    >
                      <div className="card-header">
                        <div className="d-flex justify-content-between align-items-start">
                          <h5 className="card-title mb-0">{outbreak.outbreak_name}</h5>
                          <div className="d-flex gap-2">
                            {getSeverityBadge(outbreak.severity_level)}
                            {getStatusBadge(outbreak.status)}
                          </div>
                        </div>
                        <div className="disease-info mt-2">
                          <span 
                            className="disease-badge"
                            style={{ 
                              backgroundColor: diseaseTypes.find(d => d.id === outbreak.disease_id)?.color || '#95a5a6'
                            }}
                          >
                            <i className="bi bi-virus me-1"></i>
                            {outbreak.disease_name}
                          </span>
                        </div>
                      </div>
                      
                      <div className="card-body">
                        <div className="outbreak-details">
                          <div className="detail-item">
                            <i className="bi bi-geo-alt"></i>
                            <span> {outbreak.province_name}</span>
                          </div>
                          <div className="detail-item">
                            <i className="bi bi-people"></i>
                            <span><strong>{outbreak.disease_cases}</strong> ca nhiễm</span>
                          </div>
                          <div className="detail-item">
                            <i className="bi bi-calendar-event"></i>
                            <span>Bắt đầu: {outbreak.formatted_start_date}</span>
                          </div>
                          {outbreak.formatted_end_date && (
                            <div className="detail-item">
                              <i className="bi bi-calendar-check"></i>
                              <span>Kết thúc: {outbreak.formatted_end_date}</span>
                            </div>
                          )}
                          <div className="detail-item">
                            <i className="bi bi-clock"></i>
                            <span>Cập nhật: {outbreak.last_updated}</span>
                          </div>
                        </div>
                        
                        {outbreak.description && (
                          <div className="outbreak-description mt-3">
                            <p className="mb-0">{outbreak.description}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="card-footer">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Chuyển sang chế độ bản đồ và chọn outbreak này
                            setSelectedOutbreak(outbreak.outbreak_id);
                            setViewMode('map');
                          }}
                        >
                          <i className="bi bi-map me-1"></i>
                          Xem trên bản đồ
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Safety Tips */}
        <div className="safety-tips mt-5">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-shield-check me-2 text-success"></i>
                Biện Pháp Phòng Ngừa
              </h5>
              <div className="row mt-3">
                <div className="col-md-4">
                  <div className="tip-item">
                    <i className="bi bi-mask"></i>
                    <h6>Đeo khẩu trang</h6>
                    <p>Đeo khẩu trang khi đến nơi đông người hoặc khu vực có dịch</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="tip-item">
                    <i className="bi bi-hand-thumbs-up"></i>
                    <h6>Vệ sinh tay</h6>
                    <p>Rửa tay thường xuyên với xà phòng hoặc dung dịch sát khuẩn</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="tip-item">
                    <i className="bi bi-hospital"></i>
                    <h6>Khai báo y tế</h6>
                    <p>Khai báo y tế khi có triệu chứng và đến cơ sở y tế gần nhất</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutbreakPage;