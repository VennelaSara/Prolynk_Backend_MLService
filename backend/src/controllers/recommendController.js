//
import { getRecommendations } from "../utils/mlHelper.js";
import { protect } from "../middleware/authMiddleware.js";

export const recommendServices = [
  protect,
  async (req, res) => {
    try {
      const userId = req.body.userId || req.user?._id;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const recommendations = await getRecommendations({ userId });
      console.log("Recommendations:", recommendations);
      return res.json({ recommendations });
    } catch (error) {
      console.error("Node Controller Error:", error);
      return res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  },
];
