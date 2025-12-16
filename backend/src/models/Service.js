// models/Service.js
import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  price: Number,
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  averageRating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Export as ES module
export default mongoose.model("Service", serviceSchema);
