import React, { useState, useEffect, useMemo } from 'react'; // THÊM useEffect
import MapPicker from '../../MapComponents/MapPicker/MapPicker';
import './FacilityForm.css';
import { jwtDecode } from "jwt-decode";

const FacilityForm = ({ onSubmit, initialData, mode = 'create' }) => {
  // Đảm bảo workingHours luôn có giá trị mặc định
  const defaultFormData = {
    name: '',
    type: 'hospital',
    address: '',
    phone: '',
    province: '',
    services: [],
  };

  const token = localStorage.getItem("authToken");
  
  let decodedToken = null;
  if (token) {
    decodedToken = jwtDecode(token);
  }
  const userId = decodedToken?.user_id;

  // THÊM: state cho selectedServices và formData
  const [formData, setFormData] = useState(defaultFormData);
  const [selectedServices, setSelectedServices] = useState([]);

  // THÊM: useEffect để xử lý initialData khi mode edit
  useEffect(() => {
    console.log("=== FACILITY FORM DEBUG ===");
    console.log("Mode:", mode);
    console.log("InitialData received:", initialData);
    console.log("Has facility_id?", initialData?.facility_id);
    console.log("Has id?", initialData?.id);
    console.log("Has facility_name?", initialData?.facility_name);
    console.log("Has name?", initialData?.name);
    console.log("Has services?", initialData?.services);
    
    if (mode === 'edit' && initialData) {
      // Map dữ liệu từ API vào form
      const servicesArray = Array.isArray(initialData.services) 
        ? initialData.services 
        : (typeof initialData.services === 'string' 
            ? JSON.parse(initialData.services || '[]') 
            : []);
      
      setSelectedServices(servicesArray);
      
      // Trong useEffect, sửa phần map location:
      setFormData({
        name: initialData.facility_name || initialData.name || '',
        type: initialData.type_id || initialData.type || 'hospital',
        address: initialData.address || '',
        phone: initialData.phone || '',
        province: initialData.province_id || initialData.province || '',
        // SỬA: Xử lý location an toàn
        location: initialData.facility_point_id || initialData.location || null,
        workingHours: initialData.workingHours || defaultFormData.workingHours
      });
      
      console.log("Form data after mapping:", {
        name: initialData.facility_name || initialData.name,
        type: initialData.type_id || initialData.type,
        address: initialData.address,
        phone: initialData.phone,
        province: initialData.province_id || initialData.province,
        servicesCount: servicesArray.length
      });
    } else {
      // Reset cho create mode
      setFormData(defaultFormData);
      setSelectedServices([]);
    }
  }, [initialData, mode]);

  const [currentStep, setCurrentStep] = useState(1);
  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const facilityTypes = [
    { value: 'Bệnh viện', label: 'Bệnh viện', icon: 'bi bi-hospital' },
    { value: 'Phòng khám', label: 'Phòng khám', icon: 'bi bi-plus-circle' },
    { value: 'Trung tâm y tế', label: 'Trung tâm y tế', icon: 'bi bi-building' },
  ];
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/provinces")
      .then(res => res.json())
      .then(data => setProvinces(data));
  }, []);

  const provinceMap = useMemo(() => {
  const map = {};
  provinces.forEach(p => {
    map[String(p.province_id)] = p.province_name;
  });
  return map;
}, [provinces]);

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

  const handleLocationSelect = (point) => {
    setFormData(prev => ({
      ...prev,
      location: point
    }));
  };

  const toggleService = (service) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleWorkingHoursChange = (period, timeType, value) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [period]: {
          ...(prev.workingHours?.[period] || {}),
          [timeType]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // tạo location
    let locationId = null;

    if (formData.location) {
      const locationPayload = {
        object_type: "Bệnh viện",
        coordinates: {
          type: "Point",
          coordinates: [
            formData.location.lng,
            formData.location.lat 
          ]
        }
      };

      console.log("Creating location:", locationPayload);

      const locRes = await fetch("http://localhost:3001/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(locationPayload)
      });

      if (!locRes.ok) {
        const err = await locRes.json();
        throw new Error(err.message || "Tạo location thất bại");
      }

      const locResult = await locRes.json();
      locationId = locResult.location_id;
    }

    // Lấy ID cho edit mode
    const facilityId = initialData?.facility_id || initialData?.id;
    
    console.log("=== SUBMIT DEBUG ===");
    console.log("Mode:", mode);
    console.log("Facility ID:", facilityId);
    console.log("InitialData:", initialData);
    console.log("Form data name:", formData.name);
    console.log("Selected services:", selectedServices);

    const payload = {
      facility_name: formData.name,
      type_id: formData.type,
      address: formData.address,
      phone: formData.phone,
      province_id: formData.province,
      services: selectedServices,
      facility_point_id: locationId,
      creator_id: userId
    };

  //       // Nếu là chỉnh sửa, thêm ID vào payload
  //   if (mode === 'edit' && initialData && initialData.facility_id) {
  //     payload.id = initialData.facility_id;
  //   }

  //   try {
  //     const token = localStorage.getItem("authToken");
      
  //     // SỬA: Dùng method PUT nếu là edit
  //     const method = mode === 'edit' ? 'PUT' : 'POST';
  //     const url = mode === 'edit' 
  //       ? `http://localhost:3001/api/facilities/${initialData.facility_id}` 
  //       : "http://localhost:3001/api/facilities";
      
  //     const res = await fetch(url, {
  //       method: method,
  //       headers: { 
  //         "Content-Type": "application/json",
  //         Authorization: token ? `Bearer ${token}` : ''
  //       },
  //       body: JSON.stringify(payload)
  //     });

  //     const result = await res.json();
  //     console.log(`${mode} facility result:`, result);

  //     // Lấy dữ liệu trả về
  //     const responseData = result && result.facility_id ? result : (result.data || result.created || null);

  //     if (res.ok && responseData) {
  //       // Gọi callback với dữ liệu đã được xử lý
  //       if (typeof onSubmit === 'function') {
  //         onSubmit(responseData);
  //       }
  //       alert(mode === 'edit' ? "Cập nhật cơ sở y tế thành công!" : "Thêm cơ sở y tế thành công!");
  //     } else {
  //       console.error(`${mode} facility failed:`, result);
  //       alert(result?.message || `Có lỗi xảy ra khi ${mode === 'edit' ? 'cập nhật' : 'thêm'} cơ sở y tế`);
  //     }
  //   } catch (err) {
  //     console.error(`${mode} facility error:`, err);
  //     alert(`Có lỗi mạng khi ${mode === 'edit' ? 'cập nhật' : 'thêm'} cơ sở y tế`);
  //   }
  // };
    // Xác định API endpoint và method
    const apiUrl = "http://localhost:3001/api/medical-facilities";

    // QUAN TRỌNG: Sử dụng PUT cho edit, POST cho create
    const method = mode === 'edit' && facilityId ? 'PUT' : 'POST';
    let url = apiUrl;
    
    if (mode === 'edit' && facilityId) {
      // Thêm ID vào URL cho edit
      url = `${apiUrl}/${facilityId}`;
    }
    console.log(">>> URL thực tế:", url);
    console.log(`Calling ${method} ${url}`);
    console.log("Payload:", payload);

    try {
      const res = await fetch(url, {
        method: method,  // SỬA: Dùng biến method, không cứng POST
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      let result = null;
      if (res.status !== 204) {
        result = await res.json();
      }
      
      if (res.ok) {
        alert(mode === 'edit' ? "Cập nhật cơ sở thành công!" : "Thêm cơ sở thành công!");
        
        // Gọi callback với kết quả
      if (onSubmit) {
        onSubmit(result ? result : { facility_id: facilityId });
      }
      } else {
        console.error("Error:", result);
        alert(result?.message || `Có lỗi xảy ra khi ${mode === 'edit' ? 'cập nhật' : 'thêm'} cơ sở!`);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Lỗi kết nối đến server!");
    }
  };

  return (
    <div className="facility-form">
      <div className="form-header">
        <h4>
          {mode === 'create' ? 'Thêm Cơ Sở Y Tế Mới' : 'Chỉnh Sửa Cơ Sở Y Tế'}
          {mode === 'edit' && initialData && (
            <span className="text-muted ms-2">
              (ID: {initialData.facility_id || initialData.id})
            </span>
          )}
        </h4>
        
        {/* THÊM: Debug info */}
        {mode === 'edit' && (
          <div className="alert alert-info mt-2 mb-0 p-2">
            <small>
              <i className="bi bi-info-circle me-1"></i>
              Chế độ chỉnh sửa | ID: {initialData?.facility_id || initialData?.id} | 
              API sẽ dùng: PUT {formData.type === "pharmacy" ? "/pharmacies/" : "/medical-facilities/"}
              {initialData?.facility_id || initialData?.id}
            </small>
          </div>
        )}
        
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
                  {mode === 'edit' && initialData?.facility_name && (
                    <small className="text-muted">
                      Tên hiện tại: {initialData.facility_name}
                    </small>
                  )}
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
                      <option key={p.province_id} value={p.province_id}>{p.province_name}</option>
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
              <div className="form-group">
                <label>Số điện thoại *</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="VD: 024 3869 3731"
                  required={formData.type !== 'pharmacy'}
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
                <small className="text-muted">
                  Đã chọn: {selectedServices.length} dịch vụ
                  {selectedServices.length > 0 && ` (${selectedServices.join(', ')})`}
                </small>
              </div>        
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
              <div className='map-container'>
                <MapPicker
                onLocationSelect={handleLocationSelect}
                initialLocation={formData.location}
                height="300px"
              />
              </div>
              
              <small className="text-muted">
                {formData.location ? `Đã chọn vị trí: ${formData.location.address || 'Có tọa độ'}` : 'Chưa chọn vị trí'}
              </small>
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
            <div className="form-group">
              <label>Xác nhận thông tin:</label>   
              <div className="form-summary">
                <div className="summary-grid">
                  <div className="summary-item" style={{ gridColumn: "span 2" }}>
                    <label>Chế độ:</label>
                    <span className={`badge bg-${mode === 'edit' ? 'warning' : 'info'}`}>
                      {mode === 'edit' ? 'CHỈNH SỬA' : 'THÊM MỚI'}
                    </span>
                  </div>
                  <div className="summary-item">
                    <label>Tên cơ sở:</label>
                    <span className="fw-bold">{formData.name || '(Chưa nhập tên)'}</span>
                  </div>
                  <div className="summary-item">
                    <label>Loại hình:</label>
                    <span>{facilityTypes.find(t => t.value === formData.type)?.label || '(Chưa chọn loại hình)'}</span>
                  </div>
                  <div className="summary-item">
                    <label>Tỉnh/Thành:</label>
                    <span>{provinceMap[formData.province] || '(Chưa chọn)'}</span>
                  </div>
                  <div className="summary-item">
                    <label>Số điện thoại:</label>
                    <span>{formData.phone || '(Chưa nhập số điện thoại)'}</span>
                  </div>
                  <div className="summary-item">
                    <label>Dịch vụ:</label>
                    <span>{selectedServices.length} dịch vụ</span>
                  </div>
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