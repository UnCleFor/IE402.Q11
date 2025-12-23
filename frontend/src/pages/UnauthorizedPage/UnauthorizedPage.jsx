import React from 'react';
import { Link } from 'react-router-dom';
import './UnauthorizedPage.css';

const UnauthorizedPage = () => {
  return (
    <div className="unauthorized-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            <div className="unauthorized-icon mb-4">
              <i className="bi bi-shield-lock"></i>
            </div>
            <h1 className="display-4 text-danger mb-3">Truy Cập Bị Từ Chối</h1>
            <p className="lead mb-4">
              Bạn không có quyền truy cập vào trang này.
              Trang này chỉ dành cho quản trị viên.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/" className="btn btn-primary">
                <i className="bi bi-house me-2"></i>
                Về trang chủ
              </Link>
              <Link to="/login" className="btn btn-outline-primary">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Đăng nhập tài khoản khác
              </Link>
            </div>
            <div className="mt-5">
              <p className="text-muted">
                Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ quản trị viên.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;