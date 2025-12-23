import React, { useState } from 'react';
import './SearchSection.css';

const SearchSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');

  const facilityTypes = [
    'Tất cả loại hình',
    'Bệnh viện',
    'Phòng khám',
    'Trung tâm y tế',
    'Nhà thuốc'
  ];

  const provinces = [
    'Tất cả tỉnh thành',
    'Hà Nội',
    'TP. Hồ Chí Minh',
    'Đà Nẵng',
    'Hải Phòng',
    'Cần Thơ'
  ];

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <section id="search" className="search-section section section-gray">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="section-header text-center mb-5">
              <h2 className="section-title">Tìm Kiếm Cơ Sở Y Tế</h2>
              <p className="section-subtitle">
                Tìm kiếm nhanh chóng các cơ sở y tế phù hợp với nhu cầu của bạn
              </p>
            </div>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="search-card">
              <form onSubmit={handleSearch}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label">
                        <i className="bi bi-search me-2"></i>
                        Từ khóa tìm kiếm
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Tên bệnh viện, địa chỉ, chuyên khoa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-3">
                    <div className="form-group">
                      <label className="form-label">
                        <i className="bi bi-building me-2"></i>
                        Loại hình
                      </label>
                      <select
                        className="form-select form-select-lg"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                      >
                        {facilityTypes.map((type, index) => (
                          <option key={index} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="col-md-3">
                    <div className="form-group">
                      <label className="form-label">
                        <i className="bi bi-geo-alt me-2"></i>
                        Tỉnh/Thành phố
                      </label>
                      <select
                        className="form-select form-select-lg"
                        value={selectedProvince}
                        onChange={(e) => setSelectedProvince(e.target.value)}
                      >
                        {provinces.map((province, index) => (
                          <option key={index} value={province}>
                            {province}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="col-md-2">
                    <div className="form-group">
                      <label className="form-label d-none d-md-block">&nbsp;</label>
                      <button type="submit" className="btn btn-primary btn-lg w-100">
                        <i className="bi bi-search me-2"></i>
                        Tìm kiếm
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Quick Search Suggestions */}
            <div className="quick-search mt-4">
              <h6 className="quick-search-title">Tìm kiếm nhanh:</h6>
              <div className="quick-search-tags">
                {[
                  'Cấp cứu 24/7',
                  'Khám tim mạch',
                  'Nha khoa',
                  'Da liễu',
                  'Sản phụ khoa',
                  'Nhi khoa'
                ].map((tag, index) => (
                  <button
                    key={index}
                    className="btn btn-outline-primary btn-sm me-2 mb-2"
                    onClick={() => setSearchTerm(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;