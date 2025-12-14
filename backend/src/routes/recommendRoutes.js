// src/routes/recommendRoutes.js
const express = require("express");
const router = express.Router();
const { recommendServices } = require("../controllers/recommendController");

router.post("/", recommendServices);

module.exports = router;
