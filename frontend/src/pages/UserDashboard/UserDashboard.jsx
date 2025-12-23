import React, { useState, useEffect } from 'react';
import './UserDashboard.css';
import UserSidebar from './UserSidebar/UserSidebar';
import UserHeader from './UserHeader/UserHeader';
import DashboardStats from './DashboardStats/DashboardStats';
import MedicalFacilities from './MedicalFacilities/MedicalFacilities';
import Pharmacies from './Pharmacies/Pharmacies';
import OutbreakManagement from './OutbreakManagement/OutbreakManagement';
import FacilityForm from './FormComponents/FacilityForm/FacilityForm';
import PharmacyForm from "./FormComponents/PharmacyForm/PharmacyForm";
import OutbreakForm from './FormComponents/OutbreakForm/OutbreakForm';
import ReportForm from './FormComponents/ReportForm/ReportForm';
import MapPicker from './MapComponents/MapPicker/MapPicker'
import PolygonDrawer from './MapComponents/PolygonDrawer/PolygonDrawer';
import UsersList from './UsersList/UsersList';
import outbreakServices from '../../services/outbreakServices';

const UserDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showFacilityForm, setShowFacilityForm] = useState(false);
  const [showPharmacyForm, setShowPharmacyForm] = useState(false);
  const [showOutbreakForm, setShowOutbreakForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingFacility, setEditingFacility] = useState(null);
  const [editingPharmacy, setEditingPharmacy] = useState(null);
  const [editingOutbreak, setEditingOutbreak] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshOutbreakTrigger, setRefreshOutbreakTrigger] = useState(0);

  // Chuyển đổi trạng thái sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Xử lý form cơ sở y tế
  const handleFacilitySubmit = (facilityData) => {
    setShowFacilityForm(false);
    setEditingFacility(null);
    alert(editingFacility ? 'Cập nhật cơ sở y tế thành công!' : 'Thêm cơ sở y tế thành công!');
  };

  // Xử lý form vùng dịch
  const handleOutbreakSubmit = async (outbreakData) => {
    setIsSubmitting(true);
    try {
      let result;
      if (editingOutbreak) {
        result = await outbreakServices.updateOutbreak(
          editingOutbreak.outbreak_id || editingOutbreak.id,
          outbreakData
        );
      } else {
        result = await outbreakServices.createOutbreak(outbreakData);
      }
      if (result.success !== false) {
        setShowOutbreakForm(false);
        setEditingOutbreak(null);
        setRefreshOutbreakTrigger(prev => prev + 1);
      } else {
        alert(result.message || 'Có lỗi xảy ra khi gửi dữ liệu');
      }
    } catch (error) {
      console.error('Error submitting outbreak:', error);
      alert('Có lỗi xảy ra khi gửi dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý form báo cáo
  const handleReportSubmit = (reportData) => {
    setShowReportForm(false);
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

  // Xoá cơ sở y tế
  const handleDeleteFacility = async (facilityId) => {
    if (!window.confirm("Bạn có chắc muốn xoá cơ sở này không?")) return;
    try {
      const res = await fetch(`http://localhost:3001/api/medical-facilities/${facilityId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Xoá thất bại");
      alert("Đã xoá thành công!");
      setActiveSection("facilities");
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  // Mở form chỉnh sửa vùng dịch
  const handleEditOutbreak = (outbreak) => {
    setEditingOutbreak(outbreak);
    setShowOutbreakForm(true);
    setActiveSection('outbreak');
  };

  // Render nội dung chính dựa trên phần đang hoạt động
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <DashboardStats />
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
            onDeleteFacility={handleDeleteFacility}
          />
        );
      case 'pharmacies':
        return (
          <Pharmacies
            onAddPharmacy={() => setShowPharmacyForm(true)}
            onEditPharmacy={(pharmacy) => {
              setEditingPharmacy(pharmacy);
              setShowPharmacyForm(true);
            }}
          />
        );
      case 'outbreak':
        return (
          <OutbreakManagement
            onAddOutbreak={() => setShowOutbreakForm(true)}
            onEditOutbreak={handleEditOutbreak}
            refreshTrigger={refreshOutbreakTrigger}
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
                  {editingUser ? 'Chỉnh Sửa Người Dùng' : 'Thêm Người Dùng Mới'}
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
                {editingUser ? (
                  <div className="alert alert-warning">
                    <p><strong>Chỉnh sửa người dùng</strong></p>
                    <div className="mb-3">
                      <label className="form-label">ID người dùng</label>
                      <input type="text" className="form-control" value={editingUser.user_id || editingUser.id || ''} readOnly />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Tên người dùng</label>
                      <input type="text" className="form-control" defaultValue={editingUser.username || editingUser.name || ''} />
                    </div>
                    <button className="btn btn-primary mt-2" onClick={() => {
                      alert("Cập nhật người dùng (chức năng đang phát triển)");
                      setShowUserForm(false);
                      setEditingUser(null);
                    }}>
                      Cập nhật
                    </button>
                  </div>
                ) : (
                  <div className="alert alert-info">
                    <p>Form thêm người dùng mới (chức năng đang phát triển)</p>
                    <button className="btn btn-primary" onClick={() => {
                      alert("Thêm người dùng mới (chức năng đang phát triển)");
                      setShowUserForm(false);
                    }}>
                      Thêm
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
                  initialData={editingFacility || {}}
                  mode={editingFacility ? 'edit' : 'create'}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showFacilityForm && (
        <div className="modal-overlay active">
          <div className="modal-container">
            <div className="modal-content large">
              <div className="modal-header">
                <h5>
                  {editingFacility ? 'Chỉnh Sửa Cơ Sở Y Tế' : 'Thêm Cơ Sở Y Tế Mới'}
                  {editingFacility && ` (ID: ${editingFacility.facility_id || editingFacility.id})`}
                </h5>
                <button className="btn-close" onClick={() => { setShowFacilityForm(false); setEditingFacility(null); }}></button>
              </div>
              <div className="modal-body">
                {editingFacility && (
                  <div className="alert alert-info mb-3">
                    <p><strong>Debug - Dữ liệu đang chỉnh sửa:</strong></p>
                    <p>Mode: {editingFacility ? 'EDIT' : 'CREATE'}</p>
                    <p>Facility ID: {editingFacility.facility_id || editingFacility.id}</p>
                    <p>Tên: {editingFacility.facility_name || editingFacility.name}</p>
                    <p>API sẽ dùng: {editingFacility ? 'PUT' : 'POST'}</p>
                  </div>
                )}

                <FacilityForm
                  onSubmit={handleFacilitySubmit}
                  initialData={editingFacility || {}}
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
                    if (!isSubmitting) {
                      setShowOutbreakForm(false);
                      setEditingOutbreak(null);
                    }
                  }}
                  disabled={isSubmitting}
                ></button>
              </div>
              <div className="modal-body">
                <OutbreakForm
                  onSubmit={handleOutbreakSubmit}
                  initialData={editingOutbreak}
                  mode={editingOutbreak ? 'edit' : 'create'}
                  isSubmitting={isSubmitting}
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