const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const pharmacyController = require("../controllers/pharmacies.controller");

router.post("/", auth, pharmacyController.create);
router.get("/", pharmacyController.findAll);
router.get('/search', pharmacyController.search);
router.get('/nearby', pharmacyController.findNearby);
router.post('/advanced-search', pharmacyController.advancedSearch);
router.get('/:id/with-location', pharmacyController.getWithLocation);
router.get("/:id", pharmacyController.findOne);
router.put("/:id", pharmacyController.update);
router.delete("/:id", pharmacyController.delete);

module.exports = router;