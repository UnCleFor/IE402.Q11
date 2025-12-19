import React, { useEffect, useState } from "react";
import MedicalFacilityCard from "../../components/DefaultComponent/MedicalFacilityCard/MedicalFacilityCard";
import axios from "axios";
import "./MedicalFacilityPage.css";

export default function MedicalFacilityPage() {
  const [facilities, setFacilities] = useState([]);
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("all");
  const [availableServices, setAvailableServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  useEffect(() => {
    setLoading(true);
    axios.get("http://localhost:3001/api/medical-facilities")
      .then(res => {
        console.log("Dữ liệu cơ sở y tế:", res.data);
        setFacilities(res.data);
        setFilteredFacilities(res.data);
        
        // Lấy danh sách dịch vụ duy nhất
        const services = getAllUniqueServices(res.data);
        setAvailableServices(services);
        
        setLoading(false);
      })
      .catch(err => {
        console.log("Lỗi khi tải cơ sở y tế:", err);
        setError("Không thể tải danh sách cơ sở y tế. Vui lòng thử lại sau.");
        setLoading(false);
      });
  }, []);

  // Hàm lấy tất cả dịch vụ duy nhất từ danh sách cơ sở
  const getAllUniqueServices = (facilitiesList) => {
    const serviceSet = new Set();
    
    facilitiesList.forEach(facility => {
      const services = getServicesFromFacility(facility);
      services.forEach(service => {
        if (service && service.trim()) {
          serviceSet.add(service.trim());
        }
      });
    });
    
    // Sắp xếp theo thứ tự alphabet
    return Array.from(serviceSet).sort();
  };

  // Hàm parse services từ facility
  const getServicesFromFacility = (facility) => {
    try {
      if (Array.isArray(facility?.services)) {
        return facility.services;
      }
      
      if (typeof facility?.services === 'string') {
        // Thử parse JSON
        try {
          const parsed = JSON.parse(facility.services);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          // Nếu không phải JSON, tách bằng dấu phẩy
          return facility.services
            .split(/[,;]/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
        }
      }
      
      return [];
    } catch (err) {
      console.error("Error parsing services:", err);
      return [];
    }
  };

  // Xử lý lọc khi searchTerm hoặc selectedService thay đổi
  useEffect(() => {
    let filtered = [...facilities];
    
    // Lọc theo search term
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(facility =>
        facility.facility_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.phone?.includes(searchTerm)
      );
    }
    
    // Lọc theo dịch vụ
    if (selectedService !== "all") {
      filtered = filtered.filter(facility => {
        const services = getServicesFromFacility(facility);
        return services.some(service => 
          service && service.toLowerCase().includes(selectedService.toLowerCase())
        );
      });
    }
    
    setFilteredFacilities(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedService, facilities]);

  // Hàm xử lý thay đổi dịch vụ được chọn
  const handleServiceChange = (service) => {
    setSelectedService(service);
  };

  // Hàm xóa tất cả bộ lọc
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedService("all");
  };

  const countActiveFacilities = () => {
    return facilities.filter(f => f.status === 'active').length;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFacilities.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFacilities.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="medical-facility-page loading">
        <div className="container">
          <div className="loading-state">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3">Đang tải danh sách cơ sở y tế...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="medical-facility-page error">
        <div className="container">
          <div className="error-state">
            <i className="bi bi-exclamation-triangle"></i>
            <h5>Có lỗi xảy ra</h5>
            <p>{error}</p>
            <button className="btn btn-primary mt-3" onClick={() => window.location.reload()}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="medical-facility-page">
      <div className="facility-hero">
        <div className="container">
          <div className="facility-hero-content">
            <h1 className="facility-hero-title">Danh sách Cơ sở Y tế</h1>
            <p className="facility-hero-description">
              Tìm kiếm và khám phá các cơ sở y tế uy tín trong khu vực
            </p>
          </div>
          
          <div className="facility-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-hospital"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{facilities.length}</div>
                <div className="stat-label">
                  Cơ sở y tế
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-check-circle"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{countActiveFacilities()}</div>
                <div className="stat-label">
                  Đang hoạt động
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-telephone"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">Hỗ trợ</div>
                <div className="stat-label">
                  Tư vấn 24/7
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="facility-container">
        {/* Bộ lọc tìm kiếm và dịch vụ */}
        <div className="filter-container">
          <div className="search-filter-box">
            <div className="search-box">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                placeholder="Tìm kiếm cơ sở y tế theo tên, địa chỉ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm("")}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
            
            <div className="service-filter-box">
              <div className="filter-label">
                <i className="bi bi-funnel me-2"></i>
                Lọc theo dịch vụ:
              </div>
              <select 
                className="service-select"
                value={selectedService}
                onChange={(e) => handleServiceChange(e.target.value)}
              >
                <option value="all">Tất cả dịch vụ</option>
                {availableServices.map((service, index) => (
                  <option key={index} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Hiển thị bộ lọc đang active */}
          {(searchTerm || selectedService !== "all") && (
            <div className="active-filters">
              <div className="active-filters-header">
                <span className="active-filters-label">
                  <i className="bi bi-filter me-2"></i>
                  Bộ lọc đang áp dụng:
                </span>
                <button 
                  className="clear-all-filters"
                  onClick={clearAllFilters}
                >
                  <i className="bi bi-x-lg me-1"></i>
                  Xóa tất cả
                </button>
              </div>
              
              <div className="active-filter-tags">
                {searchTerm && (
                  <div className="filter-tag">
                    <span>Tìm kiếm: "{searchTerm}"</span>
                    <button 
                      className="filter-tag-remove"
                      onClick={() => setSearchTerm("")}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                )}
                
                {selectedService !== "all" && (
                  <div className="filter-tag">
                    <span>Dịch vụ: {selectedService}</span>
                    <button 
                      className="filter-tag-remove"
                      onClick={() => setSelectedService("all")}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="search-info">
            <i className="bi bi-info-circle me-2"></i>
            Đang hiển thị {filteredFacilities.length} cơ sở y tế
            {searchTerm && ` cho "${searchTerm}"`}
            {selectedService !== "all" && ` có dịch vụ "${selectedService}"`}
          </div>
        </div>

        {!loading && !error && filteredFacilities.length === 0 && (
          <div className="empty-state">
            <i className="bi bi-hospital"></i>
            <h5>Không tìm thấy cơ sở y tế</h5>
            <p>
              {searchTerm || selectedService !== "all"
                ? "Không có cơ sở y tế nào phù hợp với bộ lọc đã chọn"
                : "Không có cơ sở y tế nào trong hệ thống"}
            </p>
            {(searchTerm || selectedService !== "all") && (
              <button 
                className="clear-filter-btn"
                onClick={clearAllFilters}
              >
                <i className="bi bi-funnel me-2"></i>Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredFacilities.length > 0 && (
          <>
            <h2 className="facility-section-title">
              <div className="title-content">
                <i className="bi bi-list-check me-2"></i>
                Danh sách cơ sở y tế
     
              </div>
            </h2>
            
            <div className="pagination-info">
              Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredFacilities.length)} 
              &nbsp;trên tổng số {filteredFacilities.length} cơ sở y tế
            </div>
            
            <div className="facility-list-single">
              {currentItems.map(facility => (
                <div key={facility.facility_id} className="facility-card-wrapper">
                  <MedicalFacilityCard facility={facility} />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination-container">
                <nav className="pagination">
                  <button 
                    className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  
                  <div className="pagination-pages">
                    {getPageNumbers().map((number, index) => (
                      number === '...' ? (
                        <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                      ) : (
                        <button
                          key={number}
                          className={`pagination-page ${currentPage === number ? 'active' : ''}`}
                          onClick={() => paginate(number)}
                        >
                          {number}
                        </button>
                      )
                    ))}
                  </div>
                  
                  <button 
                    className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </nav>
                
                <div className="items-per-page">
                  <span className="items-per-page-label">Hiển thị:</span>
                  <select 
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="items-per-page-select"
                  >
                    <option value="6">6</option>
                    <option value="9">9</option>
                    <option value="12">12</option>
                    <option value="15">15</option>
                  </select>
                </div>
              </div>
            )}
          </>
        )}

        <div className="facility-footer-note">
          <p>
            <i className="bi bi-info-circle me-2"></i>
            <strong>Lưu ý:</strong> Thông tin cơ sở y tế được cập nhật thường xuyên. 
            Vui lòng liên hệ trực tiếp để xác nhận giờ làm việc và dịch vụ hiện có.
          </p>
        </div>
      </div>
    </div>
  );
}