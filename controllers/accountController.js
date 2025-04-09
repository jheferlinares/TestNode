const utilities = require("../utilities/index"); // Import utilities
const accountModel = require("../models/account-model"); // Import account model
const jwt = require("jsonwebtoken"); // Import JWT
const bcrypt = require("bcryptjs"); // Import bcrypt for password comparison
require("dotenv").config(); // Load environment variables

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
 **************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  try {
    // Hash the password before saving it to the database
    // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult) {
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
    console.error("Error during registration:", error);
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: [{ msg: "An unexpected error occurred. Please try again later." }],
    });
  }
}

/* ****************************************
 *  Process login request
 **************************************** */
/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}


module.exports = { buildLogin, buildAccountPage, buildRegister, registerAccount, accountLogin };