const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const medicalFacilityController = require("../controllers/medical_facilities.controller");

router.post("/", auth, medicalFacilityController.create);
router.get('/search', medicalFacilityController.search);
router.get('/nearby', medicalFacilityController.findNearby);
router.post('/advanced-search', medicalFacilityController.advancedSearch);
router.get("/", medicalFacilityController.findAll);
router.get('/:id/with-location', medicalFacilityController.getWithLocation);
router.get("/:id", medicalFacilityController.findOne);
router.put("/:id", medicalFacilityController.update);
router.delete("/:id", medicalFacilityController.delete);

module.exports = router;