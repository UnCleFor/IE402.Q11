const express = require("express");
const router = express.Router();

const provinceController = require("../controllers/province.controller");

router.post("/", provinceController.create); // Tạo mới tỉnh
router.get("/", provinceController.findAll); // Lấy tất cả tỉnh
router.get("/search", provinceController.search); // Tìm kiếm tỉnh
router.get("/:id", provinceController.findOne); // Lấy tỉnh theo ID
router.put("/:id", provinceController.update); // Cập nhật tỉnh theo ID
router.delete("/:id", provinceController.delete); // Xóa tỉnh theo ID

module.exports = router;