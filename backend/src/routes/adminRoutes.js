const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  deleteUser,
  getAllServices,
  deleteService,
  getAllBookings,
  deleteBooking,
} = require("../controllers/adminController");

router.use(protect, authorize("admin"));

// Users
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

// Services
router.get("/services", getAllServices);
router.delete("/services/:id", deleteService);

// Bookings
router.get("/bookings", getAllBookings);
router.delete("/bookings/:id", deleteBooking);

module.exports = router;
