const express = require("express")
const router = express.Router()
const errorController = require("../controllers/errorController") // Import the error controller

// Intentional error route
router.get("/trigger-error", errorController.triggerError)

module.exports = router