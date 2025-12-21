import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPicker.css';

// Fix cho icon marker trong React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component chọn điểm
const PointPicker = ({ onPointSelect, selectedPoint, isSelecting }) => {
  const map = useMapEvents({
    click: (e) => {
      if (!isSelecting) return;
      
      const { lat, lng } = e.latlng;
      const point = { lat, lng };
      
      // Gọi callback với điểm đã chọn
      onPointSelect(point);
      
      // Tạo marker cho điểm đã chọn
      const marker = L.marker([lat, lng], {
        icon: new L.DivIcon({
          className: 'point-marker',
          iconSize: [12, 12]
        })
      }).addTo(map);
      
      marker.bindTooltip(`Điểm đã chọn: ${lat.toFixed(6)}, ${lng.toFixed(6)}`, {
        permanent: true,
        direction: 'top'
      });

      // Xóa marker cũ nếu có
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker && layer !== marker) {
          map.removeLayer(layer);
        }
      });
      
      // Zoom vào điểm đã chọn
      map.setView([lat, lng], 16);
    }
  });

  // Hiển thị marker nếu có selectedPoint
  useEffect(() => {
    if (!selectedPoint || isSelecting) return;
      const { lat, lng } = selectedPoint;
      
      // Xóa tất cả markers cũ
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });
      
      // Tạo marker mới
      const marker = L.marker([lat, lng], {
        icon: new L.DivIcon({
          className: 'point-marker',
          iconSize: [12, 12]
        })
      }).addTo(map);
      
      marker.bindTooltip(`Điểm đã chọn: ${lat.toFixed(6)}, ${lng.toFixed(6)}`, {
        permanent: true,
        direction: 'top'
      });
      
      // Zoom vào điểm
      map.setView([lat, lng], 16);

  }, [selectedPoint, map, isSelecting]);

  return null;
};

// Component chính
const MapPicker = ({ 
  onLocationSelect, 
  initialPoint, 
  height = "400px",
  showClearButton = true 
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(initialPoint);
  const mapRef = useRef();

  // Khởi tạo điểm nếu có initialPoint
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!initialPoint) return;
    if (isInitializedRef.current) return;

    console.log("Init point:", initialPoint);
    setSelectedPoint(initialPoint);
    isInitializedRef.current = true;
  }, [initialPoint]);

  const handlePointSelect = useCallback((point) => {    
    setSelectedPoint(point);

    // Gọi callback với dữ liệu điểm
    if (onLocationSelect) {
      onLocationSelect(point);
    }
    
    // Tự động thoát chế độ chọn sau khi chọn
    setIsSelecting(false);
  }, [onLocationSelect]);

  const handleStartSelecting = () => {
    setIsSelecting(true);
  };

  const handleEditSelecting = () => {
    setSelectedPoint(null); 
    setIsSelecting(true);
};

  const handleCancelSelecting = () => {
    setIsSelecting(false);
  };

  const handleClearSelection = () => {
    setSelectedPoint(null);
    setIsSelecting(false);
    
    // Xóa tất cả markers trên bản đồ
    if (mapRef.current) {
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapRef.current.removeLayer(layer);
        }
      });
    }
    
    // Reset về view mặc định
    if (mapRef.current) {
      mapRef.current.setView([10.762622, 106.660172], 14);
    }
  };

  // Định dạng tọa độ cho hiển thị
  const formatCoordinates = (point) => {
    if (!point) return null;
    
    return {
      lat: point.lat.toFixed(6),
      lng: point.lng.toFixed(6)
    };
  };

  return (
    <div className="map-picker-container">
      {/* Control Panel */}
      <div className="picker-controls">
        <div className="picker-buttons">
          {!isSelecting ? (
            !selectedPoint ? (
              <button 
                className="btn btn-sm btn-primary"
                onClick={handleStartSelecting}
              >
                <i className="bi bi-geo-alt me-1"></i>
                Chọn điểm
              </button>
            ) : (
              <>
                <button 
                  className="btn btn-sm btn-warning"
                  onClick={handleEditSelecting}
                >
                  <i className="bi bi-check-circle me-1"></i>
                  Chỉnh sửa
                </button>
              
                <button 
                  className="btn btn-sm btn-success"
                  disabled
                >
                  <i className="bi bi-check-circle me-1"></i>
                  Đã chọn
                </button>
              </>
            )
          ) : (
            <>
              <button 
                className="btn btn-sm btn-secondary"
                disabled
              >
                <i className="bi bi-cursor me-1"></i>
                Đang chọn điểm
              </button>
              
              <button 
                className="btn btn-sm btn-danger"
                onClick={handleCancelSelecting}
              >
                <i className="bi bi-x-circle me-1"></i>
                Hủy chọn
              </button>
            </>
          )}
          
          {showClearButton && (
            <button 
              className="btn btn-sm btn-outline-danger"
              onClick={handleClearSelection}
              disabled={!selectedPoint}
            >
              <i className="bi bi-trash me-1"></i>
              Xóa điểm
            </button>
          )}
        </div>

        <div className="picker-instructions">
          <div className="instruction-item">
            <span className="instruction-icon">🎯</span>
            <span>Nhấn "Chọn điểm" để bắt đầu</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">🖱️</span>
            <span>Click trên bản đồ để chọn điểm</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">⎋</span>
            <span>Hủy để thoát chế độ chọn</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">🗑️</span>
            <span>Xóa điểm để chọn lại</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="picker-map-container" style={{ height }}>
        <MapContainer
          center={[10.762622, 106.660172]}
          zoom={14}
          className="picker-map"
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Component chọn điểm */}
          <PointPicker 
            onPointSelect={handlePointSelect}
            selectedPoint={selectedPoint}
            isSelecting={isSelecting}
          />
        </MapContainer>
      </div>

      {/* Info Panel */}
      <div className="picker-info-panel">
        <div className="picker-header">
          <h6>Thông tin điểm đã chọn</h6>
          <span className={`badge ${selectedPoint ? 'bg-success' : 'bg-secondary'}`}>
            {selectedPoint ? 'Đã chọn' : 'Chưa chọn'}
          </span>
        </div>
        
        {!selectedPoint ? (
          <div className="no-selection">
            <i className="bi bi-geo-alt"></i>
            <p>Chưa chọn điểm nào</p>
            <small className="text-muted">Nhấn "Chọn điểm" để chọn một điểm trên bản đồ</small>
          </div>
        ) : (
          <div className="selection-info">
            <div className="coordinates-display">
              <small className="text-muted">Tọa độ:</small>
              <div className="coordinate-value">
                <code>
                  {formatCoordinates(selectedPoint).lat}, {formatCoordinates(selectedPoint).lng}
                </code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPicker;