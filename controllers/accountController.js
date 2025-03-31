const utilities = require("../utilities/index"); // Import utilities
const accountModel = require("../models/account-model"); // Import account model

/* ****************************************
 *  Deliver login view
 **************************************** */
const buildLogin = async (req, res, next) => {
  try {
    const nav = await utilities.getNav(); // Get navigation
    res.render("account/login", {
      title: "Login",
      nav,
    });
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
};

/* ****************************************
 *  Deliver "My Account" page
 **************************************** */
const buildAccountPage = async (req, res, next) => {
  try {
    const nav = await utilities.getNav(); // Get navigation
    res.render("account/myAccount", {
      title: "My Account",
      nav,
    });
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
};

/* ****************************************
 *  Deliver Registration Page
 **************************************** */
const buildRegister = async (req, res, next) => {
  try {
    const nav = await utilities.getNav(); // Get navigation
    res.render("account/register", {
      title: "Register",
      nav,
    });
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
};

/* ****************************************
 *  Process Registration
 **************************************** */
const registerAccount = async (req, res, next) => {
  try {
    const nav = await utilities.getNav(); // Get navigation
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    console.log("Form Data Received:", req.body); // Debugging log

    // Call the model function to register the account
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_password
    );

    console.log("Database Result:", regResult); // Debugging log

    if (regResult.rowCount) {
      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      );
      res.status(201).render("account/login", {
        title: "Login",
        nav,
      });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
      });
    }
  } catch (error) {
    console.error("Error in registerAccount:", error); // Debugging log
    next(error); // Pass the error to the error-handling middleware
  }
};

module.exports = { buildLogin, buildAccountPage, buildRegister, registerAccount };