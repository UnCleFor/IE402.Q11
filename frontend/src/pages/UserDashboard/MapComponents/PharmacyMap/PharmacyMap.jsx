import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PharmacyMap.css';

// Fix cho icon marker trong React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component con để điều khiển map
const MapController = ({ pharmacyToZoom, pharmacyAreas }) => {
  const map = useMap();

  useEffect(() => {
     if (!pharmacyToZoom || !pharmacyAreas.length) return;

    const pharmacy = pharmacyAreas.find(p => p.pharmacy_id === pharmacyToZoom);
    if (!pharmacy || !pharmacy.location) return;

    const { lat, lng } = pharmacy.location;

    // Zoom tới điểm nhà thuốc
    map.setView(pharmacy.location, 17, { animate: true });

    // Tạo marker
    const marker = L.marker(pharmacy.location).addTo(map);

    marker.bindPopup(`
      <div style="min-width: 260px; color: #000">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px">
          <span style="font-size:20px">💊</span>
          <strong style="font-size:16px">${pharmacy.name}</strong>
        </div>

        <div style="font-size:14px">
          <div><strong>Tỉnh/Thành phố:</strong> ${pharmacy.province}</div>
          <div><strong>Địa chỉ:</strong> ${pharmacy.address}</div>
        </div>
      </div>
    `).openPopup();

    return () => {
      map.removeLayer(marker);
    };
  }, [pharmacyToZoom, pharmacyAreas, map]);

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

const PharmacyMap = ({ 
  pharmacies = [], // QUAN TRỌNG: Nhận pharmacies từ props thay vì tự fetch
  onPharmacyClick, 
  selectedPharmacyId,
  showLoading = false 
}) => {
  const [mapCenter] = useState([10.762622, 106.660172]);
  const [mapZoom] = useState(12);
  const mapRef = useRef();
  const isZoomingRef = useRef(false);

// Tạo icon cho cơ sở y tế theo trạng thái hoạt động
  const getPharmacyIcon = useCallback((status) => {
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

  // Hàm lấy màu sắc cho pharmacy dựa trên status
  const getColorByStatus = useCallback((status) => {
    switch(status) {
      case 'active': return '#00ff00';
      case 'pending': return 'fde614ff';
      case 'inactive': return '#ff0000';
      default: return '#cccccc';
    }
  }, []);

  // lấy location cho mỗi pharmacy
  const [pharmaciesWithLocation, setPharmaciesWithLocation] = useState([]);

  useEffect(() => {
  async function enrichPharmacies() {
    if (!pharmacies || pharmacies.length === 0) return;

    const enriched = await Promise.all(
      pharmacies.map(async (p) => {
        if (!p.pharmacy_point_id) return null;

        try {
           const res = await fetch(
            `http://localhost:3001/api/locations/${p.pharmacy_point_id}`
          );

          //if (!res.ok) return null;

          const location = await res.json();
          return {
            ...p,
            location
          };
        } catch (err) {
          console.error("Load location failed", p.pharmacy_id, err);
          return null;
        }
      })
    );

    setPharmaciesWithLocation(enriched.filter(Boolean));
  }

  enrichPharmacies();
}, [pharmacies]);

  const processPharmacyData = useCallback((pharmacy) => {
    if (!pharmacy.location || !pharmacy.location.coordinates) return null;

    // GeoJSON POINT: [lng, lat]
    const [lng, lat] = pharmacy.location.coordinates.coordinates;

    return {
      id: pharmacy.pharmacy_id,
      name: pharmacy.pharmacy_name,
      address: pharmacy.address,
      status: pharmacy.status,
      province: pharmacy.province_id,

      location: [lat, lng],
      fillColor: getColorByStatus(pharmacy.status),
      borderColor: getColorByStatus(pharmacy.status),
      icon: getPharmacyIcon(pharmacy.status)
    };
  });

  // Process pharmacies data từ props
  const processedPharmacies = useMemo(() => {
    if (!pharmaciesWithLocation.length) return [];
    return pharmaciesWithLocation.map(processPharmacyData).filter(Boolean);
  }, [pharmaciesWithLocation, processPharmacyData]);

  // Theo dõi sự thay đổi của selectedPharmacyId
  useEffect(() => {
    if (selectedPharmacyId) {
      isZoomingRef.current = true;
      setTimeout(() => {
        isZoomingRef.current = false;
      }, 1000);
    }
  }, [selectedPharmacyId]);

  // Hàm xử lý khi click vào nhà thuốc
  const handlePharmacyClick = useCallback((pharmacy) => {
      onPharmacyClick?.(pharmacy);
      
      if (mapRef.current && pharmacy.location) {
        mapRef.current.setView(pharmacy.location, 17, { animate: true });
      }
  }, [onPharmacyClick]);

  // Hàm render popup cho nhà thuốc
  const renderPharmacyPopup = (pharmacy) => {

    return (
      <div style={{ minWidth: '250px' }}>
        <div style={{ 
          color: 'Black', 
          padding: '5px 10px', 
          margin: '-10px -10px 10px -10px',
          borderTopLeftRadius: '4px',
          borderTopRightRadius: '4px'
        }}>
          <strong>💊 {pharmacy.name}</strong>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <div><strong>Trạng thái hoạt động: </strong> <span style={{ color: pharmacy.status === 'inactive' ? '#dc3545' : pharmacy.status === 'pending' ? '#fde614ff' : '#28a745' }}>
            {getStatusText(pharmacy.status)}
          </span></div>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <div><strong>Địa chỉ:</strong> {pharmacy.address}</div>
        </div>
      </div>
    );
  };

  // Empty state khi không có pharmacies
  if (!showLoading && (!pharmacies || pharmacies.length === 0)) {
    return (
      <div className="pharmacy-map-container">
        <div className="map-empty-state">
          <i className="bi bi-map"></i>
          <h5>Không có dữ liệu nhà thuốc</h5>
          <p>Không tìm thấy nhà thuốc nào phù hợp với bộ lọc</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pharmacy-map-container">
      {/* Loading state */}
      {showLoading && (
        <div className="map-loading-overlay">
          <div className="map-loading">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3">Đang tải bản đồ nhà thuốc...</p>
          </div>
        </div>
      )}
      
      {/* Map */}
      <div className={`pharmacy-map-wrapper ${showLoading ? 'loading' : 'loaded'}`}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="pharmacy-map"
          scrollWheelZoom={true}
          style={{ height: "500px", width: "100%" }}
          whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Map controller để zoom vào nhà thuốc cụ thể */}
          <MapController 
            pharmacyToZoom={selectedPharmacyId} 
            pharmacyAreas={processedPharmacies} 
          />

          {/* Hiển thị các nhà thuốc từ props */}
          {!showLoading && processedPharmacies.map((pharmacy) => {
            if (!pharmacy.location) return null;

            return (
              <Marker
                key={pharmacy.id}
                position={pharmacy.location}
                icon={pharmacy.icon}
                eventHandlers={{
                  click: () => handlePharmacyClick(pharmacy)
                }}
              >
                <Popup>
                  {renderPharmacyPopup(pharmacy)}
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
PharmacyMap.defaultProps = {
  pharmacies: [],
  onPharmacyClick: null,
  selectedPharmacyId: null,
  showLoading: false
};

export default PharmacyMap;