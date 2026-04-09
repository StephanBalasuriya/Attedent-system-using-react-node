const { pool } = require("../config/database");
const { captureFace } = require("../services/pythonService");

const mapUserRow = (row) => ({
  id: row.id,
  name: row.name,
  employeeId: row.employee_id,
  department: row.department,
  createdAt: row.created_at,
});

const validateUserPayload = ({ name, employeeId, department }) =>
  name && employeeId && department;

const createUser = async (req, res) => {
  try {
    const { name, employeeId, department } = req.body;

    if (!validateUserPayload({ name, employeeId, department })) {
      return res.status(400).json({
        error: "Name, employee ID and department are required.",
      });
    }

    const capture = await captureFace();

    if (!capture.encoding) {
      return res.status(400).json({
        error: capture.error || "A single face must be visible to add a user.",
        status: "waiting",
      });
    }

    const result = await pool.query(
      `INSERT INTO users (name, employee_id, department, face_encoding)
       VALUES ($1, $2, $3, $4::jsonb)
       RETURNING id, name, employee_id, department, created_at`,
      [name.trim(), employeeId.trim(), department.trim(), JSON.stringify(capture.encoding)]
    );

    return res.status(201).json({
      message: "User added successfully.",
      previewImage: capture.previewImage || null,
      user: mapUserRow(result.rows[0]),
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "A user with that employee ID already exists.",
      });
    }

    console.error("createUser error", error);
    return res.status(500).json({
      error: "Unable to add the user right now.",
    });
  }
};

const listUsers = async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, employee_id, department, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    return res.json({
      users: result.rows.map(mapUserRow),
    });
  } catch (error) {
    console.error("listUsers error", error);
    return res.status(500).json({
      error: "Unable to load users right now.",
    });
  }
};

module.exports = {
  createUser,
  enrollUser: createUser,
  listUsers,
};
