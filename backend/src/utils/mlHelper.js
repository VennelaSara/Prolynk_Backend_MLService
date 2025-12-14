const axios = require("axios");

// Base URL for your Python ML service
const ML_SERVICE_URL = "http://localhost:5001";

async function getRecommendations({ userId }) {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/recommend`, {
      userId,
    });
    return response.data.recommendations;
  } catch (error) {
    console.error("ML Service Error:", error.message);
    return [];
  }
}

module.exports = { getRecommendations };
