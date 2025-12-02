const Location = require("../models/location.model");

async function createLocation(data) {
  return await Location.create(data);
}

async function getAllLocations() {
  return await Location.findAll();
}

async function getLocationById(id) {
  return await Location.findByPk(id);
}

async function updateLocation(id, data) {
  const location = await Location.findByPk(id);
  if (!location) return null;

  return await location.update(data);
}

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