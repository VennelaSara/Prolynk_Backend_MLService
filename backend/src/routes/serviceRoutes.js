const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  addRating,
} = require("../controllers/serviceController");

// ---------------- PUBLIC ----------------
router.get("/", getServices);
router.get("/:id", getServiceById);

// ---------------- MERCHANT ----------------
router.post("/", protect, authorize("merchant"), createService);
router.put("/:id", protect, authorize("merchant"), updateService);
router.delete("/:id", protect, authorize("merchant", "admin"), deleteService);

// ---------------- CUSTOMER ----------------
router.post("/:id/rate", protect, authorize("customer"), addRating);

module.exports = router;
