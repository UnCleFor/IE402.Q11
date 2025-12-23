import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from "react-leaflet";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './OutbreakMap.css';

// Cấu hình icon mặc định của Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component con để điều khiển map
const MapController = ({ outbreakToZoom, outbreakAreas }) => {
  const map = useMap();

  // Hiệu ứng zoom vào vùng dịch khi outbreakToZoom thay đổi
  useEffect(() => {
    if (outbreakToZoom && outbreakAreas.length > 0) {
      const outbreak = outbreakAreas.find(o => o.id === outbreakToZoom);
      if (outbreak && outbreak.coordinates && outbreak.coordinates.length > 0) {
        const bounds = L.latLngBounds(outbreak.coordinates);
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 18,
          animate: true
        });

        // Mở popup của vùng dịch
        const marker = L.marker(outbreak.center, { icon: outbreak.icon });
        marker.bindPopup(`
          <div style="min-width: 250px">
            <div style="color: black; padding: 5px 10px; margin: -10px -10px 10px -10px;">
              <strong>⚠️ ${outbreak.name}</strong>
            </div>
            <div style="margin-bottom: 10px;">
              <div><strong>Bệnh:</strong> ${outbreak.disease_name || outbreak.disease_id}</div>
              <div><strong>Số ca:</strong> <span style="color: ${outbreak.severity === 'high' ? '#dc3545' : '#000'}">${outbreak.cases}</span></div>
              <div><strong>Mức độ:</strong> <span style="color: ${outbreak.severity === 'high' ? '#dc3545' : outbreak.severity === 'medium' ? '#fd7e14' : '#28a745'}">
                ${getSeverityText(outbreak.severity)}
              </span></div>
            </div>
            <div style="margin-bottom: 10px;">
              <div><strong>Bắt đầu:</strong> ${formatDate(outbreak.startDate)}</div>
              <div><strong>Kết thúc:</strong> ${formatDate(outbreak.endDate)}</div>
            </div>
          </div>
        `).openPopup();
      }
    }
  }, [outbreakToZoom, outbreakAreas, map]);

  return null;
};

// Hàm lấy text mô tả mức độ nghiêm trọng
const getSeverityText = (severity) => {
  switch(severity) {
    case 'high': return 'Cao';
    case 'medium': return 'Trung bình';
    case 'low': return 'Thấp';
    default: return 'Không xác định';
  }
};

// Hàm định dạng ngày tháng
const formatDate = (dateString) => {
  if (!dateString) return 'Đang diễn ra';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  } catch (error) {
    return dateString;
  }
};

const OutbreakMap = ({ 
  outbreaks = [], 
  onOutbreakClick, 
  selectedOutbreakId,
  showLoading = false 
}) => {
  const [mapCenter] = useState([10.762622, 106.660172]);
  const [mapZoom] = useState(12);
  const mapRef = useRef();
  const isZoomingRef = useRef(false);

  // Tạo icon cho vùng dịch theo mức độ nghiêm trọng
  const getOutbreakIcon = useCallback((severity) => {
    const iconUrl = severity === 'high' 
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
      : severity === 'medium'
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png'
      : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png';

    return new L.Icon({
      iconUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      shadowSize: [41, 41]
    });
  }, []);

  // Hàm lấy màu sắc cho outbreak area dựa trên severity level
  const getColorBySeverity = useCallback((severity) => {
    switch(severity) {
      case 'high': return '#ff0000';
      case 'medium': return '#ff9900';
      case 'low': return '#ffff00';
      default: return '#cccccc';
    }
  }, []);

  // Hàm xử lý dữ liệu geometry từ API - Sửa để xử lý trực tiếp từ prop
  const processOutbreakData = useCallback((outbreak) => {
    const coordinates = processGeometry(outbreak.area_geom);
    let center = mapCenter;
    if (coordinates.length > 0) {
      const sum = coordinates.reduce((acc, coord) => {
        return [acc[0] + coord[0], acc[1] + coord[1]];
      }, [0, 0]);
      center = [sum[0] / coordinates.length, sum[1] / coordinates.length];
    }

    return {
      ...outbreak,
      id: outbreak.outbreak_id,
      name: outbreak.outbreak_name,
      disease_name: outbreak.disease_name || outbreak.disease_id,
      cases: outbreak.disease_cases,
      severity: outbreak.severity_level,
      startDate: outbreak.start_date,
      endDate: outbreak.end_date,
      coordinates,
      center,
      fillColor: getColorBySeverity(outbreak.severity_level),
      borderColor: getColorBySeverity(outbreak.severity_level),
      icon: getOutbreakIcon(outbreak.severity_level)
    };
  }, [mapCenter, getColorBySeverity, getOutbreakIcon]);

  // Hàm xử lý geometry từ dữ liệu API
  const processGeometry = useCallback((geometry) => {
    if (!geometry || !geometry.coordinates) return [];
    try {
      const polygonCoordinates = geometry.coordinates[0];
      return polygonCoordinates.map(coord => [coord[1], coord[0]]);
    } catch (error) {
      console.error('Error processing geometry:', error);
      return [];
    }
  }, []);

  // Xử lý dữ liệu outbreaks khi prop thay đổi
  const processedOutbreaks = useMemo(() => {
    if (!outbreaks || outbreaks.length === 0) return [];
    return outbreaks.map(outbreak => processOutbreakData(outbreak));
  }, [outbreaks, processOutbreakData]);

  // Hiệu ứng zoom vào outbreak được chọn
  useEffect(() => {
    if (selectedOutbreakId) {
      isZoomingRef.current = true;
      setTimeout(() => {
        isZoomingRef.current = false;
      }, 1000);
    }
  }, [selectedOutbreakId]);

  // Hàm xử lý khi click vào vùng dịch
  const handleOutbreakClick = useCallback((outbreak) => {
    if (onOutbreakClick) {
      onOutbreakClick(outbreak);
    }
    if (mapRef.current && outbreak.coordinates && outbreak.coordinates.length > 0) {
      const map = mapRef.current;
      const bounds = L.latLngBounds(outbreak.coordinates);
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 30,
        animate: true
      });
    }
  }, [onOutbreakClick]);

  // Hàm render popup cho vùng dịch
  const renderOutbreakPopup = (outbreak) => {
    return (
      <div style={{ minWidth: '250px' }}>
        <div style={{ 
          color: 'Black', 
          padding: '5px 10px', 
          margin: '-10px -10px 10px -10px',
          borderTopLeftRadius: '4px',
          borderTopRightRadius: '4px'
        }}>
          <strong>⚠️ {outbreak.name}</strong>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <div><strong>Bệnh:</strong> {outbreak.disease_name || outbreak.disease_id}</div>
          <div><strong>Số ca:</strong> <span style={{ color: outbreak.severity === 'high' ? '#dc3545' : '#000' }}>{outbreak.cases}</span></div>
          <div><strong>Mức độ:</strong> <span style={{ color: outbreak.severity === 'high' ? '#dc3545' : outbreak.severity === 'medium' ? '#fd7e14' : '#28a745' }}>
            {getSeverityText(outbreak.severity)}
          </span></div>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <div><strong>Bắt đầu:</strong> {formatDate(outbreak.startDate)}</div>
          <div><strong>Kết thúc:</strong> {formatDate(outbreak.endDate)}</div>
        </div>
        
        {outbreak.description && (
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
            <strong>Mô tả:</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.9em' }}>{outbreak.description}</p>
          </div>
        )}
      </div>
    );
  };

  // Hiển thị trạng thái khi không có dữ liệu
  if (!showLoading && (!outbreaks || outbreaks.length === 0)) {
    return (
      <div className="outbreak-map-container">
        <div className="map-empty-state">
          <i className="bi bi-map"></i>
          <h5>Không có dữ liệu vùng dịch</h5>
          <p>Không tìm thấy vùng dịch nào phù hợp với bộ lọc</p>
        </div>
      </div>
    );
  }

  return (
    <div className="outbreak-map-container">
      {/* Loading state */}
      {showLoading && (
        <div className="map-loading-overlay">
          <div className="map-loading">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3">Đang tải bản đồ vùng dịch...</p>
          </div>
        </div>
      )}
      
      {/* Map */}
      <div className={`outbreak-map-wrapper ${showLoading ? 'loading' : 'loaded'}`}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="outbreak-map"
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
            outbreakToZoom={selectedOutbreakId} 
            outbreakAreas={processedOutbreaks} 
          />

          {/* Hiển thị các vùng dịch từ props */}
          {!showLoading && processedOutbreaks.map((outbreak, index) => {
            if (!outbreak.coordinates || outbreak.coordinates.length === 0) {
              return null;
            }

            const isSelected = outbreak.id === selectedOutbreakId;

            return (
              <React.Fragment key={outbreak.id || index}>
                {/* Polygon cho vùng dịch */}
                <Polygon
                  positions={outbreak.coordinates}
                  pathOptions={{
                    fillColor: outbreak.fillColor,
                    color: isSelected ? '#000000' : outbreak.borderColor,
                    weight: isSelected ? 4 : 3,
                    opacity: isSelected ? 1 : 0.8,
                    fillOpacity: isSelected ? 0.4 : 0.3,
                    dashArray: isSelected ? '10, 10' : undefined
                  }}
                  eventHandlers={{
                    click: () => handleOutbreakClick(outbreak)
                  }}
                >
                  <Popup>
                    {renderOutbreakPopup(outbreak)}
                  </Popup>
                </Polygon>

                {/* Marker ở trung tâm vùng dịch */}
                <Marker
                  position={outbreak.center}
                  icon={outbreak.icon}
                  eventHandlers={{
                    click: () => handleOutbreakClick(outbreak)
                  }}
                >
                  <Popup>
                    {renderOutbreakPopup(outbreak)}
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
        
        
      </div>

      {/* Legend */}
      <div className="map-legend">
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color high"></span>
            <span>Cao</span>
          </div>
          <div className="legend-item">
            <span className="legend-color medium"></span>
            <span>Trung bình</span>
          </div>
          <div className="legend-item">
            <span className="legend-color low"></span>
            <span>Thấp</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Props mặc định
OutbreakMap.defaultProps = {
  outbreaks: [],
  onOutbreakClick: null,
  selectedOutbreakId: null,
  showLoading: false
};

export default OutbreakMap;