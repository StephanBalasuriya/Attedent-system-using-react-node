const axios = require("axios");

const PYTHON_FACE_SERVICE_URL =
  process.env.PYTHON_FACE_SERVICE_URL || "http://127.0.0.1:8001";

const captureFace = async () => {
  const response = await axios.get(`${PYTHON_FACE_SERVICE_URL}/capture-face`);
  return response.data;
};

module.exports = {
  captureFace,
};
