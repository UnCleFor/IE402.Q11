const OutbreakArea = require("../models/outbreak_area.model");

module.exports = {
  // Tạo mới vùng dịch
  async create(data) {
    return await OutbreakArea.create(data);
  },

  // Lấy tất cả vùng dịch
  async findAll() {
    return await OutbreakArea.findAll();
  },

  // Lấy vùng dịch theo ID
  async findOne(id) {
    return await OutbreakArea.findByPk(id);
  },

  // Cập nhật vùng dịch theo ID
  async update(id, data) {
    const outbreak = await OutbreakArea.findByPk(id);
    if (!outbreak) return null;
    await outbreak.update(data);
    return outbreak;
  },

  // Xóa vùng dịch theo ID
  async delete(id) {
    const outbreak = await OutbreakArea.findByPk(id);
    if (!outbreak) return null;
    await outbreak.destroy();
    return true;
  }
};