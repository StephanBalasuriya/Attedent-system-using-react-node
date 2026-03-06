const express = require("express");
const rateLimit = require("express-rate-limit");
const userController = require("../controllers/userController");

const router = express.Router();
const userRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many user requests. Please wait a moment and try again." },
});

router.get("/", userRateLimiter, userController.listUsers);
router.post("/", userRateLimiter, userController.createUser);
router.post("/enroll", userRateLimiter, userController.enrollUser);

module.exports = router;
