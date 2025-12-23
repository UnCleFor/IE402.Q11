import React from 'react';
import './EmergencyContacts.css';

const EmergencyContacts = () => {
  const emergencyNumbers = [
    {
      number: '115',
      label: 'Cấp cứu Y tế',
      description: 'Gọi ngay khi cần cấp cứu khẩn cấp',
      icon: 'bi bi-ambulance'
    },
    {
      number: '1900 9095',
      label: 'Tổng đài Y tế',
      description: 'Tư vấn sức khỏe và hỗ trợ thông tin',
      icon: 'bi bi-telephone'
    },
    {
      number: '1900 3228',
      label: 'Dịch tễ Khẩn cấp',
      description: 'Báo cáo ca bệnh và vùng dịch',
      icon: 'bi bi-virus'
    },
    {
      number: '111',
      label: 'Tổng đài Quốc gia',
      description: 'Bảo vệ trẻ em và hỗ trợ xã hội',
      icon: 'bi bi-heart'
    }
  ];

  return (
    <section className="emergency-contacts-section section section-light">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="section-header text-center mb-5">
              <h2 className="section-title">Số Điện Thoại Khẩn Cấp</h2>
              <p className="section-subtitle">
                Lưu ngay các số điện thoại quan trọng để sử dụng khi cần thiết
              </p>
            </div>
          </div>
        </div>

        {/* Hiển thị các thẻ số điện thoại khẩn cấp */}
        <div className="row justify-content-center">
          {emergencyNumbers.map((contact, index) => (
            <div key={index} className="col-lg-3 col-md-6 mb-4">
              <div className="emergency-contact-card">
                <div className="contact-icon">
                  <i className={contact.icon}></i>
                </div>
                <div className="contact-number">{contact.number}</div>
                <h6 className="contact-label">{contact.label}</h6>
                <p className="contact-description">{contact.description}</p>
                <a href={`tel:${contact.number}`} className="btn btn-danger btn-call">
                  <i className="bi bi-telephone-fill me-2"></i>
                  Gọi ngay
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="row mt-5">
          <div className="col-12">
            <div className="emergency-alert">
              <div className="alert-content">
                <i className="bi bi-exclamation-triangle-fill me-3"></i>
                <div>
                  <h6 className="alert-title">Lưu ý quan trọng</h6>
                  <p className="alert-message mb-0">
                    Trong trường hợp khẩn cấp, hãy gọi ngay số 115. 
                    Cung cấp đầy đủ thông tin về địa chỉ và tình trạng bệnh nhân.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmergencyContacts;