// controllers/adminController.js
import User from "../models/User.js";
import Service from "../models/Service.js";
import Booking from "../models/Booking.js";

// ---------------- USERS ----------------
export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

export const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted" });
};

// ---------------- SERVICES ----------------
export const getAllServices = async (req, res) => {
  const services = await Service.find().populate("merchant", "name email");
  res.json(services);
};

export const deleteService = async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) return res.status(404).json({ message: "Service not found" });
  res.json({ message: "Service deleted" });
};

// ---------------- BOOKINGS ----------------
export const getAllBookings = async (req, res) => {
  const bookings = await Booking.find()
    .populate("service", "title category price")
    .populate("customer", "name email")
    .populate("merchant", "name email")
    .sort({ createdAt: -1 });
  res.json(bookings);
};

export const deleteBooking = async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json({ message: "Booking deleted" });
};
