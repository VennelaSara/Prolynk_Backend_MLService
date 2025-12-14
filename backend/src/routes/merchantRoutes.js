const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getMyServices,
  getMyBookings,
  updateBookingStatus,
} = require("../controllers/merchantController");

// All routes are protected and merchant-only
router.use(protect, authorize("merchant"));

// Get all services of this merchant
router.get("/services", getMyServices);

// Get all bookings for this merchant
router.get("/bookings", getMyBookings);

// Update booking status
router.put("/bookings/:id/status", updateBookingStatus);

module.exports = router;
