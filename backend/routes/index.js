const express = require("express");
const router = express.Router();

const userRoutes = require("../api/user.route");
const medicalFacilityRoutes = require("../api/medical_facility.route");
const outbreakRoutes = require("../api/outbreak_area.route");
const pharmacyRoutes = require("../api/pharmacy.route");
const locationRoutes = require("../api/location.route");
const provinceRoutes = require("../api/province.route");

router.use("/users", userRoutes);
router.use("/medical-facilities", medicalFacilityRoutes);
router.use("/outbreak-areas", outbreakRoutes);
router.use("/pharmacies", pharmacyRoutes);
router.use("/locations", locationRoutes);
router.use("/provinces", provinceRoutes);


module.exports = router;
