const express = require("express");
const router = express.Router();
const controller = require("../controllers/users.controller");

router.post("/", controller.create);
router.get("/", controller.findAll);
router.get("/findOne", controller.findUser);
router.put("/:user_id", controller.update);
router.delete("/:user_id", controller.delete);
router.post("/login", controller.login);
router.post("/register", controller.register);
module.exports = router;