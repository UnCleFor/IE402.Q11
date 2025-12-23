import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { MapContainer, TileLayer, Polygon, useMapEvents } from "react-leaflet";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PolygonDrawer.css';

// Cấu hình icon mặc định của Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component con để vẽ polygon
const DrawPolygon = forwardRef(({ onPolygonComplete, isDrawing, onCancelDrawing, existingPolygon }, ref) => {
  const [points, setPoints] = useState(existingPolygon || []);
  const [currentPolygon, setCurrentPolygon] = useState(existingPolygon && existingPolygon.length > 2 ? [...existingPolygon, existingPolygon[0]] : []);
  const markersRef = useRef([]);
  const [shouldComplete, setShouldComplete] = useState(false);

  // Khởi tạo điểm nếu có existingPolygon
  useEffect(() => {
    if (existingPolygon && existingPolygon.length > 0) {
      setPoints(existingPolygon);
      if (existingPolygon.length > 2) {
        setCurrentPolygon([...existingPolygon, existingPolygon[0]]);
      }
    }
  }, [existingPolygon]);

  // Hàm hoàn thành vẽ polygon
  const handleCompleteDrawing = useCallback(() => {
    if (points.length < 3) {
      alert('Cần ít nhất 3 điểm để tạo polygon!');
      return false;
    }
    const completedPolygon = [...points, points[0]];
    onPolygonComplete(completedPolygon);
    setShouldComplete(false);
    clearMarkers();
    return true;
  }, [points, onPolygonComplete]);

  // Tự động hoàn thành khi shouldComplete thay đổi
  useEffect(() => {
    if (isDrawing && points.length >= 3 && shouldComplete) {
      const success = handleCompleteDrawing();
      if (success) {
        if (onCancelDrawing) {
          onCancelDrawing();
        }
      }
    }
  }, [shouldComplete, points, isDrawing, handleCompleteDrawing, onCancelDrawing]);

  // Xử lý sự kiện bản đồ
  const map = useMapEvents({
    click: (e) => {
      if (!isDrawing) return;
      const { lat, lng } = e.latlng;
      const newPoints = [...points, [lat, lng]];
      setPoints(newPoints);
      if (newPoints.length > 2) {
        setCurrentPolygon([...newPoints, newPoints[0]]);
      }
    },
    keydown: (e) => {
      if (e.originalEvent.key === 'Escape' && isDrawing) {
        handleCancelDrawing();
      }

      if (e.originalEvent.key === 'Backspace' && isDrawing && points.length > 0) {
        const newPoints = points.slice(0, -1);
        setPoints(newPoints);
        if (markersRef.current.length > 0) {
          const lastMarker = markersRef.current.pop();
          if (lastMarker && map.hasLayer(lastMarker)) {
            map.removeLayer(lastMarker);
          }
        }
        if (newPoints.length > 2) {
          setCurrentPolygon([...newPoints, newPoints[0]]);
        } else {
          setCurrentPolygon([]);
        }
      }
      if (e.originalEvent.key === 'Enter' && isDrawing && points.length >= 3) {
        setShouldComplete(true);
      }
    }
  });

  // Hàm hủy vẽ polygon
  const handleCancelDrawing = useCallback(() => {
    if (existingPolygon && existingPolygon.length > 0) {
      setPoints(existingPolygon);
      if (existingPolygon.length > 2) {
        setCurrentPolygon([...existingPolygon, existingPolygon[0]]);
      }
    } else {
      setPoints([]);
      setCurrentPolygon([]);
    }

    setShouldComplete(false);
    clearMarkers();
  }, [existingPolygon]);

  // Hàm chỉnh sửa điểm
  const editPoint = useCallback((index, newPosition) => {
    const newPoints = [...points];
    newPoints[index] = newPosition;
    setPoints(newPoints);
    if (newPoints.length > 2) {
      setCurrentPolygon([...newPoints, newPoints[0]]);
    }
  }, [points]);

  // Hàm xóa điểm
  const deletePoint = useCallback((index) => {
    if (points.length <= 3) {
      alert('Polygon cần ít nhất 3 điểm!');
      return;
    }

    const newPoints = points.filter((_, i) => i !== index);
    setPoints(newPoints);

    if (newPoints.length > 2) {
      setCurrentPolygon([...newPoints, newPoints[0]]);
    } else {
      setCurrentPolygon([]);
    }
  }, [points]);

  // Hàm xóa tất cả markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => {
      if (marker && map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    });
    markersRef.current = [];
  }, [map]);

  // Expose methods qua ref
  useImperativeHandle(ref, () => ({
    completeDrawing: () => {
      setShouldComplete(true);
    },
    cancelDrawing: () => {
      handleCancelDrawing();
    },
    getPoints: () => {
      return points;
    },
    editPoint: editPoint,
    deletePoint: deletePoint,
    clearPoints: () => {
      setPoints([]);
      setCurrentPolygon([]);
      clearMarkers();
    },
    getPointCount: () => {
      return points.length;
    }
  }));

  // Hiệu ứng tạo markers khi points thay đổi
  useEffect(() => {
    if (!isDrawing) {
      clearMarkers();
      return;
    }

    // Tạo markers cho các điểm mới
    const createMarkers = () => {
      clearMarkers();

      points.forEach((point, index) => {
        const marker = L.marker(point).addTo(map);
        marker.bindTooltip(`Điểm ${index + 1}`, { permanent: true, direction: 'top' });

        // Thêm sự kiện click để chỉnh sửa điểm
        marker.on('click', (e) => {
          if (!isDrawing) return;

          // Hiển thị dialog hoặc cho phép kéo điểm
          const newLatLng = e.latlng;
          editPoint(index, [newLatLng.lat, newLatLng.lng]);
        });

        markersRef.current.push(marker);
      });
    };

    createMarkers();
    return () => {
      clearMarkers();
    };
  }, [points, map, isDrawing, clearMarkers, editPoint]);

  // Hiệu ứng reset khi isDrawing thay đổi
  useEffect(() => {
    if (!isDrawing && (!existingPolygon || existingPolygon.length === 0)) {
      setPoints([]);
      setCurrentPolygon([]);
      setShouldComplete(false);
      clearMarkers();
    }
  }, [isDrawing, clearMarkers, existingPolygon]);

  return (
    <>
      {/* Vẽ polygon tạm thời */}
      {currentPolygon.length > 0 && (
        <Polygon
          positions={currentPolygon}
          pathOptions={{
            fillColor: '#3388ff',
            color: '#3388ff',
            weight: 2,
            opacity: 0.7,
            fillOpacity: 0.2,
            dashArray: '5, 5'
          }}
        />
      )}
    </>
  );
});

// Component chính
const PolygonDrawer = ({ onPolygonComplete, initialPolygon, height = "400px" }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState(
    initialPolygon ? [...initialPolygon, initialPolygon[0]] : [] // Lưu với điểm đóng
  );
  const mapRef = useRef();
  const drawPolygonRef = useRef();

  // Khởi tạo polygon nếu có initialPolygon
  useEffect(() => {
    if (initialPolygon) {
      const hasClosingPoint = initialPolygon.length > 0 &&
        initialPolygon[0][0] === initialPolygon[initialPolygon.length - 1][0] &&
        initialPolygon[0][1] === initialPolygon[initialPolygon.length - 1][1];

      if (hasClosingPoint) {
        setCurrentPolygon(initialPolygon);
      } else {
        setCurrentPolygon([...initialPolygon, initialPolygon[0]]);
      }
    }
  }, [initialPolygon]);

  // Hàm xử lý khi hoàn thành vẽ polygon
  const handlePolygonComplete = useCallback((polygon) => {
    setCurrentPolygon(polygon);
    const polygonData = polygon.map(point => ({
      lat: point[0],
      lng: point[1]
    }));
    onPolygonComplete(polygonData);
    setIsDrawing(false);
  }, [onPolygonComplete]);

  // Các hàm điều khiển vẽ polygon
  const handleStartDrawing = () => {
    setIsDrawing(true);
  };

  // Hủy vẽ polygon
  const handleCancelDrawing = () => {
    if (drawPolygonRef.current) {
      drawPolygonRef.current.cancelDrawing();
    }
    setIsDrawing(false);
  };

  // Xóa tất cả polygon
  const handleClearAll = () => {
    if (drawPolygonRef.current) {
      drawPolygonRef.current.clearPoints();
    }
    setCurrentPolygon([]);
    setIsDrawing(false);
  };

  // Chỉnh sửa polygon hiện tại
  const handleEditPolygon = () => {
    if (currentPolygon.length > 0) {
      setIsDrawing(true);
    }
  };

  // Tính diện tích
  const calculateArea = useCallback((polygon) => {
    if (polygon.length < 4) return 0;
    // Sử dụng công thức Shoelace
    let area = 0;
    for (let i = 0; i < polygon.length - 1; i++) {
      const [x1, y1] = polygon[i];
      const [x2, y2] = polygon[i + 1];
      area += x1 * y2 - x2 * y1;
    }

    return Math.abs(area / 2).toFixed(2);
  }, []);

  // Chuyển đổi tọa độ cho hiển thị
  const formatCoordinates = useCallback((polygon) => {
    if (polygon.length === 0) return [];
    const displayPolygon = polygon.length > 0 &&
      polygon[0][0] === polygon[polygon.length - 1][0] &&
      polygon[0][1] === polygon[polygon.length - 1][1]
      ? polygon.slice(0, -1)
      : polygon;

    return displayPolygon.map(point => ({
      lat: point[0].toFixed(6),
      lng: point[1].toFixed(6)
    }));
  }, []);

  // Lấy polygon không có điểm đóng để truyền vào DrawPolygon
  const getPolygonWithoutClosingPoint = useCallback(() => {
    if (currentPolygon.length === 0) return [];

    const hasClosingPoint = currentPolygon.length > 0 &&
      currentPolygon[0][0] === currentPolygon[currentPolygon.length - 1][0] &&
      currentPolygon[0][1] === currentPolygon[currentPolygon.length - 1][1];

    if (hasClosingPoint) {
      return currentPolygon.slice(0, -1);
    }
    return currentPolygon;
  }, [currentPolygon]);

  // Lấy số điểm hiện tại
  const getCurrentPointCount = () => {
    if (drawPolygonRef.current) {
      return drawPolygonRef.current.getPointCount();
    }
    return 0;
  };

  return (
    <div className="polygon-drawer-container">
      {/* Control Panel */}
      <div className="drawer-controls">
        <div className="control-buttons">
          {!isDrawing ? (
            <>
              {currentPolygon.length === 0 ? (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleStartDrawing}
                >
                  <i className="bi bi-pencil me-1"></i>
                  Bắt đầu vẽ
                </button>
              ) : (
                <>
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={handleEditPolygon}
                  >
                    <i className="bi bi-pencil-square me-1"></i>
                    Chỉnh sửa
                  </button>

                  <button
                    className="btn btn-sm btn-success"
                    disabled
                  >
                    <i className="bi bi-check-circle me-1"></i>
                    Đã hoàn thành
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <button
                className="btn btn-sm btn-secondary"
                disabled
              >
                <i className="bi bi-record-circle me-1"></i>
                Đang vẽ ({getCurrentPointCount()} điểm)
              </button>

              <button
                className="btn btn-sm btn-danger"
                onClick={handleCancelDrawing}
              >
                <i className="bi bi-x-circle me-1"></i>
                Hủy vẽ
              </button>
            </>
          )}

          <button
            className="btn btn-sm btn-outline-danger"
            onClick={handleClearAll}
            disabled={currentPolygon.length === 0}
          >
            <i className="bi bi-trash me-1"></i>
            Xóa polygon
          </button>
        </div>

        <div className="drawer-instructions">
          <div className="instruction-item">
            <span className="instruction-icon">🖱️</span>
            <span>Click để thêm điểm</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">⏎</span>
            <span>Nhấn Enter để hoàn thành (cần ít nhất 3 điểm)</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">⌫</span>
            <span>Backspace để xóa điểm cuối</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">⎋</span>
            <span>ESC để hủy vẽ</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="drawer-map-container" style={{ height }}>
        <MapContainer
          center={[10.762622, 106.660172]}
          zoom={14}
          className="drawer-map"
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Component vẽ polygon với ref */}
          <DrawPolygon
            ref={drawPolygonRef}
            onPolygonComplete={handlePolygonComplete}
            isDrawing={isDrawing}
            onCancelDrawing={handleCancelDrawing}
            existingPolygon={getPolygonWithoutClosingPoint()}
          />

          {/* Hiển thị polygon đã hoàn thành (nếu có và không đang vẽ) */}
          {!isDrawing && currentPolygon.length > 0 && (
            <Polygon
              positions={currentPolygon}
              pathOptions={{
                fillColor: '#28a745',
                color: '#28a745',
                weight: 3,
                opacity: 0.8,
                fillOpacity: 0.3
              }}
              eventHandlers={{
                click: () => {
                  if (mapRef.current) {
                    const bounds = L.latLngBounds(currentPolygon);
                    mapRef.current.fitBounds(bounds);
                  }
                }
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Info Panel */}
      <div className="drawer-info-panel">
        <div className="info-header">
          <h6>Thông tin polygon</h6>
          <span className={`badge ${currentPolygon.length > 0 ? 'bg-success' : 'bg-secondary'}`}>
            {currentPolygon.length > 0 ? 'Đã vẽ' : 'Chưa vẽ'}
          </span>
        </div>

        {currentPolygon.length === 0 ? (
          <div className="no-polygons">
            <i className="bi bi-map"></i>
            <p>Chưa có polygon nào được vẽ</p>
            <small className="text-muted">Nhấn "Bắt đầu vẽ" để tạo polygon mới</small>
          </div>
        ) : (
          <div className="polygon-info">
            <div className="polygon-header">
              <span className="polygon-title">Polygon hiện tại</span>
              <span className="polygon-area">~{calculateArea(currentPolygon)} km²</span>
            </div>
            <div className="polygon-details">
              <div className="detail-item">
                <span className="detail-label">Trạng thái:</span>
                <span className={`detail-value ${isDrawing ? 'text-warning' : 'text-success'}`}>
                  {isDrawing ? 'Đang vẽ/chỉnh sửa' : 'Đã hoàn thành'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Số điểm:</span>
                <span className="detail-value">
                  {formatCoordinates(currentPolygon).length} điểm
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Định dạng:</span>
                <span className="detail-value">Polygon đóng</span>
              </div>
            </div>

            <div className="coordinates-preview">
              <small className="text-muted">Tọa độ các điểm:</small>
              <div className="coordinates-list">
                {formatCoordinates(currentPolygon).slice(0, 3).map((coord, idx) => (
                  <div key={idx} className="coordinate-item">
                    <code>{coord.lat}, {coord.lng}</code>
                  </div>
                ))}
                {formatCoordinates(currentPolygon).length > 3 && (
                  <div className="coordinate-item">
                    <small>... và {formatCoordinates(currentPolygon).length - 3} điểm khác</small>
                  </div>
                )}
                <div className="coordinate-item">
                  <small className="text-muted">
                    <i>Điểm #{formatCoordinates(currentPolygon).length + 1} trùng với điểm #1 (đóng polygon)</i>
                  </small>
                </div>
              </div>
            </div>

            <div className="polygon-actions mt-3">
              {!isDrawing ? (
                <button
                  className="btn btn-sm btn-outline-warning w-100"
                  onClick={handleEditPolygon}
                >
                  <i className="bi bi-pencil-square me-1"></i>
                  Chỉnh sửa polygon này
                </button>
              ) : (
                <div className="alert alert-warning small mb-0">
                  <i className="bi bi-info-circle me-1"></i>
                  Đang ở chế độ chỉnh sửa.
                  <div><small>Click vào markers để di chuyển điểm, nhấn Enter để hoàn thành.</small></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolygonDrawer;