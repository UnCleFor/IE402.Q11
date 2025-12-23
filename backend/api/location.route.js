const express = require("express");
const router = express.Router();

const locationController = require("../controllers/locations.controller");

router.post("/", locationController.create); // Tạo mới location
router.get("/", locationController.findAll);  // Lấy tất cả locations
router.get("/:id", locationController.findOne); // Lấy location theo ID
router.put("/:id", locationController.update); // Cập nhật location theo ID
router.delete("/:id", locationController.delete); // Xóa location theo ID

module.exports = router;