// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const errorController = require("../controllers/errorController") // Import the error controller

// Route to build inventory by classification view
router.get("/detail/:invId", invController.buildByInventoryId)
router.get("/type/:classificationId", invController.buildByClassificationId)

// Intentional error route
router.get("/trigger-error", errorController.triggerError)

module.exports = router