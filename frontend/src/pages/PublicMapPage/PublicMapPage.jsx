import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import './PublicMapPage.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapControls from "./MapControl/MapControl";
import SearchResultItem from "./SearchResultItem/SearchResultItem";
import NearestResultItem from "./NearestResultItem/NearestResultItem";

// Fix cho icon marker trong React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom hook để cập nhật center của map
function MapCenterUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function MapView() {
  const [locations, setLocations] = useState([]);
  const [outbreakAreas, setOutbreakAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [nearestResults, setNearestResults] = useState([]);
  const [activeResultTab, setActiveResultTab] = useState('search');
  const [nearestRoute, setNearestRoute] = useState(null);
  const [userLocation, setUserLocation] = useState([10.762622, 106.660172]);
  const [mapCenter, setMapCenter] = useState([10.762622, 106.660172]);
  const [showMapControls, setShowMapControls] = useState(false);
  const mapRef = useRef();

  // State cho filters
  const [filters, setFilters] = useState({
    type: 'all',
    emergency: false,
    openNow: false,
    minRating: 0
  });

  // Tạo các icon tùy chỉnh
  const customIcons = {
    pharmacy: new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    }),

    medical_facility: new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    }),

    nearest: new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
      iconSize: [35, 51],
      iconAnchor: [17, 51],
      popupAnchor: [1, -34],
      shadowSize: [51, 51]
    }),

    default: new L.Icon.Default()
  };

  // Hàm lấy icon theo type
  const getIconByType = (type) => {
    return customIcons[type] || customIcons.default;
  };

  // Hàm lấy màu cho outbreak area
  const getColorBySeverity = (severity) => {
    switch (severity) {
      case 'high': return '#ff0000';
      case 'medium': return '#ff9900';
      case 'low': return '#ffff00';
      default: return '#cccccc';
    }
  };

  // Lấy vị trí hiện tại của user
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.error("Lỗi lấy vị trí:", error);
          alert("Không thể lấy vị trí của bạn. Vui lòng kiểm tra quyền truy cập vị trí.");
        }
      );
    } else {
      alert("Trình duyệt của bạn không hỗ trợ lấy vị trí.");
    }
  };

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [locationsRes, pharmaciesRes, medicalFacilitiesRes, outbreakAreasRes] = await Promise.all([
          fetch("http://localhost:3001/api/locations/"),
          fetch("http://localhost:3001/api/pharmacies/"),
          fetch("http://localhost:3001/api/medical-facilities/"),
          fetch("http://localhost:3001/api/outbreak-areas/")
        ]);

        if (!locationsRes.ok || !pharmaciesRes.ok || !medicalFacilitiesRes.ok || !outbreakAreasRes.ok) {
          throw new Error('Có lỗi khi tải dữ liệu từ API');
        }

        const locationsData = await locationsRes.json();
        const pharmaciesData = await pharmaciesRes.json();
        const medicalFacilitiesData = await medicalFacilitiesRes.json();
        const outbreakAreasResponse = await outbreakAreasRes.json();

        // Xử lý outbreak areas
        let outbreakAreasData = [];
        if (Array.isArray(outbreakAreasResponse)) {
          outbreakAreasData = outbreakAreasResponse;
        } else if (outbreakAreasResponse && typeof outbreakAreasResponse === 'object') {
          if (outbreakAreasResponse.data && Array.isArray(outbreakAreasResponse.data)) {
            outbreakAreasData = outbreakAreasResponse.data;
          } else if (outbreakAreasResponse.results && Array.isArray(outbreakAreasResponse.results)) {
            outbreakAreasData = outbreakAreasResponse.results;
          } else if (outbreakAreasResponse.outbreakAreas && Array.isArray(outbreakAreasResponse.outbreakAreas)) {
            outbreakAreasData = outbreakAreasResponse.outbreakAreas;
          }
        }

        // Tạo map để truy xuất nhanh location theo ID
        const locationMap = {};
        if (Array.isArray(locationsData)) {
          locationsData.forEach(location => {
            locationMap[location.location_id] = location;
          });
        }

        // Kết hợp dữ liệu locations
        const combinedData = [];

        // Thêm pharmacies
        if (Array.isArray(pharmaciesData)) {
          pharmaciesData.forEach(pharmacy => {
            const location = locationMap[pharmacy.pharmacy_point_id];
            if (location && location.coordinates) {
              const combinedPoint = {
                ...location,
                ...pharmacy,
                object_type: location.object_type || 'Pharmacy',
                type: 'pharmacy',
                details: pharmacy
              };
              combinedData.push(combinedPoint);
            }
          });
        }

        // Thêm medical facilities
        if (Array.isArray(medicalFacilitiesData)) {
          medicalFacilitiesData.forEach(facility => {
            const location = locationMap[facility.facility_point_id];
            if (location && location.coordinates) {
              const combinedPoint = {
                ...location,
                ...facility,
                object_type: location.object_type || 'Medical Facility',
                type: 'medical_facility',
                details: facility
              };
              combinedData.push(combinedPoint);
            }
          });
        }

        // Thêm các location khác
        if (Array.isArray(locationsData)) {
          locationsData.forEach(location => {
            const isPharmacy = Array.isArray(pharmaciesData) &&
              pharmaciesData.some(p => p.pharmacy_point_id === location.location_id);
            const isMedicalFacility = Array.isArray(medicalFacilitiesData) &&
              medicalFacilitiesData.some(m => m.facility_point_id === location.location_id);

            if (!isPharmacy && !isMedicalFacility && location.coordinates) {
              combinedData.push({
                ...location,
                type: 'other',
                object_type: location.object_type || 'Other'
              });
            }
          });
        }

        // Xử lý outbreak areas
        const processedOutbreakAreas = outbreakAreasData.map(area => {
          let coordinates = [];
          if (area.area_geom && area.area_geom.coordinates) {
            const polygonCoordinates = area.area_geom.coordinates[0];
            coordinates = polygonCoordinates.map(coord => [coord[1], coord[0]]);
          }

          return {
            ...area,
            processed_coordinates: coordinates,
            fillColor: getColorBySeverity(area.severity_level),
            borderColor: getColorBySeverity(area.severity_level)
          };
        });

        setLocations(combinedData);
        setFilteredLocations(combinedData);
        setOutbreakAreas(processedOutbreakAreas);

      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Hàm tìm kiếm
  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setFilteredLocations(locations);
      return;
    }

    try {
      const results = [];

      // Tìm kiếm pharmacies
      try {
        const response = await fetch(
          `http://localhost:3001/api/pharmacies/search?q=${encodeURIComponent(searchTerm)}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const pharmacyResults = data.data.map(convertPharmacyToMapFormat).filter(item => item);
            results.push(...pharmacyResults);
          }
        }
      } catch (error) {
        console.error('❌ Pharmacy search error:', error);
      }

      // Tìm kiếm medical facilities
      try {
        const response = await fetch(
          `http://localhost:3001/api/medical-facilities/search?q=${encodeURIComponent(searchTerm)}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const facilityResults = data.data.map(convertMedicalFacilityToMapFormat).filter(item => item);
            results.push(...facilityResults);
          }
        }
      } catch (error) {
        console.error('❌ Medical facility search error:', error);
      }

      // Lọc kết quả có tọa độ
      const validResults = results.filter(item =>
        item && item.coordinates && item.coordinates.coordinates
      );

      setSearchResults(validResults);
      setFilteredLocations([...locations, ...validResults]);

      // Zoom đến kết quả đầu tiên
      if (validResults.length > 0) {
        const firstResult = validResults[0];
        const [long, lat] = firstResult.coordinates.coordinates;
        setMapCenter([lat, long]);
      } else {
        alert(`Không tìm thấy kết quả nào cho "${searchTerm}"`);
      }

    } catch (error) {
      console.error("❌ Lỗi tìm kiếm:", error);
      // Fallback: tìm trong data hiện có
      const filtered = locations.filter(location => {
        const name = location.name ||
          location.details?.pharmacy_name ||
          location.details?.facility_name ||
          '';
        const address = location.address || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          address.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setSearchResults(filtered);
      setFilteredLocations([...locations, ...filtered]);
    }
  };

  // Hàm chuyển đổi pharmacy data
  const convertPharmacyToMapFormat = (pharmacy) => {
    if (!pharmacy) return null;

    // Xử lý coordinates từ location
    let coordinates = null;
    if (pharmacy.location && pharmacy.location.coordinates) {
      if (pharmacy.location.coordinates.coordinates) {
        coordinates = {
          type: "Point",
          coordinates: pharmacy.location.coordinates.coordinates
        };
      } else if (Array.isArray(pharmacy.location.coordinates)) {
        coordinates = {
          type: "Point",
          coordinates: pharmacy.location.coordinates
        };
      }
    }

    return {
      id: pharmacy.pharmacy_id || pharmacy.id,
      location_id: pharmacy.pharmacy_point_id,
      name: pharmacy.pharmacy_name,
      type: 'pharmacy',
      object_type: 'Pharmacy',
      address: pharmacy.address,
      phone: pharmacy.phone,
      coordinates: coordinates,
      distance: pharmacy.distance,
      details: {
        pharmacy_name: pharmacy.pharmacy_name,
        phone: pharmacy.phone,
        address: pharmacy.address,
        province_id: pharmacy.province_id
      },
      isSearchResult: true
    };
  };

  // Hàm chuyển đổi medical facility data
  const convertMedicalFacilityToMapFormat = (facility) => {
    if (!facility) return null;

    // Xử lý coordinates từ location
    let coordinates = null;
    if (facility.location && facility.location.coordinates) {
      if (facility.location.coordinates.coordinates) {
        coordinates = {
          type: "Point",
          coordinates: facility.location.coordinates.coordinates
        };
      } else if (Array.isArray(facility.location.coordinates)) {
        coordinates = {
          type: "Point",
          coordinates: facility.location.coordinates
        };
      }
    }

    return {
      id: facility.facility_id || facility.id,
      location_id: facility.facility_point_id,
      name: facility.facility_name,
      type: 'medical_facility',
      object_type: 'Medical Facility',
      address: facility.address,
      phone: facility.phone,
      coordinates: coordinates,
      distance: facility.distance,
      details: {
        facility_name: facility.facility_name,
        phone: facility.phone,
        address: facility.address,
        services: facility.services,
        province_id: facility.province_id,
        type_id: facility.type_id
      },
      isSearchResult: true
    };
  };

  // Hàm lọc
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);

    let filtered = [...locations];

    // Lọc theo type
    if (newFilters.type !== 'all') {
      filtered = filtered.filter(loc => loc.type === newFilters.type);
    }

    // Thêm các bộ lọc khác nếu cần
    // (dựa trên cấu trúc data thực tế của bạn)

    setFilteredLocations(filtered);
  };

  // Hàm tìm kiếm gần nhất
  const handleFindNearest = async (type, radius = 5000) => {
    if (!userLocation) {
      alert("Vui lòng cho phép truy cập vị trí để sử dụng tính năng này");
      getUserLocation();
      return;
    }

    try {
      const [lat, lng] = userLocation;
      let apiUrl = '';
      let converter = null;

      if (type === 'pharmacy') {
        apiUrl = `http://localhost:3001/api/pharmacies/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;
        converter = convertPharmacyToMapFormat;
      } else if (type === 'medical_facility') {
        apiUrl = `http://localhost:3001/api/medical-facilities/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;
        converter = convertMedicalFacilityToMapFormat;
      }

      const response = await fetch(apiUrl);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const results = data.data.map(converter).filter(item => item);
          setNearestResults(results);
          setActiveResultTab('nearest');

          // Xóa route cũ
          if (nearestRoute) {
            nearestRoute.remove();
            setNearestRoute(null);
          }

          // Zoom đến kết quả đầu tiên
          if (results.length > 0) {
            const nearest = results[0];
            if (nearest.coordinates && nearest.coordinates.coordinates) {
              const [nearestLng, nearestLat] = nearest.coordinates.coordinates;
              setMapCenter([nearestLat, nearestLng]);
            }
          }

          alert(`Tìm thấy ${results.length} địa điểm gần nhất`);
        }
      }
    } catch (error) {
      console.error("❌ Lỗi tìm kiếm gần nhất:", error);
      alert("Có lỗi khi tìm kiếm địa điểm gần nhất");
    }
  };

  // Hàm xử lý click vào kết quả
  const handleResultClick = (result) => {
    if (result.coordinates && result.coordinates.coordinates) {
      const [long, lat] = result.coordinates.coordinates;

      if (mapRef.current) {
        mapRef.current.setView([lat, long], 16);
      }

      // Vẽ đường đi đến điểm đã chọn
      // drawRouteToNearest(result);
    }
  };

  // Hàm vẽ đường đi (Đáng phát triển)
  // const drawRouteToNearest = (destination) => {
  //   if (!currentLocation || !mapRef.current || !destination.coordinates) return;

  //   const [destLng, destLat] = destination.coordinates.coordinates;

  //   const route = L.polyline([
  //     currentLocation,
  //     [destLat, destLng]
  //   ], {
  //     color: '#007bff',
  //     weight: 4,
  //     opacity: 0.7,
  //     dashArray: '10, 10'
  //   });

  //   route.addTo(mapRef.current);
  //   setNearestRoute(route);
  // };

  // Hàm render popup cho location
  const renderPopupContent = (point) => {
    const isSearchResult = point.isSearchResult;
    const isNearestResult = nearestResults.some(
      nearest => nearest.id === point.id || nearest.location_id === point.location_id
    );

    const getTitle = () => {
      if (point.type === 'pharmacy') {
        return `💊 ${point.object_type || 'NHÀ THUỐC'}`;
      } else if (point.type === 'medical_facility') {
        return `🏥 ${point.object_type || 'CƠ SỞ Y TẾ'}`;
      } else {
        return `📍 ${point.object_type || 'ĐỊA ĐIỂM'}`;
      }
    };

    return (
      <div>
        {isNearestResult && (
          <div className="nearest-indicator">
            ⭐ <strong>GẦN NHẤT</strong>
          </div>
        )}

        {isSearchResult && !isNearestResult && (
          <div className="search-indicator">
            🔍 <strong>KẾT QUẢ TÌM KIẾM</strong>
          </div>
        )}

        <strong>{getTitle()}</strong><br />
        <hr className="popup-divider" />

        <div><strong>Tên:</strong> {point.name || point.details?.pharmacy_name || point.details?.facility_name || 'Không có tên'}</div>

        {point.type === 'pharmacy' && point.details && (
          <>
            {point.details.phone && <div><strong>Điện thoại:</strong> {point.details.phone}</div>}
            {point.details.opening_hours && <div><strong>Giờ mở cửa:</strong> {point.details.opening_hours}</div>}
          </>
        )}

        {point.type === 'medical_facility' && point.details && (
          <>
            {point.details.phone && <div><strong>Điện thoại:</strong> {point.details.phone}</div>}
            {point.details.services && <div><strong>Dịch vụ:</strong> {point.details.services}</div>}
          </>
        )}

        {point.address && <div><strong>Địa chỉ:</strong> {point.address}</div>}

        {point.distance && (
          <div><strong>Khoảng cách:</strong> {point.distance.toLocaleString()} mét</div>
        )}
      </div>
    );
  };

  // Hàm render popup cho outbreak area
  const renderOutbreakPopup = (area) => {
    const getSeverityText = (severity) => {
      switch (severity) {
        case 'high': return 'Cao';
        case 'medium': return 'Trung bình';
        case 'low': return 'Thấp';
        default: return 'Không xác định';
      }
    };

    return (
      <div>
        <strong>⚠️ VÙNG DỊCH BỆNH</strong><br />
        <hr className="popup-divider" />
        <div><strong>Tên vùng dịch:</strong> {area.outbreak_name}</div>
        <div><strong>ID bệnh:</strong> {area.disease_id}</div>
        <div><strong>Số ca bệnh:</strong> {area.disease_cases}</div>
        <div><strong>Mức độ nghiêm trọng:</strong> {getSeverityText(area.severity_level)}</div>
        <div><strong>Ngày bắt đầu:</strong> {new Date(area.start_date).toLocaleDateString('vi-VN')}</div>
        {area.end_date && (
          <div><strong>Ngày kết thúc:</strong> {new Date(area.end_date).toLocaleDateString('vi-VN')}</div>
        )}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div>Đang tải dữ liệu bản đồ...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div>Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className={`map-view-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Nút bật/tắt MapControls */}
      {!showMapControls && (
        <button
          className="toggle-controls-btn"
          onClick={() => setShowMapControls(true)}
          title="Hiện bộ điều khiển"
        >
          <i className="bi bi-chevron-down me-1"></i>
          Hiện điều khiển
        </button>
      )}

      {/* Map Controls Component */}
      {showMapControls && (
        <MapControls
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onFindNearest={handleFindNearest}
          onClose={() => setShowMapControls(false)}
          filters={filters}
        />
      )}

      {/* Nút lấy vị trí hiện tại */}
      <button
        className="current-location-btn"
        onClick={getUserLocation}
        title="Lấy vị trí hiện tại"
      >
        <i className="bi bi-geo-alt me-1"></i>
        Vị trí của tôi
      </button>

      {/* Legend */}
      <div className="legend-container">
        <div className="legend-title">Chú thích:</div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#28a745' }}></div>
          <span>Nhà thuốc</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#dc3545' }}></div>
          <span>Cơ sở y tế</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ffd700', width: '20px', height: '20px' }}></div>
          <span>Điểm gần nhất</span>
        </div>
        <hr className="legend-divider" />
        <div style={{ marginBottom: '3px', fontWeight: 'bold' }}>Vùng dịch:</div>
        <div className="legend-item">
          <div className="legend-color-outbreak" style={{ backgroundColor: '#ff0000' }}></div>
          <span>Mức độ cao</span>
        </div>
        <div className="legend-item">
          <div className="legend-color-outbreak" style={{ backgroundColor: '#ff9900' }}></div>
          <span>Mức độ trung bình</span>
        </div>
        <div className="legend-item">
          <div className="legend-color-outbreak" style={{ backgroundColor: '#ffff00' }}></div>
          <span>Mức độ thấp</span>
        </div>
      </div>

      {/* Nút fullscreen */}
      <button
        className="fullscreen-btn"
        onClick={() => setIsFullscreen(!isFullscreen)}
      >
        {isFullscreen ? (
          <>
            <i className="bi bi-fullscreen-exit"></i>
            Thoát full màn hình
          </>
        ) : (
          <>
            <i className="bi bi-fullscreen"></i>
            Mở full màn hình
          </>
        )}
      </button>

      <MapContainer
        center={mapCenter}
        zoom={13}
        ref={mapRef}
        className="leaflet-container"
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Cập nhật center */}
        <MapCenterUpdater center={mapCenter} />

        {/* Hiển thị vị trí hiện tại */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              className: 'current-location-marker',
              html: '<div class="current-location-marker"></div>',
              iconSize: [20, 20]
            })}
          >
            <Popup>Vị trí của bạn</Popup>
          </Marker>
        )}

        {/* Layer outbreak areas */}
        {Array.isArray(outbreakAreas) && outbreakAreas.map((area, index) => {
          if (!area.processed_coordinates || area.processed_coordinates.length === 0) {
            return null;
          }

          return (
            <Polygon
              key={`outbreak_${area.outbreak_id || index}`}
              positions={area.processed_coordinates}
              pathOptions={{
                fillColor: area.fillColor || '#cccccc',
                color: area.borderColor || '#cccccc',
                weight: 2,
                opacity: 0.6,
                fillOpacity: 0.2
              }}
            >
              <Popup>
                {renderOutbreakPopup(area)}
              </Popup>
            </Polygon>
          );
        })}

        {/* Layer locations đã lọc */}
        {Array.isArray(filteredLocations) && filteredLocations.map((point) => {
          if (!point.coordinates || !point.coordinates.coordinates) {
            return null;
          }

          const [longitude, latitude] = point.coordinates.coordinates;

          // Kiểm tra xem có phải là kết quả gần nhất không
          const isNearestResult = nearestResults.some(
            nearest => nearest.id === point.id || nearest.location_id === point.location_id
          );

          return (
            <Marker
              key={`${point.type}_${point.id || point.location_id}`}
              position={[latitude, longitude]}
              icon={isNearestResult ? customIcons.nearest : getIconByType(point.type)}
            >
              <Popup>
                {renderPopupContent(point)}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Panel hiển thị kết quả */}
      {(searchResults.length > 0 || nearestResults.length > 0) && (
        <div className="results-panel">
          {/* Tab selection */}
          <div className="results-tabs">
            <button
              className={`tab-button search ${activeResultTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveResultTab('search')}
            >
              🔍 Kết quả tìm kiếm ({searchResults.length})
            </button>
            <button
              className={`tab-button nearest ${activeResultTab === 'nearest' ? 'active' : ''}`}
              onClick={() => setActiveResultTab('nearest')}
            >
              📍 Gần nhất ({nearestResults.length})
            </button>
          </div>

          {/* Có thể chỉnh sửa kích thước */}
          <div className="results-panel-content">
            {/* Results list */}
            <div>
              {activeResultTab === 'search' ? (
                searchResults.length > 0 ? (
                  searchResults.slice(0, 10).map((result, index) => (
                    <SearchResultItem
                      key={index}
                      result={result}
                      onClick={() => handleResultClick(result)}
                    />
                  ))
                ) : (
                  <div className="no-results">
                    Không có kết quả tìm kiếm
                  </div>
                )
              ) : (
                nearestResults.length > 0 ? (
                  nearestResults.slice(0, 10).map((result, index) => (
                    <NearestResultItem
                      key={index}
                      result={result}
                      index={index}
                      onClick={() => handleResultClick(result)}
                    />
                  ))
                ) : (
                  <div className="no-results">
                    Không có kết quả gần nhất
                  </div>
                )
              )}
            </div>

            {/* Clear buttons */}
            <div className="clear-buttons">
              <button
                className="clear-button clear-search"
                onClick={() => {
                  if (activeResultTab === 'search') {
                    setSearchResults([]);
                    setFilteredLocations(locations);
                  } else {
                    setNearestResults([]);
                    if (nearestRoute) {
                      nearestRoute.remove();
                      setNearestRoute(null);
                    }
                  }
                }}
              >
                Xóa {activeResultTab === 'search' ? 'kết quả tìm kiếm' : 'kết quả gần nhất'}
              </button>

              <button
                className="clear-button clear-all"
                onClick={() => {
                  setSearchResults([]);
                  setNearestResults([]);
                  setFilteredLocations(locations);
                  if (nearestRoute) {
                    nearestRoute.remove();
                    setNearestRoute(null);
                  }
                }}
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}