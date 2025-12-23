import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './FilteredResultsPage.css';

// Dữ liệu mẫu đánh giá theo bệnh viện - ĐẶT Ở ĐẦU FILE
const facilityReviews = {
  1: [
    {
      id: 1,
      user: 'Nguyễn Văn A',
      rating: 5,
      date: '15/10/2023',
      comment: 'Bác sĩ rất tận tâm, cơ sở vật chất hiện đại. Thời gian chờ khá lâu nhưng đáng giá.',
      helpful: 12,
      verified: true,
      hasImages: true
    },
    {
      id: 2,
      user: 'Trần Thị B',
      rating: 4,
      date: '12/10/2023',
      comment: 'Dịch vụ tốt, nhân viên thân thiện. Giá cả hợp lý so với chất lượng.',
      helpful: 8,
      verified: true,
      hasImages: false
    }
  ],
  2: [
    {
      id: 3,
      user: 'Mai Thị F',
      rating: 5,
      date: '18/10/2023',
      comment: 'Phòng khám sang trọng, bác sĩ chuyên nghiệp. Giá hơi cao nhưng xứng đáng.',
      helpful: 9,
      verified: true,
      hasImages: true
    }
  ],
  3: [
    {
      id: 4,
      user: 'Vũ Văn I',
      rating: 4,
      date: '20/10/2023',
      comment: 'Giá cả phải chăng, phù hợp với bảo hiểm y tế. Dịch vụ nhanh chóng, ít phải chờ đợi.',
      helpful: 8,
      verified: true,
      hasImages: false
    }
  ],
  4: [
    {
      id: 5,
      user: 'Mẹ bé Tú Anh',
      rating: 5,
      date: '22/10/2023',
      comment: 'Bệnh viện chuyên về nhi khoa tốt nhất. Bác sĩ rất hiểu tâm lý trẻ em.',
      helpful: 14,
      verified: true,
      hasImages: true
    }
  ]
};

// Dữ liệu mẫu - BỔ SUNG NHIỀU TỈNH THÀNH
const sampleFacilities = [
  // TP.HCM
  {
    id: 1,
    name: 'Bệnh viện Đa khoa TP.HCM',
    address: '125 Lý Chính Thắng, Quận 3, TP.HCM',
    province: 'Hồ Chí Minh',
    district: 'Quận 3',
    distance: '2.5',
    rating: 4.5,
    reviews: 128,
    specialties: ['Nội tổng quát', 'Ngoại khoa', 'Cấp cứu', 'Hô hấp', 'Tim mạch'],
    insurance: ['Bảo hiểm y tế', 'Bảo Việt', 'Bảo hiểm Prudential'],
    priceRange: 'trung bình',
    openHours: '24/24',
    appointmentAvailable: true,
    waitTime: '15 phút',
    type: 'hospital',
    emergencyDepartment: true
  },
  {
    id: 2,
    name: 'Phòng khám Đa khoa Quốc tế',
    address: '1 Lê Lợi, Quận 1, TP.HCM',
    province: 'Hồ Chí Minh',
    district: 'Quận 1',
    distance: '1.8',
    rating: 4.8,
    reviews: 89,
    specialties: ['Nhi khoa', 'Tai mũi họng', 'Da liễu', 'Thần kinh'],
    insurance: ['Bảo hiểm y tế', 'Bảo hiểm Bảo Minh', 'Bảo hiểm Manulife'],
    priceRange: 'cao',
    openHours: '07:00 - 20:00',
    appointmentAvailable: true,
    waitTime: '30 phút',
    type: 'clinic',
    emergencyDepartment: false
  },
  // Hà Nội
  {
    id: 3,
    name: 'Bệnh viện Bạch Mai',
    address: '78 Giải Phóng, Đống Đa, Hà Nội',
    province: 'Hà Nội',
    district: 'Đống Đa',
    distance: '3.5',
    rating: 4.7,
    reviews: 215,
    specialties: ['Tim mạch', 'Thần kinh', 'Cấp cứu', 'Nội tổng quát', 'Hô hấp'],
    insurance: ['Bảo hiểm y tế', 'Bảo Việt', 'Bảo hiểm Bảo Minh'],
    priceRange: 'trung bình',
    openHours: '24/24',
    appointmentAvailable: true,
    waitTime: '45 phút',
    type: 'hospital',
    emergencyDepartment: true
  },
  {
    id: 4,
    name: 'Bệnh viện Việt Đức',
    address: '40 Tràng Thi, Hoàn Kiếm, Hà Nội',
    province: 'Hà Nội',
    district: 'Hoàn Kiếm',
    distance: '2.1',
    rating: 4.6,
    reviews: 198,
    specialties: ['Ngoại khoa', 'Phẫu thuật', 'Cấp cứu', 'Chấn thương'],
    insurance: ['Bảo hiểm y tế', 'Bảo hiểm Prudential'],
    priceRange: 'trung bình',
    openHours: '24/24',
    appointmentAvailable: true,
    waitTime: '30 phút',
    type: 'hospital',
    emergencyDepartment: true
  },
  // Đà Nẵng
  {
    id: 5,
    name: 'Bệnh viện Đà Nẵng',
    address: '124 Hải Phòng, Hải Châu, Đà Nẵng',
    province: 'Đà Nẵng',
    district: 'Hải Châu',
    distance: '1.5',
    rating: 4.4,
    reviews: 76,
    specialties: ['Nội tổng quát', 'Sản phụ khoa', 'Nhi khoa', 'Cấp cứu'],
    insurance: ['Bảo hiểm y tế', 'Bảo hiểm Bảo Việt'],
    priceRange: 'thấp',
    openHours: '24/24',
    appointmentAvailable: true,
    waitTime: '25 phút',
    type: 'hospital',
    emergencyDepartment: true
  },
  // Cần Thơ
  {
    id: 6,
    name: 'Bệnh viện Đa khoa Trung ương Cần Thơ',
    address: '315 Nguyễn Văn Linh, Ninh Kiều, Cần Thơ',
    province: 'Cần Thơ',
    district: 'Ninh Kiều',
    distance: '4.2',
    rating: 4.3,
    reviews: 92,
    specialties: ['Nội tổng quát', 'Tim mạch', 'Thần kinh', 'Tiêu hóa'],
    insurance: ['Bảo hiểm y tế', 'Bảo hiểm AIA'],
    priceRange: 'trung bình',
    openHours: '24/24',
    appointmentAvailable: false,
    waitTime: '50 phút',
    type: 'hospital',
    emergencyDepartment: true
  },
  // Hải Phòng
  {
    id: 7,
    name: 'Bệnh viện Việt Tiệp Hải Phòng',
    address: '1 Nhà Thương, Lê Chân, Hải Phòng',
    province: 'Hải Phòng',
    district: 'Lê Chân',
    distance: '2.8',
    rating: 4.2,
    reviews: 67,
    specialties: ['Nội tổng quát', 'Hô hấp', 'Tiêu hóa', 'Cấp cứu'],
    insurance: ['Bảo hiểm y tế'],
    priceRange: 'thấp',
    openHours: '24/24',
    appointmentAvailable: true,
    waitTime: '35 phút',
    type: 'hospital',
    emergencyDepartment: true
  },
  // Khánh Hòa
  {
    id: 8,
    name: 'Bệnh viện Đa khoa tỉnh Khánh Hòa',
    address: '19 Yersin, Nha Trang, Khánh Hòa',
    province: 'Khánh Hòa',
    district: 'Nha Trang',
    distance: '3.0',
    rating: 4.1,
    reviews: 58,
    specialties: ['Nội tổng quát', 'Da liễu', 'Tai mũi họng', 'Cấp cứu'],
    insurance: ['Bảo hiểm y tế', 'Bảo hiểm Manulife'],
    priceRange: 'trung bình',
    openHours: '24/24',
    appointmentAvailable: true,
    waitTime: '40 phút',
    type: 'hospital',
    emergencyDepartment: true
  },
  // Bình Dương
  {
    id: 9,
    name: 'Bệnh viện Đa khoa tỉnh Bình Dương',
    address: '401 Đại lộ Bình Dương, Thủ Dầu Một, Bình Dương',
    province: 'Bình Dương',
    district: 'Thủ Dầu Một',
    distance: '5.5',
    rating: 4.0,
    reviews: 45,
    specialties: ['Nội tổng quát', 'Sản phụ khoa', 'Nhi khoa'],
    insurance: ['Bảo hiểm y tế'],
    priceRange: 'thấp',
    openHours: '07:00 - 22:00',
    appointmentAvailable: true,
    waitTime: '55 phút',
    type: 'hospital',
    emergencyDepartment: false
  },
  // Đồng Nai
  {
    id: 10,
    name: 'Bệnh viện Đa khoa Đồng Nai',
    address: '5 Phạm Văn Thuận, Biên Hòa, Đồng Nai',
    province: 'Đồng Nai',
    district: 'Biên Hòa',
    distance: '6.2',
    rating: 4.3,
    reviews: 81,
    specialties: ['Nội tổng quát', 'Cấp cứu', 'Ngoại khoa', 'Hô hấp'],
    insurance: ['Bảo hiểm y tế', 'Bảo hiểm Bảo Việt'],
    priceRange: 'trung bình',
    openHours: '24/24',
    appointmentAvailable: true,
    waitTime: '60 phút',
    type: 'hospital',
    emergencyDepartment: true
  }
];

const FilteredResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [expandedFacilityId, setExpandedFacilityId] = useState(null);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  // THÊM STATE CHO BOOKING MODAL
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '09:00',
    reason: '',
    notes: ''
  });
  const [availableTimes, setAvailableTimes] = useState([
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);


  // Hàm xử lý xem đánh giá
  const handleViewReviews = (facilityId) => {
    if (expandedFacilityId === facilityId) {
      setExpandedFacilityId(null);
    } else {
      setExpandedFacilityId(facilityId);
    }
    setReviewFilter('all');
  };

  // Lấy đánh giá theo facilityId và filter
  const getReviewsForFacility = (facilityId) => {
    const reviews = facilityReviews[facilityId] || [];

    return reviews.filter(review => {
      switch (reviewFilter) {
        case '5star':
          return review.rating === 5;
        case 'withImages':
          return review.hasImages;
        case 'verified':
          return review.verified;
        default:
          return true;
      }
    });
  };

  // Tính rating trung bình
  const getAverageRating = (facilityId) => {
    const reviews = facilityReviews[facilityId] || [];
    if (reviews.length === 0) return '0.0';
    const avg = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    return avg.toFixed(1);
  };

  // Tính toán distribution rating
  const getRatingDistribution = (facilityId) => {
    const reviews = facilityReviews[facilityId] || [];
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach(review => {
      const rating = Math.round(review.rating);
      if (distribution[rating] !== undefined) {
        distribution[rating]++;
      }
    });

    return distribution;
  };

  // Lấy thống kê đánh giá
  const getReviewStats = (facilityId) => {
    const reviews = facilityReviews[facilityId] || [];
    const totalReviews = reviews.length;
    const verifiedReviews = reviews.filter(r => r.verified).length;
    const reviewsWithImages = reviews.filter(r => r.hasImages).length;
    const totalHelpful = reviews.reduce((sum, r) => sum + r.helpful, 0);
    const avgHelpful = totalReviews > 0 ? Math.round(totalHelpful / totalReviews) : 0;

    return {
      totalReviews,
      verifiedReviews,
      reviewsWithImages,
      avgHelpful
    };
  };

  // Tìm kiếm cơ sở phù hợp
  const findMatchingFacilities = () => {
    setLoading(true);

    const facilitiesWithScore = sampleFacilities.map(facility => {
      let relevanceScore = 0;
      let matchDetails = [];

      // Ưu tiên đánh giá cao
      relevanceScore += facility.rating * 2;
      matchDetails.push(`Đánh giá ${facility.rating} sao: +${facility.rating * 2} điểm`);

      // Giảm điểm nếu không có lịch trống
      if (!facility.appointmentAvailable) {
        relevanceScore -= 5;
        matchDetails.push('Không có lịch trống: -5 điểm');
      }

      return {
        ...facility,
        relevanceScore: Math.round(relevanceScore * 100) / 100,
        matchDetails
      };
    });

    // Sắp xếp theo độ phù hợp
    const sortedFacilities = facilitiesWithScore.sort((a, b) => {
      if (sortBy === 'relevance') {
        return b.relevanceScore - a.relevanceScore;
      } else if (sortBy === 'distance') {
        return parseFloat(a.distance) - parseFloat(b.distance);
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else if (sortBy === 'price') {
        const priceOrder = { 'thấp': 1, 'trung bình': 2, 'cao': 3 };
        return priceOrder[a.priceRange] - priceOrder[b.priceRange];
      }
      return 0;
    });

    setFilteredFacilities(sortedFacilities);
    setLoading(false);
  };


  // Hàm lấy cấp độ khẩn cấp
  function getEmergencyLevelText(level) {
    switch (level) {
      case 'high': return { text: 'Cấp độ cao - Cần khám ngay', color: '#dc3545' };
      case 'medium': return { text: 'Cấp độ trung bình - Khám trong ngày', color: '#ffc107' };
      case 'low': return { text: 'Cấp độ thấp - Có thể đặt lịch sau', color: '#28a745' };
      default: return { text: 'Không xác định', color: '#6c757d' };
    }
  }

  // HÀM XỬ LÝ ĐẶT LỊCH MỚI
  const handleBookAppointment = (facilityId) => {
    const facility = sampleFacilities.find(f => f.id === facilityId);
    if (!facility) return;

    setSelectedFacility(facility);

    // Tạo danh sách bác sĩ mẫu dựa trên chuyên khoa
    const doctors = [
      { id: 1, name: 'BS. Nguyễn Văn An', specialty: facility.specialties[0] || 'Nội tổng quát', experience: '15 năm' },
      { id: 2, name: 'BS. Trần Thị Bình', specialty: facility.specialties[0] || 'Nội tổng quát', experience: '10 năm' },
      { id: 3, name: 'TS. Lê Văn Cường', specialty: facility.specialties[0] || 'Nội tổng quát', experience: '20 năm' }
    ];

    setAvailableDoctors(doctors);
    setSelectedDoctor(doctors[0]?.id || '');

    // Set default values for booking form
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];

    setBookingForm({
      name: '',
      phone: '',
      email: '',
      date: formattedDate,
      time: '09:00',
      reason: 'Khám tổng quát',
      notes: ''
    });

    setBookingStep(1);
    setBookingConfirmed(false);
    setShowBookingModal(true);
  };

  // Hàm đóng modal đặt lịch
  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setSelectedFacility(null);
    setBookingStep(1);
    setBookingConfirmed(false);
  };

  // Hàm xử lý thay đổi form
  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Hàm chuyển bước đặt lịch
  const handleNextStep = () => {
    if (bookingStep === 1) {
      // Validate step 1
      if (!bookingForm.name || !bookingForm.phone || !bookingForm.date) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }
    }
    setBookingStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setBookingStep(prev => prev - 1);
  };

  // Hàm xác nhận đặt lịch
  const handleConfirmBooking = () => {
    setBookingConfirmed(true);
    setBookingStep(4);
  };

  // Hàm in vé
  const handlePrintTicket = () => {
    window.print();
  };

  // Hàm gửi email xác nhận
  const handleSendConfirmation = () => {
    alert(`Đã gửi xác nhận đặt lịch đến ${bookingForm.email || bookingForm.phone}`);
    handleCloseBookingModal();
  };

  // Hàm lọc dữ liệu
  const applyFilters = (filterData) => {
    setLoading(true);

    // Tạo danh sách bộ lọc đang áp dụng
    const active = [];
    if (filterData.specialty) active.push(`Chuyên khoa: ${filterData.specialty}`);
    if (filterData.insurance) active.push(`Bảo hiểm: ${filterData.insurance}`);
    if (filterData.priceRange !== 'all') active.push(`Giá: ${filterData.priceRange === 'thấp' ? 'Thấp' : filterData.priceRange === 'cao' ? 'Cao' : 'Trung bình'}`);
    if (filterData.workingHours !== 'all') active.push(`Giờ làm việc: ${filterData.workingHours === '24/24' ? '24/24' : 'Hành chính'}`);
    if (filterData.rating > 0) active.push(`Đánh giá: ${filterData.rating}+`);
    if (filterData.province) active.push(`Tỉnh/TP: ${filterData.province}`);
    setActiveFilters(active);

    setTimeout(() => {
      let results = [...sampleFacilities];

      // Áp dụng từng bộ lọc
      if (filterData.specialty) {
        results = results.filter(f => f.specialties.includes(filterData.specialty));
      }

      if (filterData.insurance) {
        results = results.filter(f => f.insurance.includes(filterData.insurance));
      }

      if (filterData.priceRange !== 'all') {
        results = results.filter(f => f.priceRange === filterData.priceRange);
      }

      if (filterData.workingHours !== 'all') {
        if (filterData.workingHours === '24/24') {
          results = results.filter(f => f.openHours === '24/24');
        } else if (filterData.workingHours === 'hành_chinh') {
          results = results.filter(f => f.openHours !== '24/24');
        }
      }

      if (filterData.rating > 0) {
        results = results.filter(f => f.rating >= filterData.rating);
      }

      // THÊM LỌC THEO TỈNH/THÀNH PHỐ
      if (filterData.province) {
        results = results.filter(f => f.province === filterData.province);
      }

      setFilteredFacilities(results);
      setLoading(false);
    }, 1000);
  };

  // Xử lý khi component mount
  useEffect(() => {
    if (location.state?.filters) {
      setFilters(location.state.filters);
      applyFilters(location.state.filters);
    } else {
      // Nếu không có bộ lọc, quay lại trang chủ
      navigate('/');
    }
  }, [location, navigate]);


  const handleEditFilters = () => {
    navigate(-1);
  };

  // Hàm format thông tin chi tiết
  const getFilterDetails = () => {
    if (!filters) return [];

    const details = [];

    if (filters.specialty) {
      details.push({
        icon: 'bi-heart-pulse',
        label: 'Chuyên khoa',
        value: filters.specialty,
        type: 'filter'
      });
    }

    if (filters.insurance) {
      details.push({
        icon: 'bi-shield-check',
        label: 'Bảo hiểm',
        value: filters.insurance,
        type: 'filter'
      });
    }

    if (filters.priceRange && filters.priceRange !== 'all') {
      const priceText = filters.priceRange === 'thấp' ? 'Thấp' :
        filters.priceRange === 'cao' ? 'Cao' : 'Trung bình';
      details.push({
        icon: 'bi-cash',
        label: 'Khoảng giá',
        value: priceText,
        type: 'range'
      });
    }

    if (filters.province) {
      details.push({
        icon: 'bi-geo-alt',
        label: 'Khu vực',
        value: filters.province,
        type: 'filter'
      });
    }

    return details;
  };

  // Tính toán thống kê
  const calculateStats = () => {
    const avgRating = filteredFacilities.length > 0
      ? (filteredFacilities.reduce((sum, f) => sum + f.rating, 0) / filteredFacilities.length).toFixed(1)
      : '0.0';

    const availableAppointments = filteredFacilities.filter(f => f.appointmentAvailable).length;
    const avgDistance = filteredFacilities.length > 0
      ? (filteredFacilities.reduce((sum, f) => sum + parseFloat(f.distance), 0) / filteredFacilities.length).toFixed(1)
      : '0.0';

    return {
      avgRating,
      availableAppointments,
      avgDistance,
      totalResults: filteredFacilities.length
    };
  };

  const stats = calculateStats();
  const filterDetails = getFilterDetails();

  return (
    <div className="filtered-results-page">
      {/* Header */}
      <div className="results-header">
        <div className="container">
          <div className="header-content">
            <button
              className="back-button"
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left"></i> Quay lại
            </button>

            <div className="search-summary">
              <h1>
                <i className="bi bi-search-heart"></i>
                Kết quả theo bộ lọc
              </h1>


            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        <div className="results-content">
          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Đang tìm kiếm cơ sở phù hợp với bộ lọc của bạn...</p>
            </div>
          )}

          {/* No Results */}
          {!loading && filteredFacilities.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">
                <i className="bi bi-search"></i>
              </div>
              <h3>Không tìm thấy cơ sở phù hợp</h3>
              <p>Không có cơ sở y tế nào đáp ứng tất cả tiêu chí lọc của bạn.</p>
              <div className="no-results-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleEditFilters}
                >
                  <i className="bi bi-funnel me-2"></i> Chỉnh sửa bộ lọc
                </button>
                <Link to="/" className="btn btn-outline-primary">
                  <i className="bi bi-house me-2"></i> Về trang chủ
                </Link>
              </div>
            </div>
          )}

          {/* Results List */}
          {!loading && filteredFacilities.length > 0 && (
            <>
              <div className="results-list">
                {filteredFacilities.map((facility, index) => {
                  const reviews = getReviewsForFacility(facility.id);
                  const avgRating = getAverageRating(facility.id);
                  const ratingDistribution = getRatingDistribution(facility.id);
                  const reviewStats = getReviewStats(facility.id);
                  const isExpanded = expandedFacilityId === facility.id;

                  return (
                    <div key={facility.id} className="result-card">
                      <div className="card-header">
                        <div className="rank-badge">
                          <div className="rank-number">#{index + 1}</div>
                          <div className="rank-label">Xếp hạng</div>
                        </div>
                      </div>

                      <div className="card-body">
                        <div className="facility-info">
                          <div className="facility-main">
                            <div className="facility-title">
                              <h3 className="facility-name">
                                {facility.name}
                              </h3>
                              <div className="facility-meta">
                                <span className="facility-type">
                                  <i className="bi bi-building"></i>
                                  {facility.type === 'hospital' ? 'Bệnh viện' :
                                    facility.type === 'clinic' ? 'Phòng khám' :
                                    facility.type === 'specialty-clinic' ? 'Phòng khám chuyên khoa' : 
                                    facility.type === 'medical-center' ? 'Trung tâm y tế' :
                                    facility.type === 'specialty-hospital' ? 'Bệnh viện chuyên khoa' :
                                    facility.type === 'pharmacy' ? 'Nhà thuốc' : 'Cơ sở y tế'}
                                </span>
                                <span className="facility-distance">
                                  <i className="bi bi-geo-alt"></i>
                                  {facility.distance}
                                </span>
                                <span className="facility-rating">
                                  <i className="bi bi-star-fill"></i>
                                  {facility.rating} ({facility.reviews} đánh giá)
                                </span>
                              </div>
                            </div>

                            <p className="facility-address">
                              <i className="bi bi-geo-alt-fill"></i>
                              {facility.address}
                            </p>

                            <div className="facility-specialties">
                              <div className="specialties-label">
                                <i className="bi bi-heart-pulse"></i>
                                Chuyên khoa:
                              </div>
                              <div className="specialties-tags">
                                {facility.specialties.map((specialty, idx) => (
                                  <span
                                    key={idx}
                                    className={`specialty-tag ${idx === 0 ? 'primary' : idx === 1 ? 'secondary' : 'default'}`}
                                  >
                                    {specialty}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="facility-details">
                            <div className="facility-features">
                              <div className="feature-item">
                                <div className="feature-icon">
                                  <i className="bi bi-clock"></i>
                                </div>
                                <div className="feature-content">
                                  <div className="feature-label">Giờ mở cửa</div>
                                  <div className="feature-value">{facility.openHours}</div>
                                </div>
                              </div>
                              <div className="feature-item">
                                <div className="feature-icon">
                                  <i className="bi bi-cash"></i>
                                </div>
                                <div className="feature-content">
                                  <div className="feature-label">Mức giá</div>
                                  <div className="feature-value">
                                    {facility.priceRange === 'thấp' ? 'Thấp' :
                                      facility.priceRange === 'cao' ? 'Cao' : 'Trung bình'}
                                  </div>
                                </div>
                              </div>
                              <div className="feature-item">
                                <div className="feature-icon">
                                  <i className="bi bi-shield-check"></i>
                                </div>
                                <div className="feature-content">
                                  <div className="feature-label">Bảo hiểm</div>
                                  <div className="feature-value">{facility.insurance.length} loại</div>
                                </div>
                              </div>
                              <div className="feature-item">
                                <div className="feature-icon">
                                  <i className={`bi ${facility.appointmentAvailable ? 'bi-calendar-check' : 'bi-calendar-x'}`}></i>
                                </div>
                                <div className="feature-content">
                                  <div className="feature-label">Lịch hẹn</div>
                                  <div className={`feature-value ${facility.appointmentAvailable ? 'text-success' : 'text-danger'}`}>
                                    {facility.appointmentAvailable ? 'Có sẵn' : 'Hết lịch'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="facility-actions">
                          <div className="action-buttons">
                            <button
                              className="btn btn-primary"
                              onClick={() => handleBookAppointment(facility.id)}
                              disabled={!facility.appointmentAvailable}
                            >
                              <i className="bi bi-calendar-plus"></i>
                              {facility.appointmentAvailable ? 'Đặt lịch ngay' : 'Hết lịch'}
                            </button>
                            <button
                              className={`btn ${isExpanded ? 'btn-warning' : 'btn-outline-warning'}`}
                              onClick={() => handleViewReviews(facility.id)}
                              title={isExpanded ? 'Đóng đánh giá' : 'Xem đánh giá người dùng'}
                            >
                              <i className={`bi ${isExpanded ? 'bi-chat-left-text-fill' : 'bi-chat-left-text'}`}></i>
                              {isExpanded ? 'Đóng đánh giá' : 'Xem đánh giá'}
                            </button>
                          </div>
                        </div>

                        {/* Reviews Section - Expandable */}
                        {isExpanded && (
                          <div className="facility-reviews">
                            <div className="reviews-header">
                              <h6>Đánh giá từ người dùng</h6>
                              <div className="rating-summary">
                                <div className="average-rating">
                                  <div className="rating-number">{avgRating}<span>/5</span></div>
                                  <div className="reviews-count">{reviewStats.totalReviews} đánh giá</div>
                                </div>
                              </div>
                            </div>

                            {/* Reviews Stats */}
                            {reviewStats.totalReviews > 0 && (
                              <div className="review-filters mb-3">
                                <button
                                  className={`btn btn-sm ${reviewFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                  onClick={() => setReviewFilter('all')}
                                >
                                  Tất cả ({reviewStats.totalReviews})
                                </button>
                                <button
                                  className={`btn btn-sm ${reviewFilter === '5star' ? 'btn-primary' : 'btn-outline-primary'}`}
                                  onClick={() => setReviewFilter('5star')}
                                >
                                  5 sao ({ratingDistribution[5]})
                                </button>
                                <button
                                  className={`btn btn-sm ${reviewFilter === 'withImages' ? 'btn-primary' : 'btn-outline-primary'}`}
                                  onClick={() => setReviewFilter('withImages')}
                                >
                                  Có hình ảnh ({reviewStats.reviewsWithImages})
                                </button>
                                <button
                                  className={`btn btn-sm ${reviewFilter === 'verified' ? 'btn-primary' : 'btn-outline-primary'}`}
                                  onClick={() => setReviewFilter('verified')}
                                >
                                  Đã xác thực ({reviewStats.verifiedReviews})
                                </button>
                              </div>
                            )}

                            {/* Reviews List */}
                            {reviews.length === 0 ? (
                              <div className="no-reviews text-center py-4">
                                <i className="bi bi-chat-text display-4 text-muted mb-3"></i>
                                <p className="text-muted">
                                  {reviewFilter === 'all'
                                    ? 'Chưa có đánh giá nào cho cơ sở này.'
                                    : 'Không tìm thấy đánh giá phù hợp với bộ lọc.'}
                                </p>
                                {reviewFilter !== 'all' && (
                                  <button
                                    className="btn btn-outline-primary"
                                    onClick={() => setReviewFilter('all')}
                                  >
                                    Xem tất cả đánh giá
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="reviews-list">
                                {reviews.map(review => (
                                  <div key={review.id} className="review-item border-bottom pb-3 mb-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                      <div className="d-flex align-items-center">
                                        <div className="user-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                          {review.user.charAt(0)}
                                        </div>
                                        <div>
                                          <div className="fw-bold">{review.user}</div>
                                          <small className="text-muted">{review.date}</small>
                                        </div>
                                        {review.verified && (
                                          <span className="badge bg-success ms-2">
                                            <i className="bi bi-check-circle me-1"></i> Đã xác thực
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-warning">
                                        {[...Array(5)].map((_, i) => (
                                          <i
                                            key={i}
                                            className={`bi ${i < review.rating ? 'bi-star-fill' : 'bi-star'}`}
                                          ></i>
                                        ))}
                                      </div>
                                    </div>
                                    <p className="mb-2">{review.comment}</p>
                                    <div className="d-flex justify-content-between align-items-center">
                                      <button className="btn btn-sm btn-outline-primary">
                                        <i className="bi bi-hand-thumbs-up me-1"></i>
                                        Hữu ích ({review.helpful})
                                      </button>
                                      {review.hasImages && (
                                        <span className="badge bg-light text-dark">
                                          <i className="bi bi-image me-1"></i> Có hình ảnh
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* BOOKING MODAL */}
      {showBookingModal && selectedFacility && (
        <div className="booking-modal-overlay active">
          <div className="booking-modal-container">
            <div className="booking-modal-content">
              <div className="booking-modal-header">
                <h5>
                  <i className="bi bi-calendar-plus me-2"></i>
                  Đặt lịch khám trực tuyến
                </h5>
                <button
                  className="btn-close"
                  onClick={handleCloseBookingModal}
                  disabled={bookingStep === 4 && bookingConfirmed}
                ></button>
              </div>

              <div className="booking-modal-body">
                {/* Facility Info */}
                <div className="booking-facility-info">
                  <h6>{selectedFacility.name}</h6>
                  <div className="facility-details">
                    <span className="badge bg-light text-dark me-2">
                      <i className="bi bi-geo-alt me-1"></i>
                      {selectedFacility.province}
                    </span>
                    <span className="badge bg-light text-dark me-2">
                      <i className="bi bi-star-fill me-1"></i>
                      {selectedFacility.rating}
                    </span>
                    <span className="badge bg-light text-dark">
                      <i className="bi bi-cash me-1"></i>
                      {selectedFacility.priceRange === 'thấp' ? 'Giá thấp' :
                        selectedFacility.priceRange === 'cao' ? 'Giá cao' : 'Giá trung bình'}
                    </span>
                  </div>
                  <p className="mb-0 text-muted">
                    <small>{selectedFacility.address}</small>
                  </p>
                </div>

                {/* Booking Steps */}
                <div className="booking-steps">
                  <div className={`step ${bookingStep >= 1 ? 'active' : ''}`}>
                    <div className="step-number">1</div>
                    <div className="step-label">Thông tin</div>
                  </div>
                  <div className={`step ${bookingStep >= 2 ? 'active' : ''}`}>
                    <div className="step-number">2</div>
                    <div className="step-label">Thời gian</div>
                  </div>
                  <div className={`step ${bookingStep >= 3 ? 'active' : ''}`}>
                    <div className="step-number">3</div>
                    <div className="step-label">Xác nhận</div>
                  </div>
                  <div className={`step ${bookingStep >= 4 ? 'active' : ''}`}>
                    <div className="step-number">4</div>
                    <div className="step-label">Hoàn tất</div>
                  </div>
                </div>

                {/* Step 1: Patient Information */}
                {bookingStep === 1 && (
                  <div className="booking-step-content">
                    <h6>Thông tin bệnh nhân</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">
                          <i className="bi bi-person me-1"></i>
                          Họ và tên <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={bookingForm.name}
                          onChange={handleBookingFormChange}
                          placeholder="Nhập họ và tên"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">
                          <i className="bi bi-telephone me-1"></i>
                          Số điện thoại <span className="text-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          name="phone"
                          value={bookingForm.phone}
                          onChange={handleBookingFormChange}
                          placeholder="Nhập số điện thoại"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">
                          <i className="bi bi-envelope me-1"></i>
                          Email
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={bookingForm.email}
                          onChange={handleBookingFormChange}
                          placeholder="Nhập email (nếu có)"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">
                          <i className="bi bi-calendar me-1"></i>
                          Ngày khám dự kiến <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          name="date"
                          value={bookingForm.date}
                          onChange={handleBookingFormChange}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Appointment Details */}
                {bookingStep === 2 && (
                  <div className="booking-step-content">
                    <h6>Chi tiết lịch hẹn</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">
                          <i className="bi bi-clock me-1"></i>
                          Giờ khám
                        </label>
                        <select
                          className="form-select"
                          name="time"
                          value={bookingForm.time}
                          onChange={handleBookingFormChange}
                        >
                          {availableTimes.map(time => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">
                          <i className="bi bi-person-badge me-1"></i>
                          Bác sĩ (tùy chọn)
                        </label>
                        <select
                          className="form-select"
                          value={selectedDoctor}
                          onChange={(e) => setSelectedDoctor(e.target.value)}
                        >
                          <option value="">Chọn bác sĩ</option>
                          {availableDoctors.map(doctor => (
                            <option key={doctor.id} value={doctor.id}>
                              {doctor.name} - {doctor.specialty} ({doctor.experience})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label">
                          <i className="bi bi-file-text me-1"></i>
                          Lý do khám
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="reason"
                          value={bookingForm.reason}
                          onChange={handleBookingFormChange}
                          placeholder="Mô tả triệu chứng/ lý do khám"
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">
                          <i className="bi bi-chat-text me-1"></i>
                          Ghi chú thêm
                        </label>
                        <textarea
                          className="form-control"
                          name="notes"
                          value={bookingForm.notes}
                          onChange={handleBookingFormChange}
                          rows="3"
                          placeholder="Thông tin bổ sung (nếu có)"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {bookingStep === 3 && !bookingConfirmed && (
                  <div className="booking-step-content">
                    <h6>Xác nhận thông tin</h6>
                    <div className="booking-summary">
                      <div className="summary-section">
                        <h6>Thông tin bệnh nhân</h6>
                        <p><strong>Họ tên:</strong> {bookingForm.name}</p>
                        <p><strong>SĐT:</strong> {bookingForm.phone}</p>
                        {bookingForm.email && <p><strong>Email:</strong> {bookingForm.email}</p>}
                      </div>

                      <div className="summary-section">
                        <h6>Thông tin lịch hẹn</h6>
                        <p><strong>Cơ sở:</strong> {selectedFacility.name}</p>
                        <p><strong>Địa điểm:</strong> {selectedFacility.province} - {selectedFacility.district}</p>
                        <p><strong>Ngày:</strong> {bookingForm.date}</p>
                        <p><strong>Giờ:</strong> {bookingForm.time}</p>
                        {selectedDoctor && (
                          <p><strong>Bác sĩ:</strong> {
                            availableDoctors.find(d => d.id === parseInt(selectedDoctor))?.name
                          }</p>
                        )}
                        <p><strong>Lý do:</strong> {bookingForm.reason}</p>
                      </div>

                      <div className="summary-section">
                        <h6>Lưu ý quan trọng</h6>
                        <ul className="booking-notes">
                          <li>Vui lòng đến trước 15 phút để làm thủ tục</li>
                          <li>Mang theo CMND/CCCD và thẻ BHYT (nếu có)</li>
                          <li>Có thể hủy lịch trước 2 giờ mà không bị phí</li>
                          <li>Thông tin lịch hẹn sẽ được gửi qua SMS</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Booking Success */}
                {bookingStep === 4 && bookingConfirmed && (
                  <div className="booking-step-content success">
                    <div className="success-icon">
                      <i className="bi bi-check-circle"></i>
                    </div>
                    <h5>Đặt lịch thành công!</h5>

                    <div className="booking-confirmation">
                      <div className="confirmation-code">
                        <strong>Mã đặt lịch:</strong>
                        <span className="code">BK-{Date.now().toString().slice(-8)}</span>
                      </div>

                      <div className="confirmation-details">
                        <p><i className="bi bi-building me-2"></i>
                          <strong>Cơ sở:</strong> {selectedFacility.name}
                        </p>
                        <p><i className="bi bi-geo-alt me-2"></i>
                          <strong>Địa điểm:</strong> {selectedFacility.province} - {selectedFacility.district}
                        </p>
                        <p><i className="bi bi-calendar me-2"></i>
                          <strong>Thời gian:</strong> {bookingForm.date} lúc {bookingForm.time}
                        </p>
                        <p><i className="bi bi-person me-2"></i>
                          <strong>Bệnh nhân:</strong> {bookingForm.name}
                        </p>
                      </div>

                      <div className="confirmation-instructions">
                        <h6>Hướng dẫn tiếp theo:</h6>
                        <ol>
                          <li>Vui lòng đến trước 15 phút để làm thủ tục</li>
                          <li>Mang theo CMND/CCCD và thẻ BHYT</li>
                          <li>Thông tin đã được gửi đến {bookingForm.email || bookingForm.phone}</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="booking-modal-footer">
                {bookingStep < 3 && !bookingConfirmed ? (
                  <>
                    <button
                      className="btn btn-secondary"
                      onClick={bookingStep === 1 ? handleCloseBookingModal : handlePrevStep}
                    >
                      <i className="bi bi-arrow-left me-1"></i>
                      {bookingStep === 1 ? 'Hủy' : 'Quay lại'}
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={bookingStep === 2 ? handleConfirmBooking : handleNextStep}
                    >
                      {bookingStep === 2 ? 'Xác nhận đặt lịch' : 'Tiếp theo'}
                      <i className="bi bi-arrow-right ms-1"></i>
                    </button>
                  </>
                ) : bookingConfirmed ? (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={handleSendConfirmation}
                    >
                      <i className="bi bi-check-circle me-1"></i>
                      Hoàn tất
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  ); // XÓA THẺ ĐÓNG </div> THỪA Ở ĐÂY
};

export default FilteredResults;