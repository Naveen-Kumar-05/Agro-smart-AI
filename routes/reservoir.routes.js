// routes/reservoir.routes.js
const express = require("express");
const router = express.Router();
const reservoirController = require("../controllers/reservoir.controller");

router.get("/", reservoirController.getReservoirs);

module.exports = router;
