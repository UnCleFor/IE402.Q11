const Location = require("../models/location.model");

// Tạo location mới
async function createLocation(data) {
  return await Location.create(data);
}

// Lấy tất cả locations
async function getAllLocations() {
  return await Location.findAll();
}

// Lấy location theo ID
async function getLocationById(id) {
  return await Location.findByPk(id);
}

// Cập nhật location theo ID
async function updateLocation(id, data) {
  const location = await Location.findByPk(id);
  if (!location) return null;

  return await location.update(data);
}

// Xóa location theo ID
async function deleteLocation(id) {
  const location = await Location.findByPk(id);
  if (!location) return null;

  await location.destroy();
  return true;
}

module.exports = {
  createLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
};