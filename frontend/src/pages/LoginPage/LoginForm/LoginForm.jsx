import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import authService from '../../../services/authService';
import './LoginForm.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginError, setLoginError] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors khi người dùng bắt đầu gõ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (loginError) setLoginError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginSuccess(false);
    setLoginError('');
    
    // Validate form phía frontend
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ. Ví dụ: name@example.com';
    }
    
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Gọi API login
      const result = await authService.login(formData.email, formData.password);
      
      console.log('Login result:', result);
      
      if (result.message === 'Login successfully') {
        // Lưu token
        authService.setToken(result.token);
        
        // Sử dụng AuthContext để cập nhật trạng thái đăng nhập
        login(result.user, result.token);
        
        // Hiển thị thông báo thành công
        setLoginSuccess(true);
        setLoginError('');
        
        // Tự động chuyển hướng sau 1.5 giây
        setTimeout(() => {
          // Kiểm tra role để chuyển hướng phù hợp
          if (result.user.role === 'admin') {
            navigate('/dashboard');
          } else {
            navigate('/');
          }
        }, 1500);
        
      } else {
        // Xử lý lỗi từ backend
        console.log('Login failed:', result.message);
        setLoginError(result.message || 'Đăng nhập thất bại');
        
        // Highlight trường bị lỗi nếu có thể xác định
        if (result.message?.toLowerCase().includes('email')) {
          setErrors(prev => ({ ...prev, email: 'Email không đúng' }));
        }
        if (result.message?.toLowerCase().includes('password') || 
            result.message?.toLowerCase().includes('mật khẩu')) {
          setErrors(prev => ({ ...prev, password: 'Mật khẩu không đúng' }));
        }
      }
    } catch (error) {
      // Xử lý lỗi không mong muốn
      console.log('Unexpected error in handleSubmit:', error);
      setLoginError('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate('/forgot-password');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    navigate('/register');
  };

  const handleQuickLogin = (email, password) => {
    setFormData({
      email,
      password,
      rememberMe: false
    });
    setLoginError('');
  };

  return (
    <div className="login-form-container">
      <div className="login-form-card">
        {/* Form Header */}
        <div className="login-form-header text-center mb-4">
          <div className="login-form-logo mb-3">
            <i className="bi bi-hospital fs-1 text-primary"></i>
          </div>
          <h2 className="login-form-title">Đăng Nhập Hệ Thống</h2>
          <p className="login-form-subtitle">
            Truy cập vào Bản đồ Y tế Thông minh
          </p>
        </div>

        {/* Hiển thị thông báo thành công */}
        {loginSuccess && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            Đăng nhập thành công! Đang chuyển hướng...
            <div className="progress mt-2" style={{height: '3px'}}>
              <div 
                className="progress-bar bg-success" 
                role="progressbar" 
                style={{width: '100%'}}
                aria-valuenow="100" 
                aria-valuemin="0" 
                aria-valuemax="100"
              ></div>
            </div>
          </div>
        )}

        {/* Hiển thị lỗi đăng nhập */}
        {loginError && !loginSuccess && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {loginError}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setLoginError('')}
              disabled={isLoading}
            ></button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              <i className="bi bi-envelope me-2"></i>
              Địa chỉ Email
            </label>
            <input
              type="email"
              className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập địa chỉ email"
              required
              autoComplete="email"
              disabled={isLoading}
            />
            {errors.email && (
              <div className="invalid-feedback d-block">
                <i className="bi bi-x-circle me-1"></i>
                {errors.email}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              <i className="bi bi-lock me-2"></i>
              Mật khẩu
            </label>
            <input
              type="password"
              className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
            {errors.password && (
              <div className="invalid-feedback d-block">
                <i className="bi bi-x-circle me-1"></i>
                {errors.password}
              </div>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isLoading}
              />
              <label className="form-check-label" htmlFor="rememberMe">
                Ghi nhớ đăng nhập
              </label>
            </div>
            <button 
              type="button"
              className="btn btn-link forgot-password-link p-0"
              onClick={handleForgotPassword}
              disabled={isLoading}
            >
              Quên mật khẩu?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Đang đăng nhập...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Đăng Nhập
              </>
            )}
          </button>
        </form>

      
        {/* Register Link */}
        <div className="text-center mt-4">
          <p className="register-text">
            Chưa có tài khoản? 
            <button 
              className="btn btn-link register-link p-0 ms-1"
              onClick={handleRegister}
              disabled={isLoading}
            >
              Đăng ký ngay
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;