import React, { useState } from 'react';
import MapPicker from '../../MapComponents/MapPicker/MapPicker';
import './FacilityForm.css';

const FacilityForm = ({ onSubmit, initialData, mode = 'create' }) => {
  // Đảm bảo workingHours luôn có giá trị mặc định
  const defaultFormData = {
    name: '',
    type: 'hospital',
    address: '',
    phone: '',
    province: '',
    services: [],
    workingHours: {
      morning: { start: '07:00', end: '12:00' },
      afternoon: { start: '13:00', end: '17:00' }
    },
    location: null
  };

  const [formData, setFormData] = useState({
    ...defaultFormData,
    ...initialData, // Ghi đè bằng initialData nếu có
    workingHours: {
      ...defaultFormData.workingHours,
      ...(initialData?.workingHours || {}) // Đảm bảo workingHours luôn tồn tại
    }
  });

  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const facilityTypes = [
    { value: 'hospital', label: 'Bệnh viện', icon: 'bi bi-hospital' },
    { value: 'clinic', label: 'Phòng khám', icon: 'bi bi-plus-circle' },
    { value: 'medical_center', label: 'Trung tâm y tế', icon: 'bi bi-building' },
    { value: 'pharmacy', label: 'Nhà thuốc', icon: 'bi bi-capsule' }
  ];
  const provinces = [
  "Hà Nội",
  "Hải Phòng",
  "Đà Nẵng",
  "TP. Hồ Chí Minh",
  "Cần Thơ",
  "Tuyên Quang",
  "Lào Cai",
  "Thái Nguyên", 
  "Phú Thọ",
  "Bắc Ninh",  
  "Hưng Yên",
  "Ninh Bình",  
  "Quảng Trị",
  "Quảng Ngãi",  
  "Gia Lai",  
  "Khánh Hòa",  
  "Lâm Đồng",
  "Đắk Lắk",
  "Đồng Nai",
  "Tây Ninh",
  "Vĩnh Long",
  "An Giang",
  "Đồng Tháp",
  "Cà Mau"
];


  const [selectedServices, setSelectedServices] = useState([]);
  const serviceOptions = [
    'Khám tổng quát',
    'Cấp cứu 24/7',
    'Xét nghiệm',
    'Chẩn đoán hình ảnh',
    'Phẫu thuật',
    'Vật lý trị liệu',
    'Tư vấn sức khỏe',
    'Tiêm chủng',
    'Sản phụ khoa',
    'Nhi khoa'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      location,
      address: location.address
    }));
  };

  const toggleService = (service) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  // Hàm xử lý thay đổi giờ làm việc an toàn
  const handleWorkingHoursChange = (period, timeType, value) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [period]: {
          ...(prev.workingHours?.[period] || {}), // Đảm bảo period tồn tại
          [timeType]: value
        }
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      services: selectedServices
    });
  };



  // Đảm bảo workingHours luôn có giá trị
  const workingHours = formData.workingHours || defaultFormData.workingHours;
  const morningHours = workingHours.morning || defaultFormData.workingHours.morning;
  const afternoonHours = workingHours.afternoon || defaultFormData.workingHours.afternoon;

  return (
    <div className="facility-form">
      <div className="form-header">
        <h4>
          {mode === 'create' ? 'Thêm Cơ Sở Y Tế Mới' : 'Chỉnh Sửa Cơ Sở Y Tế'}
        </h4>
        <div className="step-indicator">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
            <span>1</span>
            Thông tin cơ bản
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            <span>2</span>
            Vị trí
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <span>3</span>
            Hoàn tất
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Thông tin cơ bản */}
        {currentStep === 1 && (
          <div className="form-step">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Tên cơ sở y tế *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="VD: Bệnh viện Bạch Mai"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tỉnh/Thành phố *</label>
                  <select
                    className="form-control mt-3"
                    value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    required
                  >
                    <option value="">-- Chọn tỉnh/thành --</option>
                    {provinces.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

 

              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label>Loại hình cơ sở *</label>
                  <div className="type-selector">
                    {facilityTypes.map(type => (
                      <div
                        key={type.value}
                        className={`type-option ${formData.type === type.value ? 'selected' : ''}`}
                        onClick={() => handleInputChange('type', type.value)}
                      >
                        <i className={type.icon}></i>
                        <span>{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
                <div className="form-group">
                    <label>Địa chỉ chi tiết *</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      required
                    />
                </div>
            </div>

            <div className="row">
                {formData.type !== 'pharmacy' && (
                  <>
                  <div className="form-group">
                      <label>Số điện thoại *</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="VD: 024 3869 3731"
                        required
                      />
                  </div>
                  <div className="form-group">
                  <label>Dịch vụ cung cấp</label>
                  <div className="services-selector">
                    {serviceOptions.map(service => (
                      <div
                        key={service}
                        className={`service-option ${selectedServices.includes(service) ? 'selected' : ''}`}
                        onClick={() => toggleService(service)}
                      >
                        <i className="bi bi-check-circle-fill"></i>
                        <span>{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
                </>
                )}             
            </div>

            
            <div className="form-actions">
              <button type="button" className="btn btn-primary ms-auto" onClick={nextStep}>
                Tiếp theo <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>            
          </div>
        )}

        {/* Step 2: Vị trí*/}
        {currentStep === 2 && (
          <div className="form-step">
            <div className="form-group">
              <label>Chọn vị trí trên bản đồ *</label>
              <MapPicker
                onLocationSelect={handleLocationSelect}
                initialLocation={formData.location}
                height="300px"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline-secondary" onClick={prevStep}>
                <i className="bi bi-arrow-left me-1"></i> Quay lại
              </button>
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Tiếp theo <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Hoàn tất */}
        {currentStep === 3 && (
          <div className="form-step">


            {/* <div className="form-group">
              <label>Giờ làm việc</label>
              <div className="working-hours">
                <div className="time-slot">
                  <label>Buổi sáng</label>
                  <div className="time-inputs">
                    <input
                      type="time"
                      value={morningHours.start}
                      onChange={(e) => handleWorkingHoursChange('morning', 'start', e.target.value)}
                    />
                    <span>đến</span>
                    <input
                      type="time"
                      value={morningHours.end}
                      onChange={(e) => handleWorkingHoursChange('morning', 'end', e.target.value)}
                    />
                  </div>
                </div>
                <div className="time-slot">
                  <label>Buổi chiều</label>
                  <div className="time-inputs">
                    <input
                      type="time"
                      value={afternoonHours.start}
                      onChange={(e) => handleWorkingHoursChange('afternoon', 'start', e.target.value)}
                    />
                    <span>đến</span>
                    <input
                      type="time"
                      value={afternoonHours.end}
                      onChange={(e) => handleWorkingHoursChange('afternoon', 'end', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div> */}

            <div className= "form-group">
              <label>Tóm tắt thông tin:</label>   

              <div className="form-summary">
                <div className="summary-grid">
                  <div className="summary-item">
                    <label>Tên cơ sở:</label>
                    <span>{formData.name || '(Chưa nhập tên)'}</span>
                  </div>
                  <div className="summary-item">
                    <label>Loại hình:</label>
                    <span>{facilityTypes.find(t => t.value === formData.type)?.label}</span>
                  </div>
                  <div className="summary-item">
                    <label>Số điện thoại:</label>
                    <span>{formData.phone || '(Chưa nhập số điện thoại)'}</span>
                  </div>
                  { formData.type !== 'pharmacy' && (
                    <div className="summary-item">
                      <label>Dịch vụ:</label>
                      <span>{selectedServices.length} dịch vụ</span>
                    </div>
                  )}
                  <div className="summary-item" style={{ gridColumn: "span 2" }}>
                    <label>Địa chỉ:</label>
                    <span>{formData.address || '(Chưa nhập địa chỉ)'}</span>
                  </div>                
                </div>
              </div>  
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline-secondary" onClick={prevStep}>
                <i className="bi bi-arrow-left me-1"></i> Quay lại
              </button>
              <button type="submit" className="btn btn-success">
                <i className="bi bi-check-circle me-1"></i>
                {mode === 'create' ? 'Thêm cơ sở' : 'Cập nhật'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default FacilityForm;