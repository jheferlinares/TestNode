const express = require("express");
const router = express.Router();
const compareController = require("../controllers/compareController");
const utilities = require("../utilities/");

// Ruta para mostrar la página de comparación
router.get("/", utilities.errorHandler(compareController.buildComparePage));

// Ruta para mostrar los resultados de la comparación
router.get("/results", utilities.errorHandler(compareController.processComparison));

module.exports = router;
