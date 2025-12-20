import React, { useState, useRef, useEffect } from 'react';
import PolygonDrawer from '../../MapComponents/PolygonDrawer/PolygonDrawer';
import './OutbreakForm.css';
import provinceService from '../../../../services/provinceService';

const OutbreakForm = ({ onSubmit, initialData, mode = 'create', isSubmitting = false }) => {
  const [user, setUser] = useState(null);

  // Lấy thông tin user từ localStorage khi component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const [formData, setFormData] = useState(() => {
    const defaultData = {
      outbreak_name: '',
      disease_id: 'DENGUE',
      disease_cases: 0,
      severity_level: 'medium',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      description: '',
      area_geom: null,
      creator_id: '',
      province_id: '',
      province_name: '',
    };

    // Nếu có initialData, merge với defaultData

    if (initialData) {
      console.log('initialData', initialData);
      console.log('defaultData', defaultData);
      console.log('merger', { ...defaultData, ...initialData })
      return { ...defaultData, ...initialData };
    }
    return defaultData;
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [polygonData, setPolygonData] = useState(null);
  const polygonDrawerRef = useRef(null);

  // Cập nhật creator_id khi user data được load
  useEffect(() => {
    if (user && user.user_id) {
      setFormData(prev => ({
        ...prev,
        creator_id: user.user_id
      }));
    }
  }, [user]);

  // Disease types theo API
  const diseaseTypes = [
    { value: 'DENGUE', label: 'Sốt xuất huyết', color: '#e74c3c' },
    { value: 'INFLUENZA', label: 'Cúm', color: '#3498db' },
    { value: 'HFMD', label: 'Tay chân miệng', color: '#f39c12' },
    { value: 'COVID', label: 'COVID-19', color: '#9b59b6' },
    { value: 'MALARIA', label: 'Sốt rét', color: '#e67e22' },
    { value: 'OTHER', label: 'Khác', color: '#95a5a6' }
  ];

  const [provinces, setProvinces] = useState([]); // [{id, name}]
  const [provinceMap, setProvinceMap] = useState({}); // Map để tra cứu nhanh
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const response = await provinceService.getAllProvinces();
        if (Array.isArray(response)) {
          // Lưu mảng đầy đủ
          setProvinces(response.map(p => ({
            id: p.province_id,
            name: p.province_name
          })));

          // Tạo map để tra cứu nhanh
          const nameToIdMap = {};
          const idToNameMap = {};

          response.forEach(p => {
            nameToIdMap[p.province_name] = p.province_id;
            idToNameMap[p.province_id] = p.province_name;
          });

          setProvinceMap({
            nameToId: nameToIdMap,
            idToName: idToNameMap
          });
        }
      } catch (error) {
        console.error('Error loading provinces:', error);
      }
    };

    loadProvinces();
  }, []);
  
  const provinceNameToId = (name) => {
    if (!name || !provinceMap.nameToId) return null;
    return provinceMap.nameToId[name] || null;
  };
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePolygonComplete = (polygon) => {
    console.log('Polygon received:', polygon);

    if (!polygon || polygon.length < 3) {
      setFormErrors(prev => ({
        ...prev,
        area_geom: 'Vui lòng vẽ polygon với ít nhất 3 điểm'
      }));
      setPolygonData(null);
      return;
    }

    // Tạo area_geom theo format của API
    const area_geom = {
      crs: {
        type: "name",
        properties: {
          name: "EPSG:4326"
        }
      },
      type: "Polygon",
      coordinates: [polygon.map(point => [point.lng, point.lat])] // Chuyển đổi [lat, lng] -> [lng, lat]
    };

    console.log('Generated area_geom:', area_geom);

    // Lưu cả polygon data và area_geom
    setPolygonData({
      rawPolygon: polygon,
      area_geom: area_geom
    });

    // Cập nhật formData
    setFormData(prev => ({
      ...prev,
      area_geom: area_geom
    }));

    // Clear error
    setFormErrors(prev => ({
      ...prev,
      area_geom: ''
    }));
  };

  const validateStep1 = () => {
    const errors = {};

    if (!formData.outbreak_name.trim()) {
      errors.outbreak_name = 'Tên vùng dịch là bắt buộc';
    } else if (formData.outbreak_name.length < 5) {
      errors.outbreak_name = 'Tên vùng dịch phải có ít nhất 5 ký tự';
    }

    if (!formData.disease_id) {
      errors.disease_id = 'Loại bệnh là bắt buộc';
    }

    if (formData.disease_cases === '' || formData.disease_cases < 0) {
      errors.disease_cases = 'Số ca nhiễm phải là số dương';
    }

    if (!formData.severity_level) {
      errors.severity_level = 'Mức độ nghiêm trọng là bắt buộc';
    }

    if (!formData.start_date) {
      errors.start_date = 'Ngày bắt đầu là bắt buộc';
    } else {
      const startDate = new Date(formData.start_date);
      const today = new Date();
      if (startDate > today) {
        errors.start_date = 'Ngày bắt đầu không được lớn hơn ngày hiện tại';
      }
    }

    if (formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate < startDate) {
        errors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    return errors;
  };

  const validateStep2 = () => {
    const errors = {};

    if (!formData.area_geom) {
      errors.area_geom = 'Vui lòng khoanh vùng dịch trên bản đồ';
    } else if (!formData.area_geom.coordinates || formData.area_geom.coordinates[0].length < 3) {
      errors.area_geom = 'Polygon phải có ít nhất 3 điểm';
    }

    return errors;
  };

  const nextStep = () => {
    let errors = {};

    if (currentStep === 1) {
      errors = validateStep1();
    } else if (currentStep === 2) {
      errors = validateStep2();
    }

    if (Object.keys(errors).length === 0) {
      setFormErrors({});
      setCurrentStep(prev => prev + 1);
    } else {
      setFormErrors(errors);
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setFormErrors({});
  };

  const getCurrentPolygon = () => {
    if (formData.area_geom && formData.area_geom.coordinates && formData.area_geom.coordinates[0].length > 0) {
      // Chuyển đổi từ [lng, lat] -> [lat, lng] cho PolygonDrawer
      return formData.area_geom.coordinates[0].map(coord => [
        coord[1], // lat
        coord[0]  // lng
      ]);
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all steps
    const errors1 = validateStep1();
    const errors2 = validateStep2();
    const allErrors = { ...errors1, ...errors2 };

    if (Object.keys(allErrors).length > 0) {
      setFormErrors(allErrors);
      // Quay lại step có lỗi
      if (Object.keys(errors2).length > 0) {
        setCurrentStep(2);
      } else if (Object.keys(errors1).length > 0) {
        setCurrentStep(1);
      }
      return;
    }

    // Kiểm tra creator_id
    if (!formData.creator_id) {
      alert('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    // Chuẩn bị dữ liệu theo API format
    const submitData = {
      outbreak_name: formData.outbreak_name.trim(),
      disease_id: formData.disease_id,
      disease_cases: parseInt(formData.disease_cases) || 0,
      severity_level: formData.severity_level,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      description: formData.description.trim() || null,
      area_geom: formData.area_geom,
      creator_id: formData.creator_id,
      province_id: formData.province_id,
    };

    console.log('Submitting data:', submitData);
    onSubmit(submitData);
  };

  // Reset polygon data khi vào step 2
  useEffect(() => {
    if (currentStep === 2) {
      // Khởi tạo lại polygon data nếu đã có
      if (formData.area_geom) {
        setPolygonData({
          area_geom: formData.area_geom,
          rawPolygon: formData.area_geom.coordinates[0].map(coord => ({
            lat: coord[1],
            lng: coord[0]
          }))
        });
      }
    }
  }, [currentStep, formData.area_geom]);

  return (
    <div className="outbreak-form">
      <div className="form-header">
        <h4>
          {mode === 'create' ? 'Khai Báo Vùng Dịch Mới' : 'Chỉnh Sửa Vùng Dịch'}
        </h4>
        <div className="step-indicator">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
            <span>1</span>
            Thông tin dịch
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            <span>2</span>
            Khoanh vùng
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <span>3</span>
            Xác nhận
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Outbreak Information */}
        {currentStep === 1 && (
          <div className="form-step">
            <div className="row">
              <div className="col-md-12">
                <div className="form-group">
                  <label className="required">Tên vùng dịch</label>
                  <input
                    type="text"
                    name="outbreak_name"
                    className={`form-control ${formErrors.outbreak_name ? 'is-invalid' : ''}`}
                    value={formData.outbreak_name}
                    onChange={(e) => handleInputChange('outbreak_name', e.target.value)}
                    placeholder="VD: Vùng dịch sốt xuất huyết Quận 5"
                    maxLength="200"
                  />
                  {formErrors.outbreak_name && (
                    <div className="invalid-feedback">{formErrors.outbreak_name}</div>
                  )}
                  <small className="form-text text-muted">
                    Tên nên mô tả rõ vùng dịch và địa điểm (tối đa 200 ký tự)
                  </small>
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="required">Loại bệnh dịch</label>
                  <div className="disease-selector">
                    {diseaseTypes.map(disease => (
                      <div
                        key={disease.value}
                        className={`disease-option ${formData.disease_id === disease.value ? 'selected' : ''} ${formErrors.disease_id ? 'is-invalid' : ''}`}
                        onClick={() => handleInputChange('disease_id', disease.value)}
                        style={{ '--disease-color': disease.color }}
                      >
                        <div className="color-indicator"></div>
                        <span>{disease.label}</span>
                      </div>
                    ))}
                  </div>
                  {formErrors.disease_id && (
                    <div className="invalid-feedback d-block">{formErrors.disease_id}</div>
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="required">Mức độ nghiêm trọng</label>
                  <select
                    name="severity_level"
                    className={`form-control ${formErrors.severity_level ? 'is-invalid' : ''}`}
                    value={formData.severity_level}
                    onChange={(e) => handleInputChange('severity_level', e.target.value)}
                  >
                    <option value="">Chọn mức độ</option>
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                  </select>
                  {formErrors.severity_level && (
                    <div className="invalid-feedback">{formErrors.severity_level}</div>
                  )}
                </div>
                <div className='form-group'>
                  <label className="required">Tỉnh/Thành phố</label>
                  <select
                    name="province"
                    className={`form-control ${formErrors.province_id ? 'is-invalid' : ''}`}
                    value={formData.province_name}
                    onChange={(e) => {
                      const selectedProvinceName = e.target.value;
                      const provinceId = provinceNameToId(selectedProvinceName); // Không cần await

                      handleInputChange('province_name', selectedProvinceName);
                      handleInputChange('province_id', provinceId || '');
                    }}
                  >
                    <option value="">Chọn Tỉnh/Thành phố</option>
                    {provinces.map(province => (
                      <option key={province.id} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.province_id && (
                    <div className="invalid-feedback">{formErrors.province_id}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-4">
                <div className="form-group">
                  <label className="required">Số ca nhiễm</label>
                  <input
                    type="number"
                    name="disease_cases"
                    className={`form-control ${formErrors.disease_cases ? 'is-invalid' : ''}`}
                    value={formData.disease_cases}
                    onChange={(e) => handleInputChange('disease_cases', e.target.value)}
                    min="0"
                    step="1"
                  />
                  {formErrors.disease_cases && (
                    <div className="invalid-feedback">{formErrors.disease_cases}</div>
                  )}
                  <small className="form-text text-muted">
                    Số ca bệnh đã được xác nhận trong vùng dịch
                  </small>
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-group">
                  <label className="required">Ngày bắt đầu</label>
                  <input
                    type="date"
                    name="start_date"
                    className={`form-control ${formErrors.start_date ? 'is-invalid' : ''}`}
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {formErrors.start_date && (
                    <div className="invalid-feedback">{formErrors.start_date}</div>
                  )}
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-group">
                  <label>Ngày kết thúc (nếu có)</label>
                  <input
                    type="date"
                    name="end_date"
                    className={`form-control ${formErrors.end_date ? 'is-invalid' : ''}`}
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    min={formData.start_date}
                  />
                  {formErrors.end_date && (
                    <div className="invalid-feedback">{formErrors.end_date}</div>
                  )}
                  <small className="form-text text-muted">
                    Để trống nếu dịch đang diễn ra
                  </small>
                </div>
              </div>
            </div>

            <div className="form-group mt-3">
              <label>Mô tả tình hình dịch</label>
              <textarea
                name="description"
                className="form-control"
                rows="4"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Mô tả chi tiết về tình hình dịch, diễn biến, đặc điểm..."
                maxLength="1000"
              />
              <small className="form-text text-muted">
                Tối đa 1000 ký tự
              </small>
            </div>

            <div className="form-actions mt-4">
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Tiếp theo <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Area Mapping */}
        {currentStep === 2 && (
          <div className="form-step">
            <div className="form-group">
              <label className="required">Khoanh vùng dịch trên bản đồ</label>
              <p className="form-help">
                Vẽ polygon để xác định khu vực bị ảnh hưởng bởi dịch bệnh.
              </p>

              <div className="map-container">
                <PolygonDrawer
                  ref={polygonDrawerRef}
                  onPolygonComplete={handlePolygonComplete}
                  initialPolygon={getCurrentPolygon()}
                  height="400px"
                />
              </div>

              {formErrors.area_geom && (
                <div className="alert alert-danger mt-2">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {formErrors.area_geom}
                </div>
              )}

              <div className="map-instructions mt-3">
                <div className="instruction-item">
                  <i className="bi bi-play-circle"></i>
                  <span>Nhấn "Bắt đầu vẽ" để bắt đầu</span>
                </div>
                <div className="instruction-item">
                  <i className="bi bi-mouse"></i>
                  <span>Click trên bản đồ để thêm điểm</span>
                </div>
                <div className="instruction-item">
                  <i className="bi bi-check-circle"></i>
                  <span>Nhấn Enter để hoàn thành</span>
                </div>
                <div className="instruction-item">
                  <i className="bi bi-backspace"></i>
                  <span>Backspace để xóa điểm cuối</span>
                </div>
              </div>

              {polygonData && (
                <div className="alert alert-success mt-3">
                  <i className="bi bi-check-circle me-2"></i>
                  <strong>Đã khoanh vùng thành công!</strong> Polygon có {polygonData.rawPolygon.length} điểm.
                </div>
              )}
            </div>

            <div className="form-actions mt-4">
              <button type="button" className="btn btn-outline-secondary" onClick={prevStep}>
                <i className="bi bi-arrow-left me-1"></i> Quay lại
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={nextStep}
                disabled={!polygonData}
              >
                Tiếp theo <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <div className="form-step">
            <div className="confirmation-section">
              <h5 className="mb-4">
                <i className="bi bi-check-circle text-success me-2"></i>
                Xác nhận thông tin vùng dịch
              </h5>

              <div className="confirmation-grid">
                <div className="confirmation-item">
                  <div className="confirmation-label">Tên vùng dịch:</div>
                  <div className="confirmation-value">{formData.outbreak_name}</div>
                </div>

                <div className="confirmation-item">
                  <div className="confirmation-label">Loại bệnh:</div>
                  <div className="confirmation-value">
                    {diseaseTypes.find(d => d.value === formData.disease_id)?.label}
                  </div>
                </div>

                <div className="confirmation-item">
                  <div className="confirmation-label">Số ca nhiễm:</div>
                  <div className="confirmation-value">{formData.disease_cases} ca</div>
                </div>

                <div className="confirmation-item">
                  <div className="confirmation-label">Mức độ:</div>
                  <div className="confirmation-value">
                    {formData.severity_level === 'high' ? 'Cao' :
                      formData.severity_level === 'medium' ? 'Trung bình' : 'Thấp'}
                  </div>
                </div>

                <div className="confirmation-item">
                  <div className="confirmation-label">Ngày bắt đầu:</div>
                  <div className="confirmation-value">
                    {new Date(formData.start_date).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                {formData.end_date && (
                  <div className="confirmation-item">
                    <div className="confirmation-label">Ngày kết thúc:</div>
                    <div className="confirmation-value">
                      {new Date(formData.end_date).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                )}

                {formData.description && (
                  <div className="confirmation-item full-width">
                    <div className="confirmation-label">Mô tả:</div>
                    <div className="confirmation-value description-text">
                      {formData.description}
                    </div>
                  </div>
                )}

                <div className="confirmation-item full-width">
                  <div className="confirmation-label">Vùng đã khoanh:</div>
                  <div className="confirmation-value">
                    {formData.area_geom ? (
                      <span className="text-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Đã xác định {formData.area_geom.coordinates[0].length} điểm
                      </span>
                    ) : (
                      <span className="text-danger">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Chưa khoanh vùng
                      </span>
                    )}
                  </div>
                </div>

                <div className="confirmation-item">
                  <div className="confirmation-label">Người tạo:</div>
                  <div className="confirmation-value">
                    {user ? `ID: ${formData.creator_id}` : 'Không xác định'}
                  </div>
                </div>
              </div>

              <div className="alert alert-info mt-4">
                <i className="bi bi-info-circle me-2"></i>
                Vui lòng kiểm tra kỹ thông tin trước khi xác nhận. Thông tin đã gửi sẽ không thể sửa đổi.
              </div>
            </div>

            <div className="form-actions mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={prevStep}
                disabled={isSubmitting}
              >
                <i className="bi bi-arrow-left me-1"></i> Quay lại
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-1"></i>
                    {mode === 'create' ? 'Xác nhận khai báo' : 'Cập nhật vùng dịch'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default OutbreakForm;