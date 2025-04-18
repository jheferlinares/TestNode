const utilities = require("../utilities/index");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 **************************************** */
const buildLogin = async (req, res, next) => {
  try {
    const nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
    });
  } catch (error) {
    next(error);
  }
};

/* ****************************************
 *  Deliver "My Account" page
 **************************************** */
const buildAccountPage = async (req, res, next) => {
  try {
    const nav = await utilities.getNav();
    res.render("account/myAccount", {
      title: "My Account",
      nav,
      account: res.locals.accountData
    });
  } catch (error) {
    next(error);
  }
};

/* ****************************************
 *  Deliver Registration Page
 **************************************** */
const buildRegister = async (req, res, next) => {
  try {
    const nav = await utilities.getNav();
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
};

const buildPasswordUpdate = async (req, res, next) => {
  try {
    const nav = await utilities.getNav();
    res.render("account/update-password", {
      title: "Update Password",
      nav,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};
/* ****************************************
 *  Process Registration
 **************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
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
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      const cookieOptions = {
        httpOnly: true,
        maxAge: 3600 * 1000,
        secure: process.env.NODE_ENV !== 'development'
      };
      res.cookie("jwt", accessToken, cookieOptions);
      return res.redirect("/account/");
    }
    
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  } catch (error) {
    next(new Error('Access Forbidden'));
  }
}

/* ****************************************
 *  Account Update Functions
 **************************************** */
async function buildAccountUpdate(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const accountId = res.locals.accountData.account_id;
    const accountData = await accountModel.getAccountById(accountId);
    
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id
    });
  } catch (error) {
    next(error);
  }
}

async function updateAccount(req, res, next) {
  try {
    const { account_firstname, account_lastname, account_email, account_id } = req.body;
    const result = await accountModel.updateAccount({
      account_firstname,
      account_lastname,
      account_email,
      account_id
    });

    if (result) {
      req.flash("success", "Account updated successfully");
      res.redirect("/account/");
    } else {
      req.flash("notice", "Error updating account");
      res.redirect("/account/update");
    }
  } catch (error) {
    next(error);
  }
}

async function updatePassword(req, res, next) {
  try {
    const { account_password, account_id } = req.body;
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const result = await accountModel.updatePassword(account_id, hashedPassword);

    if (result) {
      req.flash("success", "Password updated successfully");
      res.redirect("/account/");
    } else {
      req.flash("notice", "Error updating password");
      res.redirect("/account/update");
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  buildLogin,
  buildAccountPage,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountUpdate,
  updateAccount,
  updatePassword,
  buildPasswordUpdate,
};
