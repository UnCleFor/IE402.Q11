const MedicalFacility = require("../models/medical_facility.model");
const Location = require("../models/location.model")

async function createFacility(data) {
  return await MedicalFacility.create(data);
}

async function getAllFacilities() {
  return await MedicalFacility.findAll();
}

async function getFacilityById(id) {
  return await MedicalFacility.findByPk(id);
}

async function updateFacility(id, data) {
  const facility = await MedicalFacility.findByPk(id);
  if (!facility) return null;
  return await facility.update(data);
}

async function deleteFacility(id) {
  const facility = await MedicalFacility.findByPk(id);
  if (!facility) return null;

  const locationId = facility.facility_point_id;

  await MedicalFacility.destroy({
    where: { facility_id: id }
  });

  console.log("Facility deleted");

  if (locationId) {
    await Location.destroy({
      where: { location_id: locationId }
    });
  }

  return true;
}

module.exports = {
  createFacility,
  getAllFacilities,
  getFacilityById,
  updateFacility,
  deleteFacility,
};