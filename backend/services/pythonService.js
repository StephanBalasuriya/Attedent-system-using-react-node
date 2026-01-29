const axios = require("axios");
const fs = require("fs");

exports.getFaceEncoding = async (imagePath) => {
  // Python microservice URL
  const url = "http://127.0.0.1:8001/encode-face";

  const formData = new FormData();
  formData.append("file", fs.createReadStream(imagePath));

  const response = await axios.post(url, formData, {
    headers: formData.getHeaders(),
  });

  // Return Buffer to store in DB
  return Buffer.from(response.data.encoding);
};
