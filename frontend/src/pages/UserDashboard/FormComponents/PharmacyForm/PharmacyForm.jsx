import React, { useState, useEffect, useMemo } from 'react';
import MapPicker from '../../MapComponents/MapPicker/MapPicker';
import './PharmacyForm.css';
import { jwtDecode } from "jwt-decode";

const PharmacyForm = ({ onSubmit, initialData, mode = 'create' }) => {

  const defaultFormData = {
    name: '',
    address: '',
    phone: '',
    province: '',
  };

  const token = localStorage.getItem("authToken");
  let decodedToken = null;
  if (token) decodedToken = jwtDecode(token);
  const userId = decodedToken?.user_id;

  const [formData, setFormData] = useState(defaultFormData);
  
  // SỬA: Xử lý mapping dữ liệu từ initialData
  useEffect(() => {
    console.log("PharmacyForm received initialData:", initialData);
    
    if (initialData && mode === 'edit') {
      // Map dữ liệu từ API (có pharmacy_name) sang form (dùng name)
      setFormData({
        name: initialData.pharmacy_name || initialData.name || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
        province: initialData.province_id || initialData.province || '',
        location: initialData.pharmacy_point_id || initialData.location || null
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [initialData, mode]);

  const [currentStep, setCurrentStep] = useState(1);
  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const [hasLocationChanged, setHasLocationChanged] = useState(false);
  const handleLocationSelect = (point) => {
    setFormData(prev => ({
      ...prev,
      location: point
    }));
    setHasLocationChanged(true);
  };

  const [locationDetail, setLocationDetail] = useState(null);

  useEffect(() => {
    if (!formData.location) return;

    fetch(`http://localhost:3001/api/locations/${formData.location}`)
      .then(res => res.json())
      .then(data => setLocationDetail(data))
      .catch(err => console.error("Load location failed", err));
  }, [formData.location]);

  const getCurrentPoint = () => {
    if (
      locationDetail &&
      locationDetail.coordinates &&
      Array.isArray(locationDetail.coordinates.coordinates)
    ) {
      const [lng, lat] = locationDetail.coordinates.coordinates;
      return {lat, lng}
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // tạo location
    let locationId = initialData?.pharmacy_point_id || null;

    if (formData.location) {
      const locationPayload = {
        object_type: "Nhà thuốc",
        coordinates: {
          type: "Point",
          coordinates: [
            formData.location.lng,
            formData.location.lat 
          ]
        }
      };

      if (mode === 'edit' && locationId) {
        if (hasLocationChanged) {
        // UPDATE location cũ
        await fetch(`http://localhost:3001/api/locations/${locationId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(locationPayload)
        });
      }} else {
        // CREATE location mới
        const locRes = await fetch("http://localhost:3001/api/locations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(locationPayload)
        });

        const locResult = await locRes.json();
        locationId = locResult.location_id;
      }
    }

    // Tạo payload phù hợp cho cả create và update
    const payload = {
      pharmacy_name: formData.name,  // Map từ formData.name
      pharmacy_point_id: locationId,
      creator_id: userId,
      address: formData.address,
      province_id: formData.province
    };

    // Nếu là chỉnh sửa, thêm ID vào payload
    if (mode === 'edit' && initialData && initialData.pharmacy_id) {
      payload.id = initialData.pharmacy_id;
    }

    try {
      
      // SỬA: Dùng method PUT nếu là edit
      const method = mode === 'edit' ? 'PUT' : 'POST';
      const url = mode === 'edit' 
        ? `http://localhost:3001/api/pharmacies/${initialData.pharmacy_id}` 
        : "http://localhost:3001/api/pharmacies";
      
      const res = await fetch(url, {
        method: method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      console.log(`${mode} pharmacy result:`, result);

      // Lấy dữ liệu trả về
      const pharmacyObj = result.pharmacy || result.data || result.created || result;

      // Gọi callback nếu có id
      if (res.ok && pharmacyObj && pharmacyObj.pharmacy_id) {
        onSubmit(pharmacyObj);
        alert(mode === 'edit' ? "Cập nhật nhà thuốc thành công!" : "Thêm nhà thuốc thành công!");
      } else {
        console.error(`${mode} pharmacy failed:`, result);
        alert(result?.message || `Có lỗi xảy ra khi ${mode === 'edit' ? 'cập nhật' : 'thêm'} nhà thuốc`);
      }
    } catch (err) {
      console.error(`${mode} pharmacy error:`, err);
      alert(`Có lỗi mạng khi ${mode === 'edit' ? 'cập nhật' : 'thêm'} nhà thuốc`);
    }
  };

  return (
    <div className="pharmacy-form">
      <div className="form-header">
        <h4>
          {mode === 'create' ? 'Thêm Nhà Thuốc Mới' : 'Chỉnh Sửa Nhà Thuốc'}
          {mode === 'edit' && initialData && `: ${initialData.pharmacy_name}`}
        </h4>

        <div className="step-indicator">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
            <span>1</span> Thông tin cơ bản
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            <span>2</span> Vị trí
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <span>3</span> Hoàn tất
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="form-step">
            <div className="form-group">
              <label>Tên nhà thuốc *</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="VD: Nhà thuốc Minh Châu"
                required
              />
              {/* DEBUG: Hiển thị giá trị ban đầu */}
              {mode === 'edit' && initialData?.pharmacy_name && (
                <small className="text-muted">
                  Tên hiện tại: {initialData.pharmacy_name}
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Tỉnh/Thành phố *</label>
              <select
                className="form-control"
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

            <div className="form-group">
              <label>Địa chỉ chi tiết*</label>
              <textarea
                className="form-control"
                rows="2"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Số nhà, đường, phường/xã, quận/huyện"
                required
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-primary ms-auto" onClick={nextStep}>
                Tiếp theo <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="form-step">
            <div className="form-group">
              <label>Chọn vị trí trên bản đồ *</label>
              <div className='map-container'>
                <MapPicker
                onLocationSelect={handleLocationSelect}
                initialPoint={getCurrentPoint()}
                height="300px"
              />
              </div>
             
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

        {/* STEP 3 */}
        {currentStep === 3 && (
          <div className="form-step">
            <div className="form-group">
              <label>Xác nhận thông tin</label>
              <div className="form-summary">
                <div className="summary-grid">
                  <div className="summary-item" style={{ gridColumn: "span 2" }}>
                    <label>Chế độ:</label>
                    <span className={`badge bg-${mode === 'edit' ? 'warning' : 'info'}`}>
                      {mode === 'edit' ? 'CHỈNH SỬA' : 'THÊM MỚI'}
                    </span>
                  </div>
                  <div className="summary-item">
                    <label>Tên nhà thuốc:</label>
                    <span className="fw-bold">{formData.name || '(Chưa nhập tên)'}</span>
                  </div>
                  <div className="summary-item">
                    <label>Tỉnh/Thành:</label>
                    <span>{provinceMap[formData.province] || '(Chưa chọn)'}</span>
                  </div>
                  <div className="summary-item" style={{ gridColumn: 'span 2' }}>
                    <label>Địa chỉ:</label>
                    <span>{formData.address || '(Chưa nhập địa chỉ)'}</span>
                  </div>
                  {/* {mode === 'edit' && initialData && (
                    <div className="summary-item">
                      <label>ID nhà thuốc:</label>
                      <span className="text-muted">{initialData.pharmacy_id}</span>
                    </div>
                  )} */}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline-secondary" onClick={prevStep}>
                <i className="bi bi-arrow-left me-1"></i> Quay lại
              </button>

              <button type="submit" className="btn btn-success">
                <i className="bi bi-check-circle me-1"></i>
                {mode === 'create' ? 'Thêm nhà thuốc' : 'Cập nhật'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default PharmacyForm;