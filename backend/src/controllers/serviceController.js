// controllers/serviceController.js
import Service from "../models/Service.js";

// ---------------- CREATE SERVICE (Merchant only) ----------------
export async function createService(req, res) {
  try {
    const { title, description, category, price } = req.body;

    if (!title || !category || !price) {
      return res
        .status(400)
        .json({ message: "Title, category, and price are required" });
    }

    const service = await Service.create({
      title,
      description,
      category,
      price,
      merchant: req.user._id,
    });

    res.status(201).json(service);
  } catch (err) {
    console.error("Create Service Error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// ---------------- GET ALL SERVICES (Public) ----------------
export async function getServices(req, res) {
  try {
    const { category, title } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (title) filter.title = new RegExp(title, "i"); // search support

    const services = await Service.find(filter)
      .populate("merchant", "name email")
      .select(
        "title description category price averageRating ratings createdAt merchant"
      )
      .sort({ createdAt: -1 });

    res.json(services);
  } catch (err) {
    console.error("Get Services Error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// ---------------- GET SERVICE BY ID ----------------
export async function getServiceById(req, res) {
  try {
    const service = await Service.findById(req.params.id)
      .populate("merchant", "name email")
      .populate("ratings.user", "name");

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(service);
  } catch (err) {
    console.error("Get Service By ID Error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// ---------------- UPDATE SERVICE (Merchant only) ----------------
export async function updateService(req, res) {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (service.merchant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, description, category, price } = req.body;

    if (title) service.title = title;
    if (description) service.description = description;
    if (category) service.category = category;
    if (price) service.price = price;

    await service.save();
    res.json(service);
  } catch (err) {
    console.error("Update Service Error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// ---------------- DELETE SERVICE (Merchant/Admin) ----------------
export async function deleteService(req, res) {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (
      req.user.role !== "admin" &&
      service.merchant.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await service.deleteOne();
    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    console.error("Delete Service Error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// ---------------- ADD RATING & COMMENT (Customer only) ----------------
export async function addRating(req, res) {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Prevent duplicate rating
    const alreadyRated = service.ratings.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyRated) {
      return res.status(400).json({ message: "Service already rated" });
    }

    service.ratings.push({
      user: req.user._id,
      rating,
      comment,
    });

    // Recalculate average rating
    service.averageRating =
      service.ratings.reduce((sum, r) => sum + r.rating, 0) /
      service.ratings.length;

    await service.save();

    res.json({ message: "Rating added successfully", service });
  } catch (err) {
    console.error("Add Rating Error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
