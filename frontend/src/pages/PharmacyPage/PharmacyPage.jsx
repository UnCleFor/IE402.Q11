import React, { useEffect, useState } from "react";
import PharmacyCard from "../../components/DefaultComponent/Pharmacy/PharmacyCard";
import axios from "axios";
import "./PharmacyPage.css";

export default function PharmacyPage() {
  const [pharmacies, setPharmacies] = useState([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9); // 9 items per page (3x3 grid)

  useEffect(() => {
    setLoading(true);
    axios.get("http://localhost:3001/api/pharmacies")
      .then(res => {
        setPharmacies(res.data);
        setFilteredPharmacies(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setError("Không thể tải danh sách nhà thuốc. Vui lòng thử lại sau.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPharmacies(pharmacies);
    } else {
      const filtered = pharmacies.filter(pharmacy =>
        pharmacy.pharmacy_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.ward?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.district?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPharmacies(filtered);
    }
    // Reset về trang 1 khi tìm kiếm
    setCurrentPage(1);
  }, [searchTerm, pharmacies]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPharmacies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPharmacies.length / itemsPerPage);

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
      <div className="pharmacy-page loading">
        <div className="container">
          <div className="loading-state">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3">Đang tải danh sách nhà thuốc...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pharmacy-page error">
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
    <div className="pharmacy-page">
      <div className="pharmacy-hero">
        <div className="container">
          <div className="pharmacy-hero-content">
            <h1 className="pharmacy-hero-title">Danh Sách Nhà Thuốc</h1>
            <p className="pharmacy-hero-description">
              Tìm kiếm và khám phá các nhà thuốc uy tín trong khu vực
            </p>
          </div>
          
          <div className="pharmacy-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-capsule"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{filteredPharmacies.length}</div>
                <div className="stat-label">
                  Nhà thuốc
                  {filteredPharmacies.length !== pharmacies.length && (
                    <span className="stat-sub"> / {pharmacies.length}</span>
                  )}
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

      <div className="pharmacy-container">
        <div className="search-container">
          <div className="search-box">
            <i className="bi bi-search search-icon"></i>
            <input
              type="text"
              placeholder="Tìm kiếm nhà thuốc theo tên, địa chỉ..."
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
          <div className="search-info">
            <i className="bi bi-info-circle me-2"></i>
            Đang hiển thị {filteredPharmacies.length} nhà thuốc
            {searchTerm && ` cho "${searchTerm}"`}
          </div>
        </div>

        {!loading && !error && filteredPharmacies.length === 0 && (
          <div className="empty-state">
              <i className="bi bi-hospital"></i>
            <h5>Không tìm thấy nhà thuốc</h5>
            <p>Không có nhà thuốc nào phù hợp với từ khóa tìm kiếm của bạn.</p>
            <button 
              className="btn btn-outline-primary mt-2"
              onClick={() => setSearchTerm("")}
            >
              <i className="bi bi-funnel me-2"></i>Xóa bộ lọc
            </button>
          </div>
        )}

        {!loading && !error && filteredPharmacies.length > 0 && (
          <>
            <h2 className="pharmacy-section-title">
              <div className="title-content">
                <i className="bi bi-list-check me-2"></i>
                Danh sách nhà thuốc
              </div>
            </h2>
            
            <div className="pagination-info">
              Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredPharmacies.length)} trên tổng số {filteredPharmacies.length} nhà thuốc
            </div>
            
            <div className="pharmacy-grid">
              {currentItems.map(ph => (
                <PharmacyCard key={ph.pharmacy_id} pharmacy={ph} />
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
                      setCurrentPage(1); // Reset về trang 1 khi thay đổi số item
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
       
        <div className="pharmacy-footer-note">
          <p>
            <i className="bi bi-info-circle me-2"></i>
            <strong>Lưu ý:</strong> Thông tin nhà thuốc được cập nhật thường xuyên. 
            Vui lòng liên hệ trực tiếp để xác nhận giờ mở cửa và tình trạng thuốc.
          </p>
        </div>
      </div>
    </div>
  );
}