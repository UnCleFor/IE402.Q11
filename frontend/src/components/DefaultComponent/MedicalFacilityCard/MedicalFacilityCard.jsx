import React, { useState } from "react";
import "./MedicalFacilityCard.css";

export default function MedicalFacilityCard({ facility }) {
  const [showDetail, setShowDetail] = useState(false);

  const getFacilityType = () => {
    const typeMap = {
      'hospital': 'Bệnh viện',
      'clinic': 'Phòng khám',
      'health_center': 'Trung tâm y tế',
      'pharmacy': 'Nhà thuốc',
      'emergency': 'Cấp cứu'
    };
    
    return typeMap[facility.type_id] || facility.type_id || 'Cơ sở y tế';
  };

  const getStatusBadge = () => {
    switch(facility.status) {
      case 'active':
        return { text: 'Hoạt động', class: 'status-active' };
      case 'inactive':
        return { text: 'Ngừng hoạt động', class: 'status-inactive' };
      case 'maintenance':
        return { text: 'Bảo trì', class: 'status-maintenance' };
      default:
        return { text: facility.status || 'Không rõ', class: 'status-unknown' };
    }
  };

  const getServices = () => {
    try {
      if (Array.isArray(facility.services)) {
        return facility.services;
      }
      
      if (typeof facility.services === 'string') {
        const parsed = JSON.parse(facility.services);
        return Array.isArray(parsed) ? parsed : [];
      }
      
      return [];
    } catch (err) {
      if (typeof facility.services === 'string') {
        return facility.services
          .split(/[,;]/)
          .map(s => s.trim())
          .filter(s => s.length > 0);
      }
      return [];
    }
  };

  const facilityType = getFacilityType();
  const status = getStatusBadge();
  const services = getServices();

  const getServiceIcon = (service) => {
    const iconMap = {
      'khám tổng quát': 'bi-heart-pulse',
      'khám nội tổng quát': 'bi-heart-pulse',
      'cấp cứu 24/7': 'bi-alarm',
      'xét nghiệm': 'bi-chat-dots',
      'chẩn đoán hình ảnh': 'bi-camera',
      'phẫu thuật': 'bi-scissors',
      'vật lý trị liệu': 'bi-person-walking',
      'tư vấn sức khỏe': 'bi-chat-dots',
      'tư vấn': 'bi-chat-dots',
      'tiêm chủng': 'bi bi-virus',
      'sản phụ khoa': 'bi-baby',
      'nhi khoa': 'bi-emoji-smile'
    };

    const serviceLower = service.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (serviceLower.includes(key)) {
        return icon;
      }
    }
    
    return 'bi-check-circle'; 
  };

  const getServiceColor = (index) => {
    const colors = [
      'var(--primary)', 
      '#4CAF50',        
      '#2196F3',       
      '#FF9800',        
      '#9C27B0',       
      '#F44336',        
      '#009688',        
      '#673AB7',        
      '#FF5722',        
      '#795548'         
    ];
    return colors[index % colors.length];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Không có";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Card chỉ hiển thị tên */}
      <div className="medical-facility-card-single full-width-card">
        <div className="facility-header">
          <div className="facility-icon">
            <i className="bi bi-hospital"></i>
          </div>
          <div className="facility-name-only">
            <h3 className="facility-name">{facility.facility_name}</h3>
          </div>
        </div>

        <div className="facility-footer">
          <span className={`status-badge ${status.class}`}>
            <i className="bi bi-circle-fill me-1"></i>
            {status.text}
          </span>
          
          <div className="facility-actions">
            <button 
              className="facility-btn facility-btn-primary"
              onClick={() => setShowDetail(true)}
            >
              <i className="bi bi-eye me-2"></i>
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>

      {/* Modal chi tiết */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="facility-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <i className="bi bi-hospital me-2"></i>
                Chi tiết cơ sở y tế
              </h3>
              <button 
                className="modal-close-btn"
                onClick={() => setShowDetail(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h4 className="detail-section-title">Thông tin cơ bản</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Tên cơ sở:</span>
                    <span className="detail-value">{facility.facility_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Loại cơ sở:</span>
                    <span className="facility-type">{facilityType}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Trạng thái:</span>
                    <span className={`status-badge ${status.class}`}>
                      <i className="bi bi-circle-fill me-1"></i>
                      {status.text}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4 className="detail-section-title">Thông tin liên hệ</h4>
                <div className="detail-grid">
                  <div className="detail-item full-width">
                    <span className="detail-label">Địa chỉ:</span>
                    <span className="detail-value">{facility.address || "Không có"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Điện thoại:</span>
                    {facility.phone ? (
                      <a href={`tel:${facility.phone}`} className="facility-phone">
                        <i className="bi bi-telephone me-1"></i>
                        {facility.phone}
                      </a>
                    ) : (
                      <span className="detail-value">Không có</span>
                    )}
                  </div>
                </div>
              </div>

              {services.length > 0 && (
                <div className="detail-section">
                  <h4 className="detail-section-title">Dịch vụ ({services.length})</h4>
                  <div className="services-detail-grid">
                    {services.map((service, index) => (
                      <div 
                        key={index} 
                        className="service-badge"
                        style={{ borderLeftColor: getServiceColor(index) }}
                      >
                        <i className={`bi ${getServiceIcon(service)} me-1`}></i>
                        <span className="service-text">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="facility-btn facility-btn-secondary"
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