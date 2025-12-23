const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const medicalFacilityController = require("../controllers/medical_facilities.controller");

router.post("/", auth, medicalFacilityController.create); // Tạo mới cơ sở y tế
router.get('/search', medicalFacilityController.search); // Tìm kiếm nâng cao cơ sở y tế
router.get('/nearby', medicalFacilityController.findNearby); // Tìm cơ sở y tế gần vị trí
router.post('/advanced-search', medicalFacilityController.advancedSearch); // Tìm kiếm nâng cao cơ sở y tế
router.get("/", medicalFacilityController.findAll); // Lấy tất cả cơ sở y tế
router.get('/:id/with-location', medicalFacilityController.getWithLocation); // Lấy cơ sở y tế cùng với thông tin địa điểm
router.get("/:id", medicalFacilityController.findOne); // Lấy cơ sở y tế theo ID
router.put("/:id", medicalFacilityController.update); // Cập nhật cơ sở y tế theo ID
router.delete("/:id", medicalFacilityController.delete); // Xóa cơ sở y tế theo ID

module.exports = router;