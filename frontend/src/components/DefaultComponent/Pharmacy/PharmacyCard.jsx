import React, { useState } from "react";
import "./PharmacyCard.css";

export default function PharmacyCard({ pharmacy, provinces }) {
  const [showDetail, setShowDetail] = useState(false);
  
  // Tìm tỉnh/thành phố dựa trên province_id
  const getProvinceInfo = () => {
    if (!pharmacy.province_id || !provinces) return null;
    return provinces.find(p => p.province_id === pharmacy.province_id);
  };

  const province = getProvinceInfo();

  return (
    <>
      {/* Card nhà thuốc */}
      <div className="pharmacy-card">
        <div className="pharmacy-header">
          <div className="pharmacy-icon">
            <i className="bi bi-capsule"></i>
          </div>
          <h3 className="pharmacy-name">{pharmacy.pharmacy_name}</h3>
        </div>

        <div className="pharmacy-actions">
          <button 
            className="pharmacy-btn pharmacy-btn-primary"
            onClick={() => setShowDetail(true)}
          >
            <i className="bi bi-eye me-2"></i>
            Xem chi tiết
          </button>
        </div>
      </div>

      {/* Modal chi tiết */}
      {showDetail && (
        <div className="pharmacy-detail-modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="pharmacy-detail-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-icon">
                <i className="bi bi-capsule"></i>
              </div>
              <div className="modal-title">
                <h3 className="modal-pharmacy-name">{pharmacy.pharmacy_name}</h3>
              </div>
              <button className="modal-close" onClick={() => setShowDetail(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Thông tin cơ bản */}
              <div className="info-section">
                <h4 className="section-title">
                  <i className="bi bi-info-circle me-2"></i>
                  Thông tin cơ bản
                </h4>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-icon">
                      <i className="bi bi-geo-alt"></i>
                    </div>
                    <div className="info-content">
                      <span className="info-label">Địa chỉ: </span>
                      <p className="info-text">{pharmacy.address || "Đang cập nhật"}</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Thông tin tỉnh thành chi tiết */}
              {province && (
                <div className="info-section">
                  <h4 className="section-title">
                    <i className="bi bi-map me-2"></i>
                    Thông tin tỉnh thành
                  </h4>
                  <div className="province-info">
                    <div className="province-item">
                      <span className="province-label">Tên tỉnh:</span>
                      <span className="province-value">{province.province_name}</span>
                    </div>
                    <div className="province-item">
                      <span className="province-label">Mã tỉnh:</span>
                      <span className="province-value">{province.province_id}</span>
                    </div>
                    <div className="province-item">
                      <span className="province-label">Viết tắt:</span>
                      <span className="province-value">{province.province_abbr}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button 
                className="modal-btn modal-btn-secondary" 
                onClick={() => setShowDetail(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}