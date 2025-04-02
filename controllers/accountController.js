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
      errors: null,
    });
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
};

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}



module.exports = { buildLogin, buildAccountPage, buildRegister, registerAccount };