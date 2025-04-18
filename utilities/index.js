const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const invModel = require("../models/inventory-model");
const utilities = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************ */
utilities.getNav = async function () {
  try {
    const data = await invModel.getClassifications();
    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    data.rows.forEach((row) => {
      list += "<li>";
      list += `<a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a>`;
      list += "</li>";
    });
    list += "</ul>";
    return list;
  } catch (error) {
    console.error("Error in getNav:", error.message);
    throw error;
  }
};

/* **************************************
 * Build the classification view HTML
 ************************************** */
utilities.buildClassificationGrid = async function (data) {
  try {
    let grid;
    if (data.length > 0) {
      grid = '<ul id="inv-display">';
      data.forEach((vehicle) => {
        grid += "<li>";
        grid += `<a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                  <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
                </a>`;
        grid += '<div class="namePrice">';
        grid += "<hr />";
        grid += `<h2>
                  <a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                    ${vehicle.inv_make} ${vehicle.inv_model}
                  </a>
                </h2>`;
        grid += `<span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>`;
        grid += "</div>";
        grid += "</li>";
      });
      grid += "</ul>";
    } else {
      grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
    }
    return grid;
  } catch (error) {
    console.error("Error in buildClassificationGrid:", error.message);
    throw error;
  }
};

/* **************************************
 * Build the classification dropdown list
 ************************************** */
utilities.buildClassificationList = async function () {
  try {
    const data = await invModel.getClassifications();
    let classificationList = '<select name="classification_id" id="classificationList" required>';
    classificationList += "<option value=''>Choose a Classification</option>";
    data.rows.forEach((row) => {
      classificationList += `<option value="${row.classification_id}">${row.classification_name}</option>`;
    });
    classificationList += "</select>";
    return classificationList;
  } catch (error) {
    console.error("Error building classification list:", error.message);
    throw error;
  }
};

/* ************************
 * Error Handler Middleware
 ************************ */
utilities.errorHandler = (callback) => {
  return async (req, res, next) => {
    try {
      await callback(req, res, next);
    } catch (err) {
      console.error("Error in errorHandler:", err.message);
      next(err);
    }
  };
};

/* ****************************************
 * Middleware to check token validity
 **************************************** */
utilities.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedIn = 1
        res.locals.firstName = accountData.account_firstname
        res.locals.accountType = accountData.account_type
        next()
      })
  } else {
    next()
  }
}

/* ****************************************
 * Check Login
 **************************************** */
utilities.checkLogin = (req, res, next) => {
  if (res.locals.loggedIn) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/login")
  }
}

/* ****************************************
 * Check Account Type
 **************************************** */
utilities.checkAccountType = (req, res, next) => {
  if (res.locals.accountType === "Employee" || res.locals.accountType === "Admin") {
    next()
  } else {
    req.flash("notice", "Unauthorized access")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 * Unit Price Formatter
 **************************************** */
utilities.formatPrice = (price) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(price)
}

module.exports = utilities;
