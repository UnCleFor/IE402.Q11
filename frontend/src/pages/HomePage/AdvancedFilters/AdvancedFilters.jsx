import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdvancedFilters.css';

const AdvancedFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  onSearch
}) => {
  const navigate = useNavigate();

  // DANH SÁCH TỈNH/THÀNH PHỐ
  const provinceOptions = [
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
    'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
    'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
    'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
    'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
    'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
    'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
    'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Quảng Bình',
    'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng',
    'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa',
    'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
    'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
  ];

  // DANH SÁCH CHUYÊN KHOA
  const specialtyOptions = [
    'Nội tổng quát', 'Ngoại khoa', 'Nhi khoa', 'Sản phụ khoa',
    'Tim mạch', 'Thần kinh', 'Da liễu', 'Tai mũi họng',
    'Răng hàm mặt', 'Mắt', 'Xét nghiệm', 'Cấp cứu'
  ];

  // DANH SÁCH BẢO HIỂM
  const insuranceOptions = [
    'Bảo hiểm y tế', 'Bảo hiểm Bảo Việt', 'Bảo hiểm Prudential',
    'Bảo hiểm Manulife', 'Bảo hiểm AIA', 'Bảo hiểm Bảo Minh'
  ];

  // Loại hình cơ sở y tế
  const facilityTypes = [
    { value: '', label: 'Tất cả loại hình' },
    { value: 'hospital', label: 'Bệnh viện' },
    { value: 'clinic', label: 'Phòng khám' },
    { value: 'medical-center', label: 'Trung tâm Y tế' },
    { value: 'pharmacy', label: 'Nhà thuốc' }
  ];

  // Hàm tìm kiếm với bộ lọc
  const handleSearchWithFilters = () => {
    navigate('/filtered-results', {
      state: {
        filters: filters,
        searchType: 'advanced_filters',
        timestamp: new Date().toISOString()
      }
    });
  };

  // Đếm số bộ lọc đang áp dụng
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.province) count++;
    if (filters.facilityType) count++;
    if (filters.specialty) count++;
    if (filters.insurance) count++;
    if (filters.priceRange !== 'all') count++;
    if (filters.workingHours !== 'all') count++;
    if (filters.minRating && filters.minRating !== '0') count++;
    if (filters.emergency && filters.emergency !== 'all') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="advanced-filters-section card">
      <div className="card-body">
        <div className="filters-header">
          <h5 className="card-title">
            <i className="bi bi-funnel"></i> Bộ lọc nâng cao
          </h5>
          {activeFilterCount > 0 && (
            <span className="active-filters-badge">
              {activeFilterCount} bộ lọc
            </span>
          )}
        </div>

        <div className="filter-group">
          {/* BỘ LỌC TỈNH/THÀNH PHỐ */}
          <div className="filter-item">
            <label className="form-label">
              <i className="bi bi-geo-alt"></i> Tỉnh/Thành phố
            </label>
            <select
              className="form-select"
              value={filters.province || ''}
              onChange={(e) => onFilterChange('province', e.target.value)}
            >
              <option value="">Tất cả tỉnh/thành</option>
              {provinceOptions.map((province, idx) => (
                <option key={idx} value={province}>{province}</option>
              ))}
            </select>
          </div>

          {/* BỘ LỌC LOẠI HÌNH */}
          <div className="filter-item">
            <label className="form-label">
              <i className="bi bi-building"></i> Loại hình
            </label>
            <select
              className="form-select"
              value={filters.facilityType || ''}
              onChange={(e) => onFilterChange('facilityType', e.target.value)}
            >
              {facilityTypes.map((type, idx) => (
                <option key={idx} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* BỘ LỌC CHUYÊN KHOA */}
          <div className="filter-item">
            <label className="form-label">
              <i className="bi bi-bandaid"></i> Chuyên khoa
            </label>
            <select
              className="form-select"
              value={filters.specialty || ''}
              onChange={(e) => onFilterChange('specialty', e.target.value)}
            >
              <option value="">Tất cả chuyên khoa</option>
              {specialtyOptions.map((specialty, idx) => (
                <option key={idx} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>

          {/* BỘ LỌC BẢO HIỂM */}
          <div className="filter-item">
            <label className="form-label">
              <i className="bi bi-shield-check"></i> Bảo hiểm
            </label>
            <select
              className="form-select"
              value={filters.insurance || ''}
              onChange={(e) => onFilterChange('insurance', e.target.value)}
            >
              <option value="">Tất cả bảo hiểm</option>
              {insuranceOptions.map((insurance, idx) => (
                <option key={idx} value={insurance}>{insurance}</option>
              ))}
            </select>
          </div>

          {/* BỘ LỌC KHOẢNG GIÁ */}
          <div className="filter-item">
            <label className="form-label">
              <i className="bi bi-cash"></i> Khoảng giá
            </label>
            <select
              className="form-select"
              value={filters.priceRange}
              onChange={(e) => onFilterChange('priceRange', e.target.value)}
            >
              <option value="all">Tất cả mức giá</option>
              <option value="thấp">Giá thấp</option>
              <option value="trung bình">Giá trung bình</option>
              <option value="cao">Giá cao</option>
            </select>
          </div>

          {/* BỘ LỌC GIỜ LÀM VIỆC */}
          <div className="filter-item">
            <label className="form-label">
              <i className="bi bi-clock"></i> Giờ làm việc
            </label>
            <select
              className="form-select"
              value={filters.workingHours}
              onChange={(e) => onFilterChange('workingHours', e.target.value)}
            >
              <option value="all">Tất cả giờ</option>
              <option value="24/24">Mở cửa 24/24</option>
              <option value="hành_chinh">Giờ hành chính</option>
            </select>
          </div>
        </div>

        {/* NÚT HÀNH ĐỘNG */}
        <div className="filter-actions mt-3">
          <button
            className="btn btn-outline-secondary"
            onClick={onClearFilters}
            disabled={activeFilterCount === 0}
          >
            <i className="bi bi-x-circle"></i> Xóa lọc
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSearchWithFilters}
            disabled={activeFilterCount === 0}
          >
            <i className="bi bi-search"></i> Tìm kiếm
          </button>
        </div>

        <div className="filter-tips mt-2">
          <small className="text-muted">
            <i className="bi bi-info-circle me-1"></i>
            Chọn ít nhất 1 bộ lọc để tìm kiếm
          </small>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;