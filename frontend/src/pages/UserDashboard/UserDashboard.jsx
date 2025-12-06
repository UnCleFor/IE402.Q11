import React, { useState, useEffect } from 'react';
import './UserDashboard.css';
import UserSidebar from './UserSidebar/UserSidebar';
import UserHeader from './UserHeader/UserHeader';
import DashboardStats from './DashboardStats/DashboardStats';
import MedicalFacilities from './MedicalFacilities/MedicalFacilities';
import OutbreakManagement from './OutbreakManagement/OutbreakManagement';
import QuickActions from './QuickActions/QuickActions';
import RecentActivity from './RecentActivity/RecentActivity';
import FacilityForm from './FormComponents/FacilityForm/FacilityForm';
import OutbreakForm from './FormComponents/OutbreakForm/OutbreakForm';
import ReportForm from './FormComponents/ReportForm/ReportForm';
import MapPicker from './MapComponents/MapPicker/MapPicker'
import PolygonDrawer from './MapComponents/PolygonDrawer/PolygonDrawer';
import UsersList from './UsersList/UsersList';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
const UserDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showFacilityForm, setShowFacilityForm] = useState(false);
  const [showOutbreakForm, setShowOutbreakForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingFacility, setEditingFacility] = useState(null);
  const [editingOutbreak, setEditingOutbreak] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const navigate = useNavigate();
  const { user, hasRole, loading } = useAuth();
  // Kiểm tra quyền truy cập khi component mount
  useEffect(() => {
    if (!loading) {
      // Kiểm tra xem user đã đăng nhập chưa
      if (!user) {
        navigate('/login');
        return;
      }

      // Kiểm tra xem user có role admin không
      if (!hasRole('admin')) {
        setAccessDenied(true);
        // Có thể chuyển hướng về trang unauthorized hoặc trang chủ
        navigate('/unauthorized');
      }
    }
  }, [user, hasRole, loading, navigate]);
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Xử lý form người dùng
  const handleUserSubmit = (userData) => {
    console.log('User data submitted:', userData);
    // Gửi API hoặc xử lý dữ liệu
    setShowUserForm(false);
    setEditingUser(null);
    // Hiển thị thông báo thành công
    alert(editingUser ? 'Cập nhật người dùng thành công!' : 'Thêm người dùng thành công!');
  };

  // Xử lý form cơ sở y tế
  const handleFacilitySubmit = (facilityData) => {
    console.log('Facility data submitted:', facilityData);
    // Gửi API hoặc xử lý dữ liệu
    setShowFacilityForm(false);
    setEditingFacility(null);

    // Hiển thị thông báo thành công
    alert(editingFacility ? 'Cập nhật cơ sở y tế thành công!' : 'Thêm cơ sở y tế thành công!');
  };

  // Xử lý form vùng dịch
  const handleOutbreakSubmit = (outbreakData) => {
    console.log('Outbreak data submitted:', outbreakData);
    // Gửi API hoặc xử lý dữ liệu
    setShowOutbreakForm(false);
    setEditingOutbreak(null);

    // Hiển thị thông báo thành công
    alert(editingOutbreak ? 'Cập nhật vùng dịch thành công!' : 'Khai báo vùng dịch thành công!');
  };

  // Xử lý form báo cáo
  const handleReportSubmit = (reportData) => {
    console.log('Report data submitted:', reportData);
    // Gửi API hoặc xử lý dữ liệu
    setShowReportForm(false);

    // Hiển thị thông báo thành công
    alert('Tạo báo cáo thành công!');
  };
  // Mở form chỉnh sửa người dùng
  const handleEditUser = (user) => {
    setShowUserForm(true);
    setEditingUser(user);
    setActiveSection('users');
  }
  // Mở form chỉnh sửa cơ sở y tế
  const handleEditFacility = (facility) => {
    setEditingFacility(facility);
    setShowFacilityForm(true);
    setActiveSection('facilities');
  };

  // Mở form chỉnh sửa vùng dịch
  const handleEditOutbreak = (outbreak) => {
    setEditingOutbreak(outbreak);
    setShowOutbreakForm(true);
    setActiveSection('outbreak');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <>
            <DashboardStats />
            <div className="row mt-4">
              <div className="col-lg-8">
                <RecentActivity />
              </div>
              <div className="col-lg-4">
                <QuickActions
                  onAddFacility={() => setShowFacilityForm(true)}
                  onAddOutbreak={() => setShowOutbreakForm(true)}
                  onCreateReport={() => setShowReportForm(true)}
                />
              </div>
            </div>
          </>
        );
      case 'users':
        return (
          <UsersList
            onAddUser={() => setShowUserForm(true)}
            onEditUser={handleEditUser}
          />
        );
      case 'facilities':
        return (
          <MedicalFacilities
            onAddFacility={() => setShowFacilityForm(true)}
            onEditFacility={handleEditFacility}
          />
        );
      case 'outbreak':
        return (
          <OutbreakManagement
            onAddOutbreak={() => setShowOutbreakForm(true)}
            onEditOutbreak={handleEditOutbreak}
          />
        );
      case 'reports':
        return (
          <div className="reports-section">
            <div className="section-header">
              <div className="header-content">
                <h2>Quản Lý Báo Cáo</h2>
                <p>Tạo và quản lý các báo cáo thống kê y tế</p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setShowReportForm(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Tạo Báo Cáo Mới
              </button>
            </div>
            <div className="reports-placeholder">
              <i className="bi bi-file-earmark-text"></i>
              <h5>Danh sách báo cáo</h5>
              <p>Chức năng đang được phát triển...</p>
            </div>
          </div>
        );
      case 'map-tools':
        return (
          <div className="map-tools-section">
            <div className="section-header">
              <h2>Công Cụ Bản Đồ</h2>
              <p>Sử dụng các công cụ bản đồ để quản lý dữ liệu không gian</p>
            </div>

            <div className="row">
              <div className="col-lg-6">
                <div className="tool-card">
                  <h5>Chọn Vị Trí Trên Bản Đồ</h5>
                  <p>Chọn vị trí chính xác cho cơ sở y tế</p>
                  <MapPicker
                    onLocationSelect={(location) => {
                      console.log('Selected location:', location);
                      alert(`Đã chọn vị trí: ${location.address}`);
                    }}
                    height="300px"
                  />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="tool-card">
                  <h5>Vẽ Vùng Dịch</h5>
                  <p>Khoanh vùng các khu vực bị ảnh hưởng bởi dịch bệnh</p>
                  <PolygonDrawer
                    onPolygonComplete={(polygon) => {
                      console.log('Polygon completed:', polygon);
                      alert(`Đã vẽ vùng dịch với ${polygon.length} điểm`);
                    }}
                    height="300px"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <DashboardStats />;
    }
  };

  return (
    <div className="user-dashboard">
      {/* Sidebar */}
      <UserSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        collapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Header */}
        <UserHeader
          toggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Page Content */}
        <div className="content-area">
          <div className="container-fluid">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Modal Forms */}
      {showUserForm && (
        <div className="modal-overlay active">
          <div className="modal-container">
            <div className="modal-content large">
              <div className="modal-header">
                <h5>
                  {editingUser ? 'Chỉnh Sửa Người Dùng' : 'Thêm Người Dùng Mới' }
                  </h5>
                <button
                  className="btn-close"
                  onClick={() => {
                    setShowUserForm(false);
                    setEditingUser(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <FacilityForm
                  onSubmit={handleUserSubmit}
                  initialData={editingUser || {}} 
                  mode={editingUser ?
                    'edit' : 'create'}
                />
              </div>
            </div>
          </div>
        </div>
      )
      }
      {showFacilityForm && (
        <div className="modal-overlay active">
          <div className="modal-container">
            <div className="modal-content large">
              <div className="modal-header">
                <h5>
                  {editingFacility ? 'Chỉnh Sửa Cơ Sở Y Tế' : 'Thêm Cơ Sở Y Tế Mới'}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => {
                    setShowFacilityForm(false);
                    setEditingFacility(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <FacilityForm
                  onSubmit={handleFacilitySubmit}
                  initialData={editingFacility || {}} // Đảm bảo luôn có object
                  mode={editingFacility ? 'edit' : 'create'}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showOutbreakForm && (
        <div className="modal-overlay active">
          <div className="modal-container">
            <div className="modal-content large">
              <div className="modal-header">
                <h5>
                  {editingOutbreak ? 'Chỉnh Sửa Vùng Dịch' : 'Khai Báo Vùng Dịch Mới'}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => {
                    setShowOutbreakForm(false);
                    setEditingOutbreak(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <OutbreakForm
                  onSubmit={handleOutbreakSubmit}
                  initialData={editingOutbreak}
                  mode={editingOutbreak ? 'edit' : 'create'}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showReportForm && (
        <div className="modal-overlay active">
          <div className="modal-container">
            <div className="modal-content x-large">
              <div className="modal-header">
                <h5>Tạo Báo Cáo Mới</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowReportForm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <ReportForm
                  onSubmit={handleReportSubmit}
                  mode="create"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;