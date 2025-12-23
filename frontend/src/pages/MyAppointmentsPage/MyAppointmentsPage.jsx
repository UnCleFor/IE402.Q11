import React, { useState } from 'react';
import './MyAppointmentsPage.css';

const MyAppointments = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Dữ liệu mẫu - Lịch hẹn
  const appointmentData = {
    upcoming: [
      {
        id: 1,
        doctor: 'BS. Nguyễn Văn A',
        specialty: 'Nội tổng quát',
        facility: 'Bệnh viện Đa khoa Quốc tế Vinmec',
        date: '15/03/2024',
        time: '09:30',
        
        address: '458 Minh Khai, Hai Bà Trưng, Hà Nội',
        phone: '024 3974 3556',
        note: 'Khám tổng quát định kỳ 6 tháng',
        type: 'khám mới',
        code: 'APPT-2024-001'
      },
      {
        id: 2,
        doctor: 'TS. Trần Thị B',
        specialty: 'Tim mạch',
        facility: 'Bệnh viện Bạch Mai',
        date: '18/03/2024',
        time: '14:00',
        
        address: '78 Giải Phóng, Đống Đa, Hà Nội',
        phone: '024 3869 3731',
        note: 'Tái khám theo dõi huyết áp',
        type: 'tái khám',
        code: 'APPT-2024-002'
      },
      {
        id: 3,
        doctor: 'ThS. Lê Văn C',
        specialty: 'Da liễu',
        facility: 'Phòng khám Da liễu Hà Nội',
        date: '20/03/2024',
        time: '10:15',
        
        address: '79B Nguyễn Khuyến, Văn Miếu, Hà Nội',
        phone: '024 3734 7934',
        note: 'Điều trị mụn',
        type: 'khám mới',
        code: 'APPT-2024-003'
      }
    ],
    completed: [
      {
        id: 4,
        doctor: 'BS. Phạm Thị D',
        specialty: 'Nhi khoa',
        facility: 'Bệnh viện Nhi Trung ương',
        date: '05/03/2024',
        time: '08:45',
        
        address: '18/879 La Thành, Đống Đa, Hà Nội',
        phone: '024 6273 8532',
        note: 'Khám cho bé 5 tuổi',
        type: 'tái khám',
        code: 'APPT-2024-004',
        diagnosis: 'Viêm họng cấp',
        prescription: 'Thuốc kháng sinh, hạ sốt'
      },
      {
        id: 5,
        doctor: 'BS. Hoàng Văn E',
        specialty: 'Răng hàm mặt',
        facility: 'Nha khoa Paris',
        date: '28/02/2024',
        time: '13:30',
      
        address: '12 Quang Trung, Hoàn Kiếm, Hà Nội',
        phone: '024 3927 3399',
        note: 'Khám và lấy cao răng',
        type: 'khám mới',
        code: 'APPT-2024-005',
        diagnosis: 'Cao răng nhiều',
        prescription: 'Vệ sinh răng miệng định kỳ'
      }
    ],
    cancelled: [
      {
        id: 6,
        doctor: 'BS. Nguyễn Thị F',
        specialty: 'Sản phụ khoa',
        facility: 'Bệnh viện Phụ sản Trung ương',
        date: '10/03/2024',
        time: '11:00',
        
        address: '43 Tràng Thi, Hoàn Kiếm, Hà Nội',
        phone: '024 3825 2161',
        note: 'Khám thai định kỳ',
        type: 'tái khám',
        code: 'APPT-2024-006',
        cancelReason: 'Bận công việc đột xuất'
      }
    ]
  };

  // Thống kê
  const stats = {
    total: appointmentData.upcoming.length + appointmentData.completed.length + appointmentData.cancelled.length,
    upcoming: appointmentData.upcoming.length,
    completed: appointmentData.completed.length,
    cancelled: appointmentData.cancelled.length
  };

  // Xử lý hủy lịch hẹn
  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) {
      alert('Đã gửi yêu cầu hủy lịch hẹn. Nhân viên sẽ liên hệ xác nhận.');
    }
  };

  // Xử lý đổi lịch
  const handleReschedule = (appointmentId) => {
    setSelectedAppointment(appointmentData.upcoming.find(a => a.id === appointmentId));
    alert(`Đang chuyển đến trang đổi lịch cho mã: ${appointmentId}`);
  };

  // Xem chi tiết
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
  };

  // Đóng modal chi tiết
  const handleCloseModal = () => {
    setSelectedAppointment(null);
  };



  // Lấy loại lịch hẹn
  const getTypeBadge = (type) => {
    const typeConfig = {
      'khám mới': { label: 'Khám mới', class: 'primary' },
      'tái khám': { label: 'Tái khám', class: 'info' },
      'cấp cứu': { label: 'Cấp cứu', class: 'danger' }
    };
    
    const config = typeConfig[type] || { label: type, class: 'secondary' };
    return <span className={`badge bg-${config.class}`}>{config.label}</span>;
  };

  return (
    <div className="my-appointments-page">
      <div className="main-content-container">
        {/* Header */}
        <div className="section-header">
          <div className="header-content">
            <h2><i className="bi bi-calendar-check me-2"></i>Lịch hẹn của tôi</h2>
            
          </div>
        </div>

        {/* Quick Stats */}
        <div className="appointment-stats-container">
          <div className="appointment-stats-overview">
            <div className="stat-item">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Tổng lịch hẹn</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.upcoming}</div>
              <div className="stat-label">Sắp tới</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.completed}</div>
              <div className="stat-label">Đã hoàn thành</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.cancelled}</div>
              <div className="stat-label">Đã huỷ</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="appointment-tabs-container">
          <div className="appointment-tabs">
            <button 
              className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              <i className="bi bi-clock me-2"></i>
              Sắp tới ({stats.upcoming})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              <i className="bi bi-check-circle me-2"></i>
              Đã hoàn thành ({stats.completed})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
              onClick={() => setActiveTab('cancelled')}
            >
              <i className="bi bi-x-circle me-2"></i>
              Đã huỷ ({stats.cancelled})
            </button>
          </div>
        </div>

        {/* Appointment List */}
        <div className="appointment-list-container">
          <div className="appointment-list">
            {appointmentData[activeTab].length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-calendar-x"></i>
                <h5>Không có lịch hẹn nào</h5>
                <p>
                  {activeTab === 'upcoming' && 'Bạn chưa có lịch hẹn nào sắp tới'}
                  {activeTab === 'completed' && 'Bạn chưa có lịch hẹn nào đã hoàn thành'}
                  {activeTab === 'cancelled' && 'Bạn chưa hủy lịch hẹn nào'}
                </p>
                <button className="btn btn-primary mt-3">
                  <i className="bi bi-plus-circle me-2"></i>
                  Đặt lịch ngay
                </button>
              </div>
            ) : (
              <div className="appointment-cards">
                {appointmentData[activeTab].map(appointment => (
                  <div key={appointment.id} className="appointment-card">
                    <div className="card-header">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="mb-1">{appointment.doctor}</h5>
                          <p className="text-muted mb-0">{appointment.specialty}</p>
                        </div>
                        <div className="text-end">
                          
                          <small className="text-muted">{getTypeBadge(appointment.type)}</small>
                        </div>
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <div className="appointment-info">
                        <div className="info-row">
                          <i className="bi bi-hospital"></i>
                          <div>
                            <strong>Cơ sở y tế:</strong>
                            <p className="mb-0">{appointment.facility}</p>
                          </div>
                        </div>
                        
                        <div className="info-row">
                          <i className="bi bi-calendar"></i>
                          <div>
                            <strong>Thời gian:</strong>
                            <p className="mb-0">{appointment.date} lúc {appointment.time}</p>
                          </div>
                        </div>
                        
                        <div className="info-row">
                          <i className="bi bi-geo-alt"></i>
                          <div>
                            <strong>Địa chỉ:</strong>
                            <p className="mb-0">{appointment.address}</p>
                          </div>
                        </div>
                        
                        {appointment.note && (
                          <div className="info-row">
                            <i className="bi bi-card-text"></i>
                            <div>
                              <strong>Ghi chú:</strong>
                              <p className="mb-0">{appointment.note}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="info-row">
                          <i className="bi bi-upc-scan"></i>
                          <div>
                            <strong>Mã lịch hẹn:</strong>
                            <p className="mb-0">{appointment.code}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="card-footer">
                      <div className="action-buttons">
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleViewDetails(appointment)}
                        >
                          <i className="bi bi-eye me-1"></i> Chi tiết
                        </button>
                        
                        {activeTab === 'upcoming' && appointment.status !== 'cancelled' && (
                          <>
                            <button 
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleCancelAppointment(appointment.id)}
                            >
                              <i className="bi bi-x-circle me-1"></i> Huỷ lịch
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal chi tiết */}
      {selectedAppointment && (
        <div className="modal-overlay active">
          <div className="modal-container">
            <div className="modal-content large">
              <div className="modal-header">
                <h5>Chi tiết lịch hẹn</h5>
                <button className="btn-close" onClick={handleCloseModal}></button>
              </div>
              
              <div className="modal-body">
                <div className="appointment-details">
                  <div className="detail-section">
                    <h6><i className="bi bi-info-circle me-2"></i>Thông tin chung</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Mã lịch hẹn:</strong> {selectedAppointment.code}</p>
                        
                        <p><strong>Loại lịch hẹn:</strong> {getTypeBadge(selectedAppointment.type)}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Ngày hẹn:</strong> {selectedAppointment.date}</p>
                        <p><strong>Giờ hẹn:</strong> {selectedAppointment.time}</p>
                        <p><strong>Ngày đặt:</strong> 10/03/2024</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h6><i className="bi bi-person-badge me-2"></i>Thông tin bác sĩ</h6>
                    <p><strong>Bác sĩ:</strong> {selectedAppointment.doctor}</p>
                    <p><strong>Chuyên khoa:</strong> {selectedAppointment.specialty}</p>
                    <p><strong>Điện thoại:</strong> {selectedAppointment.phone}</p>
                  </div>
                  
                  <div className="detail-section">
                    <h6><i className="bi bi-hospital me-2"></i>Thông tin cơ sở y tế</h6>
                    <p><strong>Tên cơ sở:</strong> {selectedAppointment.facility}</p>
                    <p><strong>Địa chỉ:</strong> {selectedAppointment.address}</p>
                    <p><strong>Ghi chú:</strong> {selectedAppointment.note}</p>
                  </div>
                  
                  {selectedAppointment.diagnosis && (
                    <div className="detail-section">
                      <h6><i className="bi bi-clipboard-check me-2"></i>Kết quả khám</h6>
                      <p><strong>Chẩn đoán:</strong> {selectedAppointment.diagnosis}</p>
                      {selectedAppointment.prescription && (
                        <p><strong>Đơn thuốc:</strong> {selectedAppointment.prescription}</p>
                      )}
                    </div>
                  )}
                  
                  {selectedAppointment.cancelReason && (
                    <div className="detail-section">
                      <h6><i className="bi bi-x-octagon me-2"></i>Lý do hủy</h6>
                      <p>{selectedAppointment.cancelReason}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseModal}>
                  Đóng
                </button>
                {activeTab === 'upcoming' && selectedAppointment.status !== 'cancelled' && (
                  <>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;