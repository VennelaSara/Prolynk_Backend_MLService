const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createBooking,
  getMyBookings,
  getMerchantBookings,
  updateBookingStatus,
  deleteBooking,
  getAllBookings,
} = require("../controllers/bookingController");

// Customer
router.post("/", protect, authorize("customer"), createBooking);
router.get("/my", protect, authorize("customer"), getMyBookings);
router.delete("/:id", protect, authorize("customer", "admin"), deleteBooking);

// Merchant
router.get("/merchant", protect, authorize("merchant"), getMerchantBookings);
router.put(
  "/:id/status",
  protect,
  authorize("merchant", "admin"),
  updateBookingStatus
);

// Admin
router.get("/", protect, authorize("admin"), getAllBookings);

module.exports = router;
