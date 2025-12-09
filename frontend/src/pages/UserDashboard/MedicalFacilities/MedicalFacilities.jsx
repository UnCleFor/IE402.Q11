// src/pages/UserDashboard/MedicalFacilities/MedicalFacilities.jsx
import React, { useState, useEffect } from 'react';
import './MedicalFacilities.css';
import FacilityForm from '../FormComponents/FacilityForm/FacilityForm';

const MedicalFacilities = ({ onAddFacility, onEditFacility, onDeleteFacility }) => {
  const [activeTab, setActiveTab] = useState('all'); // Lọc theo trạng thái hoạt động
  const [searchTerm, setSearchTerm] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // THÊM: state cho modal form (giống Pharmacies.jsx)
  const [showForm, setShowForm] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);

  useEffect(() => {
    const fetchFacilities = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch('http://localhost:3001/api/medical-facilities');
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();

        // Nếu backend trả object chứa key (vd: { data: [...] })
        const list = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);

        // Normalize + safe parse services
        const mapped = list.map(item => {
          // services có thể là null, '', JSON string or already array
          let servicesArr = [];
          try {
            if (Array.isArray(item.services)) {
              servicesArr = item.services;
            } else {
              servicesArr = JSON.parse(item.services || '[]');
            }
          } catch (err) {
            servicesArr = [];
          }

          return {
            id: item.facility_id || item.id || item.facilityId || item._id,
            raw: item, // giữ bản gốc nếu cần edit
            name: item.facility_name || item.name || '',
            type: item.type_id || item.type || '',
            address: item.address || '',
            phone: item.phone || '—',
            status: item.status || 'unknown',
            verified: item.verified ?? true,
            services: servicesArr,
            lastUpdated: item.updatedAt ? item.updatedAt.slice(0,10) : '',
            // Thêm thông tin mặc định cho các trường không có trong API
            province: getProvinceFromGeometry(item.area_geom),
          };
        });

        setFacilities(mapped);
      } catch (err) {
        console.error("Error fetching facilities:", err);
        setErrorMsg(err.message || 'Lỗi khi lấy dữ liệu');
        setFacilities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  const getProvinceFromGeometry = (geometry) => {
    // Đây là hàm mẫu, cần tích hợp với GIS service thực tế
    return 'Hồ Chí Minh';
  };

  // THÊM: hàm xử lý khi thêm thành công (giống Pharmacies.jsx)
  const handleAddFacilityResult = (created) => {
    // created có thể dùng key 'facility_id'
    // Thêm lên đầu danh sách để thấy ngay
    setFacilities(prev => [created, ...prev]);
    // Ẩn form
    setShowForm(false);
  };

  // THÊM: hàm xử lý khi chỉnh sửa thành công (giống Pharmacies.jsx)
  const handleEditFacilityResult = (updated) => {
    setFacilities(prev => prev.map(f => 
      (f.id === updated.facility_id || f.id === updated.id ? updated : f)
    ));
    setEditingFacility(null);
    setShowForm(false);
  };

  // THÊM: hàm xử lý xóa (giống Pharmacies.jsx)
  const handleDeleteClick = async (facilityId, facilityName) => {
    // Sử dụng prop nếu có, nếu không dùng window.confirm
    if (onDeleteFacility) {
      // Gọi prop function
      onDeleteFacility(facilityId);
    } else {
      // Fallback: dùng window.confirm
      if (!window.confirm(`Xác nhận xóa cơ sở "${facilityName}"?`)) return;
      
      console.log("Deleting facility ID:", facilityId);
      
      try {
        const response = await fetch(`http://localhost:3001/api/medical-facilities/${facilityId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        // Cập nhật state local
        setFacilities(prev => prev.filter(f => f.id !== facilityId));
        alert(`Đã xóa cơ sở "${facilityName}" thành công!`);
      } catch (err) {
        console.error("Error deleting facility:", err);
        alert(`Xóa thất bại: ${err.message}`);
      }
    }
  };

  // Hàm lọc Facilities
  const filteredFacilities = facilities.filter(facility => {
    // Lọc theo loại hình cơ sở y tế
    if (activeTab !== 'all' && facility.status !== activeTab) {
      return false;
    }

    // Lọc theo từ khóa tìm kiếm

    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      return (
        facility.name.toLowerCase().includes(searchLower) ||
        facility.type.toLowerCase().includes(searchLower) ||
        facility.services.join(", ").toLowerCase().includes(searchLower) ||
        facility.province.toLowerCase().includes(searchLower)

    // const q = (searchTerm || '').toString().toLowerCase();
    // const name = (facility.name || '').toString().toLowerCase();
    // const addr = (facility.address || '').toString().toLowerCase();
    // const matchesTab = activeTab === 'all' || (facility.status || '') === activeTab;
    // return matchesTab && (name.includes(q) || addr.includes(q));
      );
    }
    
    return true;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Hoạt động', class: 'success' },
      pending: { label: 'Chờ duyệt', class: 'warning' },
      inactive: { label: 'Ngừng hoạt động', class: 'danger' }
    };
    const config = statusConfig[status] || { label: status || 'Không rõ', class: 'secondary' };
    return <span className={`badge bg-${config.class}`}>{config.label}</span>;
  };

    const handleExportReport = () => {
    console.log('Exporting outbreak report');
    alert('Đã xuất báo cáo thành công!');
  };

  // Thống kê nhanh
  const stats = {
    total: facilities.length,
    activeStatus: facilities.filter(o => o.status === 'active').length,
    pendingStatus: facilities.filter(o => o.status === 'pending').length,
    inactiveStatus: facilities.filter(o => o.status === 'inactive').length,
    totalFaci: facilities.reduce((sum, o) => sum + o.type, 0)
  };

  // Thống kê theo bộ lọc hiện tại
  const filteredStats = {
    showing: filteredFacilities.length,
    total: facilities.length
  };

  if (isLoading) {
    return (
      <div className="medical-facilities">
        <div className="loading-state">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3">Đang tải dữ liệu cơ sở y tế...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="medical-facilities">
        <div className="error-state">
          <i className="bi bi-exclamation-triangle"></i>
          <h5>Có lỗi xảy ra</h5>
          <p>{errorMsg}</p>
          <button className="btn btn-primary mt-3" onClick={setFacilities}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="medical-facilities">
      <div className="section-header">
        <div className="header-content">
          <h2>Quản Lý Cơ Sở Y Tế</h2>
          <p>Quản lý thông tin các cơ sở y tế trên toàn quốc</p>
{/* ////////////////// */}
          {/* Quick Stats */}
          <div className="facility-stats-overview">
            <div className="stat-item">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Tổng cơ sở y tế</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.activeStatus}</div>
              <div className="stat-label">Trạng thái hoạt động</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.pendingStatus}</div>
              <div className="stat-label">Trạng thái đang chờ duyệt</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.inactiveStatus}</div>
              <div className="stat-label">Trạng thái ngưng hoạt động</div>
            </div>
          </div>
        </div>
      </div>

      {/* Facility Map Preview */}
      {/* <div className="outbreak-map-preview">
        <div className="map-header">
          <h5>Bản Đồ Cơ Sở Y Tế</h5>
          
        </div> */}
        
        {/* Map Component */}
        {/* <div className="outbreak-map-wrapper ">
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
                onClick={setFacilities}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Thử lại
              </button>
            </div>
          ) : facilities.length === 0 ? (
            <div className="map-empty-state">
              <i className="bi bi-map"></i>
              <h6>Chưa có dữ liệu cơ sở y tế</h6>
              <p>Bản đồ sẽ hiển thị khi có cơ sở y tế được thêm vào</p>
            </div>
          ) : (
            <OutbreakMap 
              outbreakId={mapOutbreakId}
              onOutbreakClick={handleMapOutbreakClick}
            />
          )}
        </div> */}
      
              {/* Map Controls */}
              {/* <div className="map-controls">
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
            </div> */}
{/* ////////////////// */}
      {/*Filters and Search*/}
      <div className="facilities-filters">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="search-box">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Tìm kiếm cơ sở y tế (tên hoặc địa chỉ)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="filter-tabs">
              <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>Tất cả ({stats.total})</button>
              <button className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>Hoạt động ({stats.activeStatus})</button>
              <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Đang chờ duyệt ({stats.pendingStatus})</button>
              <button className={`tab-btn ${activeTab === 'inactive' ? 'active' : ''}`} onClick={() => setActiveTab('inactive')}>Ngưng hoạt động ({stats.inactiveStatus})</button>
            </div>
          </div>
        </div>

        {/* Results summary */}
        <div className="filter-summary">
          <small>
            Đang hiển thị <strong>{filteredStats.showing}</strong> trong tổng số <strong>{filteredStats.total}</strong> cơ sở y tế
            {searchTerm && ` - Kết quả tìm kiếm cho: "${searchTerm}"`}
            {activeTab !== 'all' && ` - Lọc theo trạng thái hoạt động: ${activeTab === 'active' ? 'hoạt động' : activeTab === 'pending' ? 'đang chờ duyệt' : 'ngưng hoạt động'}`}
          </small>
        </div>
      </div>

      {errorMsg && <div className="alert alert-danger mt-3">Lỗi: {errorMsg}</div>}

      {/* Facility List */}
      <div className="facility-list">
        <div className="list-header">
          <h5>Danh Sách Cơ Sở Y Tế ({filteredFacilities.length})</h5>
            <div className="header-actions">
          <button 
            className="btn btn-primary me-2"
            onClick={onAddFacility}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Thêm Cơ Sở Y Tế
          </button>
                  {/* SỬA: dùng setShowForm thay vì onAddFacility prop */}
        {/* <button className="btn btn-primary" onClick={() => { setEditingFacility(null); setShowForm(true); }}>
          <i className="bi bi-plus-circle me-2"></i> Thêm Cơ Sở Mới
        </button> */}
          <button 
            className="btn btn-outline-primary"
            onClick={handleExportReport}
          >
            <i className="bi bi-download me-2"></i>
            Xuất Báo Cáo
          </button>
        </div>
        </div>

        {/* <div className="facilities-table-container mt-3"> */}
          {filteredFacilities.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-hospital"></i>
              <h5>Không tìm thấy cơ sở y tế nào</h5>
              <p>
                {searchTerm 
                ? `Không tìm thấy cơ sở y tế nào phù hợp với từ khóa "${searchTerm}"`
                : activeTab !== 'all'
                ? `Không có cơ sở y tế nào có trạng thái ${activeTab === 'active' ? 'hoạt động' : activeTab === 'pending' ? 'đang chờ duyệt' : 'ngưng hoạt động'}`
                : 'Chưa có vùng dịch nào được thêm vào hệ thống'
              }
              </p>

              {/* THÊM: nút thêm cơ sở đầu tiên */}
              {/* <button className="btn btn-primary mt-3" onClick={() => { setEditingFacility(null); setShowForm(true); }}>
                <i className="bi bi-plus-circle me-2"></i>
                Thêm Cơ Sở Đầu Tiên
              </button> */}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table facilities-table">
                <thead>
                  <tr>
                    <th>Tên cơ sở</th>
                    <th>Loại hình</th>
                    <th>Địa chỉ</th>
                    <th>Liên hệ</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFacilities.map(f => (
                    <tr key={f.id || f.name}>
                      <td><strong>{f.name}</strong></td>
                      <td>{f.type}</td>
                      <td><small>{f.address}</small></td>
                      <td>{f.phone}</td>
                      <td>{getStatusBadge(f.status)}</td>
                      <td>
                        <div className="action-buttons">
                          {/* SỬA: Truyền toàn bộ raw data, không chỉ f.raw */}
                          <button 
                            className="btn btn-sm btn-outline-primary" 
                            onClick={() => { 
                              console.log("Editing facility - Full object:", f);
                              console.log("Facility name:", f.name);
                              console.log("Facility ID:", f.id);
                              console.log("Raw data:", f.raw);
                              
                              // Tạo object đầy đủ với tất cả field cần thiết
                            const facilityData = {
                              facility_id: f.id,
                              id: f.id,
                              facility_name: f.name,
                              name: f.name,
                              type_id: f.type,
                              type: f.type,
                              address: f.address,
                              phone: f.phone,
                              province_id: f.raw?.province_id || '',
                              province: f.raw?.province || '',
                              services: f.services,
                              status: f.status,
                              // SỬA: Xử lý location an toàn
                              location: f.raw?.facility_point_id || null,
                              facility_point_id: f.raw?.facility_point_id || null
                            };;
                              
                              console.log("Data to pass to form:", facilityData);
                              setEditingFacility(facilityData);
                              setShowForm(true);
                            }}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          
                          <button 
                            className="btn btn-sm btn-outline-info" 
                            onClick={() => alert(`Chi tiết: ${f.name}\nĐịa chỉ: ${f.address}\nLoại: ${f.type}\nTrạng thái: ${f.status}`)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          
                          {/* SỬA: dùng handleDeleteClick */}
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            onClick={() => handleDeleteClick(f.id, f.name)}
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
          )}
        {/* </div> */}
      </div>

      {/* THÊM: Modal form (giống Pharmacies.jsx) */}
      {showForm && (
        <div className="modal-overlay active">
          <div className="modal-container">
            <div className="modal-content large">
              <div className="modal-header">
                <h5>{editingFacility ? 'Chỉnh Sửa Cơ Sở Y Tế' : 'Thêm Cơ Sở Y Tế Mới'}</h5>
                <button className="btn-close" onClick={() => { setShowForm(false); setEditingFacility(null); }}></button>
              </div>
              <div className="modal-body">
                <FacilityForm
                  initialData={editingFacility || {}}
                  mode={editingFacility ? 'edit' : 'create'}
                  onSubmit={(createdOrUpdated) => {
                    // nếu mode create -> created mới có facility_id chưa tồn tại trong list
                    if (editingFacility) {
                      handleEditFacilityResult(createdOrUpdated);
                    } else {
                      handleAddFacilityResult(createdOrUpdated);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalFacilities;