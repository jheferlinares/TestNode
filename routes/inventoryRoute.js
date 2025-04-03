// Importa los módulos necesarios
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const validate = require("../utilities/inventory-validation"); // Importa las validaciones

// Rutas para detalles de inventario
router.get("/detail/:invId", invController.buildByInventoryId); // Muestra los detalles de un vehículo
router.get("/type/:classificationId", invController.buildByClassificationId); // Muestra vehículos por clasificación

// Ruta para la vista de gestión de inventario
router.get("/", invController.buildManagementView); // Página principal de gestión de inventario

// Rutas para agregar una clasificación
router.get("/add-classification", invController.buildAddClassification); // Muestra el formulario para agregar una clasificación
router.post(
  "/add-classification",
  validate.classificationRules(), // Aplica las reglas de validación
  validate.checkClassificationData, // Verifica los datos validados
  invController.addClassification // Lógica del controlador para agregar la clasificación
);

// Rutas para agregar un inventario
router.get("/add-inventory", invController.buildAddInventory); // Muestra el formulario para agregar un inventario
router.post(
  "/add-inventory",
  validate.inventoryRules(), // Aplica las reglas de validación
  validate.checkInventoryData, // Verifica los datos validados
  invController.addInventory // Lógica del controlador para agregar el inventario
);

module.exports = router;