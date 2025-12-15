import React from 'react';
import './ServicesSection.css';

const ServicesSection = () => {
  const services = [
    {
      icon: 'bi bi-geo-alt',
      title: 'Tìm Bệnh Viện',
      description: 'Tìm kiếm bệnh viện, phòng khám gần bạn nhất với đầy đủ thông tin chi tiết.',
      features: ['Định vị GPS', 'Giờ làm việc', 'Chuyên khoa', 'Đánh giá']
    },
    {
      icon: 'bi bi-virus',
      title: 'Theo Dõi Dịch Bệnh',
      description: 'Cập nhật thông tin các vùng dịch và cảnh báo sức khỏe cộng đồng.',
      features: ['Bản đồ dịch tễ', 'Cảnh báo khu vực', 'Số liệu thống kê', 'Khuyến cáo']
    },
    {
      icon: 'bi bi-clock',
      title: 'Đặt Lịch Khám',
      description: 'Đặt lịch khám bệnh trực tuyến với các cơ sở y tế hợp tác.',
      features: ['Đặt lịch online', 'Nhắc lịch SMS', 'Lịch sử khám', 'Hồ sơ điện tử']
    },
    {
      icon: 'bi bi-telephone',
      title: 'Tư Vấn Y Tế',
      description: 'Kết nối với bác sĩ và chuyên gia y tế để được tư vấn miễn phí.',
      features: ['Tư vấn online', 'Hỏi đáp 24/7', 'Chuyên gia', 'Bảo mật thông tin']
    },
    {
      icon: 'bi bi-file-medical',
      title: 'Tra Cứu Thuốc',
      description: 'Cơ sở dữ liệu thuốc với thông tin chi tiết về công dụng và liều dùng.',
      features: ['Danh mục thuốc', 'Tương tác thuốc', 'Giá tham khảo', 'Hướng dẫn sử dụng']
    },
    {
      icon: 'bi bi-graph-up',
      title: 'Thống Kê Sức Khỏe',
      description: 'Theo dõi và phân tích các chỉ số sức khỏe cộng đồng theo thời gian thực.',
      features: ['Biểu đồ xu hướng', 'So sánh khu vực', 'Báo cáo định kỳ', 'Dự báo dịch tễ']
    }
  ];

  return (
    <section className="services-section section section-gray">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="section-header text-center mb-5">
              <h2 className="section-title">Dịch Vụ Y Tế Trực Tuyến</h2>
              <p className="section-subtitle">
                Khám phá các dịch vụ y tế số tiện ích dành cho cộng đồng
              </p>
            </div>
          </div>
        </div>

        <div className="row">
          {services.map((service, index) => (
            <div key={index} className="col-lg-4 col-md-6 mb-4">
              <div className="service-card">
                <div className="service-icon">
                  <i className={service.icon}></i>
                </div>
                <h5 className="service-title">{service.title}</h5>
                <p className="service-description">{service.description}</p>
                <ul className="service-features">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex}>
                      <i className="bi bi-check-circle-fill"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="btn btn-outline-primary btn-sm">
                  Khám phá ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;