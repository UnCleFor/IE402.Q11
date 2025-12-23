const outbreakService = require("../services/outbreak_areas.service");

module.exports = {
  // Tạo mới vùng dịch
  async create(req, res) {
    try {
      const newArea = await outbreakService.create(req.body);
      res.status(201).json({
        message: "Tạo vùng dịch thành công",
        data: newArea
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },


  // Lấy tất cả vùng dịch
  async findAll(req, res) {
    try {
      const list = await outbreakService.findAll();
      res.json({
        message: "Lấy danh sách vùng dịch thành công",
        data: list
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Lấy vùng dịch theo ID
  async findOne(req, res) {
    try {
      const { id } = req.params;
      const area = await outbreakService.findOne(id);
      if (!area) return res.status(404).json({ message: "Vùng dịch không tồn tại!" });
      res.json({
        message: "Lấy vùng dịch thành công",
        data: area
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Cập nhật vùng dịch theo ID
  async update(req, res) {
    try {
      const { id } = req.params;
      const updated = await outbreakService.update(id, req.body);
      if (!updated) return res.status(404).json({ message: "Vùng dịch không tồn tại!" });
      res.json({
        message: "Cập nhật vùng dịch thành công",
        data: updated
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Xóa vùng dịch theo ID
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await outbreakService.delete(id);
      if (!result) return res.status(404).json({ message: "Vùng dịch không tồn tại!" });
      res.json({ message: "Xóa thành công" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};