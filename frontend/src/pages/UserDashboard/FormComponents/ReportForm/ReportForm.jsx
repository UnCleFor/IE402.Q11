import React, { useState } from 'react';
import './ReportForm.css';

const ReportForm = ({ onSubmit, initialData, mode = 'create' }) => {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    reportType: 'daily',
    period: {
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    facilities: [],
    outbreaks: [],
    metrics: {
      totalFacilities: 0,
      newFacilities: 0,
      activeOutbreaks: 0,
      totalCases: 0,
      recoveredCases: 0
    },
    analysis: '',
    recommendations: '',
    attachments: []
  });

  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [selectedOutbreaks, setSelectedOutbreaks] = useState([]);

  // Các loại báo cáo
  const reportTypes = [
    { value: 'daily', label: 'Báo cáo hàng ngày', icon: 'bi bi-calendar-day' },
    { value: 'weekly', label: 'Báo cáo hàng tuần', icon: 'bi bi-calendar-week' },
    { value: 'monthly', label: 'Báo cáo hàng tháng', icon: 'bi bi-calendar-month' },
    { value: 'outbreak', label: 'Báo cáo dịch bệnh', icon: 'bi bi-virus' },
    { value: 'facility', label: 'Báo cáo cơ sở y tế', icon: 'bi bi-hospital' },
    { value: 'custom', label: 'Báo cáo tùy chỉnh', icon: 'bi bi-file-text' }
  ];

  // Dữ liệu mẫu
  const sampleFacilities = [
    { id: 1, name: 'Bệnh viện Bạch Mai', type: 'hospital' },
    { id: 2, name: 'Bệnh viện Việt Đức', type: 'hospital' },
    { id: 3, name: 'Phòng khám Đa khoa Quốc tế', type: 'clinic' }
  ];

  // Dữ liệu mẫu vùng dịch
  const sampleOutbreaks = [
    { id: 1, name: 'Dịch sốt xuất huyết Ba Đình', disease: 'dengue_fever' },
    { id: 2, name: 'Cúm A H5N1 Gia Lâm', disease: 'influenza' }
  ];

  // Xử lý thay đổi input
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Xử lý thay đổi chỉ số
  const handleMetricChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [field]: parseInt(value) || 0
      }
    }));
  };

  // Xử lý thay đổi khoảng thời gian
  const handlePeriodChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      period: {
        ...prev.period,
        [field]: value
      }
    }));
  };

  // Chọn/Bỏ chọn cơ sở y tế
  const toggleFacility = (facility) => {
    setSelectedFacilities(prev =>
      prev.includes(facility.id)
        ? prev.filter(id => id !== facility.id)
        : [...prev, facility.id]
    );
  };

  // Chọn/Bỏ chọn vùng dịch
  const toggleOutbreak = (outbreak) => {
    setSelectedOutbreaks(prev =>
      prev.includes(outbreak.id)
        ? prev.filter(id => id !== outbreak.id)
        : [...prev, outbreak.id]
    );
  };

  // Xử lý tải lên tệp
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))]
    }));
  };

  // Xóa tệp đính kèm
  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      facilities: selectedFacilities,
      outbreaks: selectedOutbreaks
    });
  };

  // Tạo bản xem trước báo cáo
  const generateReportPreview = () => {
    return {
      facilities: selectedFacilities.length,
      outbreaks: selectedOutbreaks.length,
      period: `${formData.period.start} đến ${formData.period.end}`
    };
  };

  const preview = generateReportPreview();

  return (
    <div className="report-form">
      <div className="form-header">
        <h4>
          {mode === 'create' ? 'Tạo Báo Cáo Mới' : 'Chỉnh Sửa Báo Cáo'}
        </h4>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-8">
            <div className="form-group">
              <label>Tiêu đề báo cáo *</label>
              <input
                type="text"
                className="form-control"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="VD: Báo cáo tình hình dịch sốt xuất huyết tháng 1/2024"
                required
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label>Loại báo cáo *</label>
              <select
                className="form-control"
                value={formData.reportType}
                onChange={(e) => handleInputChange('reportType', e.target.value)}
                required
              >
                <option value="">Chọn loại báo cáo</option>
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>Thời gian bắt đầu *</label>
              <input
                type="date"
                className="form-control"
                value={formData.period.start}
                onChange={(e) => handlePeriodChange('start', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Thời gian kết thúc *</label>
              <input
                type="date"
                className="form-control"
                value={formData.period.end}
                onChange={(e) => handlePeriodChange('end', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Facilities Selection */}
        <div className="form-group">
          <label>Cơ sở y tế trong báo cáo</label>
          <div className="selection-list">
            {sampleFacilities.map(facility => (
              <div
                key={facility.id}
                className={`selection-item ${selectedFacilities.includes(facility.id) ? 'selected' : ''}`}
                onClick={() => toggleFacility(facility)}
              >
                <div className="selection-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedFacilities.includes(facility.id)}
                    readOnly
                  />
                </div>
                <div className="selection-content">
                  <h6>{facility.name}</h6>
                  <span className="item-type">{facility.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outbreaks Selection */}
        <div className="form-group">
          <label>Vùng dịch trong báo cáo</label>
          <div className="selection-list">
            {sampleOutbreaks.map(outbreak => (
              <div
                key={outbreak.id}
                className={`selection-item ${selectedOutbreaks.includes(outbreak.id) ? 'selected' : ''}`}
                onClick={() => toggleOutbreak(outbreak)}
              >
                <div className="selection-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedOutbreaks.includes(outbreak.id)}
                    readOnly
                  />
                </div>
                <div className="selection-content">
                  <h6>{outbreak.name}</h6>
                  <span className="item-type">{outbreak.disease}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="form-group">
          <label>Chỉ số thống kê</label>
          <div className="metrics-grid">
            <div className="metric-item">
              <label>Tổng cơ sở y tế</label>
              <input
                type="number"
                className="form-control"
                value={formData.metrics.totalFacilities}
                onChange={(e) => handleMetricChange('totalFacilities', e.target.value)}
                min="0"
              />
            </div>
            <div className="metric-item">
              <label>Cơ sở mới</label>
              <input
                type="number"
                className="form-control"
                value={formData.metrics.newFacilities}
                onChange={(e) => handleMetricChange('newFacilities', e.target.value)}
                min="0"
              />
            </div>
            <div className="metric-item">
              <label>Vùng dịch đang hoạt động</label>
              <input
                type="number"
                className="form-control"
                value={formData.metrics.activeOutbreaks}
                onChange={(e) => handleMetricChange('activeOutbreaks', e.target.value)}
                min="0"
              />
            </div>
            <div className="metric-item">
              <label>Tổng số ca nhiễm</label>
              <input
                type="number"
                className="form-control"
                value={formData.metrics.totalCases}
                onChange={(e) => handleMetricChange('totalCases', e.target.value)}
                min="0"
              />
            </div>
            <div className="metric-item">
              <label>Số ca đã phục hồi</label>
              <input
                type="number"
                className="form-control"
                value={formData.metrics.recoveredCases}
                onChange={(e) => handleMetricChange('recoveredCases', e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Analysis & Recommendations */}
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>Phân tích tình hình</label>
              <textarea
                className="form-control"
                rows="6"
                value={formData.analysis}
                onChange={(e) => handleInputChange('analysis', e.target.value)}
                placeholder="Phân tích chi tiết về tình hình y tế trong kỳ báo cáo..."
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Kiến nghị & Đề xuất</label>
              <textarea
                className="form-control"
                rows="6"
                value={formData.recommendations}
                onChange={(e) => handleInputChange('recommendations', e.target.value)}
                placeholder="Đề xuất các biện pháp, kiến nghị cần thực hiện..."
              />
            </div>
          </div>
        </div>

        {/* File Attachments */}
        <div className="form-group">
          <label>Tệp đính kèm</label>
          <div className="file-upload">
            <input
              type="file"
              id="file-upload"
              multiple
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="upload-btn">
              <i className="bi bi-cloud-upload me-2"></i>
              Chọn tệp đính kèm
            </label>
          </div>

          {formData.attachments.length > 0 && (
            <div className="attachments-list">
              {formData.attachments.map((file, index) => (
                <div key={index} className="attachment-item">
                  <i className="bi bi-file-earmark-text"></i>
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeAttachment(index)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report Preview */}
        <div className="report-preview">
          <h6>Xem trước báo cáo:</h6>
          <div className="preview-content">
            <div className="preview-item">
              <strong>Tiêu đề:</strong> {formData.title || '(Chưa có tiêu đề)'}
            </div>
            <div className="preview-item">
              <strong>Thời gian:</strong> {preview.period}
            </div>
            <div className="preview-item">
              <strong>Số cơ sở y tế:</strong> {preview.facilities}
            </div>
            <div className="preview-item">
              <strong>Số vùng dịch:</strong> {preview.outbreaks}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-success">
            <i className="bi bi-file-earmark-pdf me-1"></i>
            {mode === 'create' ? 'Tạo báo cáo' : 'Cập nhật báo cáo'}
          </button>
          <button type="button" className="btn btn-outline-primary">
            <i className="bi bi-eye me-1"></i>
            Xem trước đầy đủ
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;