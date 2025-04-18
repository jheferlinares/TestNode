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
      errors: null,
      messages: req.flash(),
    });
  } catch (error) {
    next(error);
  }
};

/* ****************************************
 *  Deliver "My Account" page
 **************************************** */
/* ****************************************
*  Deliver login view
* *************************************** */
async function buildAccountPage(req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("account/myAccount", {
      title: "Account Management",
      nav,
      account: res.locals.accountData,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}



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
  const { 
    account_firstname, 
    account_lastname, 
    account_email, 
    account_password,
    account_type  // Añadido para capturar el tipo de cuenta
  } = req.body;

  // Log para depuración
  console.log("Datos del formulario recibidos:", {
    account_firstname,
    account_lastname,
    account_email,
    account_type
  });

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword,
      account_type || 'Client' // Valor por defecto si no se especifica
    );

    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you're registered as ${account_type || 'Client'}, ${account_firstname}. Please log in.`
      );
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        messages: req.flash()
      });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
        messages: req.flash()
      });
    }
  } catch (error) {
    console.error("Error during registration:", error);
    req.flash("error", "Registration failed. Please try again.");
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: [{ msg: "Registration failed. Please try again." }],
      messages: req.flash()
    });
  }
}


/* ****************************************
 *  Process login request
 * ************************************ */
/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res, next) { // Añadido next como parámetro
  try {
    let nav = await utilities.getNav();
    const { account_email, account_password } = req.body;
    const accountData = await accountModel.getAccountByEmail(account_email);
    
    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", { // Corregido el path de la vista
        title: "Login",
        nav,
        errors: null,
        messages: req.flash(),
        account_email,
      });
      return;
    }
    
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
    res.status(400).render("account/login", { // Corregido el path de la vista
      title: "Login",
      nav,
      errors: null,
      messages: req.flash(),
      account_email,
    });
  } catch (error) {
    next(error); // Pasamos el error actual en lugar de crear uno nuevo
  }
}


/* ****************************************
 *  Account Update Functions
 **************************************** */
// En controllers/accountController.js

async function buildAccountUpdate(req, res, next) {
  try {
    let nav = await utilities.getNav();
    
    // Obtener el account_id del token JWT almacenado en res.locals
    const account_id = res.locals.accountData.account_id;
    
    // Verificar que account_id sea válido
    if (!account_id) {
      throw new Error("Invalid account ID");
    }

    const accountData = await accountModel.getAccountById(account_id);
    
    if (!accountData) {
      throw new Error("Account not found");
    }

    res.render("account/update", {
      title: "Edit Account Information",
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



async function updateAccountInfo(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const { 
      account_firstname, 
      account_lastname, 
      account_email,
      account_id 
    } = req.body;

    // Validar que account_id sea un número
    const parsedId = parseInt(account_id);
    if (isNaN(parsedId)) {
      throw new Error("Invalid account ID");
    }

    const result = await accountModel.updateAccount(
      parsedId,
      account_firstname,
      account_lastname,
      account_email
    );

    if (result) {
      req.flash("success", `Congratulations, ${account_firstname}! Your account was successfully updated.`);
      res.redirect("/account/");
    } else {
      req.flash("notice", "Error updating account");
      res.status(501).render("account/update", {
        title: "Edit Account",
        nav,
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
        account_id
      });
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

async function logoutAccount(req, res, next) {
  try {
    res.clearCookie("jwt");
    res.clearCookie("connect.sid");
    await new Promise((resolve, reject) => {
      req.session.destroy((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
    
    return res.redirect("/");  // Cambia esto para redirigir directamente
  } catch (error) {
    req.flash("notice", "Error during logout");
    return res.redirect("/");  // En caso de error, también redirige a home
  }
}


module.exports = {
  buildLogin,
  buildAccountPage,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountUpdate,
  updateAccountInfo,
  updatePassword,
  buildPasswordUpdate,
  logoutAccount,
};
