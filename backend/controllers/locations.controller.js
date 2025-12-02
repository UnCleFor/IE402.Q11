const locationService = require("../services/locations.service");

module.exports = {
  async create(req, res) {
    try {
      const newLocation = await locationService.createLocation(req.body);
      res.status(201).json(newLocation);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async findAll(req, res) {
    try {
      const locations = await locationService.getAllLocations();
      res.json(locations);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async findOne(req, res) {
    try {
      const { id } = req.params;
      const location = await locationService.getLocationById(id);

      if (!location)
        return res.status(404).json({ message: "Location not found" });

      res.json(location);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const updated = await locationService.updateLocation(id, req.body);

      if (!updated)
        return res.status(404).json({ message: "Location not found" });

      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await locationService.deleteLocation(id);

      if (!deleted)
        return res.status(404).json({ message: "Location not found" });

      res.json({ message: "Location deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};