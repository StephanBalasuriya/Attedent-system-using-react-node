const express = require("express");
const attendanceController = require("../controllers/attendanceController");

const router = express.Router();

router.get("/", attendanceController.listAttendance);
router.post("/scan", attendanceController.scanAttendance);

module.exports = router;
