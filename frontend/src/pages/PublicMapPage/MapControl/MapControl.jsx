import React, { useState } from 'react';
import './MapControl.css';

export default function MapControls({
  onSearch,
  onFilterChange,
  onFindNearest,
  filters,
  onClose
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [radius, setRadius] = useState(5000);
  const [selectedType, setSelectedType] = useState('all');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
      setSearchTerm(''); // Clear input after search
    }
  };

  const handleFilterChange = (filterType, value) => {
    setSelectedType(value);
    onFilterChange({ ...filters, type: value });
  };

  const handleFindNearest = (type) => {
    onFindNearest(type, radius);
  };

  // Format radius for display
  const formatRadius = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}km`;
    }
    return `${value}m`;
  };

  return (
    <div className="map-controls">
      {/* Nút đóng ở góc trên bên phải */}
      <button 
        className="close-map-controls-btn"
        onClick={onClose}
        title="Đóng bộ điều khiển"
      >
        <i className="bi bi-x-lg"></i>
      </button>

      {/* Search Box */}
      <div className="control-section">
        <h4>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          Tìm kiếm
        </h4>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Nhập tên nhà thuốc, bệnh viện, địa chỉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label="Tìm kiếm địa điểm"
          />
          <button type="submit" className="search-button" aria-label="Tìm kiếm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </form>
      </div>

      {/* Filter Controls */}
      <div className="control-section">
        <h4>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
          Lọc theo loại
        </h4>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${selectedType === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('type', 'all')}
            aria-label="Hiển thị tất cả"
            aria-pressed={selectedType === 'all'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 9h6v6H9z" />
            </svg>
            Tất cả
          </button>
          <button
            className={`filter-btn ${selectedType === 'pharmacy' ? 'active' : ''}`}
            onClick={() => handleFilterChange('type', 'pharmacy')}
            aria-label="Chỉ hiển thị nhà thuốc"
            aria-pressed={selectedType === 'pharmacy'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L3 7v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-9-5z" />
              <path d="M16 10a4 4 0 1 1-8 0" />
            </svg>
            Nhà thuốc
          </button>
          <button
            className={`filter-btn ${selectedType === 'medical_facility' ? 'active' : ''}`}
            onClick={() => handleFilterChange('type', 'medical_facility')}
            aria-label="Chỉ hiển thị cơ sở y tế"
            aria-pressed={selectedType === 'medical_facility'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8z" />
              <path d="M6 13h4" />
              <path d="M8 11v4" />
            </svg>
            Cơ sở y tế
          </button>
        </div>
      </div>

      {/* Find Nearest Controls */}
      <div className="control-section">
        <h4>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Tìm kiếm gần nhất
        </h4>
        <div className="radius-control">
          <label>
            <span>Bán kính tìm kiếm:</span>
            <strong>{formatRadius(radius)}</strong>
          </label>
          <input
            type="range"
            min="500"
            max="20000"
            step="100"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            aria-label="Điều chỉnh bán kính tìm kiếm"
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#667eea',
            marginTop: '5px'
          }}>
            <span>500m</span>
            <span>20km</span>
          </div>
        </div>
        <div className="nearest-buttons">
          <button
            onClick={() => handleFindNearest('pharmacy')}
            className="nearest-btn"
            aria-label="Tìm nhà thuốc gần nhất"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L3 7v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-9-5z" />
              <path d="M16 10a4 4 0 1 1-8 0" />
            </svg>
            Nhà thuốc gần nhất
          </button>
          <button
            onClick={() => handleFindNearest('medical_facility')}
            className="nearest-btn"
            aria-label="Tìm cơ sở y tế gần nhất"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8z" />
              <path d="M6 13h4" />
              <path d="M8 11v4" />
            </svg>
            Cơ sở y tế gần nhất
          </button>
        </div>
      </div>

      {/* Info Note */}
      <div style={{
        marginTop: '15px',
        paddingTop: '10px',
        borderTop: '1px solid rgba(102, 126, 234, 0.1)',
        fontSize: '11px',
        color: '#888',
        textAlign: 'center'
      }}>
        <p>Để tìm địa điểm gần nhất, vui lòng cho phép trình duyệt truy cập vị trí của bạn.</p>
      </div>
    </div>
  );
}