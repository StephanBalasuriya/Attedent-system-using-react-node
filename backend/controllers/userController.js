const pool = require("../config");
const faceService = require("../services/faceService");

exports.enrollUser = async (req, res) => {
  try {
    const { name, employee_id, department } = req.body;
    const faceImage = req.file.path;

    // Call Python service to get encoding
    const encoding = await faceService.getFaceEncoding(faceImage);

    const result = await pool.query(
      "INSERT INTO users (name, employee_id, department, face_encoding) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, employee_id, department, encoding]
    );

    res.json({ message: "User enrolled", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
