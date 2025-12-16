import express from "express";
const router = express.Router();

// Middleware imports (ES module)
import { protect, authorize } from "../middleware/authMiddleware.js";

// Controller imports (ES module)
import {
  createBooking,
  getMyBookings,
  getMerchantBookings,
  updateBookingStatus,
  deleteBooking,
  getAllBookings,
} from "../controllers/bookingController.js";

// Customer routes
router.post("/", protect, authorize("customer"), createBooking);
router.get("/my", protect, authorize("customer"), getMyBookings);
router.delete("/:id", protect, authorize("customer", "admin"), deleteBooking);

// Merchant routes
router.get("/merchant", protect, authorize("merchant"), getMerchantBookings);
router.put(
  "/:id/status",
  protect,
  authorize("merchant", "admin"),
  updateBookingStatus
);

// Admin routes
router.get("/", protect, authorize("admin"), getAllBookings);

export default router;
