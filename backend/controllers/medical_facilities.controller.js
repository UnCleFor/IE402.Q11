const facilityService = require("../services/medical_facilities.service");

module.exports = {
  async create(req, res) {
    try {
      const facility = await facilityService.createFacility(req.body);
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
};