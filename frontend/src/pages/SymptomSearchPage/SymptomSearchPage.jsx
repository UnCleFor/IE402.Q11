import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SymptomSearchPage.css';

const SymptomSearchPage = () => {
  const [symptoms, setSymptoms] = useState('');
  const [symptomSuggestions, setSymptomSuggestions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy triệu chứng từ state nếu có (khi chuyển từ trang khác)
  React.useEffect(() => {
    if (location.state?.symptom) {
      setSymptoms(location.state.symptom);
    }
  }, [location.state]);

  const symptomOptions = [
    'Sốt cao', 'Đau đầu', 'Ho kéo dài', 'Đau bụng', 'Khó thở',
    'Chóng mặt', 'Buồn nôn', 'Đau họng', 'Mệt mỏi', 'Đau ngực',
    'Sổ mũi', 'Đau cơ', 'Tiêu chảy', 'Phát ban', 'Mất vị giác',
    'Mất khứu giác', 'Đau lưng', 'Đau khớp', 'Hoa mắt', 'Ù tai'
  ];

  const symptomToSpecialty = {
    'Sốt cao': 'Nội tổng quát',
    'Đau đầu': 'Thần kinh',
    'Ho kéo dài': 'Hô hấp',
    'Đau bụng': 'Tiêu hóa',
    'Khó thở': 'Hô hấp',
    'Chóng mặt': 'Thần kinh',
    'Buồn nôn': 'Tiêu hóa',
    'Đau họng': 'Tai Mũi Họng',
    'Mệt mỏi': 'Nội tổng quát',
    'Đau ngực': 'Tim mạch',
    'Sổ mũi': 'Tai Mũi Họng',
    'Đau cơ': 'Cơ Xương Khớp',
    'Tiêu chảy': 'Tiêu hóa',
    'Phát ban': 'Da liễu',
    'Mất vị giác': 'Tai Mũi Họng',
    'Mất khứu giác': 'Tai Mũi Họng',
    'Đau lưng': 'Cơ Xương Khớp',
    'Đau khớp': 'Cơ Xương Khớp',
    'Hoa mắt': 'Thần kinh',
    'Ù tai': 'Tai Mũi Họng'
  };

  const symptomToEmergency = {
    'Sốt cao': 'medium',
    'Đau đầu': 'low',
    'Ho kéo dài': 'low',
    'Đau bụng': 'medium',
    'Khó thở': 'high',
    'Chóng mặt': 'low',
    'Buồn nôn': 'low',
    'Đau họng': 'low',
    'Mệt mỏi': 'low',
    'Đau ngực': 'high',
    'Sổ mũi': 'low',
    'Đau cơ': 'low',
    'Tiêu chảy': 'medium',
    'Phát ban': 'low',
    'Mất vị giác': 'low',
    'Mất khứu giác': 'low',
    'Đau lưng': 'low',
    'Đau khớp': 'low',
    'Hoa mắt': 'low',
    'Ù tai': 'low'
  };

  // Xử lý tìm kiếm triệu chứng
  const handleSymptomSearch = (e) => {
    const value = e.target.value;
    setSymptoms(value);

    if (value.length > 1) {
      const filtered = symptomOptions.filter(symptom =>
        symptom.toLowerCase().includes(value.toLowerCase())
      );
      setSymptomSuggestions(filtered);
    } else {
      setSymptomSuggestions([]);
    }
  };

  // Xử lý chọn triệu chứng từ gợi ý
  const handleSymptomSelection = (symptom) => {
    setSymptoms(symptom);
    setSymptomSuggestions([]);

    const suggestedSpecialty = symptomToSpecialty[symptom] || 'Nội tổng quát';
    const emergencyLevel = symptomToEmergency[symptom] || 'low';

    navigate('/symptom-results', {
      state: {
        symptom,
        suggestedSpecialty,
        emergencyLevel,
        searchTime: new Date().toISOString()
      }
    });
  };

  const handleSubmit = () => {
    if (symptoms.trim()) {
      const suggestedSpecialty = symptomToSpecialty[symptoms] || 'Nội tổng quát';
      const emergencyLevel = symptomToEmergency[symptoms] || 'low';

      navigate('/symptom-results', {
        state: {
          symptom: symptoms,
          suggestedSpecialty,
          emergencyLevel,
          searchTime: new Date().toISOString()
        }
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="symptom-search-page">
      <div className="container">
        
          
            {/* Header */}
            <div className="page-header">
              <h1 className="page-title">
                <i className="bi bi-search-heart me-2"></i>
                Tìm kiếm theo Triệu chứng
              </h1>
              <p className="page-subtitle">
                Nhập triệu chứng của bạn để được gợi ý chuyên khoa phù hợp
              </p>
            </div>

            {/* Search Box */}
            <div className="card shadow-lg border-0 mb-4">
              <div className="card-body p-4">
                <div className="search-box">
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-primary text-white border-0">
                      <i className="bi bi-heart-pulse fs-4"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-0 py-3"
                      placeholder="Nhập triệu chứng của bạn (ví dụ: sốt cao, đau đầu, khó thở)..."
                      value={symptoms}
                      onChange={handleSymptomSearch}
                      onKeyPress={handleKeyPress}
                      autoFocus
                    />
                    <button
                      className="btn btn-primary px-4"
                      onClick={handleSubmit}
                      disabled={!symptoms.trim()}
                    >
                      <i className="bi bi-search me-2"></i> Tìm kiếm
                    </button>
                  </div>

                  {symptomSuggestions.length > 0 && (
                    <div className="suggestions-dropdown mt-3">
                      <div className="dropdown-header text-muted small mb-2">Gợi ý:</div>
                      <div className="dropdown-items">
                        {symptomSuggestions.map((symptom, index) => (
                          <button
                            key={index}
                            className="dropdown-item py-2"
                            onClick={() => handleSymptomSelection(symptom)}
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <span>{symptom}</span>
                              <span className="badge bg-light text-primary">
                                {symptomToSpecialty[symptom]}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Symptoms */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0">
                  <i className="bi bi-lightning me-2 text-warning"></i>
                  Triệu chứng thường gặp
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {symptomOptions.slice(0, 12).map((symptom, index) => {
                    const emergencyLevel = symptomToEmergency[symptom];
                    const emergencyClass = `emergency-${emergencyLevel}`;

                    return (
                      <div key={index} className="col-md-4 col-sm-6">
                        <button
                          className={`quick-symptom-btn w-100 ${emergencyClass}`}
                          onClick={() => handleSymptomSelection(symptom)}
                        >
                          <div className="d-flex align-items-center">
                            <div className="symptom-icon me-3">
                              {emergencyLevel === 'high' && <i className="bi bi-exclamation-triangle"></i>}
                              {emergencyLevel === 'medium' && <i className="bi bi-exclamation-circle"></i>}
                              {emergencyLevel === 'low' && <i className="bi bi-info-circle"></i>}
                            </div>
                            <div className="text-start">
                              <div className="symptom-name fw-medium">{symptom}</div>
                              <div className="symptom-specialty small text-muted">
                                {symptomToSpecialty[symptom]}
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Emergency Guide */}
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2 text-info"></i>
                  Hướng dẫn cấp độ khẩn cấp
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="emergency-guide-card high">
                      <div className="d-flex align-items-center mb-2">
                        <span className="emergency-indicator high me-2"></span>
                        <h6 className="mb-0 fw-bold">Cấp độ cao</h6>
                      </div>
                      <p className="mb-2 small">Cần đến cơ sở y tế ngay lập tức</p>
                      <ul className="small text-muted mb-0 ps-3">
                        <li>Khó thở</li>
                        <li>Đau ngực dữ dội</li>
                        <li>Chấn thương nặng</li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="emergency-guide-card medium">
                      <div className="d-flex align-items-center mb-2">
                        <span className="emergency-indicator medium me-2"></span>
                        <h6 className="mb-0 fw-bold">Cấp độ trung bình</h6>
                      </div>
                      <p className="mb-2 small">Khám trong vòng 24 giờ</p>
                      <ul className="small text-muted mb-0 ps-3">
                        <li>Sốt cao trên 39°C</li>
                        <li>Đau bụng dữ dội</li>
                        <li>Tiêu chảy kéo dài</li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="emergency-guide-card low">
                      <div className="d-flex align-items-center mb-2">
                        <span className="emergency-indicator low me-2"></span>
                        <h6 className="mb-0 fw-bold">Cấp độ thấp</h6>
                      </div>
                      <p className="mb-2 small">Có thể đặt lịch khám thông thường</p>
                      <ul className="small text-muted mb-0 ps-3">
                        <li>Cảm cúm thông thường</li>
                        <li>Đau đầu nhẹ</li>
                        <li>Ho khan</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          
        
      </div>
    </div>
  );
};

export default SymptomSearchPage;