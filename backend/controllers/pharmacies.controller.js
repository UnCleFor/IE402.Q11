const pharmacyService = require("../services/pharmacies.service");

module.exports = {
  // Tạo mới nhà thuốc
  async create(req, res) {
    try {
      const body = req.body;
      const payload = {
        pharmacy_name: body.pharmacy_name,
        //type_id: body.type_id,
        address: body.address,
        status: body.status,
        province_id: body.province_id,
        //services: (body.services || []).join(', '),
        pharmacy_point_id: body.pharmacy_point_id,
        creator_id: req.user.user_id         // từ decoded token
      };


      const pharmacy = await pharmacyService.createPharmacy(payload);
      res.status(201).json({
        message: "Tạo nhà thuốc thành công",
        pharmacy
      });
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  },

  // Lấy tất cả nhà thuốc
  async findAll(req, res) {
    try {
      const pharmacies = await pharmacyService.getAllPharmacies();
      res.json(pharmacies);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Lấy nhà thuốc theo ID
  async findOne(req, res) {
    try {
      const { id } = req.params;
      const pharmacy = await pharmacyService.getPharmacyById(id);
      if (!pharmacy) return res.status(404).json({ message: "Nhà thuốc không tồn tại!" });
      res.json(pharmacy);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Cập nhật nhà thuốc theo ID
  async update(req, res) {
    try {
      const { id } = req.params;
      const updated = await pharmacyService.updatePharmacy(id, req.body);
      if (!updated) return res.status(404).json({ message: "Nhà thuốc không tồn tại!" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Xóa nhà thuốc theo ID
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await pharmacyService.deletePharmacy(id);
      if (!deleted) return res.status(404).json({ message: "Nhà thuốc không tồn tại!" });
      res.json({ message: "Xóa thành công" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Tìm kiếm pharmacies nâng cao (GET)
  async search(req, res) {
    try {
      const results = await pharmacyService.search(req.query);

      res.json({
        success: true,
        count: results.length,
        data: results,
        query: req.query
      });
    } catch (err) {
      console.error('❌ Pharmacies search error:', err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  },

  // Tìm pharmacies gần nhất
  async findNearby(req, res) {
    try {
      const { lat, lng } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          error: 'Thiếu tham số bắt buộc: lat và lng'
        });
      }

      const results = await pharmacyService.findNearby(req.query);

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
      console.error('❌ Pharmacies nearby error:', err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  },

  //Tìm kiếm nâng cao (POST)
  async advancedSearch(req, res) {
    try {
      const results = await pharmacyService.advancedSearch(req.body);

      res.json({
        success: true,
        count: results.length,
        filters: req.body,
        data: results
      });
    } catch (err) {
      console.error('❌ Pharmacies advanced search error:', err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  },

  //Lấy chi tiết pharmacy với location
  async getWithLocation(req, res) {
    try {
      const { id } = req.params;
      const result = await pharmacyService.getByIdWithLocation(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Pharmacy not found'
        });
      }

      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      console.error('❌ Get pharmacy with location error:', err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
};