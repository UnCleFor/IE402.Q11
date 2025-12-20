import React, { useState, useEffect, useMemo } from 'react';
import './Pharmacies.css';
import pharmacyService from '../../../services/pharmacyService';
import PharmacyForm from '../FormComponents/PharmacyForm/PharmacyForm';
import PharmacyMap from '../MapComponents/PharmacyMap/PharmacyMap';

const Pharmacies = ({ onAddPharmacy, onEditPharmacy, onDeletePharmacy }) => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [pharmacies, setPharmacies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);   

    // State phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // modal state
    const [showForm, setShowForm] = useState(false);
    const [editingPharmacy, setEditingPharmacy] = useState(null);

    // ----- Fetch dữ liệu từ API -----
    useEffect(() => {
        const fetchPharmacies = async () => {
            setLoading(true);
            setErrorMsg(null);
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
            // Reset về trang 1 khi fetch dữ liệu mới
            setCurrentPage(1);
        };
        fetchPharmacies();
    }, []);

    const [provinces, setProvinces] = useState([]);
    useEffect(() => {
        fetch("http://localhost:3001/api/provinces")
        .then(res => res.json())
        .then(data => setProvinces(data));
    }, []);
    const provinceMap = useMemo(() => {
    const map = {};
    provinces.forEach(p => {
        map[String(p.province_id)] = p.province_name;
    });
    return map;
    }, [provinces]);

    // THÊM (update state trực tiếp)
    const handleAddPharmacyResult = (created) => {
        console.log("NEW PHARMACY:", created);
        // Thêm lên đầu danh sách để thấy ngay
        setPharmacies(prev => [created, ...prev]);
        setSearchTerm('');
        // Ẩn form nếu dùng modal
        setShowForm(false);
        // Reset về trang 1 khi thêm mới
        setCurrentPage(1);
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
            } else alert(`Đã xóa nhà thuốc "${pharmacyName}" thành công!`);

            // Cập nhật state local
            setPharmacies(prev => prev.filter(p => p.pharmacy_id !== pharmacyId));
        }
    };

    // Sửa hàm xử lý click trên bản đồ
    const handleMapPharmacyClick = (pharmacy) => {
        const pharmacyId = pharmacy.pharmacy_id;
        
        // Toggle selection - nếu đang chọn thì bỏ chọn, nếu không thì chọn
        if (selectedPharmacy === pharmacyId) {
        setSelectedPharmacy(null);
        } else {
        setSelectedPharmacy(pharmacyId);
        }
    };

    // Thêm hàm reset map view
    const handleResetMapView = () => {
        setSelectedPharmacy(null);
    };

    // filter: tìm theo pharmacy_name hoặc address (an toàn khi p undefined)
    const filteredPharmacies = useMemo(() => {
        return pharmacies.filter(p => {
            if (!p) return false;
            const name = (p.pharmacy_name || '').toString().toLowerCase();
            const addr = (p.address || '').toString().toLowerCase();
            const q = searchTerm.toLowerCase();
            return name.includes(q) || addr.includes(q);
        });
    }, [pharmacies, searchTerm]);

    // Tính toán phân trang
    const totalPages = Math.ceil(filteredPharmacies.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPharmacies = filteredPharmacies.slice(startIndex, endIndex);

    // Điều hướng trang
    const goToPage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Tạo mảng các số trang để hiển thị
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5; // Số trang hiển thị tối đa

        if (totalPages <= maxVisiblePages) {
            // Hiển thị tất cả các trang nếu tổng số trang ít
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Hiển thị một số trang xung quanh trang hiện tại
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, currentPage + 2);

            // Điều chỉnh nếu ở đầu hoặc cuối
            if (currentPage <= 3) {
                endPage = maxVisiblePages;
            } else if (currentPage >= totalPages - 2) {
                startPage = totalPages - maxVisiblePages + 1;
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            // Thêm ellipsis nếu cần
            if (startPage > 1) {
                pageNumbers.unshift('...');
                pageNumbers.unshift(1);
            }
            if (endPage < totalPages) {
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    };



    // Thống kê theo bộ lọc hiện tại
    const filteredStats = {
        showing: filteredPharmacies.length,
        total: pharmacies.length,
        showingRange: filteredPharmacies.length > 0
            ? `Hiển thị ${startIndex + 1}-${Math.min(endIndex, filteredPharmacies.length)} trong tổng số ${filteredPharmacies.length} nhà thuốc`
            : 'Không có dữ liệu'
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

    if (errorMsg) {
        return (
            <div className="pharmacies-page">
                <div className="error-state">
                    <i className="bi bi-exclamation-triangle"></i>
                    <h5>Có lỗi xảy ra</h5>
                    <p>{errorMsg}</p>
                    <button className="btn btn-primary mt-3" onClick={setPharmacies}>
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Thử lại
                    </button>
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

        {/* Pharmacy Map Preview */}
        <div className="pharmacy-map-preview">
            <div className="map-header">
            <h5>Bản Đồ Nhà Thuốc</h5>
            <div className="map-header-badge">
                <span className="badge bg-primary">
                {filteredPharmacies.length} nhà thuốc đang hiển thị
                </span>
                {selectedPharmacy && (
                <button 
                    className="btn btn-sm btn-outline-secondary ms-2"
                    onClick={handleResetMapView}
                    title="Xóa chọn và xem tất cả"
                >
                    <i className="bi bi-x-lg me-1"></i>
                    Xóa chọn
                </button>
                )}
            </div>
            </div>
            
            <div className="pharmacy-map-wrapper">
            {pharmacies.length === 0 ? (
                <div className="map-empty-state">
                <i className="bi bi-map"></i>
                <h6>Chưa có dữ liệu nhà thuốc</h6>
                <p>Bản đồ sẽ hiển thị khi có nhà thuốc được thêm vào</p>
                </div>
            ) : (
                <PharmacyMap 
                pharmacies={filteredPharmacies}
                onPharamcyClick={handleMapPharmacyClick}
                selectedPharmacyId={selectedPharmacy}
                showLoading={loading}
                enableReset={true}
                />
            )}
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
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
                                }}
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="items-per-page-selector">
                            <label className="me-2">Hiển thị:</label>
                            <select
                                className="form-select form-select-sm d-inline-block w-auto"
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1); // Reset về trang 1 khi thay đổi số lượng mỗi trang
                                }}
                            >
                                <option value={5}>5 dòng/trang</option>
                                <option value={10}>10 dòng/trang</option>
                                <option value={20}>20 dòng/trang</option>
                                <option value={50}>50 dòng/trang</option>
                                <option value={100}>100 dòng/trang</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results summary */}
                <div className="filter-summary">
                    <small>
                        {filteredStats.showingRange}
                        {searchTerm && ` - Kết quả tìm kiếm cho: "${searchTerm}"`}
                    </small>
                </div>
            </div>

            {/* Table */}
            <div className="pharmacies-table-container">
                <div className="list-header">
                    <h5>Danh Sách Nhà Thuốc ({filteredPharmacies.length})</h5>
                    <div className="header-actions">
                        <button className="btn btn-primary" onClick={() => { setEditingPharmacy(null); setShowForm(true); }}>
                            <i className="bi bi-plus-circle me-2"></i> Thêm Nhà Thuốc Mới
                        </button>
                        
                    </div>
                </div>

                {currentPharmacies.length > 0 ? (
                    <>
                        <div className="table-responsive">
                            <table className="table pharmacies-table">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Tên nhà thuốc</th>
                                        <th>Địa chỉ</th>
                                        <th>Tỉnh/Thành phố</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentPharmacies.map((pharmacy, index) => (
                                        <tr key={pharmacy.pharmacy_id}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>
                                                <strong>{pharmacy.pharmacy_name}</strong>
                                            </td>
                                            <td>
                                                <small>{pharmacy.address}</small>
                                            </td>
                                            <td>
                                                {provinceMap[pharmacy.province_id]}
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

                                                    {/* <button
                                                        className="btn btn-sm btn-outline-info me-1"
                                                        title="Xem chi tiết"
                                                        onClick={() => {
                                                            alert(`Chi tiết: ${pharmacy.pharmacy_name}\nĐịa chỉ: ${pharmacy.address}`);
                                                        }}
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </button> */}

                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        title="Xóa"
                                                        onClick={() => handleDeleteClick(pharmacy.pharmacy_id, pharmacy.pharmacy_name)}
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

                        {/* Phân trang */}
                        {totalPages > 1 && (
                            <div className="pagination-container">
                                <nav aria-label="Page navigation">
                                    <ul className="pagination justify-content-center">
                                        {/* Nút Previous */}
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => goToPage(currentPage - 1)}
                                                aria-label="Previous"
                                            >
                                                <span aria-hidden="true">&laquo;</span>
                                            </button>
                                        </li>

                                        {/* Các số trang */}
                                        {getPageNumbers().map((pageNum, index) => (
                                            <li
                                                key={index}
                                                className={`page-item ${pageNum === '...' ? 'disabled' :
                                                        pageNum === currentPage ? 'active' : ''
                                                    }`}
                                            >
                                                {pageNum === '...' ? (
                                                    <span className="page-link">...</span>
                                                ) : (
                                                    <button
                                                        className="page-link"
                                                        onClick={() => goToPage(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                )}
                                            </li>
                                        ))}

                                        {/* Nút Next */}
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => goToPage(currentPage + 1)}
                                                aria-label="Next"
                                            >
                                                <span aria-hidden="true">&raquo;</span>
                                            </button>
                                        </li>
                                    </ul>
                                </nav>

                                <div className="pagination-info">
                                    <span>
                                        Trang {currentPage} / {totalPages}
                                    </span>
                                </div>
                            </div>
                        )}
                    </>
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