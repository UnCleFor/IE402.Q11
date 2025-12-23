import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './FacilityMap.css';

// Cấu hình icon mặc định của Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapController = ({ facilityToZoom, facilityAreas }) => {
  const map = useMap();

  // Hiệu ứng zoom tới cơ sở y tế khi facilityToZoom thay đổi
  useEffect(() => {
     if (!facilityToZoom || !facilityAreas.length) return;
    const facility = facilityAreas.find(f => f.id === facilityToZoom);
    if (!facility || !facility.location) return;
    const { lat, lng } = facility.location;

    // Zoom tới điểm cơ sở y tế
    map.setView(facility.location, 17, { animate: true });

    // Thêm marker tạm thời để mở popup
    const marker = L.marker(facility.location).addTo(map);

    // Tạo nội dung popup
    const servicesText = Array.isArray(facility.services)
      ? facility.services.join(", ")
      : facility.services || "Chưa cập nhật";

    // Gắn popup vào marker và mở nó
    marker.bindPopup(`
      <div style="min-width: 260px; color: #000">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px">
          <span style="font-size:20px">🏥</span>
          <strong style="font-size:16px">${facility.name}</strong>
        </div>

        <div style="font-size:14px">
          <div><strong>Loại hình:</strong> ${facility.type}</div>
          <div><strong>Tỉnh/Thành phố:</strong> ${facility.province}</div>
          <div><strong>Địa chỉ:</strong> ${facility.address}</div>
          <div><strong>Điện thoại:</strong> ${facility.phone || "Chưa có"}</div>
          <div><strong>Dịch vụ:</strong> ${servicesText}</div>
        </div>
      </div>
    `).openPopup();

    return () => {
      map.removeLayer(marker);
    };
  }, [facilityToZoom, facilityAreas, map]);

  return null;
};

// Hàm lấy text trạng thái từ status code
const getStatusText = (status) => {
  switch(status) {
    case 'active': return 'Hoạt động';
    case 'pending': return 'Chờ duyệt';
    case 'inactive': return 'Ngừng hoạt động';
    default: return 'Không xác định';
  }
};

// Component bản đồ cơ sở y tế
const FacilityMap = ({ 
  facilities = [], 
  onFacilityClick, 
  selectedFacilityId,
  showLoading = false 
}) => {
  const [mapCenter] = useState([10.762622, 106.660172]);
  const [mapZoom] = useState(12);
  const mapRef = useRef();
  const isZoomingRef = useRef(false);

  // Tạo icon cho cơ sở y tế theo trạng thái hoạt động
  const getFacilityIcon = useCallback((status) => {
    const iconUrl = status === 'active' 
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
      : status === 'pending'
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png'
      : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';

    return new L.Icon({
      iconUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      shadowSize: [41, 41]
    });
  }, []);

  // Hàm lấy màu sắc cho facility dựa trên status
  const getColorByStatus = useCallback((status) => {
    switch(status) {
      case 'active': return '#00ff00';
      case 'pending': return 'fde614ff';
      case 'inactive': return '#ff0000';
      default: return '#cccccc';
    }
  }, []);

  const [facilitiesWithLocation, setFacilitiesWithLocation] = useState([]);

  // Hiệu ứng để load thông tin location cho mỗi cơ sở y tế
  useEffect(() => {
  async function enrichFacilities() {
    if (!facilities || facilities.length === 0) return;
    const enriched = await Promise.all(
      facilities.map(async (f) => {
        if (!f.raw.facility_point_id) return null;
        try {
           const res = await fetch(
            `http://localhost:3001/api/locations/${f.raw.facility_point_id}`
          );
          const location = await res.json();
          return {
            ...f,
            location
          };
        } catch (err) {
          console.error("Load location failed", f.facility_id, err);
          return null;
        }
      })
    );
    setFacilitiesWithLocation(enriched.filter(Boolean));
  }
  enrichFacilities();
}, [facilities]);

  // Hàm xử lý và chuyển đổi dữ liệu cơ sở y tế cho bản đồ
  const processFacilityData = useCallback((facility) => {
    if (!facility.location || !facility.location.coordinates) return null;
    const [lng, lat] = facility.location.coordinates.coordinates;
    return {
      id: facility.id,
      name: facility.name,
      type: facility.type,
      address: facility.address,
      phone: facility.phone,
      province: facility.province,
      status: facility.status,
      services: facility.services,

      location: [lat, lng],
      fillColor: getColorByStatus(facility.status),
      borderColor: getColorByStatus(facility.status),
      icon: getFacilityIcon(facility.status)
    };
  }, [getColorByStatus, getFacilityIcon]);

  const processedFacilities = useMemo(() => {
    if (!facilitiesWithLocation.length) return [];
    return facilitiesWithLocation.map(processFacilityData).filter(Boolean);
  }, [facilitiesWithLocation, processFacilityData]);

  // Hiệu ứng zoom khi selectedFacilityId thay đổi
  useEffect(() => {
    if (selectedFacilityId) {
      isZoomingRef.current = true;
      setTimeout(() => {
        isZoomingRef.current = false;
      }, 1000);
    }
  }, [selectedFacilityId]);

  // Hàm xử lý khi click vào cơ sở y tế
  const handleFacilityClick = useCallback((facility) => {
      onFacilityClick?.(facility);
      if (mapRef.current && facility.location) {
        mapRef.current.setView(facility.location, 17, { animate: true });
      }
  }, [onFacilityClick]);

  // Hàm render popup cho cơ sở y tế
  const renderFacilityPopup = (facility) => {
    return (
      <div style={{ minWidth: '250px' }}>
        <div style={{ 
          color: 'Black', 
          padding: '5px 10px', 
          margin: '-10px -10px 10px -10px',
          borderTopLeftRadius: '4px',
          borderTopRightRadius: '4px'
        }}>
          <strong>🏥 {facility.name}</strong>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <div><strong>Loại hình: </strong> {facility.type}</div>
          <div><strong>Trạng thái hoạt động: </strong> <span style={{ color: facility.status === 'inactive' ? '#dc3545' : facility.status === 'pending' ? '#fde614ff' : '#28a745' }}>
            {getStatusText(facility.status)}
          </span></div>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <div><strong>Điện thoại</strong> {facility.phone}</div>
          <div><strong>Dịch vụ:</strong> {facility.services.join(", ")}</div>
          <div><strong>Địa chỉ:</strong> {facility.address}</div>
        </div>
      </div>
    );
  };
  
  // Hiển thị trạng thái không có dữ liệu
  if (!showLoading && (!facilities || facilities.length === 0)) {
    return (
      <div className="facility-map-container">
        <div className="map-empty-state">
          <i className="bi bi-map"></i>
          <h5>Không có dữ liệu cơ sở y tế</h5>
          <p>Không tìm thấy cơ sở y tế nào phù hợp với bộ lọc</p>
        </div>
      </div>
    );
  }

  return (
    <div className="facility-map-container">
      {/* Loading state */}
      {showLoading && (
        <div className="map-loading-overlay">
          <div className="map-loading">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3">Đang tải bản đồ cơ sở y tế...</p>
          </div>
        </div>
      )}
      
      {/* Map */}
      <div className={`facility-map-wrapper ${showLoading ? 'loading' : 'loaded'}`}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="facility-map"
          scrollWheelZoom={true}
          style={{ height: "500px", width: "100%" }}
          whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Map controller để zoom vào cơ sở y tế cụ thể */}
          <MapController 
            facilityToZoom={selectedFacilityId} 
            facilityAreas={processedFacilities} 
          />

          {/* Hiển thị các cơ sở y tế từ props */}
          {!showLoading && processedFacilities.map((facility) => {
            if (!facility.location) return null;

            return (
              <Marker
                key={facility.id}
                position={facility.location}
                icon={facility.icon}
                eventHandlers={{
                  click: () => handleFacilityClick(facility)
                }}
              >
                <Popup>
                  {renderFacilityPopup(facility)}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        
       
      </div>
    </div>
  );
};

// Props mặc định
FacilityMap.defaultProps = {
  facilities: [],
  onFacilityClick: null,
  selectedFacilityId: null,
  showLoading: false
};

export default FacilityMap;