// src/pages/UserDashboard/MedicalFacilities/MedicalFacilities.jsx
import React, { useState, useEffect, useMemo } from 'react';
import './MedicalFacilities.css';
import FacilityForm from '../FormComponents/FacilityForm/FacilityForm';
import FacilityMap from '../MapComponents/FacilityMap/FacilityMap';

const MedicalFacilities = ({ onAddFacility, onEditFacility, onDeleteFacility }) => {
  const [activeTab, setActiveTab] = useState('all'); // Lọc theo trạng thái hoạt động
  const [searchTerm, setSearchTerm] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
            lastUpdated: item.updatedAt ? item.updatedAt.slice(0, 10) : '',
            // Thêm thông tin mặc định cho các trường không có trong API
            province: item.province_id //getProvinceFromGeometry(item.area_geom),
          };
        });

        setFacilities(mapped);
        setCurrentPage(1); // Reset về trang 1 khi fetch dữ liệu mới
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

  // map cho data mới add
  const mapFacility = (item) => {
    let servicesArr = [];
    try {
      if (Array.isArray(item.services)) servicesArr = item.services;
      else servicesArr = JSON.parse(item.services || '[]');
    } catch { servicesArr = []; }

    return {
      id: item.facility_id || item.id,
      raw: item,
      name: item.facility_name || item.name || '',
      type: item.type_id || item.type || '',
      address: item.address || '',
      phone: item.phone || '—',
      status: item.status || 'unknown',
      services: servicesArr,
      province: item.province_id || '',
      lastUpdated: item.updatedAt?.slice(0, 10) || ''
    };
  };

  const [expandedFacilityId, setExpandedFacilityId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedFacilityId(prev => (prev === id ? null : id));
  };

  const getProvinceFromGeometry = (geometry) => {
    // Đây là hàm mẫu, cần tích hợp với GIS service thực tế
    return 'Hồ Chí Minh';
  };

  const [provinces, setProvinces] = useState([]);
  useEffect(() => {
    fetch("http://localhost:3001/api/provinces")
      .then(res => res.json())
      .then(data => setProvinces(data));
  }, []);
  const provinceMap = useMemo(() => {
  const map = {};
  provinces.forEach(p => {
    map[String(p.province_id)] = p.province_name;
  });
  return map;
}, [provinces]);

  // THÊM: hàm xử lý khi thêm thành công (giống Pharmacies.jsx)
  const handleAddFacilityResult = async (created) => {
    const facility = created.facility || created;
    const mapped = mapFacility(facility);

    setFacilities(prev => [mapped, ...prev]);
    setShowForm(false);
    setCurrentPage(1); // Reset về trang 1 khi thêm mới
  };

  // CHỈNH SỬA: hàm xử lý khi chỉnh sửa thành công (giống Pharmacies.jsx)
  const handleEditFacilityResult = (updated) => {
    const mapped = mapFacility(updated);

    setFacilities(prev =>
      prev.map(f =>
        f.id === mapped.id ? mapped : f
      )
    );
    setEditingFacility(null);
    setShowForm(false);
  };

  // XÓA: hàm xử lý xóa (giống Pharmacies.jsx)
  const handleDeleteClick = async (facilityId, facilityName) => {
    // Sử dụng prop nếu có, nếu không dùng window.confirm
    console.log("onDeleteFacility =", onDeleteFacility);

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
      setFacilities(prev => {
        const updated = prev.filter(f => f.id !== facilityId);
        console.log("Facilities sau khi xoá:", updated);
        return updated;
      });

      // Nếu trang hiện tại trống sau khi xóa, quay lại trang trước đó
      if (currentFacilities.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }

      alert(`Đã xóa cơ sở "${facilityName}" thành công!`);
    } catch (err) {
      console.error("Error deleting facility:", err);
      alert(`Xóa thất bại: ${err.message}`);
    }
  };

  // Sửa hàm xử lý click trên bản đồ
  const handleMapFacilityClick = (facility) => {
    const facilityId = facility.facility_id;
    
    // Toggle selection - nếu đang chọn thì bỏ chọn, nếu không thì chọn
    if (selectedFacility === facilityId) {
      setSelectedFacility(null);
    } else {
      setSelectedFacility(facilityId);
    }
  };

  // Thêm hàm reset map view
  const handleResetMapView = () => {
    setSelectedFacility(null);
  };

  // Hàm lọc Facilities
  const filteredFacilities = useMemo(() => {
    return facilities.filter(facility => {
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
        );
      }

      return true;
    });
  }, [facilities, activeTab, searchTerm]);

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredFacilities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFacilities = filteredFacilities.slice(startIndex, endIndex);

  // Điều hướng trang
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Tạo mảng các số trang để hiển thị
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Số trang hiển thị tối đa

    if (totalPages <= maxVisiblePages) {
      // Hiển thị tất cả các trang nếu tổng số trang ít
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Hiển thị một số trang xung quanh trang hiện tại
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      // Điều chỉnh nếu ở đầu hoặc cuối
      if (currentPage <= 3) {
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxVisiblePages + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Thêm ellipsis nếu cần
      if (startPage > 1) {
        pageNumbers.unshift('...');
        pageNumbers.unshift(1);
      }
      if (endPage < totalPages) {
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

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
  };

  // Thống kê theo bộ lọc hiện tại
  const filteredStats = {
    showing: filteredFacilities.length,
    total: facilities.length,
    showingRange: filteredFacilities.length > 0
      ? `Hiển thị ${startIndex + 1}-${Math.min(endIndex, filteredFacilities.length)} trong tổng số ${filteredFacilities.length} cơ sở y tế`
      : 'Không có dữ liệu'
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
          <button className="btn btn-primary mt-3" onClick={() => window.location.reload()}>
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
      <div className="facility-map-preview">
        <div className="map-header">
          <h5>Bản Đồ Cơ Sở Y Tế</h5>
          <div className="map-header-badge">
            <span className="badge bg-primary">
              {filteredFacilities.length} cơ sở y tế đang hiển thị
            </span>
            {selectedFacility && (
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
        
        <div className="facility-map-wrapper">
          {facilities.length === 0 ? (
            <div className="map-empty-state">
              <i className="bi bi-map"></i>
              <h6>Chưa có dữ liệu cơ sở y tế</h6>
              <p>Bản đồ sẽ hiển thị khi có cơ sở y tế được thêm vào</p>
            </div>
          ) : (
            <FacilityMap 
              facilities={filteredFacilities}
              onFacilityClick={handleMapFacilityClick}
              selectedFacilityId={selectedFacility}
              showLoading={isLoading}
              enableReset={true}
            />
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="facilities-filters">
        <div className="row g-3">
          <div className="col-md-12">
            <div className="search-box">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Tìm kiếm cơ sở y tế (tên hoặc địa chỉ)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
                }}
              />
            </div>
          </div>
        </div>

        <div className="row g-3 mt-2">
          <div className="col-md-8">
            <div className="status-filter-row">
              <div className="filter-tabs">
                <button
                  className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                >
                  Tất cả ({stats.total})
                </button>
                <button
                  className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('active'); setCurrentPage(1); }}
                >
                  Hoạt động ({stats.activeStatus})
                </button>
                <button
                  className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
                >
                  Đang chờ duyệt ({stats.pendingStatus})
                </button>
                <button
                  className={`tab-btn ${activeTab === 'inactive' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('inactive'); setCurrentPage(1); }}
                >
                  Ngưng hoạt động ({stats.inactiveStatus})
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="items-per-page-selector">
              <label className="me-2">Hiển thị:</label>
              <select
                className="form-select form-select-sm d-inline-block w-auto"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset về trang 1 khi thay đổi số lượng mỗi trang
                }}
              >
                <option value={5}>5 dòng/trang</option>
                <option value={10}>10 dòng/trang</option>
                <option value={20}>20 dòng/trang</option>
                <option value={50}>50 dòng/trang</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results summary */}
        <div className="filter-summary mt-3">
          <small>
            {filteredStats.showingRange}
            {searchTerm && ` - Kết quả tìm kiếm cho: "${searchTerm}"`}
            {activeTab !== 'all' && ` - Lọc theo trạng thái: ${activeTab === 'active' ? 'hoạt động' : activeTab === 'pending' ? 'đang chờ duyệt' : 'ngưng hoạt động'}`}
          </small>
        </div>
      </div>

      {errorMsg && <div className="alert alert-danger mt-3">Lỗi: {errorMsg}</div>}

      {/* Facility List */}
      <div className="facility-list">
        <div className="list-header">
          <h5>Danh Sách Cơ Sở Y Tế ({filteredFacilities.length})</h5>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => { setEditingFacility(null); setShowForm(true); }}>
              <i className="bi bi-plus-circle me-2"></i> Thêm Cơ Sở Mới
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

        {currentFacilities.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-hospital"></i>
            <h5>Không tìm thấy cơ sở y tế nào</h5>
            <p>
              {searchTerm
                ? `Không tìm thấy cơ sở y tế nào phù hợp với từ khóa "${searchTerm}"`
                : activeTab !== 'all'
                  ? `Không có cơ sở y tế nào có trạng thái ${activeTab === 'active' ? 'hoạt động' : activeTab === 'pending' ? 'đang chờ duyệt' : 'ngưng hoạt động'}`
                  : 'Chưa có cơ sở y tế nào được thêm vào hệ thống'
              }
            </p>
            <button className="btn btn-primary mt-3" onClick={() => { setEditingFacility(null); setShowForm(true); }}>
              <i className="bi bi-plus-circle me-2"></i>
              Thêm Cơ Sở Đầu Tiên
            </button>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table facilities-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên cơ sở</th>
                    <th>Loại hình</th>
                    <th>Địa chỉ</th>
                    <th>Tỉnh/Thành phố</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentFacilities.map((f, index) => (
                    <React.Fragment key={f.id}>
                      <tr key={f.id || f.name}>
                        <td>{startIndex + index + 1}</td>
                        <td><strong>{f.name}</strong></td>
                        <td>{f.type}</td>
                        <td><small>{f.address}</small></td>
                        <td>{provinceMap[f.province]}</td>
                        <td>{getStatusBadge(f.status)}</td>
                        <td>
                          <div className="action-buttons">
                            <button     // sửa
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
                                };

                                console.log("Data to pass to form:", facilityData);
                                setEditingFacility(facilityData);
                                setShowForm(true);
                              }}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>

                            <button     // xóa
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteClick(f.id, f.name)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>

                            <button     // xem
                              className="btn btn-sm btn-outline-info"
                              onClick={() => toggleExpand(f.id)}
                            >
                              <i className={`bi ${expandedFacilityId === f.id ? 'bi-chevron-up' : 'bi-eye'}`}></i>
                            </button>                            
                          </div>
                        </td>
                      </tr>
                      {expandedFacilityId === f.id && (
                        <tr className="facility-expanded-row">
                          <td colSpan={7}>
                            <div className="expanded-content">
                              <div><strong>Số điện thoại:</strong> {f.phone || '(Chưa cập nhật)'}</div>
                
                              <div style={{ marginTop: 6 }}>
                                <strong>Dịch vụ: </strong>
                                {Array.isArray(f.services) ? f.services.join(', ') : (<span> (Chưa cập nhật)</span>)}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>   
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-center">
                    {/* Nút Previous */}
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => goToPage(currentPage - 1)}
                        aria-label="Previous"
                      >
                        <span aria-hidden="true">&laquo;</span>
                      </button>
                    </li>

                    {/* Các số trang */}
                    {getPageNumbers().map((pageNum, index) => (
                      <li
                        key={index}
                        className={`page-item ${pageNum === '...' ? 'disabled' :
                            pageNum === currentPage ? 'active' : ''
                          }`}
                      >
                        {pageNum === '...' ? (
                          <span className="page-link">...</span>
                        ) : (
                          <button
                            className="page-link"
                            onClick={() => goToPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        )}
                      </li>
                    ))}

                    {/* Nút Next */}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => goToPage(currentPage + 1)}
                        aria-label="Next"
                      >
                        <span aria-hidden="true">&raquo;</span>
                      </button>
                    </li>
                  </ul>
                </nav>

                <div className="pagination-info">
                  <span>
                    Trang {currentPage} / {totalPages}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
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