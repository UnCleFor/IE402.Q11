const Pharmacy = require("../models/pharmacy.model");

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
    await pharmacy.destroy();
    return true;
  }
};