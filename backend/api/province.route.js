const express = require("express");
const router = express.Router();
const provinceController = require("../controllers/province.controller");

router.post("/", provinceController.create);
router.get("/", provinceController.findAll);
router.get("/search", provinceController.search); // 🔍 tìm kiếm
router.get("/:id", provinceController.findOne);
router.put("/:id", provinceController.update);
router.delete("/:id", provinceController.delete);

module.exports = router;