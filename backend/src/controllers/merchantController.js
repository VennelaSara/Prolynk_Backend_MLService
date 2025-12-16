// controllers/merchantController.js
import Service from "../models/Service.js";
import Booking from "../models/Booking.js";

/**
 * Get all services created by logged-in merchant
 * GET /api/merchant/services
 */
export const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ merchant: req.user._id });
    res.json(services);
  } catch (err) {
    console.error("Merchant get services error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all bookings for logged-in merchant
 * GET /api/merchant/bookings
 */
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ merchant: req.user._id })
      .populate("service", "title category price")
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Merchant get bookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update booking status for this merchant's booking
 * PUT /api/merchant/bookings/:id/status
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.merchant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!["pending", "accepted", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error("Update booking status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
