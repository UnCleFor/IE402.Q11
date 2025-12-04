import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterForm.css'; // Tạo file CSS mới cho đăng ký

const RegisterForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    user_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState('');

  // Validate functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    // Ít nhất 6 ký tự, có chữ và số
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    return re.test(password);
  };

  const validateUsername = (username) => {
    // Từ 3-20 ký tự, chỉ chữ, số, dấu gạch dưới
    const re = /^[a-zA-Z0-9_]{3,20}$/;
    return re.test(username);
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
    if (registerError) setRegisterError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterSuccess(false);
    setRegisterError('');
    
    // Validate form
    const newErrors = {};
    
    // Validate username
    if (!formData.user_name) {
      newErrors.user_name = 'Vui lòng nhập tên đăng nhập';
    } else if (!validateUsername(formData.user_name)) {
      newErrors.user_name = 'Tên đăng nhập từ 3-20 ký tự, chỉ chứa chữ, số và dấu gạch dưới';
    }
    
    // Validate email
    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ. Ví dụ: name@example.com';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Mật khẩu phải chứa ít nhất 1 chữ và 1 số';
    }
    
    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    // Validate terms
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Bạn phải đồng ý với điều khoản sử dụng';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
        console.log('form',formData)
      // Gọi API đăng ký
    //   const response = await fetch('http://localhost:3001/api/users/register', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       user_name: formData.user_name,
    //       email: formData.email,
    //       password: formData.password,
    //       confirmPassword: formData.confirmPassword
    //     })
    //   });
      
    //   const result = await response.json();
      
    //   console.log('Register result:', result);
      
    //   if (result.success) {
    //     // Đăng ký thành công
    //     setRegisterSuccess(true);
    //     setRegisterError('');
        
    //     // Tự động chuyển hướng đến trang login sau 2 giây
    //     setTimeout(() => {
    //       navigate('/login');
    //     }, 2000);
        
    //   } else {
    //     // Xử lý lỗi từ backend
    //     console.log('Register failed:', result.message);
    //     setRegisterError(result.message || 'Đăng ký thất bại');
        
    //     // Xử lý lỗi cụ thể
    //     if (result.message?.toLowerCase().includes('email')) {
    //       setErrors(prev => ({ ...prev, email: 'Email đã tồn tại' }));
    //     }
    //     if (result.message?.toLowerCase().includes('username') || 
    //         result.message?.toLowerCase().includes('tên đăng nhập')) {
    //       setErrors(prev => ({ ...prev, user_name: 'Tên đăng nhập đã tồn tại' }));
    //     }
    //   }
    } catch (error) {
      // Xử lý lỗi không mong muốn
      console.log('Unexpected error in handleSubmit:', error);
      setRegisterError('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  const handleQuickFill = (data) => {
    setFormData({
      ...data,
      acceptTerms: false
    });
    setRegisterError('');
  };

  return (
    <div className="register-form-container">
      <div className="register-form-card">
        {/* Form Header */}
        <div className="register-form-header text-center mb-4">
          <div className="register-form-logo mb-3">
            <i className="bi bi-hospital fs-1 text-primary"></i>
          </div>
          <h2 className="register-form-title">Đăng Ký Tài Khoản</h2>
          <p className="register-form-subtitle">
            Tạo tài khoản để truy cập vào Bản đồ Y tế Thông minh
          </p>
        </div>

        {/* Hiển thị thông báo thành công */}
        {registerSuccess && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...
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

        {/* Hiển thị lỗi đăng ký */}
        {registerError && !registerSuccess && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {registerError}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setRegisterError('')}
              disabled={isLoading}
            ></button>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Username Field */}
          <div className="mb-3">
            <label htmlFor="user_name" className="form-label">
              <i className="bi bi-person me-2"></i>
              Tên đăng nhập
            </label>
            <input
              type="text"
              className={`form-control form-control-lg ${errors.user_name ? 'is-invalid' : ''}`}
              id="user_name"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập"
              required
              autoComplete="username"
              disabled={isLoading}
            />
            {errors.user_name && (
              <div className="invalid-feedback d-block">
                <i className="bi bi-x-circle me-1"></i>
                {errors.user_name}
              </div>
            )}
            <div className="form-text">
              Từ 3-20 ký tự, chỉ chứa chữ, số và dấu gạch dưới
            </div>
          </div>

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
            <div className="form-text">
              Email sẽ được dùng để đăng nhập và khôi phục mật khẩu
            </div>
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
              autoComplete="new-password"
              disabled={isLoading}
            />
            {errors.password && (
              <div className="invalid-feedback d-block">
                <i className="bi bi-x-circle me-1"></i>
                {errors.password}
              </div>
            )}
            <div className="form-text">
              Ít nhất 6 ký tự, phải chứa ít nhất 1 chữ và 1 số
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              <i className="bi bi-lock-fill me-2"></i>
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              className={`form-control form-control-lg ${errors.confirmPassword ? 'is-invalid' : ''}`}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              required
              autoComplete="new-password"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <div className="invalid-feedback d-block">
                <i className="bi bi-x-circle me-1"></i>
                {errors.confirmPassword}
              </div>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="mb-4">
            <div className="form-check">
              <input
                className={`form-check-input ${errors.acceptTerms ? 'is-invalid' : ''}`}
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                disabled={isLoading}
              />
              <label className="form-check-label" htmlFor="acceptTerms">
                Tôi đồng ý với{' '}
                <Link to="/terms" className="text-primary">
                  Điều khoản sử dụng
                </Link>{' '}
                và{' '}
                <Link to="/privacy" className="text-primary">
                  Chính sách bảo mật
                </Link>
              </label>
              {errors.acceptTerms && (
                <div className="invalid-feedback d-block">
                  <i className="bi bi-x-circle me-1"></i>
                  {errors.acceptTerms}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-success btn-lg w-100 register-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus me-2"></i>
                Đăng Ký
              </>
            )}
          </button>
        </form>

        {/* Divider */}

        {/* Login Link */}
        <div className="text-center mt-4">
          <p className="login-text">
            Đã có tài khoản? 
            <button 
              className="btn btn-link login-link p-0 ms-1"
              onClick={handleLogin}
              disabled={isLoading}
            >
              Đăng nhập ngay
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default RegisterForm;