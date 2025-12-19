import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from "react-leaflet";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './FacilityMap.css';

// Fix cho icon marker trong React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component con để điều khiển map
const MapController = ({ facilityToZoom, facilityAreas }) => {
  const map = useMap();

  useEffect(() => {
     if (!facilityToZoom || !facilityAreas.length) return;

    const facility = facilityAreas.find(f => f.id === facilityToZoom);
    if (!facility || !facility.location) return;

    const { lat, lng } = facility.location;

    // Zoom tới điểm cơ sở y tế
    map.setView(facility.location, 17, { animate: true });

    // Tạo marker
    const marker = L.marker(facility.location).addTo(map);

    // Format services
    const servicesText = Array.isArray(facility.services)
      ? facility.services.join(", ")
      : facility.services || "Chưa cập nhật";

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

// Helper functions
const getStatusText = (status) => {
  switch(status) {
    case 'active': return 'Hoạt động';
    case 'pending': return 'Chờ duyệt';
    case 'inactive': return 'Ngừng hoạt động';
    default: return 'Không xác định';
  }
};

const FacilityMap = ({ 
  facilities = [], // QUAN TRỌNG: Nhận facilitys từ props thay vì tự fetch
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
      case 'pending': return '#ffff00';
      case 'inactive': return '#ff0000';
      default: return '#cccccc';
    }
  }, []);

  // Hàm xử lý dữ liệu geometry từ API - Sửa để xử lý trực tiếp từ prop
  const processFacilityData = useCallback((facility) => {
    if (!facility.location || !facility.location.coordinates) return null;

    // GeoJSON POINT: [lng, lat]
    const [lng, lat] = facility.location.coordinates.coordinates;

    return {
      id: facility.facility_id,
      name: facility.facility_name,
      type: facility.type_id,
      address: facility.address,
      phone: facility.phone,
      province: facility.province_name,
      status: facility.status,
      services: facility.services,

      location: [lat, lng],
      fillColor: getColorByStatus(facility.status),
      borderColor: getColorByStatus(facility.status),
      icon: getFacilityIcon(facility.status)
    };
  }, [getColorByStatus, getFacilityIcon]);

  useEffect(() => {
  console.log("RAW facilities:", facilities);
}, [facilities]);
console.log("FIRST facility:", facilities?.[0]);

  // Process facilities data từ props
  const processedFacilities = useMemo(() => {
    if (!facilities || facilities.length === 0) return [];
    return facilities.map(processFacilityData).filter(Boolean);
  }, [facilities, processFacilityData]);

  // Theo dõi sự thay đổi của selectedFacilityId
  useEffect(() => {
    if (selectedFacilityId) {
      isZoomingRef.current = true;
      setTimeout(() => {
        isZoomingRef.current = false;
      }, 1000);
    }
  }, [selectedFacilityId]);

  // Hàm xử lý khi click vào vùng dịch
  const handleFacilityClick = useCallback((facility) => {
      onFacilityClick?.(facility);
    
      if (mapRef.current && facility.location) {
        mapRef.current.setView(facility.location, 17, { animate: true });
      }
  }, [onFacilityClick]);

  // Hàm render popup cho vùng dịch
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
          <div><strong>Dịch vụ:</strong> {facility.services}</div>
        </div>
      </div>
    );
  };

  // Empty state khi không có facilities
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

          {/* Map controller để zoom vào vùng dịch cụ thể */}
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
        
        {/* Custom zoom controls */}
        <div className="custom-map-controls">
          <button 
            className="map-control-btn"
            onClick={() => mapRef.current?.zoomIn()}
            title="Zoom in"
          >
            <i className="bi bi-plus"></i>
          </button>
          <button 
            className="map-control-btn"
            onClick={() => mapRef.current?.zoomOut()}
            title="Zoom out"
          >
            <i className="bi bi-dash"></i>
          </button>
          <button 
            className="map-control-btn"
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView(mapCenter, mapZoom);
              }
            }}
            title="Reset view"
          >
            <i className="bi bi-geo-alt"></i>
          </button>
        </div>
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