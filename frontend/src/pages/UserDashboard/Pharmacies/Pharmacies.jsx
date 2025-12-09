import React, { useState, useEffect } from 'react';
import './Pharmacies.css';
import pharmacyService from '../../../services/pharmacyService'; 
import PharmacyForm from '../FormComponents/PharmacyForm/PharmacyForm';

const Pharmacies = ({ onAddPharmacy, onEditPharmacy, onDeletePharmacy }) => { // THÊM prop
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [pharmacies, setPharmacies] = useState([]);
    const [loading, setLoading] = useState(true);

    // modal state
    const [showForm, setShowForm] = useState(false);
    const [editingPharmacy, setEditingPharmacy] = useState(null);

    // ----- Fetch dữ liệu từ API -----
    useEffect(() => {
        const fetchPharmacies = async () => {
            setLoading(true);
            const res = await pharmacyService.getAllPharmacies();
            console.log("GET pharmacies response:", res);

            // res có thể là array trực tiếp hoặc object
            const list =
                Array.isArray(res) ? res :
                Array.isArray(res.data) ? res.data :
                Array.isArray(res.items) ? res.items :
                Array.isArray(res.pharmacies) ? res.pharmacies :
                [];

            setPharmacies(list);
            setLoading(false);
        };
        fetchPharmacies();
    }, []);

    // THÊM (update state trực tiếp)
    const handleAddPharmacyResult = (created) => {
        // created có thể dùng key 'pharmacy_id'
        // Thêm lên đầu danh sách để thấy ngay
        setPharmacies(prev => [created, ...prev]);
        // Ẩn form nếu dùng modal
        setShowForm(false);
    };

    // CHỈNH SỬA (cập nhật state) 
    const handleEditPharmacyResult = (updated) => {
        setPharmacies(prev => prev.map(p => 
            (p.pharmacy_id === updated.pharmacy_id ? updated : p)
        ));
        setEditingPharmacy(null);
        setShowForm(false);
    };

    // XÓA - SỬA LẠI THEO CÁCH CỦA MedicalFacilities
    const handleDeleteClick = async (pharmacyId, pharmacyName) => {
        // Sử dụng prop nếu có, nếu không dùng window.confirm
        if (onDeletePharmacy) {
            // Gọi prop function (giống MedicalFacilities)
            onDeletePharmacy(pharmacyId);
        } else {
            // Fallback: dùng window.confirm
            if (!window.confirm(`Xác nhận xóa nhà thuốc "${pharmacyName}"?`)) return;
            
            console.log("Deleting pharmacy ID:", pharmacyId);
            
            const res = await pharmacyService.deletePharmacy(pharmacyId);
            
            console.log("Delete response:", res);
            console.log("Response success value:", res?.success);
            
            if (res?.success === false) {
                alert(res.message || 'Xóa thất bại');
                return;
            }
            
            // Cập nhật state local
            setPharmacies(prev => prev.filter(p => p.pharmacy_id !== pharmacyId));
        }
    };

    // filter: tìm theo pharmacy_name hoặc address (an toàn khi p undefined)
    const filteredPharmacies = pharmacies.filter(p => {
        if (!p) return false;
        const name = (p.pharmacy_name || '').toString().toLowerCase();
        const addr = (p.address || '').toString().toLowerCase();
        const q = searchTerm.toLowerCase();
        return name.includes(q) || addr.includes(q);
    });

    const handleExportReport = () => {
    console.log('Exporting outbreak report');
    alert('Đã xuất báo cáo thành công!');
  };

      // Thống kê theo bộ lọc hiện tại
    const filteredStats = {
        showing: filteredPharmacies.length,
        total: pharmacies.length
    };

    if (loading) {
    return (
      <div className="pharmacies-page">
        <div className="loading-state">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3">Đang tải dữ liệu nhà thuốc...</p>
        </div>
      </div>
    );
  }

    return (
        <div className="pharmacies-page">

            {/* Header */}
            <div className="section-header">
                <div className="header-content">
                    <h2>Quản Lý Nhà Thuốc</h2>
                    <p>Quản lý thông tin các nhà thuốc trên toàn quốc</p>
                </div>
            </div>

            {/* Filters and Search*/}
            <div className="pharmacies-filters">
                <div className="row g-3">
                    <div className="col-md-6">
                        <div className="search-box">
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                placeholder="Tìm kiếm nhà thuốc..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Results summary */}
                <div className="filter-summary">
                <small>
                    Đang hiển thị <strong>{filteredStats.showing}</strong> trong tổng số <strong>{filteredStats.total}</strong> nhà thuốc
                    {searchTerm && ` - Kết quả tìm kiếm cho: "${searchTerm}"`}
                </small>
                </div>
            </div>

            {/* Table */}
            <div className="pharmacies-table-container">
                <div className="list-header">
                <h5>Danh Sách Nhà Thuốc ({filteredPharmacies.length})</h5>
                    <div className="header-actions">
                <button 
                    className="btn btn-primary me-2"
                    onClick={onAddPharmacy}
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Thêm Nhà Thuốc
                </button>
                        {/* SỬA: dùng setShowForm thay vì onAddFacility prop */}
                {/* <button className="btn btn-primary" onClick={() => { setEditingFacility(null); setShowForm(true); }}>
                <i className="bi bi-plus-circle me-2"></i> Thêm Cơ Sở Mới
                </button> */}
                <button 
                    className="btn btn-outline-primary"
                    onClick={handleExportReport}
                >
                    <i className="bi bi-download me-2"></i>
                    Xuất Báo Cáo
                </button>
                </div>
                </div>

                {filteredPharmacies.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table pharmacies-table">
                            <thead>
                                <tr>
                                    <th>Tên nhà thuốc</th>
                                    <th>Địa chỉ</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredPharmacies.map(pharmacy => (
                                    <tr key={pharmacy.pharmacy_id}>
                                        <td>
                                            <strong>{pharmacy.pharmacy_name}</strong>
                                        </td>

                                        <td>
                                            <small>{pharmacy.address}</small>
                                        </td>

                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-1"
                                                    title="Chỉnh sửa"
                                                    onClick={() => { setEditingPharmacy(pharmacy); setShowForm(true); }}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-outline-info me-1"
                                                    title="Xem chi tiết"
                                                    onClick={() => {
                                                        alert(`Chi tiết: ${pharmacy.pharmacy_name}\nĐịa chỉ: ${pharmacy.address}`);
                                                    }}
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Xóa"
                                                    onClick={() => handleDeleteClick(pharmacy.pharmacy_id, pharmacy.pharmacy_name)} // SỬA DÒNG NÀY
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <i className="bi bi-capsule"></i>
                        <h5>Không tìm thấy nhà thuốc nào</h5>
                        <p>Thử thay đổi điều kiện tìm kiếm hoặc thêm nhà thuốc mới</p>
                        <button className="btn btn-primary mt-3" onClick={() => { setEditingPharmacy(null); setShowForm(true); }}>
                            <i className="bi bi-plus-circle me-2"></i>
                            Thêm Nhà Thuốc Đầu Tiên
                        </button>
                    </div>
                )}
            </div>

            {/* Modal/form area (simple) */}
            {showForm && (
                <div className="modal-overlay active">
                    <div className="modal-container">
                        <div className="modal-content large">
                            <div className="modal-header">
                                <h5>{editingPharmacy ? 'Chỉnh Sửa Nhà Thuốc' : 'Thêm Nhà Thuốc Mới'}</h5>
                                <button className="btn-close" onClick={() => { setShowForm(false); setEditingPharmacy(null); }}></button>
                            </div>
                            <div className="modal-body">
                                <PharmacyForm
                                    initialData={editingPharmacy || {}}
                                    mode={editingPharmacy ? 'edit' : 'create'}
                                    onSubmit={(createdOrUpdated) => {
                                        // nếu mode create -> created mới có pharmacy_id chưa tồn tại trong list
                                        if (editingPharmacy) {
                                            handleEditPharmacyResult(createdOrUpdated);
                                        } else {
                                            handleAddPharmacyResult(createdOrUpdated);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pharmacies;