const express = require("express");
const router = express.Router();
const multer = require("multer");
const userController = require("../controllers/userController");

const upload = multer({ dest: "uploads/" });

// Enroll user + face image
router.post("/enroll", upload.single("face"), userController.enrollUser);

module.exports = router;
