const express = require("express");
const router = express.Router();

const locationController = require("../controllers/locations.controller");

router.post("/", locationController.create);
router.get("/", locationController.findAll);
router.get("/:id", locationController.findOne);
router.put("/:id", locationController.update);
router.delete("/:id", locationController.delete);

module.exports = router;