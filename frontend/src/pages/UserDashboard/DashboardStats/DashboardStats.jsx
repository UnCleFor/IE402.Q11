import { useEffect, useState } from 'react';
import './DashboardStats.css';
import facilityService from '../../../services/facilityService';
import pharmacyService from '../../../services/pharmacyService';
import outbreakServices from '../../../services/outbreakServices';
import provinceService from '../../../services/provinceService';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
  AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const DashboardStats = () => {
  // State để lưu trữ tất cả dữ liệu thống kê
  const [stats, setStats] = useState({
    facilities: {
      total: 0,
      loading: true,
      error: null,
      data: [],
      byType: {},
      byProvince: {},
      byStatus: {},
      byCreator: {},
      monthlyData: []
    },
    pharmacies: {
      total: 0,
      loading: true,
      error: null,
      data: [],
      byProvince: {},
      byStatus: {},
      byType: {},
      monthlyData: []
    },
    outbreaks: {
      total: 0,
      loading: true,
      error: null,
      data: [],
      byDisease: {},
      bySeverity: {},
      byProvince: {},
      byStatus: {},
      monthlyData: [],
      casesByMonth: []
    }
  });

  // Thống kê tổng quan
  const [overallStats, setOverallStats] = useState({
    totalEntities: 0,
    lastUpdated: null,
    loading: true
  });

  // Fetch tất cả dữ liệu
  useEffect(() => {
    fetchAllData();
  }, []);

  // Helper function để lấy tên tỉnh từ ID
  const getProvinceName = async (id) => {
    if (!id) return 'Không xác định';
    try {
      const res = await provinceService.searchProvinces(id);
      if (Array.isArray(res) && res.length > 0) {
        const province = res[0];
        return province.province_name || 'Không xác định';
      }
      return 'Không xác định';
    } catch (error) {
      console.error('Error in getProvinceName:', error);
      return 'Không xác định';
    }
  };

  // Helper function để định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Helper function để lấy tháng từ date
  const getMonthFromDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Hàm fetch tất cả dữ liệu và xử lý
  const fetchAllData = async () => {
    try {
      const [facilitiesRes, pharmaciesRes, outbreaksRes] = await Promise.all([
        facilityService.getAllFacilities(),
        pharmacyService.getAllPharmacies(),
        outbreakServices.getAllOutbreaks()
      ]);

      // Xử lý dữ liệu cơ sở y tế
      let facilitiesData = [];
      let facilitiesByType = {};
      let facilitiesByProvince = {};
      let facilitiesByStatus = {};
      let facilitiesByCreator = {};
      let facilitiesMonthlyData = {};
      if (facilitiesRes && Array.isArray(facilitiesRes)) {
        facilitiesData = facilitiesRes;
        const facilitiesWithProvinces = await Promise.all(
          facilitiesData.map(async (facility) => {
            const provinceName = await getProvinceName(facility.province_id);

            // Phân loại theo loại cơ sở y tế
            const type = facility.type_id || facility.facility_type || 'Khác';
            facilitiesByType[type] = (facilitiesByType[type] || 0) + 1;
            facilitiesByProvince[provinceName] = (facilitiesByProvince[provinceName] || 0) + 1;

            // Phân loại theo trạng thái
            const status = facility.status || facility.is_active || 'active';
            facilitiesByStatus[status] = (facilitiesByStatus[status] || 0) + 1;

            // Phân loại theo người tạo
            const creator = facility.creator_id || 'Unknown';
            facilitiesByCreator[creator] = (facilitiesByCreator[creator] || 0) + 1;

            // Thống kê theo tháng
            const createdDate = facility.createdAt || facility.created_date || new Date();
            const month = getMonthFromDate(createdDate);
            if (month) {
              facilitiesMonthlyData[month] = (facilitiesMonthlyData[month] || 0) + 1;
            }
            return {
              ...facility,
              province_name: provinceName,
              formatted_date: formatDate(createdDate)
            };
          })
        );
        facilitiesData = facilitiesWithProvinces;
      }

      // Xử lý dữ liệu nhà thuốc
      let pharmaciesData = [];
      let pharmaciesByProvince = {};
      let pharmaciesByStatus = {};
      let pharmaciesByType = {};
      let pharmaciesMonthlyData = {};
      if (pharmaciesRes && Array.isArray(pharmaciesRes)) {
        pharmaciesData = pharmaciesRes;
        const pharmaciesWithProvinces = await Promise.all(
          pharmaciesData.map(async (pharmacy) => {
            const provinceName = await getProvinceName(pharmacy.province_id);

            // Phân loại theo tỉnh/thành
            pharmaciesByProvince[provinceName] = (pharmaciesByProvince[provinceName] || 0) + 1;

            // Phân loại theo trạng thái
            const status = pharmacy.status || pharmacy.is_active || 'active';
            pharmaciesByStatus[status] = (pharmaciesByStatus[status] || 0) + 1;

            // Phân loại theo loại nhà thuốc
            const type = pharmacy.pharmacy_type || pharmacy.type || 'General';
            pharmaciesByType[type] = (pharmaciesByType[type] || 0) + 1;

            // Thống kê theo tháng
            const createdDate = pharmacy.createdAt || pharmacy.created_date || new Date();
            const month = getMonthFromDate(createdDate);
            if (month) {
              pharmaciesMonthlyData[month] = (pharmaciesMonthlyData[month] || 0) + 1;
            }

            return {
              ...pharmacy,
              province_name: provinceName,
              formatted_date: formatDate(createdDate)
            };
          })
        );

        pharmaciesData = pharmaciesWithProvinces;
      }

      // Xử lý dữ liệu vùng dịch
      let outbreaksData = [];
      let outbreaksByDisease = {};
      let outbreaksBySeverity = {
        high: 0,
        medium: 0,
        low: 0
      };
      let outbreaksByProvince = {};
      let outbreaksByStatus = {};
      let outbreaksMonthlyData = {};
      let outbreaksCasesByMonth = {};
      if (outbreaksRes && outbreaksRes.data && Array.isArray(outbreaksRes.data)) {
        outbreaksData = outbreaksRes.data;
        const outbreaksWithProvinces = await Promise.all(
          outbreaksData.map(async (outbreak) => {
            const provinceName = await getProvinceName(outbreak.province_id);

            // Phân loại theo loại bệnh
            const disease = outbreak.disease_id || outbreak.disease_type || 'OTHER';
            outbreaksByDisease[disease] = (outbreaksByDisease[disease] || 0) + 1;

            // Phân loại theo mức độ
            const severity = outbreak.severity_level || outbreak.severity || 'medium';
            outbreaksBySeverity[severity] = (outbreaksBySeverity[severity] || 0) + 1;

            // Phân loại theo tỉnh/thành
            outbreaksByProvince[provinceName] = (outbreaksByProvince[provinceName] || 0) + 1;

            // Phân loại theo trạng thái
            const endDate = outbreak.end_date;
            const status = endDate ? 'Đã kết thúc' : 'Đang diễn ra';
            outbreaksByStatus[status] = (outbreaksByStatus[status] || 0) + 1;

            // Thống kê theo tháng
            const startDate = outbreak.start_date || outbreak.createdAt;
            const month = getMonthFromDate(startDate);
            if (month) {
              outbreaksMonthlyData[month] = (outbreaksMonthlyData[month] || 0) + 1;

              // Thống kê số ca bệnh theo tháng
              const cases = outbreak.disease_cases || outbreak.cases || 0;
              outbreaksCasesByMonth[month] = (outbreaksCasesByMonth[month] || 0) + parseInt(cases);
            }

            return {
              ...outbreak,
              province_name: provinceName,
              status: endDate ? 'Đã kết thúc' : 'Đang diễn ra',
              formatted_start_date: formatDate(startDate),
              formatted_end_date: formatDate(endDate)
            };
          })
        );
        outbreaksData = outbreaksWithProvinces;
      }

      // Chuyển đổi dữ liệu tháng thành array
      const convertMonthlyData = (monthlyData) => {
        return Object.entries(monthlyData)
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => {
            const [monthA, yearA] = a.month.split('/').map(Number);
            const [monthB, yearB] = b.month.split('/').map(Number);
            if (yearA !== yearB) return yearA - yearB;
            return monthA - monthB;
          });
      };

      // Cập nhật state với dữ liệu đã xử lý
      setStats({
        facilities: {
          total: facilitiesData.length,
          loading: false,
          error: null,
          data: facilitiesData,
          byType: facilitiesByType,
          byProvince: facilitiesByProvince,
          byStatus: facilitiesByStatus,
          byCreator: facilitiesByCreator,
          monthlyData: convertMonthlyData(facilitiesMonthlyData)
        },
        pharmacies: {
          total: pharmaciesData.length,
          loading: false,
          error: null,
          data: pharmaciesData,
          byProvince: pharmaciesByProvince,
          byStatus: pharmaciesByStatus,
          byType: pharmaciesByType,
          monthlyData: convertMonthlyData(pharmaciesMonthlyData)
        },
        outbreaks: {
          total: outbreaksData.length,
          loading: false,
          error: null,
          data: outbreaksData,
          byDisease: outbreaksByDisease,
          bySeverity: outbreaksBySeverity,
          byProvince: outbreaksByProvince,
          byStatus: outbreaksByStatus,
          monthlyData: convertMonthlyData(outbreaksMonthlyData),
          casesByMonth: Object.entries(outbreaksCasesByMonth)
            .map(([month, cases]) => ({ month, cases }))
            .sort((a, b) => {
              const [monthA, yearA] = a.month.split('/').map(Number);
              const [monthB, yearB] = b.month.split('/').map(Number);
              if (yearA !== yearB) return yearA - yearB;
              return monthA - monthB;
            })
        }
      });

      // Cập nhật thống kê tổng quan
      setOverallStats({
        totalEntities: facilitiesData.length + pharmaciesData.length + outbreaksData.length,
        lastUpdated: new Date().toLocaleString('vi-VN'),
        loading: false
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(prev => ({
        facilities: { ...prev.facilities, loading: false, error: 'Lỗi tải dữ liệu cơ sở y tế' },
        pharmacies: { ...prev.pharmacies, loading: false, error: 'Lỗi tải dữ liệu nhà thuốc' },
        outbreaks: { ...prev.outbreaks, loading: false, error: 'Lỗi tải dữ liệu vùng dịch' }
      }));
    }
  };

  // === CÁC HÀM CHUẨN BỊ DỮ LIỆU CHO BIỂU ĐỒ ===

  // Biểu đồ loại cơ sở y tế
  const getFacilityTypeChartData = () => {
    const { byType } = stats.facilities;
    if (!byType || typeof byType !== 'object') return [];

    const typeLabels = {
      'hospital': 'Bệnh viện',
      'clinic': 'Phòng khám',
      'health_station': 'Trạm y tế',
      'other': 'Khác',
      'Khác': 'Khác'
    };

    return Object.entries(byType).map(([name, value]) => ({
      name: typeLabels[name] || name,
      value
    }));
  };

  // Biểu đồ phân bố theo tháng (tổng hợp)
  const getMonthlyTrendData = () => {
    const facilityMap = new Map(stats.facilities.monthlyData.map(item => [item.month, item.count]));
    const pharmacyMap = new Map(stats.pharmacies.monthlyData.map(item => [item.month, item.count]));
    const outbreakMap = new Map(stats.outbreaks.monthlyData.map(item => [item.month, item.count]));

    const allMonths = new Set([
      ...stats.facilities.monthlyData.map(item => item.month),
      ...stats.pharmacies.monthlyData.map(item => item.month),
      ...stats.outbreaks.monthlyData.map(item => item.month)
    ]);

    return Array.from(allMonths)
      .sort((a, b) => {
        const [monthA, yearA] = a.split('/').map(Number);
        const [monthB, yearB] = b.split('/').map(Number);
        if (yearA !== yearB) return yearA - yearB;
        return monthA - monthB;
      })
      .map(month => ({
        month,
        CơSởYTe: facilityMap.get(month) || 0,
        NhàThuốc: pharmacyMap.get(month) || 0,
        VùngDịch: outbreakMap.get(month) || 0
      }));
  };

  // Biểu đồ số ca bệnh theo tháng
  const getCasesByMonthData = () => {
    return stats.outbreaks.casesByMonth || [];
  };

  // Biểu đồ trạng thái vùng dịch
  const getOutbreakStatusData = () => {
    const { byStatus } = stats.outbreaks;
    if (!byStatus || typeof byStatus !== 'object') return [];

    return Object.entries(byStatus).map(([name, value]) => ({
      name,
      value,
      color: name === 'Đang diễn ra' ? '#e74c3c' : '#2ecc71'
    }));
  };

  // Biểu đồ nhà thuốc theo tỉnh
  const getPharmacyProvinceChartData = () => {
    const { byProvince } = stats.pharmacies;
    if (!byProvince || typeof byProvince !== 'object') return [];

    return Object.entries(byProvince)
      .filter(([name]) => name !== 'Không xác định')
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  };

  // Biểu đồ loại bệnh dịch
  const getOutbreakDiseaseChartData = () => {
    const { byDisease } = stats.outbreaks;
    if (!byDisease || typeof byDisease !== 'object') return [];
    return Object.entries(byDisease).map(([name, value]) => ({
      name: getDiseaseLabel(name),
      value
    }));
  };

  // Biểu đồ mức độ nghiêm trọng
  const getSeverityChartData = () => {
    const { bySeverity } = stats.outbreaks;
    if (!bySeverity || typeof bySeverity !== 'object') {
      return [
        { name: 'Cao', value: 0, color: '#e74c3c' },
        { name: 'Trung bình', value: 0, color: '#f39c12' },
        { name: 'Thấp', value: 0, color: '#2ecc71' }
      ];
    }
    return [
      { name: 'Cao', value: bySeverity.high || bySeverity.cao || 0, color: '#e74c3c' },
      { name: 'Trung bình', value: bySeverity.medium || bySeverity['trung bình'] || bySeverity.trung_binh || 0, color: '#f39c12' },
      { name: 'Thấp', value: bySeverity.low || bySeverity.thap || 0, color: '#2ecc71' }
    ];
  };

  // Biểu đồ trạng thái cơ sở y tế
  const getFacilityStatusData = () => {
    const { byStatus } = stats.facilities;
    if (!byStatus || typeof byStatus !== 'object') return [];

    const statusLabels = {
      'active': 'Đang hoạt động',
      'inactive': 'Ngừng hoạt động',
      'Đang hoạt động': 'Đang hoạt động',
      'Ngừng hoạt động': 'Ngừng hoạt động',
      'pending': 'Đang chờ duyệt',
    };

    return Object.entries(byStatus).map(([name, value]) => ({
      name: statusLabels[name] || name,
      value,
      color: name === 'active' || name === 'Đang HĐ' ? '#2ecc71' :
        name === 'inactive' || name === 'Ngừng hoạt động' ? '#e74c3c' : '#f39c12'
    }));
  };

  // Biểu đồ so sánh 3 loại đối tượng
  const getEntityComparisonData = () => {
    return [
      { name: 'Cơ sở y tế', value: stats.facilities.total, color: '#3498db' },
      { name: 'Nhà thuốc', value: stats.pharmacies.total, color: '#9b59b6' },
      { name: 'Vùng dịch', value: stats.outbreaks.total, color: '#e74c3c' }
    ];
  };

  // Biểu đồ radar tổng quan
  const getRadarChartData = () => {
    const facilityProvinces = Object.keys(stats.facilities.byProvince || {}).filter(p => p !== 'Không xác định').length;
    const pharmacyProvinces = Object.keys(stats.pharmacies.byProvince || {}).filter(p => p !== 'Không xác định').length;
    const outbreakProvinces = Object.keys(stats.outbreaks.byProvince || {}).filter(p => p !== 'Không xác định').length;

    const facilityTypes = Object.keys(stats.facilities.byType || {}).length;
    const pharmacyTypes = Object.keys(stats.pharmacies.byType || {}).length;
    const outbreakDiseases = Object.keys(stats.outbreaks.byDisease || {}).length;

    return [
      {
        subject: 'Số lượng',
        'Cơ sở y tế': Math.min(stats.facilities.total / 100, 100),
        'Nhà thuốc': Math.min(stats.pharmacies.total / 100, 100),
        'Vùng dịch': Math.min(stats.outbreaks.total / 10, 100),
        fullMark: 100,
      },
      {
        subject: 'Phân bố',
        'Cơ sở y tế': Math.min(facilityProvinces * 10, 100),
        'Nhà thuốc': Math.min(pharmacyProvinces * 10, 100),
        'Vùng dịch': Math.min(outbreakProvinces * 20, 100),
        fullMark: 100,
      },
      {
        subject: 'Đa dạng',
        'Cơ sở y tế': Math.min(facilityTypes * 20, 100),
        'Nhà thuốc': Math.min(pharmacyTypes * 20, 100),
        'Vùng dịch': Math.min(outbreakDiseases * 25, 100),
        fullMark: 100,
      },
      {
        subject: 'Mức độ',
        'Cơ sở y tế': 30,
        'Nhà thuốc': 40,
        'Vùng dịch': Math.min((stats.outbreaks.bySeverity?.high || 0) * 30, 100),
        fullMark: 100,
      }
    ];
  };

  // Hàm lấy nhãn bệnh dịch
  const getDiseaseLabel = (diseaseId) => {
    const diseaseMap = {
      'DENGUE': 'Sốt xuất huyết',
      'INFLUENZA': 'Cúm',
      'HFMD': 'Tay chân miệng',
      'COVID': 'COVID-19',
      'COVID-19': 'COVID-19',
      'MALARIA': 'Sốt rét',
      'OTHER': 'Khác',
      'Khác': 'Khác'
    };
    return diseaseMap[diseaseId] || diseaseId;
  };

  // Hàm làm mới dữ liệu
  const refreshData = () => {
    setStats(prev => ({
      facilities: { ...prev.facilities, loading: true },
      pharmacies: { ...prev.pharmacies, loading: true },
      outbreaks: { ...prev.outbreaks, loading: true }
    }));
    setOverallStats(prev => ({ ...prev, loading: true }));
    fetchAllData();
  };

  // Giao diện khi đang tải dữ liệu
  if (overallStats.loading) {
    return (
      <div className="dashboard-stats">
        <div className="stats-header">
          <h2>Tổng Quan Hệ Thống</h2>
        </div>
        <div className="loading-state">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3">Đang tải dữ liệu tổng quan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-stats">
      {/* Header */}
      <div className="stats-header">
        <div className="header-content">
          <h2>Tổng Quan Hệ Thống</h2>
          <p className="text-muted">Thống kê tổng hợp tất cả dữ liệu trong hệ thống</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={refreshData}
            disabled={stats.facilities.loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Làm mới
          </button>
          <div className="last-updated">
            <small className="text-muted">
              <i className="bi bi-clock-history me-1"></i>
              Cập nhật: {overallStats.lastUpdated}
            </small>
          </div>
        </div>
      </div>

      {/* Tổng số thống kê */}
      <div className="overall-stats-cards">
        <div className="row g-4">
          {/* Cơ sở y tế */}
          <div className="col-md-4">
            <div className="stat-card facility-card">
              <div className="card-body">
                <div className="stat-icon">
                  <i className="bi bi-hospital"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.facilities.total.toLocaleString()}</h3>
                  <p className="stat-label">Cơ Sở Y Tế</p>
                  <div className="stat-details">
                    <span className="badge bg-info me-2">
                      {Object.keys(stats.facilities.byType || {}).length} loại
                    </span>
                    <span className="badge bg-secondary">
                      {Object.keys(stats.facilities.byProvince || {}).filter(p => p !== 'Không xác định').length} tỉnh/thành
                    </span>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <small>
                  <i className="bi bi-arrow-up-right me-1 text-success"></i>
                  {stats.facilities.monthlyData.length > 0 ?
                    `${stats.facilities.monthlyData[stats.facilities.monthlyData.length - 1]?.count || 0} tháng này` :
                    'Cập nhật mới nhất'}
                </small>
              </div>
            </div>
          </div>

          {/* Nhà thuốc */}
          <div className="col-md-4">
            <div className="stat-card pharmacy-card">
              <div className="card-body">
                <div className="stat-icon">
                  <i className="bi bi-capsule"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.pharmacies.total.toLocaleString()}</h3>
                  <p className="stat-label">Nhà Thuốc</p>
                  <div className="stat-details">
                    <span className="badge bg-info me-2">
                      {Object.keys(stats.pharmacies.byType || {}).length} loại
                    </span>
                    <span className="badge bg-secondary">
                      {Object.keys(stats.pharmacies.byProvince || {}).filter(p => p !== 'Không xác định').length} tỉnh/thành
                    </span>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <small>
                  <i className="bi bi-activity me-1 text-warning"></i>
                  {Object.values(stats.pharmacies.byStatus || {}).find(v => typeof v === 'number') || 0} đang hoạt động
                </small>
              </div>
            </div>
          </div>

          {/* Vùng dịch */}
          <div className="col-md-4">
            <div className="stat-card outbreak-card">
              <div className="card-body">
                <div className="stat-icon">
                  <i className="bi bi-virus"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.outbreaks.total.toLocaleString()}</h3>
                  <p className="stat-label">Vùng Dịch</p>
                  <div className="stat-details">
                    <span className="badge bg-danger me-2">
                      {stats.outbreaks.bySeverity?.high || 0} mức cao
                    </span>
                    <span className="badge bg-secondary">
                      {Object.keys(stats.outbreaks.byDisease || {}).length} loại bệnh
                    </span>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <small>
                  <i className="bi bi-exclamation-triangle me-1 text-danger"></i>
                  {stats.outbreaks.byStatus?.['Đang diễn ra'] || 0} đang diễn ra
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Tổng số */}
        <div className="total-entities-card mt-4">
          <div className="card">
            <div className="card-body text-center">
              <h4 className="mb-2">Tổng số đối tượng trong hệ thống</h4>
              <h1 className="display-4 text-primary mb-0">
                {overallStats.totalEntities.toLocaleString()}
              </h1>
              <p className="text-muted mb-0">
                Bao gồm: {stats.facilities.total} cơ sở y tế, {stats.pharmacies.total} nhà thuốc, {stats.outbreaks.total} vùng dịch
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Biểu đồ và thống kê chi tiết */}
      <div className="detailed-stats mt-4">
        <div className="row g-4">
          {/* Biểu đồ so sánh 3 loại đối tượng */}
          <div className="col-lg-6">
            <div className="chart-card">
              <div className="card-header">
                <h5>So Sánh Số Lượng</h5>
                <small className="text-muted">Giữa các loại đối tượng</small>
              </div>
              <div className="card-body">
                {getEntityComparisonData().some(item => item.value > 0) ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={getEntityComparisonData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'Số lượng']} />
                      <Bar dataKey="value" name="Số lượng">
                        {getEntityComparisonData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data">
                    <i className="bi bi-bar-chart"></i>
                    <p>Không có dữ liệu</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Biểu đồ trạng thái cơ sở y tế */}
          <div className="col-lg-6">
            <div className="chart-card">
              <div className="card-header">
                <h5>Trạng Thái CSYT</h5>
                <small className="text-muted">Phân bố theo trạng thái</small>
              </div>
              <div className="card-body">
                {getFacilityStatusData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={getFacilityStatusData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getFacilityStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Số lượng']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data">
                    <i className="bi bi-pie-chart"></i>
                    <p>Không có dữ liệu</p>
                  </div>
                )}
              </div>
            </div>
          </div>



          {/* Biểu đồ xu hướng theo tháng */}
          <div className="col-lg-6">
            <div className="chart-card">
              <div className="card-header">
                <h5>Xu Hướng Theo Tháng</h5>
                <small className="text-muted">Số lượng đối tượng mới theo thời gian</small>
              </div>
              <div className="card-body">
                {getMonthlyTrendData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getMonthlyTrendData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="CơSởYTe" stroke="#3498db" name="Cơ sở y tế" strokeWidth={2} />
                      <Line type="monotone" dataKey="NhàThuốc" stroke="#9b59b6" name="Nhà thuốc" strokeWidth={2} />
                      <Line type="monotone" dataKey="VùngDịch" stroke="#e74c3c" name="Vùng dịch" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data">
                    <i className="bi bi-graph-up"></i>
                    <p>Không có dữ liệu xu hướng</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Biểu đồ số ca bệnh theo tháng */}
          <div className="col-lg-6">
            <div className="chart-card">
              <div className="card-header">
                <h5>Số Ca Bệnh Theo Tháng</h5>
                <small className="text-muted">Tổng số ca bệnh trong vùng dịch</small>
              </div>
              <div className="card-body">
                {getCasesByMonthData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={getCasesByMonthData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value.toLocaleString(), 'Số ca']} />
                      <Area type="monotone" dataKey="cases" stroke="#e74c3c" fill="#e74c3c" fillOpacity={0.3} name="Số ca bệnh" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data">
                    <i className="bi bi-graph-up"></i>
                    <p>Không có dữ liệu số ca bệnh</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Biểu đồ radar tổng quan */}
          <div className="col-lg-6">
            <div className="chart-card">
              <div className="card-header">
                <h5>Biểu Đồ Radar Tổng Quan</h5>
                <small className="text-muted">So sánh các chỉ số</small>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={getRadarChartData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Cơ sở y tế" dataKey="Cơ sở y tế" stroke="#3498db" fill="#3498db" fillOpacity={0.6} />
                    <Radar name="Nhà thuốc" dataKey="Nhà thuốc" stroke="#9b59b6" fill="#9b59b6" fillOpacity={0.6} />
                    <Radar name="Vùng dịch" dataKey="Vùng dịch" stroke="#e74c3c" fill="#e74c3c" fillOpacity={0.6} />
                    <Legend verticalAlign="bottom"
                      height={1} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Biểu đồ trạng thái vùng dịch */}
          <div className="col-lg-6">
            <div className="chart-card">
              <div className="card-header">
                <h5>Trạng Thái Vùng Dịch</h5>
                <small className="text-muted">Đang diễn ra / Đã kết thúc</small>
              </div>
              <div className="card-body">
                {getOutbreakStatusData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={getOutbreakStatusData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getOutbreakStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Số lượng']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data">
                    <i className="bi bi-pie-chart"></i>
                    <p>Không có dữ liệu</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Biểu đồ phân bố tỉnh thành */}
          <div className="col-lg-12">
            <div className="chart-card">
              <div className="card-header">
                <h5>Phân Bố Đối Tượng Theo Tỉnh/Thành</h5>
                <small className="text-muted">Top 5 tỉnh có nhiều đối tượng nhất</small>
              </div>
              <div className="card-body">
                {(() => {
                  // Lấy dữ liệu phân bố tỉnh thành
                  const getCombinedProvinceData = () => {
                    const { byProvince: facilityProvince } = stats.facilities;
                    const { byProvince: pharmacyProvince } = stats.pharmacies;
                    const { byProvince: outbreakProvince } = stats.outbreaks;

                    // Tạo object tổng hợp cho tất cả các tỉnh
                    const allProvinces = new Set([
                      ...Object.keys(facilityProvince || {}),
                      ...Object.keys(pharmacyProvince || {}),
                      ...Object.keys(outbreakProvince || {})
                    ]);

                    // Tính toán tổng số cho từng tỉnh
                    const provinceData = Array.from(allProvinces)
                      .filter(province => province !== 'Không xác định' && province !== 'Đang tải...')
                      .map(province => {
                        const facilityCount = facilityProvince?.[province] || 0;
                        const pharmacyCount = pharmacyProvince?.[province] || 0;
                        const outbreakCount = outbreakProvince?.[province] || 0;
                        const total = facilityCount + pharmacyCount + outbreakCount;

                        return {
                          province,
                          'Cơ sở y tế': facilityCount,
                          'Nhà thuốc': pharmacyCount,
                          'Vùng dịch': outbreakCount,
                          'Tổng số': total
                        };
                      })
                      .filter(item => item['Tổng số'] > 0)
                      .sort((a, b) => b['Tổng số'] - a['Tổng số'])
                      .slice(0, 5); // Lấy top 5

                    return provinceData;
                  };

                  const provinceData = getCombinedProvinceData();

                  return provinceData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={provinceData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="province"
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis />
                          <Tooltip
                            formatter={(value, name) => {
                              if (name === 'Tổng số') {
                                return [value, name];
                              }
                              return [value, name];
                            }}
                            labelFormatter={(label) => `Tỉnh: ${label}`}
                          />
                          <Legend
                            verticalAlign="bottom"
                            height={1}
                          />
                          <Bar
                            dataKey="Cơ sở y tế"
                            stackId="a"
                            fill="#3498db"
                            name="Cơ sở y tế"
                          />
                          <Bar
                            dataKey="Nhà thuốc"
                            stackId="a"
                            fill="#9b59b6"
                            name="Nhà thuốc"
                          />
                          <Bar
                            dataKey="Vùng dịch"
                            stackId="a"
                            fill="#e74c3c"
                            name="Vùng dịch"
                          />
                        </BarChart>
                      </ResponsiveContainer>

                      {/* Bảng thống kê chi tiết bên dưới biểu đồ */}
                      <div className="province-details mt-3">
                        
                        <div className="table-responsive">
                          <table className="table table-sm table-hover">
                            <thead>
                              <tr>
                                <th>Tỉnh/Thành</th>
                                <th className="text-center">Cơ sở y tế</th>
                                <th className="text-center">Nhà thuốc</th>
                                <th className="text-center">Vùng dịch</th>
                                <th className="text-center">Tổng cộng</th>
                              </tr>
                            </thead>
                            <tbody>
                              {provinceData.map((item, index) => (
                                <tr key={index}>
                                  <td>
                                    <strong>{item.province}</strong>
                                  </td>
                                  <td className="text-center">
                                    <span className="badge bg-primary">
                                      {item['Cơ sở y tế']}
                                    </span>
                                  </td>
                                  <td className="text-center">
                                    <span className="badge bg-info">
                                      {item['Nhà thuốc']}
                                    </span>
                                  </td>
                                  <td className="text-center">
                                    <span className="badge bg-danger">
                                      {item['Vùng dịch']}
                                    </span>
                                  </td>
                                  <td className="text-center">
                                    <strong>{item['Tổng số']}</strong>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="table-light">
                                <td>
                                  <strong>Tổng cộng</strong>
                                </td>
                                <td className="text-center">
                                  <strong>{provinceData.reduce((sum, item) => sum + item['Cơ sở y tế'], 0)}</strong>
                                </td>
                                <td className="text-center">
                                  <strong>{provinceData.reduce((sum, item) => sum + item['Nhà thuốc'], 0)}</strong>
                                </td>
                                <td className="text-center">
                                  <strong>{provinceData.reduce((sum, item) => sum + item['Vùng dịch'], 0)}</strong>
                                </td>
                                <td className="text-center">
                                  <strong className="text-primary">
                                    {provinceData.reduce((sum, item) => sum + item['Tổng số'], 0)}
                                  </strong>
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="no-data text-center py-5">
                      <i className="bi bi-map display-4 text-muted mb-3"></i>
                      <p className="text-muted">Không có dữ liệu phân bố theo tỉnh thành</p>
                      <small className="text-muted">
                        Có thể dữ liệu chưa được cập nhật đầy đủ thông tin tỉnh/thành
                      </small>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Biểu đồ loại cơ sở y tế */}
          <div className="col-lg-6">
            <div className="chart-card">
              <div className="card-header">
                <h5>Phân Loại Cơ Sở Y Tế</h5>
                <small className="text-muted">Theo loại hình</small>
              </div>
              <div className="card-body">
                {getFacilityTypeChartData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getFacilityTypeChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'Số lượng']} />
                      <Legend />
                      <Bar dataKey="value" fill="#3498db" name="Số lượng" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data">
                    <i className="bi bi-bar-chart"></i>
                    <p>Không có dữ liệu cơ sở y tế</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Biểu đồ loại bệnh dịch */}
          <div className="col-lg-6">
            <div className="chart-card">
              <div className="card-header">
                <h5>Phân Bố Loại Bệnh Dịch</h5>
                <small className="text-muted">Theo loại bệnh</small>
              </div>
              <div className="card-body">
                {getOutbreakDiseaseChartData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getOutbreakDiseaseChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getOutbreakDiseaseChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#e74c3c', '#3498db', '#f39c12', '#9b59b6', '#e67e22'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Số lượng']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data">
                    <i className="bi bi-pie-chart"></i>
                    <p>Không có dữ liệu vùng dịch</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Biểu đồ mức độ nghiêm trọng */}
          <div className="col-lg-6">
            <div className="chart-card">
              <div className="card-header">
                <h5>Mức Độ Nghiêm Trọng Vùng Dịch</h5>
                <small className="text-muted">Theo phân loại</small>
              </div>
              <div className="card-body">
                {getSeverityChartData().some(item => item.value > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getSeverityChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'Số lượng']} />
                      <Bar dataKey="value" name="Số lượng">
                        {getSeverityChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data">
                    <i className="bi bi-graph-up"></i>
                    <p>Không có dữ liệu mức độ nghiêm trọng</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Biểu đồ nhà thuốc theo tỉnh */}
          <div className="col-lg-6">
            <div className="chart-card">
              <div className="card-header">
                <h5>Top Tỉnh Có Nhiều Nhà Thuốc</h5>
                <small className="text-muted">Phân bố địa lý</small>
              </div>
              <div className="card-body">
                {getPharmacyProvinceChartData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getPharmacyProvinceChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'Số lượng']} />
                      <Bar dataKey="value" fill="#9b59b6" name="Số nhà thuốc" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data">
                    <i className="bi bi-capsule"></i>
                    <p>Không có dữ liệu nhà thuốc</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng thống kê nhanh */}
      <div className="quick-stats mt-4">
        <div className="row g-4">
          <div className="col-md-6 col-lg-4">
            <div className="info-card">
              <div className="card-header">
                <h6>Thống Kê Nhanh Cơ Sở Y Tế</h6>
              </div>
              <div className="card-body">
                <div className="system-status">
                  <div className="status-item">
                    <span className="status-label">Tổng số:</span>
                    <span className="status-value">{stats.facilities.total}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Số loại:</span>
                    <span className="status-value">{Object.keys(stats.facilities.byType || {}).length}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Tỉnh có CSYT:</span>
                    <span className="status-value">
                      {Object.keys(stats.facilities.byProvince || {}).filter(p => p !== 'Không xác định').length}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Đang hoạt động:</span>
                    <span className="status-value text-success">
                      {stats.facilities.byStatus?.['active'] || stats.facilities.byStatus?.['Đang hoạt động'] || 0}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Tháng này:</span>
                    <span className="status-value">
                      {stats.facilities.monthlyData.length > 0 ?
                        stats.facilities.monthlyData[stats.facilities.monthlyData.length - 1]?.count || 0 : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="info-card">
              <div className="card-header">
                <h6>Thống Kê Nhanh Nhà Thuốc</h6>
              </div>
              <div className="card-body">
                <div className="system-status">
                  <div className="status-item">
                    <span className="status-label">Tổng số:</span>
                    <span className="status-value">{stats.pharmacies.total}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Số loại:</span>
                    <span className="status-value">{Object.keys(stats.pharmacies.byType || {}).length}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Tỉnh có NT:</span>
                    <span className="status-value">
                      {Object.keys(stats.pharmacies.byProvince || {}).filter(p => p !== 'Không xác định').length}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Đang hoạt động:</span>
                    <span className="status-value text-success">
                      {stats.pharmacies.byStatus?.['active'] || stats.pharmacies.byStatus?.['Đang hoạt động'] || 0}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Tháng này:</span>
                    <span className="status-value">
                      {stats.pharmacies.monthlyData.length > 0 ?
                        stats.pharmacies.monthlyData[stats.pharmacies.monthlyData.length - 1]?.count || 0 : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="info-card">
              <div className="card-header">
                <h6>Thống Kê Nhanh Vùng Dịch</h6>
              </div>
              <div className="card-body">
                <div className="system-status">
                  <div className="status-item">
                    <span className="status-label">Tổng số:</span>
                    <span className="status-value">{stats.outbreaks.total}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Số loại bệnh:</span>
                    <span className="status-value">{Object.keys(stats.outbreaks.byDisease || {}).length}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Tỉnh có VD:</span>
                    <span className="status-value">
                      {Object.keys(stats.outbreaks.byProvince || {}).filter(p => p !== 'Không xác định').length}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Đang diễn ra:</span>
                    <span className="status-value text-danger">
                      {stats.outbreaks.byStatus?.['Đang diễn ra'] || 0}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Mức độ cao:</span>
                    <span className="status-value text-danger">
                      {stats.outbreaks.bySeverity?.high || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lỗi hiển thị */}
      {(stats.facilities.error || stats.pharmacies.error || stats.outbreaks.error) && (
        <div className="alert alert-warning mt-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>Lưu ý:</strong> Có một số dữ liệu không thể tải được.
          <button className="btn btn-sm btn-outline-warning ms-2" onClick={refreshData}>
            Thử lại
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;