import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OnlineBookingPage.css';

const OnlineBookingPage = () => {
  const navigate = useNavigate();
  
  // State cho form đặt lịch
  const [bookingData, setBookingData] = useState({
    patientName: '',
    phoneNumber: '',
    email: '',
    date: '',
    time: '',
    facility: '',
    doctor: '',
    specialty: '',
    symptoms: '',
    notes: '',
    insurance: 'none',
    isReturningPatient: false
  });

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingCode, setBookingCode] = useState('');

  // Danh sách cơ sở y tế
  const facilities = [
    { id: 1, name: 'Bệnh viện Đa khoa TP.HCM', type: 'hospital' },
    { id: 2, name: 'Phòng khám Đa khoa Quốc tế', type: 'clinic' },
    { id: 3, name: 'Trung tâm Y tế Quận 5', type: 'medical-center' },
    { id: 4, name: 'Bệnh viện Nhi Đồng', type: 'hospital' },
    { id: 5, name: 'Phòng khám Tai Mũi Họng Sài Gòn', type: 'clinic' }
  ];

  // Danh sách bác sĩ
  const doctors = [
    { id: 1, name: 'BS. Nguyễn Văn A', specialty: 'Nội tổng quát', facility: 1 },
    { id: 2, name: 'BS. Trần Thị B', specialty: 'Ngoại khoa', facility: 1 },
    { id: 3, name: 'BS. Lê Văn C', specialty: 'Nhi khoa', facility: 2 },
    { id: 4, name: 'BS. Phạm Thị D', specialty: 'Da liễu', facility: 2 },
    { id: 5, name: 'BS. Hoàng Văn E', specialty: 'Tai Mũi Họng', facility: 3 }
  ];

  // Danh sách chuyên khoa
  const specialties = [
    'Nội tổng quát', 'Ngoại khoa', 'Nhi khoa', 'Sản phụ khoa',
    'Tim mạch', 'Thần kinh', 'Da liễu', 'Tai mũi họng',
    'Răng hàm mặt', 'Mắt', 'Xét nghiệm', 'Cấp cứu'
  ];

  // Các khung giờ có sẵn
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00'
  ];

  // Danh sách bảo hiểm
  const insuranceOptions = [
    { value: 'none', label: 'Không có bảo hiểm' },
    { value: 'public', label: 'Bảo hiểm y tế' },
    { value: 'private_bv', label: 'Bảo hiểm Bảo Việt' },
    { value: 'private_prudential', label: 'Bảo hiểm Prudential' },
    { value: 'private_manulife', label: 'Bảo hiểm Manulife' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFacilityChange = (facilityId) => {
    setBookingData(prev => ({
      ...prev,
      facility: facilityId,
      doctor: ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Kiểm tra validate
    if (!bookingData.patientName || !bookingData.phoneNumber || !bookingData.date || !bookingData.time || !bookingData.facility) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    // Tạo mã booking
    const newBookingCode = 'BK-' + Date.now().toString().slice(-8);
    setBookingCode(newBookingCode);
    setShowBookingModal(true);
  };

  // Lọc bác sĩ theo cơ sở đã chọn
  const filteredDoctors = bookingData.facility 
    ? doctors.filter(doctor => doctor.facility === parseInt(bookingData.facility))
    : [];

  // Tính ngày hôm nay và ngày trong vòng 30 ngày
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Hàm đóng modal
  const handleCloseModal = () => {
    setShowBookingModal(false);
    // Reset form
    setBookingData({
      patientName: '',
      phoneNumber: '',
      email: '',
      date: '',
      time: '',
      facility: '',
      doctor: '',
      specialty: '',
      symptoms: '',
      notes: '',
      insurance: 'none',
      isReturningPatient: false
    });
  };

  // Hàm quay về trang chủ
  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="online-booking-page">
      <div className="container">
        <div className="online-booking">
          <div className="booking-header">
            <h2><i className="bi bi-calendar-check"></i> Đặt Lịch Khám Trực Tuyến</h2>
            <p className="subtitle">Đặt lịch nhanh chóng, tiện lợi với vài bước đơn giản</p>
          </div>

          <div className="booking-steps">
            <div className="step active">
              <div className="step-number">1</div>
              <div className="step-text">Thông tin bệnh nhân</div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-text">Chọn cơ sở & bác sĩ</div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-text">Chọn thời gian</div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-text">Xác nhận</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="booking-form">
            {/* Phần 1: Thông tin bệnh nhân */}
            <div className="form-section">
              <div className="section-header">
                <i className="bi bi-person-circle"></i>
                <h4>Thông Tin Bệnh Nhân</h4>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="patientName">
                      <i className="bi bi-person"></i> Họ và tên *
                    </label>
                    <input
                      type="text"
                      id="patientName"
                      name="patientName"
                      className="form-control"
                      placeholder="Nhập họ và tên đầy đủ"
                      value={bookingData.patientName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="phoneNumber">
                      <i className="bi bi-telephone"></i> Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      className="form-control"
                      placeholder="Nhập số điện thoại liên hệ"
                      value={bookingData.phoneNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="email">
                      <i className="bi bi-envelope"></i> Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      placeholder="email@example.com"
                      value={bookingData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="insurance">
                      <i className="bi bi-shield-check"></i> Bảo hiểm
                    </label>
                    <select
                      id="insurance"
                      name="insurance"
                      className="form-select"
                      value={bookingData.insurance}
                      onChange={handleChange}
                    >
                      {insuranceOptions.map((option, index) => (
                        <option key={index} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-check">
                <input
                  type="checkbox"
                  id="isReturningPatient"
                  name="isReturningPatient"
                  className="form-check-input"
                  checked={bookingData.isReturningPatient}
                  onChange={handleChange}
                />
                <label htmlFor="isReturningPatient" className="form-check-label">
                  Tôi là bệnh nhân cũ của cơ sở này
                </label>
              </div>
            </div>

            {/* Phần 2: Chọn cơ sở y tế & bác sĩ */}
            <div className="form-section">
              <div className="section-header">
                <i className="bi bi-hospital"></i>
                <h4>Chọn Cơ Sở Y Tế & Bác Sĩ</h4>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-geo-alt"></i> Chọn cơ sở y tế *
                </label>
                <div className="facilities-grid">
                  {facilities.map(facility => (
                    <div
                      key={facility.id}
                      className={`facility-card ${bookingData.facility === facility.id.toString() ? 'selected' : ''}`}
                      onClick={() => handleFacilityChange(facility.id)}
                    >
                      <div className="facility-icon">
                        <i className={`bi ${facility.type === 'hospital' ? 'bi-hospital' : 'bi-clipboard-pulse'}`}></i>
                      </div>
                      <div className="facility-info">
                        <div className="facility-name">{facility.name}</div>
                        <div className="facility-type">
                          {facility.type === 'hospital' ? 'Bệnh viện' : 
                          facility.type === 'clinic' ? 'Phòng khám' : 'Trung tâm y tế'}
                        </div>
                      </div>
                      {bookingData.facility === facility.id.toString() && (
                        <div className="selected-check">
                          <i className="bi bi-check-circle-fill"></i>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {bookingData.facility && (
                <>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="specialty">
                          <i className="bi bi-bandaid"></i> Chuyên khoa
                        </label>
                        <select
                          id="specialty"
                          name="specialty"
                          className="form-select"
                          value={bookingData.specialty}
                          onChange={handleChange}
                        >
                          <option value="">Chọn chuyên khoa (không bắt buộc)</option>
                          {specialties.map((specialty, index) => (
                            <option key={index} value={specialty}>{specialty}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="doctor">
                          <i className="bi bi-person-badge"></i> Chọn bác sĩ
                        </label>
                        <select
                          id="doctor"
                          name="doctor"
                          className="form-select"
                          value={bookingData.doctor}
                          onChange={handleChange}
                        >
                          <option value="">Chọn bác sĩ (không bắt buộc)</option>
                          {filteredDoctors.map(doctor => (
                            <option key={doctor.id} value={doctor.id}>
                              {doctor.name} - {doctor.specialty}
                            </option>
                          ))}
                        </select>
                        {!filteredDoctors.length && bookingData.facility && (
                          <small className="text-muted d-block mt-1">Vui lòng chọn cơ sở để xem danh sách bác sĩ</small>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Phần 3: Chọn thời gian khám */}
            <div className="form-section">
              <div className="section-header">
                <i className="bi bi-calendar-week"></i>
                <h4>Chọn Thời Gian Khám</h4>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="date">
                      <i className="bi bi-calendar-date"></i> Ngày khám *
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      className="form-control"
                      value={bookingData.date}
                      onChange={handleChange}
                      min={today}
                      max={maxDateStr}
                      required
                    />
                    <small className="text-muted d-block mt-1">Có thể đặt lịch trong vòng 30 ngày tới</small>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="time">
                      <i className="bi bi-clock"></i> Khung giờ *
                    </label>
                    <div className="time-slots">
                      {timeSlots.map((time, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`time-slot ${bookingData.time === time ? 'selected' : ''}`}
                          onClick={() => setBookingData(prev => ({ ...prev, time }))}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    {bookingData.time && (
                      <div className="selected-time mt-2">
                        <span>Đã chọn: </span>
                        <strong>{bookingData.time}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Phần 4: Thông tin bổ sung */}
            <div className="form-section">
              <div className="section-header">
                <i className="bi bi-clipboard-plus"></i>
                <h4>Thông Tin Bổ Sung</h4>
              </div>

              <div className="form-group">
                <label htmlFor="symptoms">
                  <i className="bi bi-heart-pulse"></i> Triệu chứng / Lý do khám
                </label>
                <textarea
                  id="symptoms"
                  name="symptoms"
                  className="form-control"
                  placeholder="Mô tả các triệu chứng bạn đang gặp phải..."
                  rows="3"
                  value={bookingData.symptoms}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">
                  <i className="bi bi-chat-left-text"></i> Ghi chú thêm (nếu có)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-control"
                  placeholder="Ghi chú hoặc yêu cầu đặc biệt..."
                  rows="2"
                  value={bookingData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Ghi chú đặt lịch */}
            <div className="booking-notes">
              <div className="note-item">
                <i className="bi bi-info-circle"></i>
                <span>Vui lòng đến trước 15 phút để làm thủ tục</span>
              </div>
              <div className="note-item">
                <i className="bi bi-info-circle"></i>
                <span>Mang theo CMND/CCCD và thẻ bảo hiểm (nếu có)</span>
              </div>
              <div className="note-item">
                <i className="bi bi-info-circle"></i>
                <span>Có thể hủy lịch trước 24h miễn phí</span>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={handleGoHome}
              >
                <i className="bi bi-arrow-left"></i> Quay lại trang chủ
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-calendar-check"></i> Đặt Lịch Ngay
              </button>
            </div>
          </form>

          {/* Thông tin bổ sung */}
          <div className="booking-info">
            <div className="info-card">
              <div className="info-icon">
                <i className="bi bi-clock-history"></i>
              </div>
              <div className="info-content">
                <h5>Lịch hẹn của bạn</h5>
                <p>Quản lý và xem lịch sử đặt lịch dễ dàng</p>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">
                <i className="bi bi-bell"></i>
              </div>
              <div className="info-content">
                <h5>Nhắc lịch thông minh</h5>
                <p>Nhận thông báo SMS và email trước cuộc hẹn</p>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">
                <i className="bi bi-shield-check"></i>
              </div>
              <div className="info-content">
                <h5>Bảo mật thông tin</h5>
                <p>Thông tin cá nhân được mã hóa và bảo vệ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Đặt Lịch Thành Công */}
      {showBookingModal && (
        <div className="booking-success-modal">
          <div className="modal-overlay" onClick={handleCloseModal}></div>
          
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-check-circle-fill text-success me-2"></i>
                Đặt Lịch Thành Công!
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={handleCloseModal}
              ></button>
            </div>
            
            <div className="modal-body">
              <div className="booking-confirmation-card">
                <div className="success-icon">
                  <i className="bi bi-check-circle"></i>
                </div>
                
                <h4 className="text-center mb-4">Đặt lịch khám thành công!</h4>
                
                <div className="confirmation-details">
                  <div className="confirmation-row">
                    <div className="confirmation-label">
                      <i className="bi bi-ticket-detailed"></i>
                      Mã đặt lịch:
                    </div>
                    <div className="confirmation-value">
                      <strong className="booking-code">{bookingCode}</strong>
                    </div>
                  </div>
                  
                  <div className="confirmation-row">
                    <div className="confirmation-label">
                      <i className="bi bi-building"></i>
                      Cơ sở y tế:
                    </div>
                    <div className="confirmation-value">
                      {facilities.find(f => f.id === parseInt(bookingData.facility))?.name}
                    </div>
                  </div>
                  
                  <div className="confirmation-row">
                    <div className="confirmation-label">
                      <i className="bi bi-person"></i>
                      Bệnh nhân:
                    </div>
                    <div className="confirmation-value">
                      {bookingData.patientName}
                    </div>
                  </div>
                  
                  <div className="confirmation-row">
                    <div className="confirmation-label">
                      <i className="bi bi-calendar"></i>
                      Ngày khám:
                    </div>
                    <div className="confirmation-value">
                      {bookingData.date}
                    </div>
                  </div>
                  
                  <div className="confirmation-row">
                    <div className="confirmation-label">
                      <i className="bi bi-clock"></i>
                      Giờ khám:
                    </div>
                    <div className="confirmation-value">
                      {bookingData.time}
                    </div>
                  </div>
                  
                  {bookingData.doctor && (
                    <div className="confirmation-row">
                      <div className="confirmation-label">
                        <i className="bi bi-person-badge"></i>
                        Bác sĩ:
                      </div>
                      <div className="confirmation-value">
                        {doctors.find(d => d.id === parseInt(bookingData.doctor))?.name}
                      </div>
                    </div>
                  )}
                  
                  {bookingData.specialty && (
                    <div className="confirmation-row">
                      <div className="confirmation-label">
                        <i className="bi bi-heart-pulse"></i>
                        Chuyên khoa:
                      </div>
                      <div className="confirmation-value">
                        {bookingData.specialty}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="confirmation-notes mt-4">
                  <h6><i className="bi bi-info-circle me-2"></i>Lưu ý quan trọng:</h6>
                  <ul>
                    <li>Vui lòng đến trước 15 phút để làm thủ tục</li>
                    <li>Mang theo CMND/CCCD và thẻ bảo hiểm (nếu có)</li>
                    <li>Thông tin lịch hẹn đã được gửi qua SMS/Email</li>
                    <li>Có thể hủy lịch trước 24h miễn phí</li>
                    <li>Mang theo mã đặt lịch ({bookingCode}) khi đến khám</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleCloseModal}
              >
                <i className="bi bi-house me-2"></i>Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineBookingPage;