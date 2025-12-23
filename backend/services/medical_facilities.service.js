const MedicalFacility = require("../models/medical_facility.model");
const { Op } = require("sequelize");
const Location = require("../models/location.model");
const {
  buildSearchConditions,
  addFilters,
  getCombinedDataWithLocations,
  filterAndSortByDistance,
  calculateHaversineDistance
} = require("../utils/search.utils");

// Tạo cơ sở y tế mới
async function createFacility(data) {
  return await MedicalFacility.create(data);
}

// Lấy tất cả cơ sở y tế
async function getAllFacilities() {
  return await MedicalFacility.findAll();
}

// Lấy cơ sở y tế theo ID
async function getFacilityById(id) {
  return await MedicalFacility.findByPk(id);
}

// Cập nhật cơ sở y tế theo ID
async function updateFacility(id, data) {
  const facility = await MedicalFacility.findByPk(id);
  if (!facility) return null;
  return await facility.update(data);
}

// Xóa cơ sở y tế theo ID
async function deleteFacility(id) {
  const facility = await MedicalFacility.findByPk(id);
  if (!facility) return null;

  const locationId = facility.facility_point_id;

  await MedicalFacility.destroy({
    where: { facility_id: id }
  });

  console.log("Facility deleted");

  if (locationId) {
    await Location.destroy({
      where: { location_id: locationId }
    });
  }

  return true;
}

// Tìm kiếm cơ sở y tế
async function search(queryParams) {
  try {
    const {
      q,
      type_id,
      province_id,
      phone,
      address,
      status = "active",
      lat,
      lng,
      radius = 5000,
      limit = 50,
      page = 1
    } = queryParams;

    // Xây dựng điều kiện tìm kiếm
    const fieldsToSearch = ['facility_name', 'address', 'services', 'phone'];
    let whereConditions = buildSearchConditions({ q, status }, fieldsToSearch);


    // DEBUG: Thử tìm không có điều kiện trước
    try {
      const testResult = await MedicalFacility.findAll({
        limit: 1
      });
    } catch (testError) {
      console.error('Test findAll failed:', testError);
      throw testError;
    }

    // Thêm bộ lọc
    whereConditions = addFilters(whereConditions, {
      type_id,
      province_id,
      phone,
      address
    });

    // Tính offset
    const offset = (page - 1) * limit;

    // Lấy danh sách medical facilities
    const facilities = await MedicalFacility.findAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: offset,
      order: [['facility_name', 'ASC']]
    });

    // Kết hợp với location data
    let combinedResults = await getCombinedDataWithLocations(
      facilities,
      'facility_point_id'
    );

    // Lọc và sắp xếp theo khoảng cách nếu có tọa độ
    if (lat && lng) {
      combinedResults = filterAndSortByDistance(
        combinedResults,
        lat,
        lng,
        radius
      );
    }

    return combinedResults;

  } catch (error) {
    console.error('Error in MedicalFacilityService.search:', error);
    throw error;
  }
}

// Tìm cơ sở y tế gần nhất
async function findNearby(queryParams) {
  try {
    const {
      lat,
      lng,
      type_id,
      province_id,
      radius = 5000,
      limit = 10
    } = queryParams;

    // Validate required parameters
    if (!lat || !lng) {
      throw new Error('Missing required parameters: lat and lng');
    }

    // Điều kiện where
    const whereConditions = { status: "active" };
    if (type_id) whereConditions.type_id = type_id;
    if (province_id) whereConditions.province_id = province_id;

    // Lấy tất cả medical facilities active
    const facilities = await MedicalFacility.findAll({
      where: whereConditions,
      limit: 100 // Giới hạn để tối ưu
    });

    if (!facilities || facilities.length === 0) {
      return [];
    }

    // Kết hợp với location data
    let combinedResults = await getCombinedDataWithLocations(
      facilities,
      'facility_point_id'
    );

    // Lọc và sắp xếp theo khoảng cách
    combinedResults = filterAndSortByDistance(
      combinedResults,
      lat,
      lng,
      radius
    );

    // Giới hạn kết quả
    return combinedResults.slice(0, parseInt(limit));

  } catch (error) {
    console.error('Error in MedicalFacilityService.findNearby:', error);
    throw error;
  }
}

// Tìm kiếm cơ sở y tế nâng cao (POST method)
async function advancedSearch(filters) {
  try {
    const {
      facility_name,
      phone,
      address,
      type_id,
      province_id,
      services,
      status = "active",
      lat,
      lng,
      minDistance,
      maxDistance,
      sortBy = 'facility_name',
      sortOrder = 'ASC',
      limit = 50
    } = filters;

    const whereConditions = { status };

    // Thêm các điều kiện filter
    if (facility_name) {
      whereConditions.facility_name = { [Op.iLike]: `%${facility_name}%` };
    }
    if (phone) {
      whereConditions.phone = { [Op.iLike]: `%${phone}%` };
    }
    if (address) {
      whereConditions.address = { [Op.iLike]: `%${address}%` };
    }
    if (type_id) {
      whereConditions.type_id = type_id;
    }
    if (province_id) {
      whereConditions.province_id = province_id;
    }
    if (services) {
      whereConditions.services = { [Op.iLike]: `%${services}%` };
    }

    // Lấy danh sách medical facilities
    const facilities = await MedicalFacility.findAll({
      where: whereConditions,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit)
    });

    // Kết hợp với location data
    let results = await getCombinedDataWithLocations(
      facilities,
      'facility_point_id'
    );

    // Tính khoảng cách nếu có tọa độ
    if (lat && lng) {
      results = results.map(item => {
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

        const distance = calculateHaversineDistance(
          parseFloat(lat), parseFloat(lng),
          facilityLat, facilityLng
        ) * 1000; // Chuyển sang mét

        return {
          ...item,
          distance: Math.round(distance)
        };
      });

      // Lọc theo khoảng cách nếu có
      if (minDistance !== undefined || maxDistance !== undefined) {
        results = results.filter(item => {
          if (item.distance === null) return false;

          const distance = item.distance;
          const passMin = minDistance === undefined || distance >= minDistance;
          const passMax = maxDistance === undefined || distance <= maxDistance;

          return passMin && passMax;
        });
      }

      // Sắp xếp theo khoảng cách nếu được yêu cầu
      if (sortBy === 'distance') {
        results.sort((a, b) => {
          const distA = a.distance || Infinity;
          const distB = b.distance || Infinity;
          return sortOrder === 'ASC' ? distA - distB : distB - distA;
        });
      }
    }

    return results;

  } catch (error) {
    console.error('Error in MedicalFacilityService.advancedSearch:', error);
    throw error;
  }
}

// Lấy medical facility theo ID với location
async function getByIdWithLocation(id) {
  try {
    const facility = await MedicalFacility.findByPk(id);
    if (!facility) return null;

    const combinedResults = await getCombinedDataWithLocations(
      [facility],
      'facility_point_id'
    );

    return combinedResults[0] || null;
  } catch (error) {
    console.error('Error in MedicalFacilityService.getByIdWithLocation:', error);
    throw error;
  }
}

module.exports = {
  createFacility,
  getAllFacilities,
  getFacilityById,
  updateFacility,
  deleteFacility,
  search,
  findNearby,
  advancedSearch,
  getByIdWithLocation,
};