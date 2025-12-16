import express from "express";
const router = express.Router();

// Middleware imports
import { protect, authorize } from "../middleware/authMiddleware.js";

// Controller imports
import {
  getAllUsers,
  deleteUser,
  getAllServices,
  deleteService,
  getAllBookings,
  deleteBooking,
} from "../controllers/adminController.js";

// Protect all admin routes
router.use(protect, authorize("admin"));

// Users routes
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

// Services routes
router.get("/services", getAllServices);
router.delete("/services/:id", deleteService);

// Bookings routes
router.get("/bookings", getAllBookings);
router.delete("/bookings/:id", deleteBooking);

export default router;
