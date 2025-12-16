import express from "express";
const router = express.Router();

// Middleware imports (ES module)
import { protect, authorize } from "../middleware/authMiddleware.js";

// Controller imports (ES module)
import {
  getMyServices,
  getMyBookings,
  updateBookingStatus,
} from "../controllers/merchantController.js";

// All routes are protected and merchant-only
router.use(protect, authorize("merchant"));

// Get all services of this merchant
router.get("/services", getMyServices);

// Get all bookings for this merchant
router.get("/bookings", getMyBookings);

// Update booking status
router.put("/bookings/:id/status", updateBookingStatus);

export default router;
