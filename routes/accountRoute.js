// Import required modules
const express = require("express")
const router = express.Router()
const accountController = require("../controllers/accountController") // Import account controller

// Route for login page
router.get("/login", accountController.buildLogin)

// Route for "My Account" page
router.get("/myAccount", accountController.buildAccountPage)

module.exports = router