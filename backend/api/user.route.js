const express = require("express");
const router = express.Router();

const controller = require("../controllers/users.controller");

router.post("/", controller.create); // Tạo mới user
router.get("/", controller.findAll); // Lấy tất cả users
router.get("/findOne", controller.findUser); // Lấy user theo điều kiện
router.put("/:user_id", controller.update); // Cập nhật user theo ID
router.delete("/:user_id", controller.delete); // Xóa user theo ID
router.post("/login", controller.login); // Đăng nhập
router.post("/register", controller.register); // Đăng ký

module.exports = router;