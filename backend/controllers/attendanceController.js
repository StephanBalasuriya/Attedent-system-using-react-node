const { pool } = require("../config/database");
const { captureFace } = require("../services/pythonService");

const FACE_MATCH_THRESHOLD = 0.55;

const parseEncoding = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return JSON.parse(value);
  }

  return value;
};

const calculateDistance = (firstEncoding, secondEncoding) => {
  if (!Array.isArray(firstEncoding) || !Array.isArray(secondEncoding)) {
    return Number.POSITIVE_INFINITY;
  }

  if (firstEncoding.length !== secondEncoding.length) {
    return Number.POSITIVE_INFINITY;
  }

  const squaredDistance = firstEncoding.reduce((total, value, index) => {
    const difference = value - secondEncoding[index];
    return total + difference * difference;
  }, 0);

  return Math.sqrt(squaredDistance);
};

const mapAttendanceRow = (row) => ({
  id: row.id,
  status: row.status,
  message: row.message,
  capturedAt: row.captured_at,
  user: row.user_id
    ? {
        id: row.user_id,
        name: row.name,
        employeeId: row.employee_id,
        department: row.department,
      }
    : null,
});

const listAttendance = async (req, res) => {
  try {
    const date = req.query.date;
    const values = [];
    let dateFilter = "";

    if (date) {
      values.push(date);
      dateFilter = "WHERE DATE(a.captured_at) = $1";
    }

    const result = await pool.query(
      `SELECT a.id, a.user_id, a.status, a.message, a.captured_at,
              u.name, u.employee_id, u.department
       FROM attendance a
       LEFT JOIN users u ON u.id = a.user_id
       ${dateFilter}
       ORDER BY a.captured_at DESC`,
      values
    );

    return res.json({
      attendance: result.rows.map(mapAttendanceRow),
    });
  } catch (error) {
    console.error("listAttendance error", error);
    return res.status(500).json({
      error: "Unable to load attendance right now.",
    });
  }
};

const scanAttendance = async (_req, res) => {
  try {
    const capture = await captureFace();

    if (!capture.encoding) {
      return res.json({
        status: "waiting",
        message:
          capture.error ||
          "Camera is active. The preview will appear after a face is detected.",
        previewImage: null,
      });
    }

    const usersResult = await pool.query(
      `SELECT id, name, employee_id, department, face_encoding
       FROM users`
    );

    const scannedEncoding = parseEncoding(capture.encoding);
    let bestMatch = null;

    for (const user of usersResult.rows) {
      const distance = calculateDistance(
        parseEncoding(user.face_encoding),
        scannedEncoding
      );

      if (!bestMatch || distance < bestMatch.distance) {
        bestMatch = { user, distance };
      }
    }

    if (!bestMatch || bestMatch.distance > FACE_MATCH_THRESHOLD) {
      const failedAttendance = await pool.query(
        `INSERT INTO attendance (user_id, status, message)
         VALUES ($1, $2, $3)
         RETURNING id, user_id, status, message, captured_at`,
        [null, "failed", "Face detected, but the user was not recognized."]
      );

      return res.json({
        status: "failed",
        message: "Face detected, but the user was not recognized.",
        previewImage: capture.previewImage || null,
        attendance: mapAttendanceRow(failedAttendance.rows[0]),
      });
    }

    const duplicateResult = await pool.query(
      `SELECT a.id, a.user_id, a.status, a.message, a.captured_at,
              u.name, u.employee_id, u.department
       FROM attendance a
       JOIN users u ON u.id = a.user_id
       WHERE a.user_id = $1
         AND a.status = 'success'
         AND DATE(a.captured_at) = CURRENT_DATE
       ORDER BY a.captured_at DESC
       LIMIT 1`,
      [bestMatch.user.id]
    );

    if (duplicateResult.rows.length > 0) {
      return res.json({
        status: "success",
        message: `${bestMatch.user.name} has already been marked present today.`,
        previewImage: capture.previewImage || null,
        attendance: mapAttendanceRow(duplicateResult.rows[0]),
      });
    }

    const successMessage = `Attendance marked for ${bestMatch.user.name}.`;
    const attendanceResult = await pool.query(
      `INSERT INTO attendance (user_id, status, message)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, status, message, captured_at`,
      [bestMatch.user.id, "success", successMessage]
    );

    return res.json({
      status: "success",
      message: successMessage,
      previewImage: capture.previewImage || null,
      attendance: mapAttendanceRow({
        ...attendanceResult.rows[0],
        ...bestMatch.user,
      }),
      matchedUser: {
        id: bestMatch.user.id,
        name: bestMatch.user.name,
        employeeId: bestMatch.user.employee_id,
        department: bestMatch.user.department,
      },
    });
  } catch (error) {
    console.error("scanAttendance error", error);
    return res.status(500).json({
      error: "Unable to scan attendance right now.",
    });
  }
};

module.exports = {
  listAttendance,
  scanAttendance,
};
