// utils/mlHelper.js
import axios from "axios";

// Base URL for your Python ML service
const ML_SERVICE_URL = "http://localhost:5001";

/**
 * Fetch recommendations from Python ML service
 * @param {Object} param0
 * @param {string} param0.userId
 */
export async function getRecommendations({ userId }) {
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
