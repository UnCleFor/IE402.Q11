import React, { useState, useEffect } from 'react';
import './NearbyFacilitiesPage.css';

const NearbyFacilitiesPage = () => {
  // State và logic từ file NearbyFacilities.jsx
  const [sortBy, setSortBy] = useState('distance');
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [locationSource, setLocationSource] = useState('unknown');
  const [showFacilities, setShowFacilities] = useState(false);
  const [expandedFacilityId, setExpandedFacilityId] = useState(null);
  const [reviewFilter, setReviewFilter] = useState('all');
  
  // State cho booking modal
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
  
  const [availableTimes] = useState([
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ]);
  
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Dữ liệu mẫu - Copy từ NearbyFacilities.jsx
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
      },
      {
        id: 3,
        user: 'Lê Văn C',
        rating: 3,
        date: '10/10/2023',
        comment: 'Cơ sở hơi đông đúc, nhưng bác sĩ chẩn đoán chính xác. Xét nghiệm nhanh.',
        helpful: 5,
        verified: false,
        hasImages: true
      },
      {
        id: 4,
        user: 'Phạm Thị D',
        rating: 5,
        date: '08/10/2023',
        comment: 'Đã khám ở đây nhiều lần. Luôn hài lòng với dịch vụ. Bác sĩ tư vấn rất nhiệt tình.',
        helpful: 15,
        verified: true,
        hasImages: false
      }
    ],
    2: [
      {
        id: 5,
        user: 'Mai Thị F',
        rating: 5,
        date: '18/10/2023',
        comment: 'Phòng khám sang trọng, bác sĩ chuyên nghiệp. Giá hơi cao nhưng xứng đáng.',
        helpful: 9,
        verified: true,
        hasImages: true
      },
      {
        id: 6,
        user: 'Đặng Văn G',
        rating: 4,
        date: '16/10/2023',
        comment: 'Dịch vụ quốc tế, bác sĩ nói tiếng Anh tốt. Thích hợp cho người nước ngoài.',
        helpful: 6,
        verified: true,
        hasImages: false
      },
      {
        id: 7,
        user: 'Hoàng Văn H',
        rating: 5,
        date: '14/10/2023',
        comment: 'Khám nhi khoa rất tốt. Bác sĩ kiên nhẫn với trẻ em. Phòng chờ có khu vui chơi cho bé.',
        helpful: 11,
        verified: true,
        hasImages: true
      }
    ],
    3: [
      {
        id: 8,
        user: 'Vũ Văn I',
        rating: 4,
        date: '20/10/2023',
        comment: 'Giá cả phải chăng, phù hợp với bảo hiểm y tế. Dịch vụ nhanh chóng, ít phải chờ đợi.',
        helpful: 8,
        verified: true,
        hasImages: false
      },
      {
        id: 9,
        user: 'Lý Thị K',
        rating: 3,
        date: '19/10/2023',
        comment: 'Cơ sở hơi cũ nhưng dịch vụ ổn. Bác sĩ có kinh nghiệm, nhưng thời gian chờ hơi lâu.',
        helpful: 4,
        verified: false,
        hasImages: false
      },
      {
        id: 10,
        user: 'Trịnh Văn L',
        rating: 5,
        date: '17/10/2023',
        comment: 'Khám tổng quát tốt, chi phí thấp. Phù hợp với sinh viên và người có thu nhập thấp.',
        helpful: 10,
        verified: true,
        hasImages: true
      }
    ],
    4: [
      {
        id: 11,
        user: 'Mẹ bé Tú Anh',
        rating: 5,
        date: '22/10/2023',
        comment: 'Bệnh viện chuyên về nhi khoa tốt nhất. Bác sĩ rất hiểu tâm lý trẻ em. Bé nhà tôi không sợ khám nữa.',
        helpful: 14,
        verified: true,
        hasImages: true
      },
      {
        id: 12,
        user: 'Ba bé Minh Đức',
        rating: 4,
        date: '21/10/2023',
        comment: 'Cấp cứu nhi nhanh chóng. Đội ngũ y tế tận tâm, xử lý tình huống khẩn cấp rất chuyên nghiệp.',
        helpful: 7,
        verified: true,
        hasImages: false
      },
      {
        id: 13,
        user: 'Chị Thanh Hằng',
        rating: 3,
        date: '20/10/2023',
        comment: 'Đông bệnh nhân, chờ lâu. Nhưng bác sĩ giỏi và chuẩn đoán chính xác. Cần cải thiện thời gian chờ.',
        helpful: 5,
        verified: false,
        hasImages: false
      },
      {
        id: 14,
        user: 'Anh Tuấn Kiệt',
        rating: 5,
        date: '18/10/2023',
        comment: 'Phòng khám sạch sẽ, đồ chơi cho trẻ em nhiều. Bé nhà mình rất thích, không khóc khi đi khám.',
        helpful: 9,
        verified: true,
        hasImages: true
      }
    ]
  };

  const sampleFacilities = [
    {
      id: 1,
      name: 'Bệnh viện Đa khoa TP.HCM',
      address: '125 Lý Chính Thắng, Quận 3, TP.HCM',
      coordinates: { lat: 10.7829, lng: 106.6773 },
      distance: '2.5',
      rating: 4.5,
      reviews: 128,
      specialties: ['Nội tổng quát', 'Ngoại khoa', 'Cấp cứu', 'Tim mạch'],
      insurance: ['Bảo hiểm y tế', 'Bảo Việt', 'Prudential', 'AIA'],
      priceRange: 'trung bình',
      openHours: '24/24',
      appointmentAvailable: true,
      waitTime: '15-30 phút',
      type: 'hospital',
      features: ['Cấp cứu 24/7', 'Phòng VIP', 'Đỗ xe miễn phí'],
      phone: '0283 825 6789',
      website: 'www.bvdk-tphcm.vn'
    },
    {
      id: 2,
      name: 'Phòng khám Đa khoa Quốc tế',
      address: '1 Lê Lợi, Quận 1, TP.HCM',
      coordinates: { lat: 10.7758, lng: 106.7034 },
      distance: '1.8',
      rating: 4.8,
      reviews: 89,
      specialties: ['Nhi khoa', 'Tai mũi họng', 'Da liễu', 'Răng hàm mặt'],
      insurance: ['Bảo hiểm y tế', 'Bảo Minh', 'Manulife', 'Liberty'],
      priceRange: 'cao',
      openHours: '07:00 - 20:00',
      appointmentAvailable: true,
      waitTime: '20-40 phút',
      type: 'clinic',
      features: ['Bác sĩ quốc tế', 'Phiên dịch tiếng Anh', 'Phòng chờ VIP'],
      phone: '0283 822 1234',
      website: 'www.pkquocte.com'
    },
    {
      id: 3,
      name: 'Trung tâm Y tế Quận 5',
      address: '786 Nguyễn Trãi, Quận 5, TP.HCM',
      coordinates: { lat: 10.7540, lng: 106.6624 },
      distance: '3.2',
      rating: 4.2,
      reviews: 56,
      specialties: ['Nội tổng quát', 'Sản phụ khoa', 'Xét nghiệm', 'Chẩn đoán hình ảnh'],
      insurance: ['Bảo hiểm y tế', 'Bảo hiểm xã hội'],
      priceRange: 'thấp',
      openHours: '07:30 - 17:00',
      appointmentAvailable: true,
      waitTime: '30-60 phút',
      type: 'medical-center',
      features: ['Giá cả hợp lý', 'Đối tượng chính sách', 'Khám BHYT'],
      phone: '0283 855 4321',
      website: 'www.ttyt-quan5.gov.vn'
    },
    {
      id: 4,
      name: 'Bệnh viện Nhi Đồng Thành phố',
      address: '15 Võ Trường Toản, Quận 1, TP.HCM',
      coordinates: { lat: 10.7889, lng: 106.6912 },
      distance: '2.9',
      rating: 4.7,
      reviews: 203,
      specialties: ['Nhi khoa', 'Cấp cứu nhi', 'Dinh dưỡng', 'Tâm lý trẻ em'],
      insurance: ['Bảo hiểm y tế', 'Bảo Việt', 'AIA', 'Prudential'],
      priceRange: 'trung bình',
      openHours: '24/24',
      appointmentAvailable: false,
      waitTime: '45-90 phút',
      type: 'hospital',
      features: ['Khu vui chơi trẻ em', 'Bác sĩ chuyên khoa nhi', 'Phòng gia đình'],
      phone: '0283 829 5678',
      website: 'www.nhidong.org.vn'
    }
  ];

  // Các hàm xử lý - Copy từ NearbyFacilities.jsx
  const getDefaultLocation = () => {
    return {
      lat: 10.8231,
      lng: 106.6297,
      city: 'Thành phố Hồ Chí Minh',
      source: 'default',
      accuracy: 100000,
      timestamp: Date.now()
    };
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchUserLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError('');

    setTimeout(() => {
      const defaultLocation = getDefaultLocation();
      setUserLocation(defaultLocation);
      setLocationSource('default');
      setIsLoadingLocation(false);
    }, 1000);
  };

  const getFacilitiesWithDistance = () => {
    return sampleFacilities.map(facility => {
      let distance = null;
      let distanceText = 'Chưa xác định';
      let isExactDistance = false;

      if (userLocation && facility.coordinates) {
        const dist = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          facility.coordinates.lat,
          facility.coordinates.lng
        );

        distance = dist;

        if (locationSource === 'manual') {
          distanceText = `${dist.toFixed(1)} km`;
          isExactDistance = true;
        } else {
          distanceText = `Khoảng ${Math.round(dist)} km`;
          isExactDistance = false;
        }
      }

      return {
        ...facility,
        distance,
        distanceText,
        isExactDistance,
        numericDistance: distance !== null ? distance : Infinity
      };
    });
  };

  const getSortedFacilities = () => {
    const facilitiesWithDist = getFacilitiesWithDistance();

    return [...facilitiesWithDist].sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          if (a.isExactDistance && !b.isExactDistance) return -1;
          if (!a.isExactDistance && b.isExactDistance) return 1;
          return a.numericDistance - b.numericDistance;
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          const priceOrder = { 'thấp': 1, 'trung bình': 2, 'cao': 3 };
          return priceOrder[a.priceRange] - priceOrder[b.priceRange];
        default:
          return 0;
      }
    });
  };

  const handleManualLocationInput = async () => {
    if (!manualAddress.trim()) {
      setLocationError('Vui lòng nhập địa chỉ');
      return;
    }

    setIsLoadingLocation(true);

    setTimeout(() => {
      const manualLocation = {
        lat: 10.8231,
        lng: 106.6297,
        address: manualAddress,
        source: 'manual',
        accuracy: 50,
        timestamp: Date.now()
      };

      setUserLocation(manualLocation);
      setLocationSource('manual');
      setUseManualLocation(false);
      setLocationError('');
      setIsLoadingLocation(false);
      setShowFacilities(true);
    }, 800);
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'vừa xong';
    return `${minutes} phút trước`;
  };

  const handleViewReviews = (facilityId) => {
    if (expandedFacilityId === facilityId) {
      setExpandedFacilityId(null);
    } else {
      setExpandedFacilityId(facilityId);
    }
    setReviewFilter('all');
  };

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

  const getAverageRating = (facilityId) => {
    const reviews = facilityReviews[facilityId] || [];
    if (reviews.length === 0) return '0.0';
    const avg = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    return avg.toFixed(1);
  };

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

  // Hàm xử lý đặt lịch
  const handleOpenBookingModal = (facility) => {
    setSelectedFacility(facility);

    const doctors = [
      { id: 1, name: 'BS. Nguyễn Văn An', specialty: facility.specialties[0], experience: '15 năm' },
      { id: 2, name: 'BS. Trần Thị Bình', specialty: facility.specialties[0], experience: '10 năm' },
      { id: 3, name: 'TS. Lê Văn Cường', specialty: facility.specialties[0] || 'Nội tổng quát', experience: '20 năm' }
    ];

    setAvailableDoctors(doctors);
    setSelectedDoctor(doctors[0]?.id || '');

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

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setSelectedFacility(null);
    setBookingStep(1);
    setBookingConfirmed(false);
  };

  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Các hàm chuyển bước đặt lịch
  const handleNextStep = () => {
    if (bookingStep === 1) {
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

  const handleConfirmBooking = () => {
    setBookingConfirmed(true);
    setBookingStep(4);
  };

  const handleSendConfirmation = () => {
    alert(`Đã gửi xác nhận đặt lịch đến ${bookingForm.email || bookingForm.phone}`);
    handleCloseBookingModal();
  };

  useEffect(() => {
    fetchUserLocation();
  }, []);

  const sortedFacilities = getSortedFacilities();

  return (
    <div className="nearby-facilities-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <i className="bi bi-hospital me-2"></i>
            Cơ sở y tế gần bạn
          </h1>
          <p className="page-subtitle">
            Tìm kiếm bệnh viện, phòng khám gần vị trí của bạn
          </p>
        </div>

        <div className="main-content">
          {/* Copy phần JSX từ NearbyFacilities.jsx từ đây */}
          <div className="nearby-facilities-section card">
            <div className="card-body">
              <div className="facilities-header">
                <div className="header-main">
                  <div className="location-info">
                    {isLoadingLocation ? (
                      <div className="location-loading">
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <span>Đang xác định vị trí của bạn...</span>
                      </div>
                    ) : userLocation ? (
                      <div className="location-details">
                        <span className="location-source">
                          <i className={`bi ${locationSource === 'manual' ? 'bi-pencil-square' : 'bi-geo'}`}></i>
                          {locationSource === 'manual' ? 'Địa chỉ thủ công' : 'Vị trí mặc định'}
                          {userLocation.timestamp && (
                            <span className="location-time">
                              ({formatTimeAgo(userLocation.timestamp)})
                            </span>
                          )}
                        </span>

                        {userLocation.address && (
                          <div className="location-address">
                            <i className="bi bi-geo-alt"></i>
                            {userLocation.address}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="header-controls">
                  {showFacilities && (
                    <span className="facilities-count">{sortedFacilities.length} cơ sở gần bạn</span>
                  )}

                  <div className="location-actions">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={fetchUserLocation}
                      disabled={isLoadingLocation}
                      title="Làm mới vị trí"
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                    </button>

                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => {
                        setUseManualLocation(!useManualLocation);
                        setManualAddress('');
                      }}
                      title="Nhập địa chỉ thủ công"
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Form nhập địa chỉ thủ công */}
              {useManualLocation && (
                <div className="manual-location-input">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập địa chỉ của bạn để tìm cơ sở gần nhất..."
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualLocationInput()}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleManualLocationInput}
                      disabled={isLoadingLocation}
                    >
                      {isLoadingLocation ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                          Tìm kiếm
                        </>
                      ) : (
                        'Tìm cơ sở gần đây'
                      )}
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setUseManualLocation(false)}
                    >
                      Hủy
                    </button>
                  </div>
                  {locationError && (
                    <div className="alert alert-danger mt-2" role="alert">
                      <i className="bi bi-exclamation-triangle"></i> {locationError}
                    </div>
                  )}
                </div>
              )}

              {/* Hướng dẫn khi chưa nhập địa chỉ */}
              {!showFacilities && !useManualLocation && (
                <div className="location-prompt">
                  <div className="prompt-content">
                    <div className="prompt-icon">
                      <i className="bi bi-geo-alt-fill"></i>
                    </div>
                    <div className="prompt-text">
                      <h6>Nhập địa chỉ để tìm cơ sở y tế gần bạn</h6>
                      <p className="text-muted">
                        Chúng tôi sẽ hiển thị các bệnh viện, phòng khám gần vị trí của bạn.
                        <br />
                        <small>Ví dụ: "123 Đường ABC, Quận 1, TP.HCM"</small>
                      </p>
                      <button
                        className="btn btn-primary"
                        onClick={() => setUseManualLocation(true)}
                      >
                        <i className="bi bi-pencil-square me-2"></i>
                        Nhập địa chỉ ngay
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Danh sách cơ sở y tế (chỉ hiện khi có địa chỉ) */}
              {showFacilities && (
                <div className="facilities-list">
                  {sortedFacilities.map((facility, index) => {
                    const reviews = getReviewsForFacility(facility.id);
                    const avgRating = getAverageRating(facility.id);
                    const ratingDistribution = getRatingDistribution(facility.id);
                    const reviewStats = getReviewStats(facility.id);
                    const isExpanded = expandedFacilityId === facility.id;
                    
                    return (
                      <div key={facility.id} className="facility-item">
                        <div className="facility-content-wrapper">
                          <div className="facility-main">
                            <div className="facility-header">
                              <h6 className="facility-name">{facility.name}</h6>
                              <div className="facility-distance">
                                <span className={`distance-badge ${facility.isExactDistance ? 'exact' : 'estimated'}`}>
                                  <i className="bi bi-signpost"></i>
                                  {facility.distanceText}
                                  {!facility.isExactDistance && (
                                    <span className="distance-note"> (ước tính)</span>
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="facility-body">
                              <p className="facility-address">
                                <i className="bi bi-geo-alt"></i> {facility.address}
                              </p>

                              <div className="facility-rating">
                                <div className="rating-stars">
                                  {[...Array(5)].map((_, i) => (
                                    <i
                                      key={i}
                                      className={`bi ${i < Math.floor(facility.rating) ? 'bi-star-fill' : i < facility.rating ? 'bi-star-half' : 'bi-star'}`}
                                    ></i>
                                  ))}
                                </div>
                                <span className="rating-value">{facility.rating}</span>
                                <span className="reviews-count">({facility.reviews} đánh giá)</span>
                              </div>

                              <div className="facility-tags">
                                <span className={`price-badge ${facility.priceRange}`}>
                                  <i className="bi bi-cash"></i>
                                  {facility.priceRange === 'thấp' ? 'Giá thấp' :
                                    facility.priceRange === 'cao' ? 'Giá cao' : 'Giá trung bình'}
                                </span>

                                <span className="hours-badge">
                                  <i className="bi bi-clock"></i> {facility.openHours}
                                </span>

                                <span className={`availability-badge ${facility.appointmentAvailable ? 'available' : 'unavailable'}`}>
                                  <i className="bi bi-calendar-check"></i>
                                  {facility.appointmentAvailable ? 'Có lịch' : 'Hết lịch'}
                                </span>
                              </div>

                              <div className="facility-specialties">
                                {facility.specialties.map((specialty, idx) => (
                                  <span key={idx} className="specialty-tag">{specialty}</span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="facility-actions">
                            <button
                              className="btn btn-primary"
                              onClick={() => handleOpenBookingModal(facility)}
                              disabled={!facility.appointmentAvailable}
                            >
                              <i className="bi bi-calendar-plus"></i>
                              {facility.appointmentAvailable ? 'Đặt lịch ngay' : 'Hết lịch'}
                            </button>
                            <button
                              className={`btn ${isExpanded ? 'btn-info' : 'btn-outline-primary'}`}
                              onClick={() => handleViewReviews(facility.id)}
                              title="Xem đánh giá người dùng"
                            >
                              <i className={`bi ${isExpanded ? 'bi-chat-left-text-fill' : 'bi-chat-left-text'}`}></i>
                              {isExpanded ? 'Đóng đánh giá' : 'Xem đánh giá'}
                            </button>
                          </div>
                        </div>

                        {/* Phần đánh giá expandable */}
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
                    );
                  })}
                </div>
              )}

              {/* Thông báo khi có địa chỉ nhưng không có cơ sở nào */}
              {showFacilities && sortedFacilities.length === 0 && (
                <div className="no-facilities-found">
                  <div className="no-facilities-icon">
                    <i className="bi bi-search"></i>
                  </div>
                  <h6>Không tìm thấy cơ sở y tế trong khu vực</h6>
                  <p className="text-muted">
                    Thử nhập địa chỉ khác hoặc mở rộng phạm vi tìm kiếm.
                  </p>
                </div>
              )}

              {/* Gợi ý sử dụng */}
              {!showFacilities && (
                <div className="usage-tips">
                  <div className="tip-item">
                    <i className="bi bi-lightbulb"></i>
                    <span>
                      <strong>Mẹo:</strong> Bạn có thể nhập địa chỉ hiện tại, nơi làm việc
                      hoặc bất kỳ địa điểm nào bạn muốn tìm cơ sở y tế gần đó.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Booking tập trung - SỬA LẠI */}
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
                      {selectedFacility.distanceText}
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
                  <button
                    className="btn btn-primary"
                    onClick={handleSendConfirmation}
                  >
                    <i className="bi bi-check-circle me-1"></i>
                    Hoàn tất
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NearbyFacilitiesPage;