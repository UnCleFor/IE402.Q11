import React, { useState } from 'react';
import './UserReviews.css';

const UserReviews = ({ facilityId, reviews = [] }) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  // Dữ liệu mẫu đánh giá theo bệnh viện
  const allReviews = {
    // Bệnh viện Đa khoa TP.HCM (id: 1)
    1: [
      {
        id: 1,
        user: 'Nguyễn Văn A',
        rating: 5,
        date: '15/10/2023',
        comment: 'Bác sĩ rất tận tâm, cơ sở vật chất hiện đại. Thời gian chờ khá lâu nhưng đáng giá.',
        helpful: 12,
        verified: true
      },
      {
        id: 2,
        user: 'Trần Thị B',
        rating: 4,
        date: '12/10/2023',
        comment: 'Dịch vụ tốt, nhân viên thân thiện. Giá cả hợp lý so với chất lượng.',
        helpful: 8,
        verified: true
      },
      {
        id: 3,
        user: 'Lê Văn C',
        rating: 3,
        date: '10/10/2023',
        comment: 'Cơ sở hơi đông đúc, nhưng bác sĩ chẩn đoán chính xác. Xét nghiệm nhanh.',
        helpful: 5,
        verified: false
      },
      {
        id: 4,
        user: 'Phạm Thị D',
        rating: 5,
        date: '08/10/2023',
        comment: 'Đã khám ở đây nhiều lần. Luôn hài lòng với dịch vụ.',
        helpful: 15,
        verified: true
      },
      {
        id: 5,
        user: 'Hoàng Văn E',
        rating: 4,
        date: '05/10/2023',
        comment: 'Phòng chờ thoáng mát, wifi miễn phí. Nhân viên hướng dẫn nhiệt tình.',
        helpful: 7,
        verified: true
      }
    ],
    // Phòng khám Đa khoa Quốc tế (id: 2)
    2: [
      {
        id: 6,
        user: 'Mai Thị F',
        rating: 5,
        date: '18/10/2023',
        comment: 'Phòng khám sang trọng, bác sĩ chuyên nghiệp. Giá hơi cao nhưng xứng đáng.',
        helpful: 9,
        verified: true
      },
      {
        id: 7,
        user: 'Đặng Văn G',
        rating: 4,
        date: '16/10/2023',
        comment: 'Dịch vụ quốc tế, bác sĩ nói tiếng Anh tốt. Thích hợp cho người nước ngoài.',
        helpful: 6,
        verified: true
      },
      {
        id: 8,
        user: 'Bùi Thị H',
        rating: 5,
        date: '14/10/2023',
        comment: 'Khám nhi khoa rất tốt. Bác sĩ kiên nhẫn với trẻ em.',
        helpful: 11,
        verified: true
      }
    ],
    // Trung tâm Y tế Quận 5 (id: 3)
    3: [
      {
        id: 9,
        user: 'Vũ Văn I',
        rating: 4,
        date: '20/10/2023',
        comment: 'Giá cả phải chăng, phù hợp với bảo hiểm y tế. Dịch vụ nhanh chóng.',
        helpful: 8,
        verified: true
      },
      {
        id: 10,
        user: 'Lý Thị K',
        rating: 3,
        date: '19/10/2023',
        comment: 'Cơ sở hơi cũ nhưng dịch vụ ổn. Bác sĩ có kinh nghiệm.',
        helpful: 4,
        verified: false
      },
      {
        id: 11,
        user: 'Trịnh Văn L',
        rating: 5,
        date: '17/10/2023',
        comment: 'Khám tổng quát tốt, chi phí thấp. Phù hợp với sinh viên.',
        helpful: 10,
        verified: true
      }
    ],
    // Bệnh viện Nhi Đồng (id: 4)
    4: [
      {
        id: 12,
        user: 'Mẹ bé Tú Anh',
        rating: 5,
        date: '22/10/2023',
        comment: 'Bệnh viện chuyên về nhi khoa tốt nhất. Bác sĩ rất hiểu tâm lý trẻ em.',
        helpful: 14,
        verified: true
      },
      {
        id: 13,
        user: 'Ba bé Minh Đức',
        rating: 4,
        date: '21/10/2023',
        comment: 'Cấp cứu nhi nhanh chóng. Đội ngũ y tế tận tâm.',
        helpful: 7,
        verified: true
      },
      {
        id: 14,
        user: 'Chị Thanh Hằng',
        rating: 3,
        date: '20/10/2023',
        comment: 'Đông bệnh nhân, chờ lâu. Nhưng bác sĩ giỏi.',
        helpful: 5,
        verified: false
      },
      {
        id: 15,
        user: 'Anh Tuấn Kiệt',
        rating: 5,
        date: '18/10/2023',
        comment: 'Phòng khám sạch sẽ, đồ chơi cho trẻ em nhiều. Bé nhà mình rất thích.',
        helpful: 9,
        verified: true
      }
    ]
  };
  
  // Lấy đánh giá theo facilityId, nếu không có thì lấy mặc định
  const facilityReviews = reviews.length > 0 ? reviews : 
      (allReviews[facilityId] || allReviews[1] || []);
  
  // Tính rating trung bình
  const averageRating = facilityReviews.length > 0 
    ? (facilityReviews.reduce((sum, review) => sum + review.rating, 0) / facilityReviews.length).toFixed(1)
    : '0.0';
  
  // Số lượng review sẽ hiển thị (3 mặc định, tất cả khi click xem thêm)
  const displayedReviews = showAllReviews ? facilityReviews : facilityReviews.slice(0, 3);

  return (
    <div className="user-reviews-section card">
      <div className="card-body">
        <div className="reviews-header">
          <h5 className="card-title">
            <i className="bi bi-chat-left-text"></i> Đánh giá từ người dùng
          </h5>
          
          <div className="rating-summary">
            <div className="average-rating">
              <span className="rating-number">{averageRating}</span>
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <i 
                    key={i} 
                    className={`bi ${i < Math.floor(averageRating) ? 'bi-star-fill' : 'bi-star'} ${i < averageRating ? 'text-warning' : 'text-muted'}`}
                  ></i>
                ))}
              </div>
              <span className="reviews-count">({facilityReviews.length} đánh giá)</span>
            </div>
          </div>
        </div>
        
        {facilityReviews.length === 0 ? (
          <div className="no-reviews">
            <div className="no-reviews-icon">
              <i className="bi bi-chat-left"></i>
            </div>
            <p className="text-muted">Chưa có đánh giá nào cho cơ sở này.</p>
            <button className="btn btn-outline-primary btn-sm">
              <i className="bi bi-pencil-square"></i> Viết đánh giá đầu tiên
            </button>
          </div>
        ) : (
          <>
            <div className="reviews-list">
              {displayedReviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="review-user-info">
                      <div className="user-avatar">
                        {review.user.charAt(0)}
                      </div>
                      <div>
                        <div className="user-name">
                          {review.user}
                          {review.verified && (
                            <span className="verified-badge">
                              <i className="bi bi-patch-check-fill"></i>
                            </span>
                          )}
                        </div>
                        <div className="review-date">{review.date}</div>
                      </div>
                    </div>
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <i 
                          key={i} 
                          className={`bi ${i < review.rating ? 'bi-star-fill' : 'bi-star'} ${i < review.rating ? 'text-warning' : 'text-muted'}`}
                        ></i>
                      ))}
                    </div>
                  </div>
                  
                  <div className="review-comment">
                    {review.comment}
                  </div>
                  
                  <div className="review-actions">
                    <button className="btn-helpful">
                      <i className="bi bi-hand-thumbs-up"></i> 
                      <span>Hữu ích ({review.helpful})</span>
                    </button>
                    <button className="btn-report">
                      <i className="bi bi-flag"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Button xem thêm/ẩn bớt */}
            {facilityReviews.length > 3 && (
              <button 
                className="btn-toggle-reviews"
                onClick={() => setShowAllReviews(!showAllReviews)}
              >
                <i className={`bi ${showAllReviews ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                {showAllReviews ? 'Ẩn bớt' : `Xem thêm ${facilityReviews.length - 3} đánh giá`}
              </button>
            )}
            
            <button className="btn-write-review">
              <i className="bi bi-pencil-square"></i> Viết đánh giá của bạn
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserReviews;