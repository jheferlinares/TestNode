const { body, validationResult } = require("express-validator");
const validate = {};
const accountModel = require("../models/account-model");

/* **********************************
 *  Registration Data Validation Rules
 ********************************** */
validate.registationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()

      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error("Email exists. Please log in or use a different email.");
        }
      }),

    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* ******************************
 * Login Data Validation Rules
 ****************************** */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ];
};

/* ******************************
 * Update Account Validation Rules
 ****************************** */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const emailExists = await accountModel.checkExistingEmail(account_email);
        // Permite mantener el mismo email si no se está cambiando
        if (emailExists && emailExists.account_id !== req.body.account_id) {
          throw new Error("Email already exists. Please use a different email.");
        }
      }),
  ];
};

/* ******************************
 * Check Registration Data
 ****************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await require("./index").getNav();
    res.render("account/register", {
      errors: errors.array(),
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/* ******************************
 * Check Login Data
 ****************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await require("./index").getNav();
    res.render("account/login", {
      errors: errors.array(),
      title: "Login",
      nav,
      account_email,
    });
    return;
  }
  next();
};

/* ******************************
 * Check Update Data
 ****************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await require("./index").getNav();
    res.render("account/update", {
      errors: errors.array(),
      title: "Update Account",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};


/* ******************************
 * Password Update Validation Rules
 ****************************** */
validate.updatePasswordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
    
    body("account_password2")
      .trim()
      .notEmpty()
      .withMessage("Please confirm your password")
      .custom((value, { req }) => {
        if (value !== req.body.account_password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
  ];
};

/* ******************************
 * Check Password Update Data
 ****************************** */
validate.checkPasswordData = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await require("./index").getNav();
    const account_id = req.body.account_id;
    const accountData = await accountModel.getAccountById(account_id);
    
    res.render("account/update", {
      errors: errors.array(),
      title: "Update Password",
      nav,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id
    });
    return;
  }
  next();
};

module.exports = validate;
