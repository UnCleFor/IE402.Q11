import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdvancedFilters from '../HomePage/AdvancedFilters/AdvancedFilters';
import './FiltersPage.css';

const FilterPage = () => {
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    province: '',
    insurance: '',
    priceRange: 'all',
    specialty: '',
    workingHours: 'all',
    rating: 0,
    facilityType: ''
  });

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      province: '',
      insurance: '',
      priceRange: 'all',
      specialty: '',
      workingHours: 'all',
      rating: 0,
      facilityType: ''
    });
  };

  const handleSearchWithFilters = () => {
    navigate('/filtered-results', {
      state: {
        filters: filters,
        searchType: 'advanced_filters',
        timestamp: new Date().toISOString()
      }
    });
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="filter-page">
        {/* Header */}
            <div className="filter-header">
              <div className="container">
                <h1 className="display-5 fw-bold mb-3">
                  <i className="bi bi-funnel-fill me-3"></i>
                  Bộ lọc Nâng Cao
                </h1>
                <p className="lead mb-0">
                  Sử dụng bộ lọc để tìm cơ sở y tế phù hợp nhất với nhu cầu của bạn
                </p>
              </div>
            </div>
            {/* Main Content */}
      <div className="container">
        <div className="filter-main">
          <div className="row">
            {/* Left: Filters */}
            <div className="col-lg-8">
              <div className="filter-card">
                <div className="card-header">
                  <h5>
                    <i className="bi bi-sliders"></i>
                    Bộ Lọc Tìm Kiếm
                  </h5>
                </div>
                <div className="card-body">
                  <AdvancedFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                    onSearch={handleSearchWithFilters}
                  />
                </div>
              </div>
            </div>

            {/* Right: Tips & Info */}
            <div className="col-lg-4">
              <div className="tips-section">
                <h5 className="filter-section-title">
                  <i className="bi bi-lightbulb"></i>
                  Mẹo Tìm Kiếm
                </h5>
                
                <div className="d-flex mb-4 tip-item">
                  <div className="tip-icon">
                    <i className="bi bi-geo-alt fs-5"></i>
                  </div>
                  <div>
                    <h6>Chọn địa điểm cụ thể</h6>
                    <p>Chọn tỉnh/thành để tìm cơ sở gần bạn</p>
                  </div>
                </div>

                <div className="d-flex mb-4 tip-item">
                  <div className="tip-icon">
                    <i className="bi bi-shield-check fs-5"></i>
                  </div>
                  <div>
                    <h6>Ưu tiên bảo hiểm</h6>
                    <p>Giảm chi phí với bảo hiểm được hỗ trợ</p>
                  </div>
                </div>

                <div className="d-flex mb-4 tip-item">
                  <div className="tip-icon">
                    <i className="bi bi-clock-history fs-5"></i>
                  </div>
                  <div>
                    <h6>Giờ làm việc linh hoạt</h6>
                    <p>Chọn cơ sở mở cửa 24/7 cho khẩn cấp</p>
                  </div>
                </div>

                <div className="d-flex tip-item">
                  <div className="tip-icon">
                    <i className="bi bi-star-fill fs-5"></i>
                  </div>
                  <div>
                    <h6>Xem đánh giá</h6>
                    <p>Tham khảo đánh giá từ người dùng trước</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="stats-section">
                <h5 className="filter-section-title">
                  <i className="bi bi-graph-up"></i>
                  Thống Kê Hệ Thống
                </h5>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-number">2,500+</div>
                    <div className="stat-label">Cơ sở y tế</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">15,000+</div>
                    <div className="stat-label">Bác sĩ</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">85%</div>
                    <div className="stat-label">Hỗ trợ BHYT</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">4.5/5</div>
                    <div className="stat-label">Đánh giá TB</div>
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

export default FilterPage;