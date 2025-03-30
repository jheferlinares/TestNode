const utilities = require("../utilities/index") // Import utilities

/* ****************************************
 *  Deliver login view
 **************************************** */
const buildLogin = async (req, res, next) => {
  try {
    const nav = await utilities.getNav() // Get navigation
    res.render("account/login", {
      title: "Login",
      nav,
    })
  } catch (error) {
    next(error) // Pass the error to the error-handling middleware
  }
}

/* ****************************************
 *  Deliver "My Account" page
 **************************************** */
const buildAccountPage = async (req, res, next) => {
  try {
    const nav = await utilities.getNav() // Get navigation
    res.render("account/myAccount", {
      title: "My Account",
      nav,
    })
  } catch (error) {
    next(error) // Pass the error to the error-handling middleware
  }
}

module.exports = { buildLogin, buildAccountPage }