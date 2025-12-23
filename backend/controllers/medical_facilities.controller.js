const facilityService = require("../services/medical_facilities.service");

module.exports = {
  // Tạo mới cơ sở y tế
  async create(req, res) {
    try {
      const body = req.body;
      const payload = {
      facility_name: body.facility_name, 
      type_id: body.type_id,
      address: body.address,
      phone: body.phone,
      province_id: body.province_id,
      services: body.services,
      facility_point_id: body.facility_point_id,
      creator_id: req.user.user_id
    };


      const facility = await facilityService.createFacility(payload);
      res.status(201).json({
        message: "Tạo cơ sở y tế thành công",
        facility
      });
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  },

  // Lấy tất cả cơ sở y tế
  async findAll(req, res) {
    try {
      const facilities = await facilityService.getAllFacilities();
      res.json(facilities);
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  },

  // Lấy cơ sở y tế theo ID
  async findOne(req, res) {
    try {
      const {
        id
      } = req.params;
      const facility = await facilityService.getFacilityById(id);
      if (!facility) return res.status(404).json({
        message: "Cơ sở y tế không tồn tại!"
      });
      res.json(facility);
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  },

  // Cập nhật cơ sở y tế theo ID
  async update(req, res) {
    try {
      const {
        id
      } = req.params;
      const facility = await facilityService.updateFacility(id, req.body);
      if (!facility) return res.status(404).json({
        message: "Cơ sở y tế không tồn tại!"
      });
      res.json(facility);
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  },

  // Xóa cơ sở y tế theo ID
  async delete(req, res) {
    try {
      const {
        id
      } = req.params;
      const facility = await facilityService.deleteFacility(id);
      if (!facility) return res.status(404).json({
        message: "Cơ sở y tế không tồn tại!"
      });
      res.json({
        message: "Xóa thành công"
      });
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  },

  // Tìm kiếm cơ sở y tế nâng cao
  async search(req, res) {
    try {      
      const results = await facilityService.search(req.query);
      
      res.json({
        success: true,
        count: results.length,
        data: results,
        query: req.query
      });
    } catch (err) {
      console.error('❌ Medical facilities search error:', err);
      res.status(500).json({ 
        success: false,
        error: err.message 
      });
    }
  },

  // Tìm cơ sở y tế gần nhất
  async findNearby(req, res) {
    try {      
      const { lat, lng } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          error: 'Thiếu tham số bắt buộc: lat và lng'
        });
      }
      
      const results = await facilityService.findNearby(req.query);
      
      res.json({
        success: true,
        count: results.length,
        current_location: { 
          lat: parseFloat(lat), 
          lng: parseFloat(lng) 
        },
        search_radius: req.query.radius || 5000,
        data: results
      });
    } catch (err) {
      console.error('❌ Medical facilities nearby error:', err);
      res.status(500).json({ 
        success: false,
        error: err.message 
      });
    }
  },

  // Tìm kiếm nâng cao cơ sở y tế
  async advancedSearch(req, res) {
    try {      
      const results = await facilityService.advancedSearch(req.body);
      
      res.json({
        success: true,
        count: results.length,
        filters: req.body,
        data: results
      });
    } catch (err) {
      console.error('❌ Medical facilities advanced search error:', err);
      res.status(500).json({ 
        success: false,
        error: err.message 
      });
    }
  },

  // Lấy cơ sở y tế theo ID kèm dữ liệu location
  async getWithLocation(req, res) {
    try {
      const { id } = req.params;
      const result = await facilityService.getByIdWithLocation(id);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Medical facility not found'
        });
      }
      
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      console.error('❌ Get medical facility with location error:', err);
      res.status(500).json({ 
        success: false,
        error: err.message 
      });
    }
  }
};