// controllers/bookingController.js
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";

/**
 * Create booking (Customer)
 * POST /api/bookings
 */
export const createBooking = async (req, res) => {
  const { serviceId, scheduledAt } = req.body;

  try {
    if (!serviceId || !scheduledAt) {
      return res
        .status(400)
        .json({ message: "Service and scheduled date required" });
    }

    // Fetch service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Create booking (merchant auto-linked from service)
    const booking = await Booking.create({
      service: service._id,
      customer: req.user._id,
      merchant: service.merchant, // ✅ linked automatically
      scheduledAt,
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all bookings (Admin)
 * GET /api/bookings
 */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("service", "title category price")
      .populate("customer", "name email")
      .populate("merchant", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Get all bookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get bookings of logged-in customer
 * GET /api/bookings/my
 */
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate("service", "title category price")
      .populate("merchant", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Get my bookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get bookings of logged-in merchant
 * GET /api/bookings/merchant
 */
export const getMerchantBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ merchant: req.user._id })
      .populate("service", "title category price")
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Get merchant bookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update booking status (Merchant/Admin)
 * PUT /api/bookings/:id/status
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Merchant authorization
    if (
      req.user.role === "merchant" &&
      booking.merchant.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { status } = req.body;
    if (status) booking.status = status;

    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error("Update booking status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete booking (Customer/Admin)
 * DELETE /api/bookings/:id
 */
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Customer authorization
    if (
      req.user.role === "customer" &&
      booking.customer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await booking.deleteOne();
    res.json({ message: "Booking deleted" });
  } catch (err) {
    console.error("Delete booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
