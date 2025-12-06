const pharmacyService = require("../services/pharmacies.service");

module.exports = {
  async create(req, res) {
    try {
      const newPharmacy = await pharmacyService.createPharmacy(req.body);
      res.status(201).json(newPharmacy);
    } catch (err) {
      res.status(500).json({ error: err.message });
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