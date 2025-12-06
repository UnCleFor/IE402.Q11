import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import { useEffect, useState } from "react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix cho icon marker trong React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function MapView() {
  const [locations, setLocations] = useState([]);
  const [outbreakAreas, setOutbreakAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tạo các icon tùy chỉnh cho từng loại đối tượng
  const customIcons = {
    pharmacy: new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      shadowSize: [41, 41]
    }),
    
    medical_facility: new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      shadowSize: [41, 41]
    }),
    
    default: new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      shadowSize: [41, 41]
    })
  };

  // Hàm lấy icon dựa trên loại đối tượng
  const getIconByType = (type) => {
    return customIcons[type] || customIcons.default;
  };

  // Hàm lấy màu sắc cho outbreak area dựa trên severity level
  const getColorBySeverity = (severity) => {
    switch(severity) {
      case 'high': return '#ff0000';
      case 'medium': return '#ff9900';
      case 'low': return '#ffff00';
      default: return '#cccccc';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Gọi song song 4 API
        const [locationsRes, pharmaciesRes, medicalFacilitiesRes, outbreakAreasRes] = await Promise.all([
          fetch("http://localhost:3001/api/locations/"),
          fetch("http://localhost:3001/api/pharmacies/"),
          fetch("http://localhost:3001/api/medical-facilities/"),
          fetch("http://localhost:3001/api/outbreak-areas/")
        ]);

        // Kiểm tra response
if (!locationsRes.ok || !pharmaciesRes.ok || !medicalFacilitiesRes.ok || !outbreakAreasRes.ok) {
          throw new Error('Có lỗi khi tải dữ liệu từ API');
        }

        const locationsData = await locationsRes.json();
        const pharmaciesData = await pharmaciesRes.json();
        const medicalFacilitiesData = await medicalFacilitiesRes.json();
        const outbreakAreasResponse = await outbreakAreasRes.json();

        console.log('Outbreak areas response:', outbreakAreasResponse); // Debug log

        // Xử lý outbreak areas data - kiểm tra định dạng
        let outbreakAreasData = [];
        
        if (Array.isArray(outbreakAreasResponse)) {
          // Nếu response là mảng
          outbreakAreasData = outbreakAreasResponse;
        } else if (outbreakAreasResponse && typeof outbreakAreasResponse === 'object') {
          // Nếu response là object, kiểm tra các trường có thể chứa mảng
          if (outbreakAreasResponse.data && Array.isArray(outbreakAreasResponse.data)) {
            outbreakAreasData = outbreakAreasResponse.data;
          } else if (outbreakAreasResponse.results && Array.isArray(outbreakAreasResponse.results)) {
            outbreakAreasData = outbreakAreasResponse.results;
          } else if (outbreakAreasResponse.outbreakAreas && Array.isArray(outbreakAreasResponse.outbreakAreas)) {
            outbreakAreasData = outbreakAreasResponse.outbreakAreas;
          } else {
            // Nếu không tìm thấy mảng, thử lấy tất cả values
            const values = Object.values(outbreakAreasResponse);
            outbreakAreasData = values.filter(item => Array.isArray(item)).flat();
          }
        }

        console.log('Processed outbreak areas data:', outbreakAreasData); // Debug log

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

        // Xử lý dữ liệu outbreak areas
        const processedOutbreakAreas = outbreakAreasData.map(area => {
          // Chuyển đổi dữ liệu geometry
          let coordinates = [];
          
          if (area.area_geom && area.area_geom.coordinates) {
            // area_geom.coordinates là một mảng các mảng các điểm
            // Đối với Polygon, chúng ta cần lấy ring đầu tiên
            const polygonCoordinates = area.area_geom.coordinates[0];
            
            // Chuyển đổi từ [long, lat] sang [lat, long] cho Leaflet
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
        setOutbreakAreas(processedOutbreakAreas);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Hàm render nội dung popup tùy theo loại
  const renderPopupContent = (point) => {
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
        <strong>{getTitle()}</strong><br />
        <hr style={{ margin: '5px 0' }} />
        
        <div><strong>Loại đối tượng:</strong> {point.object_type || 'Không xác định'}</div>
{point.type === 'pharmacy' && point.details && (
          <>
            <div><strong>Tên nhà thuốc:</strong> {point.details.pharmacy_name || 'Không có tên'}</div>
            {point.details.phone && <div><strong>Điện thoại:</strong> {point.details.phone}</div>}
            {point.details.opening_hours && <div><strong>Giờ mở cửa:</strong> {point.details.opening_hours}</div>}
          </>
        )}
        
        {point.type === 'medical_facility' && point.details && (
          <>
            <div><strong>Tên cơ sở:</strong> {point.details.facility_name || 'Không có tên'}</div>
            {point.details.phone && <div><strong>Điện thoại:</strong> {point.details.phone}</div>}
            {point.details.emergency_services !== undefined && 
              <div><strong>Cấp cứu:</strong> {point.details.emergency_services ? 'Có' : 'Không'}</div>}
          </>
        )}
        
        {point.address && <div><strong>Địa chỉ:</strong> {point.address}</div>}
      </div>
    );
  };

  // Hàm render popup cho outbreak area
  const renderOutbreakPopup = (area) => {
    const getSeverityText = (severity) => {
      switch(severity) {
        case 'high': return 'Cao';
        case 'medium': return 'Trung bình';
        case 'low': return 'Thấp';
        default: return 'Không xác định';
      }
    };

    return (
      <div>
        <strong>⚠️ VÙNG DỊCH BỆNH</strong><br />
        <hr style={{ margin: '5px 0' }} />
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
      <div style={{ 
        height: "600px", 
        width: "100%", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        backgroundColor: "#f5f5f5"
      }}>
        <div>Đang tải dữ liệu bản đồ...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height: "600px", 
        width: "100%", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        backgroundColor: "#f5f5f5"
      }}>
        <div style={{ color: "red" }}>Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Legend cho bản đồ */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: 1000,
        fontSize: '14px',
        maxWidth: '200px'
      }}>
        <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>Chú thích:</div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
          <div style={{
            width: '15px',
            height: '15px',
            backgroundColor: '#28a745',
            marginRight: '5px',
            borderRadius: '50%'
          }}></div>
          <span>Nhà thuốc</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
          <div style={{
            width: '15px',
            height: '15px',
            backgroundColor: '#dc3545',
            marginRight: '5px',
            borderRadius: '50%'
          }}></div>
          <span>Cơ sở y tế</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
          <div style={{
            width: '15px',
            height: '15px',
            backgroundColor: '#007bff',
            marginRight: '5px',
            borderRadius: '50%'
          }}></div>
          <span>Địa điểm khác</span>
        </div>
        <hr style={{ margin: '5px 0' }} />
        <div style={{ marginBottom: '3px', fontWeight: 'bold' }}>Vùng dịch:</div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
          <div style={{
            width: '15px',
            height: '15px',
            backgroundColor: '#ff0000',
            marginRight: '5px'
          }}></div>
          <span>Mức độ cao</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
          <div style={{
            width: '15px',
            height: '15px',
            backgroundColor: '#ff9900',
            marginRight: '5px'
          }}></div>
          <span>Mức độ trung bình</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
          <div style={{
            width: '15px',
            height: '15px',
            backgroundColor: '#ffff00',
            marginRight: '5px'
          }}></div>
          <span>Mức độ thấp</span>
        </div>
      </div>

      <MapContainer
        center={[10.762622, 106.660172]}
        zoom={13}
        style={{ height: "600px", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Layer outbreak areas - NẰM DƯỚI layer location */}
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

        {/* Layer locations - NẰM TRÊN layer outbreak areas */}
        {Array.isArray(locations) && locations.map((point) => {
          if (!point.coordinates || !point.coordinates.coordinates) {
            return null;
          }

          const [longitude, latitude] = point.coordinates.coordinates;
          
          return (
            <Marker
              key={`${point.type}_${point.location_id}`}
              position={[latitude, longitude]}
              icon={getIconByType(point.type)}
            >
              <Popup>
                {renderPopupContent(point)}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}