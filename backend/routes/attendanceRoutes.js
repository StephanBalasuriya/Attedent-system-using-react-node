const express = require("express");
const rateLimit = require("express-rate-limit");
const attendanceController = require("../controllers/attendanceController");

const router = express.Router();
const attendanceReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attendance requests. Please wait a moment and try again." },
});
const attendanceScanLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Attendance scanning is rate-limited. Please wait before scanning again." },
});

router.get("/", attendanceReadLimiter, attendanceController.listAttendance);
router.post("/scan", attendanceScanLimiter, attendanceController.scanAttendance);

module.exports = router;
