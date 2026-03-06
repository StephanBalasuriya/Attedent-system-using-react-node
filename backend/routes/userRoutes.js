const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/", userController.listUsers);
router.post("/", userController.createUser);
router.post("/enroll", userController.enrollUser);

module.exports = router;
