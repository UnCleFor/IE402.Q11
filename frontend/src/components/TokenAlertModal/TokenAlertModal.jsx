import React, { useState, useEffect } from 'react';
import { useTokenAlert } from '../../contexts/TokenAlertContext';
import './TokenAlertModal.css';

const TokenAlertModal = () => {
    const {
        showAlert,
        alertConfig,
        hideTokenAlert,
        // extendSession 
    } = useTokenAlert();

    // const [isExtending, setIsExtending] = useState(false);
    const [progress, setProgress] = useState(100);

    // Cập nhật progress bar
    useEffect(() => {
        if (showAlert && alertConfig.timeLeft) {
            const totalTime = alertConfig.timeLeft;
            const interval = setInterval(() => {
                setProgress((prev) => {
                    const newProgress = prev - (100 / totalTime);
                    return newProgress <= 0 ? 0 : newProgress;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [showAlert, alertConfig.timeLeft]);

    // Reset progress khi alert mới hiển thị
    useEffect(() => {
        if (showAlert) {
            setProgress(100);
        }
    }, [showAlert]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Cần chỉnh lại backend để sử dụng
    // const handleExtendSession = async () => {
    //   setIsExtending(true);
    //   try {
    //     const success = await extendSession();
    //     if (success) {
    //       hideTokenAlert();
    //     } else {
    //       // Xử lý khi refresh token thất bại
    //       alert('Không thể gia hạn phiên làm việc. Vui lòng đăng nhập lại.');
    //       hideTokenAlert();
    //     }
    //   } catch (error) {
    //     console.error('Error extending session:', error);
    //     setIsExtending(false);
    //   }
    // };

    const handleLogout = () => {
        // Đóng modal và logout sẽ được xử lý bởi context
        hideTokenAlert();
        // Xóa token và user info khỏi localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');

        // Chuyển hướng về trang login
        window.location.href = '/login';
    };

    if (!showAlert) return null;

    return (
        <div className="token-alert-overlay">
            <div className="token-alert-modal">
                {/* Header */}
                <div className="token-alert-header">
                    <div className="alert-icon">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 17C11.45 17 11 16.55 11 16C11 15.45 11.45 15 12 15C12.55 15 13 15.45 13 16C13 16.55 12.55 17 12 17ZM13 13C13 13.55 12.55 14 12 14C11.45 14 11 13.55 11 13V8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8V13Z"
                                fill="currentColor"
                            />
                        </svg>
                    </div>
                    <h3 className="alert-title">{alertConfig.title}</h3>
                </div>

                {/* Progress Bar */}
                <div className="token-progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Body */}
                <div className="token-alert-body">
                    <p className="alert-message">{alertConfig.message}</p>

                    {/* Timer Display */}
                    <div className="timer-container">
                        <div className="timer-display">
                            <div className="timer-circle">
                                <svg className="timer-svg" viewBox="0 0 100 100">
                                    <circle
                                        className="timer-background"
                                        cx="50"
                                        cy="50"
                                        r="45"
                                    />
                                    <circle
                                        className="timer-progress"
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        style={{
                                            strokeDasharray: `${(alertConfig.timeLeft / 300) * 283} 283`,
                                        }}
                                    />
                                </svg>
                                <span className="timer-text">
                                    {formatTime(alertConfig.timeLeft)}
                                </span>
                            </div>
                            <div className="timer-info">
                                <span className="timer-label">THỜI GIAN CÒN LẠI</span>
                                <span className="timer-description">
                                    Phiên làm việc sẽ tự động kết thúc sau
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="alert-tips">
                        {/* <div className="tip-item">
              <span className="tip-icon">💡</span>
              <span className="tip-text">
                Bấm "Tiếp tục" để gia hạn phiên làm việc thêm 60 phút
              </span>
            </div> */}
                        <div className="tip-item">
                            <span className="tip-icon">📝</span>
                            <span className="tip-text">
                                Lưu công việc hiện tại trước khi tiếp tục hoặc đăng xuất
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer - Buttons */}
                <div className="token-alert-footer">
                    {/* <button
            className="btn btn-primary btn-extend"
            onClick={handleExtendSession}
            disabled={isExtending}
          >
            {isExtending ? (
              <>
                <span className="spinner"></span>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <span className="btn-icon">🔄</span>
                <span>Tiếp tục phiên làm việc</span>
              </>
            )}
          </button> */}

                    <button
                        className="btn btn-secondary btn-logout"
                        onClick={handleLogout}
                    // disabled={isExtending}
                    >
                        <span className="btn-icon">🚪</span>
                        <span>Đăng xuất ngay</span>
                    </button>

                    <button
                        className="btn btn-ghost btn-minimize"
                        onClick={hideTokenAlert}
                    // disabled={isExtending}
                    >
                        <span>Ẩn thông báo</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TokenAlertModal;