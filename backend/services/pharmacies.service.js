const Pharmacy = require("../models/pharmacy.model");
const { Op } = require("sequelize");
const Location = require("../models/location.model");
const {
  buildSearchConditions,
  addFilters,
  getCombinedDataWithLocations,
  filterAndSortByDistance,
  calculateHaversineDistance
} = require("../utils/search.utils");

module.exports = {
  async createPharmacy(data) {
    return await Pharmacy.create(data);
  },

  async getAllPharmacies() {
    return await Pharmacy.findAll();
  },

  async getPharmacyById(id) {
    return await Pharmacy.findByPk(id);
  },

  async updatePharmacy(id, data) {
    const pharmacy = await Pharmacy.findByPk(id);
    if (!pharmacy) return null;
    await pharmacy.update(data);
    return pharmacy;
  },

  async deletePharmacy(id) {
    const pharmacy = await Pharmacy.findByPk(id);
    if (!pharmacy) return null;

    const locationId = pharmacy.pharmacy_point_id;

    await Pharmacy.destroy({
      where: { pharmacy_id: id }
    });

    if (locationId) {
      await Location.destroy({
        where: { location_id: locationId }
      });
    }

    return true;
  },

  async search(queryParams) {
    try {
      const {
        q,
        province_id,
        address,
        status = "active",
        lat,
        lng,
        radius = 5000,
        limit = 50,
        page = 1
      } = queryParams;

      // Xây dựng điều kiện tìm kiếm
      const fieldsToSearch = ['pharmacy_name', 'address'];
      let whereConditions = buildSearchConditions({ q, status }, fieldsToSearch);
      
      // Thêm bộ lọc (pharmacy không có type_id và phone trong model của bạn)
      if (province_id) whereConditions.province_id = province_id;
      if (address) whereConditions.address = { [Op.iLike]: `%${address}%` };

      // Tính offset
      const offset = (page - 1) * limit;

      // Lấy danh sách pharmacies
      const pharmacies = await Pharmacy.findAll({
        where: whereConditions,
        limit: parseInt(limit),
        offset: offset,
        order: [['pharmacy_name', 'ASC']]
      });

      // Kết hợp với location data
      let combinedResults = await getCombinedDataWithLocations(
        pharmacies,
        'pharmacy_point_id'
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
      console.error('Error in PharmacyService.search:', error);
      throw error;
    }
  },

  // Tìm pharmacies gần nhất
  async findNearby(queryParams) {
    try {
      const {
        lat,
        lng,
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
      if (province_id) whereConditions.province_id = province_id;

      // Lấy tất cả pharmacies active
      const pharmacies = await Pharmacy.findAll({
        where: whereConditions,
        limit: 100 // Giới hạn để tối ưu
      });

      if (!pharmacies || pharmacies.length === 0) {
        return [];
      }

      // Kết hợp với location data
      let combinedResults = await getCombinedDataWithLocations(
        pharmacies,
        'pharmacy_point_id'
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
      console.error('Error in PharmacyService.findNearby:', error);
      throw error;
    }
  },

  // Tìm kiếm nâng cao (POST method)
  async advancedSearch(filters) {
    try {
      const {
        pharmacy_name,
        address,
        province_id,
        status = "active",
        lat,
        lng,
        minDistance,
        maxDistance,
        sortBy = 'pharmacy_name',
        sortOrder = 'ASC',
        limit = 50
      } = filters;

      const whereConditions = { status };

      // Thêm các điều kiện filter
      if (pharmacy_name) {
        whereConditions.pharmacy_name = { [Op.iLike]: `%${pharmacy_name}%` };
      }
      if (address) {
        whereConditions.address = { [Op.iLike]: `%${address}%` };
      }
      if (province_id) {
        whereConditions.province_id = province_id;
      }

      // Lấy danh sách pharmacies
      const pharmacies = await Pharmacy.findAll({
        where: whereConditions,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit)
      });

      // Kết hợp với location data
      let results = await getCombinedDataWithLocations(
        pharmacies,
        'pharmacy_point_id'
      );

      // Tính khoảng cách nếu có tọa độ
      if (lat && lng) {
        results = results.map(item => {
          if (!item.location || !item.location.coordinates) {
            return { ...item, distance: null };
          }

          let pharmacyLat, pharmacyLng;
          const coordinates = item.location.coordinates;

          if (coordinates && coordinates.coordinates) {
            [pharmacyLng, pharmacyLat] = coordinates.coordinates;
          } else if (Array.isArray(coordinates)) {
            [pharmacyLng, pharmacyLat] = coordinates;
          } else {
            return { ...item, distance: null };
          }

          const distance = calculateHaversineDistance(
            parseFloat(lat), parseFloat(lng),
            pharmacyLat, pharmacyLng
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
      console.error('Error in PharmacyService.advancedSearch:', error);
      throw error;
    }
  },

  // Lấy pharmacy theo ID với location
  async getByIdWithLocation(id) {
    try {
      const pharmacy = await Pharmacy.findByPk(id);
      if (!pharmacy) return null;

      const combinedResults = await getCombinedDataWithLocations(
        [pharmacy],
        'pharmacy_point_id'
      );

      return combinedResults[0] || null;
    } catch (error) {
      console.error('Error in PharmacyService.getByIdWithLocation:', error);
      throw error;
    }
  }
};