const pharmacyService = require("../services/pharmacies.service");

module.exports = {
  async create(req, res) { console.log("Body nhận được:", req.body);
      try {
        const body = req.body;
        const payload = {
        pharmacy_name: body.pharmacy_name, 
        //type_id: body.type_id,
        address: body.address,
        //phone: body.phone,
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

  async findAll(req, res) {
    try {
      const pharmacies = await pharmacyService.getAllPharmacies();
      res.json(pharmacies);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

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
};