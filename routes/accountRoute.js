// Import required modules
const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController"); // Import account controller
const utilities = require("../utilities/index"); // Import utilities
const regValidate = require("../utilities/account-validation"); // Import validation rules



// Route for login page
router.get("/login", utilities.errorHandler(accountController.buildLogin));

// Route for "My Account" page
router.get("/myAccount", utilities.errorHandler(accountController.buildAccountPage));

router.get("/", utilities.errorHandler(accountController.buildAccountPage));
// Route for registration page
router.get("/register", utilities.errorHandler(accountController.buildRegister));

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.errorHandler(accountController.registerAccount)
);

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.errorHandler(accountController.accountLogin)
);

// Process the login attempt
router.post(
  "/login",
  (req, res) => {
    res.status(200).send('login process')
  }
)


module.exports = router;