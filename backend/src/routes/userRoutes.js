const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

// Protected routes
router.use(protect);

// Current user profile
router.get("/me", (req, res) => res.json({ user: req.user }));

// Admin routes
router.get("/", authorize("admin"), getAllUsers);
router.get("/:id", authorize("admin"), getUserById);
router.put("/:id", authorize("admin", "customer", "merchant"), updateUser);
router.delete("/:id", authorize("admin"), deleteUser);

module.exports = router;
