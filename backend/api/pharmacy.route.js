const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const pharmacyController = require("../controllers/pharmacies.controller");

router.post("/", auth, pharmacyController.create); // Tạo mới nhà thuốc
router.get("/", pharmacyController.findAll); // Lấy tất cả nhà thuốc
router.get('/search', pharmacyController.search); // Tìm kiếm nâng cao nhà thuốc
router.get('/nearby', pharmacyController.findNearby); // Tìm nhà thuốc gần vị trí
router.post('/advanced-search', pharmacyController.advancedSearch); // Tìm kiếm nâng cao nhà thuốc
router.get('/:id/with-location', pharmacyController.getWithLocation); // Lấy nhà thuốc cùng với thông tin địa điểm
router.get("/:id", pharmacyController.findOne); // Lấy nhà thuốc theo ID
router.put("/:id", pharmacyController.update); // Cập nhật nhà thuốc theo ID
router.delete("/:id", pharmacyController.delete); // Xóa nhà thuốc theo ID

module.exports = router;