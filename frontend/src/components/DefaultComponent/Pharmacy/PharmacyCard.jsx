import React from "react";
import "./PharmacyCard.css";

export default function PharmacyCard({ pharmacy }) {
  return (
    <div className="pharmacy-card">
      <div className="pharmacy-header">
        <div className="pharmacy-icon">
          <i className="bi bi-hospital"></i>
        </div>
        <h3 className="pharmacy-name">{pharmacy.pharmacy_name}</h3>
      </div>

      <div className="pharmacy-info">
        <div className="address-item">
          <div className="address-icon">
            <i className="bi bi-geo-alt"></i>
          </div>
          <div className="address-content">
            <span className="address-label">Địa chỉ</span>
            <p className="address-text">{pharmacy.address}</p>
          </div>
        </div>
        
        {pharmacy.status && (
          <div className="pharmacy-status">
            <i className="bi bi-info-circle me-2"></i>
            {pharmacy.status}
          </div>
        )}
      </div>

      <div className="pharmacy-actions">
        <button className="pharmacy-btn pharmacy-btn-primary">
          <i className="bi bi-eye me-2"></i>
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}