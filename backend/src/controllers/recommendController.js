const { getRecommendations } = require("../utils/mlHelper");

exports.recommendServices = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const recommendations = await getRecommendations({ userId });
    return res.json({ recommendations });
  } catch (error) {
    console.error("Node Controller Error:", error.message);
    return res.status(500).json({ error: "Failed to fetch recommendations" });
  }
};
