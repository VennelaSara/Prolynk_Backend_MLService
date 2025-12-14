// const Booking = require("../models/Booking");
// const Service = require("../models/Service");

// // Create booking (Customer)
// exports.createBooking = async (req, res) => {
//   const { serviceId, merchantId, scheduledAt } = req.body;
//   try {
//     if (!serviceId || !merchantId || !scheduledAt)
//       return res
//         .status(400)
//         .json({ message: "Service, merchant, date required" });

//     const service = await Service.findById(serviceId);
//     if (!service) return res.status(404).json({ message: "Service not found" });

//     if (service.merchant.toString() !== merchantId)
//       return res.status(400).json({ message: "Invalid merchant" });

//     const booking = await Booking.create({
//       service: serviceId,
//       customer: req.user._id,
//       merchant: merchantId,
//       scheduledAt,
//     });

//     res.status(201).json(booking);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Get all bookings (Admin)
// exports.getAllBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find()
//       .populate("service", "title category price")
//       .populate("customer", "name email")
//       .populate("merchant", "name email")
//       .sort({ createdAt: -1 });
//     res.json(bookings);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Get bookings by customer
// exports.getMyBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find({ customer: req.user._id })
//       .populate("service", "title category price")
//       .populate("merchant", "name email")
//       .sort({ createdAt: -1 });
//     res.json(bookings);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Get bookings by merchant
// exports.getMerchantBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find({ merchant: req.user._id })
//       .populate("service", "title category price")
//       .populate("customer", "name email")
//       .sort({ createdAt: -1 });
//     res.json(bookings);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Update booking status (Merchant/Admin)
// exports.updateBookingStatus = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id);
//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     if (
//       req.user.role === "merchant" &&
//       booking.merchant.toString() !== req.user._id.toString()
//     )
//       return res.status(403).json({ message: "Not authorized" });

//     const { status } = req.body;
//     booking.status = status || booking.status;
//     await booking.save();
//     res.json(booking);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Delete booking (Customer/Admin)
// exports.deleteBooking = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id);
//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     if (
//       req.user.role === "customer" &&
//       booking.customer.toString() !== req.user._id.toString()
//     )
//       return res.status(403).json({ message: "Not authorized" });

//     await booking.remove();
//     res.json({ message: "Booking deleted" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

const Booking = require("../models/Booking");
const Service = require("../models/Service");

/**
 * Create booking (Customer)
 * POST /api/bookings
 */
exports.createBooking = async (req, res) => {
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
      merchant: service.merchant, // ✅ FIXED
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
exports.getAllBookings = async (req, res) => {
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
exports.getMyBookings = async (req, res) => {
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
exports.getMerchantBookings = async (req, res) => {
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
exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

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
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

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
