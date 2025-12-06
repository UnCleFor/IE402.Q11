const facilityService = require("../services/medical_facilities.service");

module.exports = {
  async create(req, res) { console.log("Body nhận được:", req.body);
    try {
      const body = req.body;
      const payload = {
      facility_name: body.facility_name, 
      type_id: body.type_id,
      address: body.address,
      phone: body.phone,
      province_id: body.province_id,
      services: JSON.stringify(body.services || []),
      creator_id: req.user.user_id         // từ decoded token
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