const path = require("path");
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const { initializeDatabase } = require("./config/database");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/users", userRoutes);
app.use("/api/attendance", attendanceRoutes);

initializeDatabase().catch((error) => {
  console.error("Database initialization failed", error);
});

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
