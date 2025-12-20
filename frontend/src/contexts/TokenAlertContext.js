import React, { createContext, useState, useContext, useCallback, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';

const TokenAlertContext = createContext({});

export const useTokenAlert = () => {
    const context = useContext(TokenAlertContext);
    if (!context) {
        throw new Error('useTokenAlert must be used within TokenAlertProvider');
    }
    return context;
};

export const TokenAlertProvider = ({ children }) => {
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: 'Phiên làm việc sắp hết hạn',
        message: 'Phiên làm việc của bạn sắp hết hạn. Bạn có muốn tiếp tục?',
        expiryTime: null,
        timeLeft: 300,
    });

    const { logout, refreshToken } = useAuth();
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);
    const alertShownRef = useRef(false);
    const monitoringIntervalRef = useRef(null);

    // Hiển thị thông báo
    const showTokenAlert = useCallback((config = {}) => {
        alertShownRef.current = true;

        setAlertConfig(prev => ({
            ...prev,
            ...config,
            timeLeft: config.timeLeft || 300,
        }));

        setShowAlert(true);

        // Bắt đầu đếm ngược
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setAlertConfig(prev => {
                const newTimeLeft = prev.timeLeft - 1;

                if (newTimeLeft <= 0) {
                    clearInterval(intervalRef.current);
                    handleAutoLogout();
                    return prev;
                }

                return { ...prev, timeLeft: newTimeLeft };
            });
        }, 1000);

        // Tự động logout sau khi hết thời gian
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            handleAutoLogout();
        }, (config.timeLeft || 300) * 1000);

    }, []);

    // Ẩn thông báo
    const hideTokenAlert = useCallback(() => {
        setShowAlert(false);
        alertShownRef.current = false;

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    // Gia hạn phiên làm việc
    const extendSession = useCallback(async () => {
        try {
            const newToken = await refreshToken();
            if (newToken) {
                hideTokenAlert();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error extending session:', error);
            return false;
        }
    }, [refreshToken, hideTokenAlert]);

    // Tự động đăng xuất
    const handleAutoLogout = useCallback(() => {
        hideTokenAlert();
        logout();

        // Chỉ redirect nếu không phải trang login
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login?reason=session_timeout';
        }
    }, [hideTokenAlert, logout]);

    // Kiểm tra token expiry
    const checkTokenExpiry = useCallback(() => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000;
            const currentTime = Date.now();
            const timeUntilExpiry = expiry - currentTime;

            // Hiển thị cảnh báo trước 5 phút
            const warningThreshold = 5 * 60 * 1000; // 5 phút
            const criticalThreshold = 1 * 60 * 1000; // 1 phút

            if (timeUntilExpiry > 0 && timeUntilExpiry <= warningThreshold) {
                if (!alertShownRef.current) {
                    const minutesLeft = Math.ceil(timeUntilExpiry / 60000);

                    let message = `Phiên làm việc của bạn sẽ hết hạn sau ${minutesLeft} phút.`;
                    if (timeUntilExpiry <= criticalThreshold) {
                        message = `Phiên làm việc sắp hết hạn! Còn ${Math.ceil(timeUntilExpiry / 1000)} giây.`;
                    }

                    showTokenAlert({
                        expiryTime: expiry,
                        timeLeft: Math.floor(timeUntilExpiry / 1000),
                        message: message,
                        title: timeUntilExpiry <= criticalThreshold
                            ? '⚠️ Phiên làm việc sắp hết hạn!'
                            : 'Phiên làm việc sắp hết hạn'
                    });
                }
            }

            // Nếu token đã hết hạn và chưa đăng xuất
            if (timeUntilExpiry <= 0 && localStorage.getItem('authToken')) {
                console.log('⏰ Token expired, auto logout');
                handleAutoLogout();
            }
        } catch (error) {
            console.error('Error checking token expiry:', error);
        }
    }, [showTokenAlert, handleAutoLogout]);

    // Khởi động monitoring token
    const startTokenMonitoring = useCallback(() => {
        // Dừng monitoring cũ nếu có
        if (monitoringIntervalRef.current) {
            clearInterval(monitoringIntervalRef.current);
        }

        // Kiểm tra ngay lập tức
        checkTokenExpiry();

        // Thiết lập interval kiểm tra mỗi 1 phút
        monitoringIntervalRef.current = setInterval(checkTokenExpiry, 60000);

        return () => {
            if (monitoringIntervalRef.current) {
                clearInterval(monitoringIntervalRef.current);
                monitoringIntervalRef.current = null;
            }
        };
    }, [checkTokenExpiry]);

    // Auto logout khi không hoạt động
    useEffect(() => {
        let inactivityTimer;

        const resetInactivityTimer = () => {
            if (inactivityTimer) {
                clearTimeout(inactivityTimer);
            }

            // 60 phút không hoạt động sẽ logout
            inactivityTimer = setTimeout(() => {
                if (localStorage.getItem('authToken')) {
                    console.log('🕒 Inactivity timeout, auto logout');
                    logout();

                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login?reason=inactivity';
                    }
                }
            }, 60 * 60 * 1000);
        };

        // Reset timer khi có user activity
        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
        activityEvents.forEach(event => {
            window.addEventListener(event, resetInactivityTimer);
        });

        // Bắt đầu inactivity timer
        resetInactivityTimer();

        return () => {
            if (inactivityTimer) {
                clearTimeout(inactivityTimer);
            }
            activityEvents.forEach(event => {
                window.removeEventListener(event, resetInactivityTimer);
            });
        };
    }, [logout]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (monitoringIntervalRef.current) {
                clearInterval(monitoringIntervalRef.current);
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const value = {
        showAlert,
        alertConfig,
        showTokenAlert,
        hideTokenAlert,
        extendSession,
        startTokenMonitoring,
    };

    return (
        <TokenAlertContext.Provider value={value}>
            {children}
        </TokenAlertContext.Provider>
    );
};