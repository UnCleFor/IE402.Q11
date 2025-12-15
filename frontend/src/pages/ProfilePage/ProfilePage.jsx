import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import authService from '../../services/authService';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [confirmUsername, setConfirmUsername] = useState('');
    const [formData, setFormData] = useState({
        user_name: '',
        email: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    // Lấy thông tin user khi component mount
    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            setMessage({ type: '', text: '' });

            // Gọi API lấy thông tin user
            const userData = await authService.getCurrentUser();

            // API trả về {user_id, user_name, email, role, createdAt, ...}
            if (userData && userData.user_id) {
                setUser(userData);
                setFormData({
                    user_name: userData.user_name,
                    email: userData.email
                });

                // Lưu vào localStorage để dùng sau
                localStorage.setItem('user', JSON.stringify(userData));
            } else if (userData && userData.success === false) {
                setMessage({ type: 'error', text: userData.message || 'Không thể tải thông tin hồ sơ' });
            } else {
                setMessage({ type: 'error', text: 'Dữ liệu không hợp lệ' });
            }

        } catch (error) {
            console.error('Error fetching user profile:', error);
            setMessage({
                type: 'error',
                text: `Đã xảy ra lỗi: ${error.message || 'Không thể tải thông tin'}`
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setMessage({ type: '', text: '' });

            // Kiểm tra không có thay đổi
            if (formData.user_name === user.user_name && formData.email === user.email) {
                setMessage({ type: 'info', text: 'Không có thay đổi nào để cập nhật' });
                setEditing(false);
                return;
            }

            // Validate email format
            if (formData.email !== user.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.email)) {
                    setMessage({ type: 'error', text: 'Email không hợp lệ. Vui lòng nhập email đúng định dạng.' });
                    return;
                }
            }

            // Gọi API update
            const result = await authService.updateProfile(user.user_id, formData);

            if (result && result.success) {
                const updatedUser = {
                    ...user,
                    user_name: formData.user_name,
                    email: formData.email
                };

                setUser(updatedUser);
                setEditing(false);
                setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });

                // Cập nhật localStorage
                localStorage.setItem('user', JSON.stringify(updatedUser));
            } else {
                // Hiển thị thông báo lỗi từ server
                let errorMessage = result?.message || 'Cập nhật thất bại';

                // Nếu là lỗi email trùng, đề xuất giữ email cũ
                if (errorMessage.includes('Email') || errorMessage.includes('email')) {
                    errorMessage += '\n\nVui lòng giữ email cũ hoặc chọn email khác.';

                    // Tự động revert về email cũ
                    setFormData(prev => ({
                        ...prev,
                        email: user.email
                    }));
                }

                setMessage({ type: 'error', text: errorMessage });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.'
            });
        }
    };

    const handleDeleteAccount = async () => {
        if (confirmUsername !== user.user_name) {
            setMessage({ type: 'error', text: 'Tên đăng nhập không khớp!' });
            return;
        }

        try {
            const result = await authService.deleteUser(user.user_id);

            if (result && result.success) {
                // Xóa thông tin đăng nhập
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');

                setMessage({
                    type: 'success',
                    text: 'Tài khoản đã được xóa thành công!'
                });

                // Chuyển hướng về trang chủ sau 2 giây
                setTimeout(() => {
                    navigate('/');
                    window.location.reload();
                }, 2000);
            } else {
                setMessage({
                    type: 'error',
                    text: result?.message || 'Không thể xóa tài khoản'
                });
                setShowDeleteConfirm(false);
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            setMessage({
                type: 'error',
                text: 'Đã xảy ra lỗi khi xóa tài khoản'
            });
            setShowDeleteConfirm(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="container py-5">
                <div className="row">
                    {/* Sidebar với avatar và thông tin cơ bản */}
                    <div className="col-md-4 col-lg-3 mb-4">
                        <div className="profile-sidebar card shadow-sm">
                            <div className="card-body text-center p-4">
                                <div className="profile-avatar mb-3">
                                    <div className="avatar-placeholder">
                                        {user?.user_name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                </div>
                                <h4 className="card-title mb-1">{user?.user_name || 'Người dùng'}</h4>

                                {/* Hiển thị role dưới tên */}
                                <div className="user-role mb-3">
                                    <span className={`role-badge ${user?.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                                        {user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                                    </span>
                                </div>

                                <p className="text-muted small mb-4">{user?.email}</p>

                                <div className="d-grid gap-2">
                                    <button
                                        className={`btn ${editing ? 'btn-secondary' : 'btn-primary'}`}
                                        onClick={() => setEditing(!editing)}
                                    >
                                        {editing ? (
                                            <>
                                                <i className="bi bi-x-circle me-2"></i>
                                                Hủy chỉnh sửa
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-pencil-square me-2"></i>
                                                Chỉnh sửa hồ sơ
                                            </>
                                        )}
                                    </button>

                                    <button
                                        className="btn btn-outline-danger"
                                        onClick={() => setShowDeleteConfirm(true)}
                                    >
                                        <i className="bi bi-trash me-2"></i>
                                        Xóa tài khoản
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content - Form chỉnh sửa */}
                    <div className="col-md-8 col-lg-9">
                        <div className="profile-content card shadow-sm">
                            <div className="card-header text-white d-flex justify-content-between align-items-center">
                                <h4 className="mb-0">Hồ sơ cá nhân</h4>
                                <span className="badge bg-light text-primary">
                                    ID: {user?.user_id?.substring(0, 8)}...
                                </span>
                            </div>

                            <div className="card-body p-4">
                                {message.text && (
                                    <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}>
                                        {message.text}
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={() => setMessage({ type: '', text: '' })}
                                        ></button>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">
                                                <i className="bi bi-person me-2"></i>
                                                Tên người dùng
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="user_name"
                                                value={formData.user_name}
                                                onChange={handleInputChange}
                                                disabled={!editing}
                                                required
                                            />
                                            {!editing && (
                                                <small className="text-muted">
                                                    Tên hiển thị của bạn
                                                </small>
                                            )}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">
                                                <i className="bi bi-envelope me-2"></i>
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                disabled={!editing}
                                                required
                                            />
                                            {!editing && (
                                                <small className="text-muted">
                                                    Email đăng nhập
                                                </small>
                                            )}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">
                                                <i className="bi bi-shield me-2"></i>
                                                Vai trò
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                                                disabled
                                            />
                                            <small className="text-muted">
                                                Quyền hạn tài khoản
                                            </small>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">
                                                <i className="bi bi-calendar me-2"></i>
                                                Ngày tạo tài khoản
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Chưa có thông tin'}
                                                disabled
                                            />
                                            <small className="text-muted">
                                                Thời gian đăng ký
                                            </small>
                                        </div>
                                    </div>

                                    {editing && (
                                        <div className="d-flex gap-2 mt-4">
                                            <button type="submit" className="btn btn-primary px-4">
                                                <i className="bi bi-check-circle me-2"></i>
                                                Lưu thay đổi
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary px-4"
                                                onClick={() => {
                                                    setEditing(false);
                                                    setFormData({
                                                        user_name: user.user_name,
                                                        email: user.email
                                                    });
                                                    setMessage({ type: '', text: '' });
                                                }}
                                            >
                                                <i className="bi bi-x-circle me-2"></i>
                                                Hủy bỏ
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>

                        {/* Thông tin bổ sung */}
                        <div className="additional-info mt-4">
                            <div className="card shadow-sm">
                                <div className="card-header bg-light">
                                    <h5 className="mb-0">Thông tin tài khoản</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="info-item mb-3">
                                                <h6 className="text-muted">Mã người dùng</h6>
                                                <p className="mb-0 font-monospace small">{user?.user_id}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item mb-3">
                                                <h6 className="text-muted">Trạng thái tài khoản</h6>
                                                <p className="mb-0">
                                                    <span className="badge bg-success">✓ Hoạt động</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal xác nhận xóa tài khoản */}
            {showDeleteConfirm && (
                <div className="modal-backdrop show">
                    <div className="modal show" style={{ display: 'block' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header bg-danger text-white">
                                    <h5 className="modal-title">
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        Xác nhận xóa tài khoản
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={() => {
                                            setShowDeleteConfirm(false);
                                            setConfirmUsername('');
                                        }}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <div className="alert alert-warning">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!
                                    </div>
                                    <p>
                                        Bạn có chắc chắn muốn xóa tài khoản <strong className="text-danger">{user?.user_name}</strong>?
                                    </p>
                                    <ul className="text-danger small">
                                        <li>Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn</li>
                                        <li>Bạn sẽ không thể đăng nhập lại với tài khoản này</li>
                                        <li>Không thể khôi phục tài khoản sau khi xóa</li>
                                    </ul>
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Nhập tên đăng nhập để xác nhận:
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder={`Nhập "${user?.user_name}"`}
                                            value={confirmUsername}
                                            onChange={(e) => setConfirmUsername(e.target.value)}
                                        />
                                        <small className="text-muted">
                                            Gõ đúng tên đăng nhập của bạn để xác nhận
                                        </small>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowDeleteConfirm(false);
                                            setConfirmUsername('');
                                        }}
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={handleDeleteAccount}
                                        disabled={confirmUsername !== user?.user_name}
                                    >
                                        <i className="bi bi-trash me-1"></i>
                                        Xóa tài khoản
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;