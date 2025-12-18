const Pharmacy = require("../models/pharmacy.model");
const Location = require("../models/location.model")

module.exports = {
  async createPharmacy(data) {
    return await Pharmacy.create(data);
  },

  async getAllPharmacies() {
    return await Pharmacy.findAll();
  },

  async getPharmacyById(id) {
    return await Pharmacy.findByPk(id);
  },

  async updatePharmacy(id, data) {
    const pharmacy = await Pharmacy.findByPk(id);
    if (!pharmacy) return null;
    await pharmacy.update(data);
    return pharmacy;
  },

  async deletePharmacy(id) {
    const pharmacy = await Pharmacy.findByPk(id);
    if (!pharmacy) return null;

    const locationId = pharmacy.pharmacy_point_id;

    await Pharmacy.destroy({
      where: { pharmacy_id: id }
    });

    console.log("Pharmacy deleted");

    if (locationId) {
      await Location.destroy({
        where: { location_id: locationId }
      });
    }

    return true;
  }
};