// Import required modules
const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController"); // Import account controller
const utilities = require("../utilities/index"); // Import utilities
const regValidate = require('../utilities/account-validation')

// Route for login page
router.get("/login", utilities.errorHandler(accountController.buildLogin));

// Route for "My Account" page
router.get("/myAccount", utilities.errorHandler(accountController.buildAccountPage));

// Route for registration page
router.get("/register", utilities.errorHandler(accountController.buildRegister));

// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.errorHandler(accountController.registerAccount)
  )

  

module.exports = router;