const { Op } = require("sequelize");
const Location = require("../models/location.model");

// Hàm tính khoảng cách Haversine
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Bán kính Trái đất tính bằng km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Khoảng cách tính bằng km
}

// Hàm xây dựng điều kiện tìm kiếm cơ bản
function buildSearchConditions(queryParams, fieldsToSearch) {
  const { q, status = "active" } = queryParams;
  const whereConditions = { status };

  if (q && q.trim()) {
    const searchConditions = fieldsToSearch.map(field => ({
      [field]: { [Op.iLike]: `%${q}%` }
    }));
    
    whereConditions[Op.or] = searchConditions;
  }

  return whereConditions;
}

// Hàm thêm bộ lọc
function addFilters(whereConditions, filters) {
  const { type_id, province_id, phone, address } = filters;
  
  if (type_id) whereConditions.type_id = type_id;
  if (province_id) whereConditions.province_id = province_id;
  if (phone) whereConditions.phone = { [Op.iLike]: `%${phone}%` };
  if (address) whereConditions.address = { [Op.iLike]: `%${address}%` };
  
  return whereConditions;
}

// Hàm lấy và kết hợp dữ liệu location
async function getCombinedDataWithLocations(items, locationKey) {
  if (!items || items.length === 0) return [];

  // Lấy location_ids
  const locationIds = items
    .map(item => item[locationKey])
    .filter(id => id);

  if (locationIds.length === 0) return items.map(item => ({
    ...item.toJSON(),
    location: null
  }));

  // Lấy locations
  const locations = await Location.findAll({
    where: {
      location_id: {
        [Op.in]: locationIds
      }
    }
  });

  // Tạo map location_id -> location
  const locationMap = {};
  locations.forEach(loc => {
    locationMap[loc.location_id] = loc;
  });

  // Kết hợp dữ liệu
  return items.map(item => ({
    ...item.toJSON(),
    location: locationMap[item[locationKey]] || null
  }));
}

// Hàm tính và lọc theo khoảng cách
function filterAndSortByDistance(items, lat, lng, radius) {
  if (!lat || !lng || !items || items.length === 0) return items;

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const radiusInMeters = parseFloat(radius);

  const itemsWithDistance = items.map(item => {
    if (!item.location || !item.location.coordinates) {
      return { ...item, distance: null };
    }

    let facilityLat, facilityLng;
    const coordinates = item.location.coordinates;

    if (coordinates && coordinates.coordinates) {
      [facilityLng, facilityLat] = coordinates.coordinates;
    } else if (Array.isArray(coordinates)) {
      [facilityLng, facilityLat] = coordinates;
    } else {
      return { ...item, distance: null };
    }

    const distanceKm = calculateHaversineDistance(
      latitude, longitude,
      facilityLat, facilityLng
    );
    const distanceMeters = distanceKm * 1000;

    return {
      ...item,
      distance: Math.round(distanceMeters)
    };
  });

  // Lọc theo bán kính
  const filtered = itemsWithDistance.filter(item => 
    item.distance !== null && item.distance <= radiusInMeters
  );

  // Sắp xếp theo khoảng cách
  filtered.sort((a, b) => a.distance - b.distance);

  return filtered;
}

module.exports = {
  calculateHaversineDistance,
  buildSearchConditions,
  addFilters,
  getCombinedDataWithLocations,
  filterAndSortByDistance
};