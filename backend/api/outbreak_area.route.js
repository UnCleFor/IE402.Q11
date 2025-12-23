const express = require("express");
const router = express.Router();

const outbreakAreasController = require("../controllers/outbreak_areas.controller");

router.post("/", outbreakAreasController.create); // Tạo mới vùng dịch
router.get("/", outbreakAreasController.findAll); // Lấy tất cả vùng dịch
router.get("/:id", outbreakAreasController.findOne); // Lấy vùng dịch theo ID
router.put("/:id", outbreakAreasController.update); // Cập nhật vùng dịch theo ID
router.delete("/:id", outbreakAreasController.delete); // Xóa vùng dịch theo ID

module.exports = router;