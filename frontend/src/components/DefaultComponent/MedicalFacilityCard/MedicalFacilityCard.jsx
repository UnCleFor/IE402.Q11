import React from "react";
import "./MedicalFacilityCard.css";

export default function MedicalFacilityCard({ facility }) {
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
      'xét nghiệm': 'bi-vial',
      'chẩn đoán hình ảnh': 'bi-camera',
      'phẫu thuật': 'bi-scissors',
      'vật lý trị liệu': 'bi-person-walking',
      'tư vấn sức khỏe': 'bi-chat-dots',
      'tư vấn': 'bi-chat-dots',
      'tiêm chủng': 'bi-syringe',
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

  return (
    <div className="medical-facility-card-single full-width-card">
      <div className="facility-header">
        <div className="facility-icon">
          <i className="bi bi-hospital"></i>
        </div>
        <div>
          <h3 className="facility-name">{facility.facility_name}</h3>
          <span className={`facility-type ${facility.type_id}`}>
            {facilityType}
          </span>
        </div>
      </div>


      <div className="facility-info">
        <div className="info-item">
          <div className="info-icon">
            <i className="bi bi-geo-alt"></i>
          </div>
          <div className="info-content">
            <span className="info-label">Địa chỉ</span>
            <p className="info-text">{facility.address}</p>
          </div>
        </div>

        {facility.phone && (
          <div className="info-item">
            <div className="info-icon">
              <i className="bi bi-telephone"></i>
            </div>
            <div className="info-content">
              <span className="info-label">Điện thoại</span>
              <a href={`tel:${facility.phone}`} className="facility-phone">
                {facility.phone}
              </a>
            </div>
          </div>
        )}

        {services.length > 0 && (
          <div className="info-item services-item">
            <div className="info-icon">
              <i className="bi bi-list-check"></i>
            </div>
            <div className="info-content">
              <span className="info-label">Dịch vụ ({services.length})</span>
              <div className="services-container">
                <div className="services-grid">
                  {services.slice(0, 4).map((service, index) => (
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
                

                {services.length > 4 && (
                  <div className="more-services">
                    <div className="more-services-badge">
                      <i className="bi bi-plus-circle me-1"></i>
                      +{services.length - 4} dịch vụ khác
                    </div>

                    <div className="services-tooltip">
                      {services.map((service, index) => (
                        <div key={index} className="tooltip-service">
                          <i className={`bi ${getServiceIcon(service)} me-2`}></i>
                          {service}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="facility-footer">
        <span className={`status-badge ${status.class}`}>
          <i className="bi bi-circle-fill me-1"></i>
          {status.text}
        </span>
        
        <div className="facility-actions">
          <button className="facility-btn facility-btn-primary">
            <i className="bi bi-eye me-2"></i>
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}