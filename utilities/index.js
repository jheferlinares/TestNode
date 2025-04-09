const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Util = {}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const invModel = require("../models/inventory-model");
const utilities = {}; // Inicializa el objeto utilities

/* ************************
 * Constructs the nav HTML unordered list
 ************************ */
utilities.getNav = async function () {
  try {
    const data = await invModel.getClassifications(); // Obtiene las clasificaciones desde la base de datos
    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    data.rows.forEach((row) => {
      list += "<li>";
      list += `<a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a>`;
      list += "</li>";
    });
    list += "</ul>";
    return list; // Devuelve el HTML generado
  } catch (error) {
    console.error("Error in getNav:", error.message); // Log para depuración
    throw error; // Lanza el error para que sea manejado por el controlador
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
    return grid; // Devuelve el HTML generado
  } catch (error) {
    console.error("Error in buildClassificationGrid:", error.message); // Log para depuración
    throw error; // Lanza el error para que sea manejado por el controlador
  }
};

/* **************************************
 * Build the classification dropdown list
 ************************************** */
utilities.buildClassificationList = async function () {
  try {
    const data = await invModel.getClassifications(); // Obtén las clasificaciones desde la base de datos
    let classificationList = '<select name="classification_id" id="classificationList" required>';
    classificationList += "<option value=''>Choose a Classification</option>";
    data.rows.forEach((row) => {
      classificationList += `<option value="${row.classification_id}">${row.classification_name}</option>`;
    });
    classificationList += "</select>";
    return classificationList; // Devuelve el HTML generado
  } catch (error) {
    console.error("Error building classification list:", error.message); // Log para depuración
    throw error; // Lanza el error para que sea manejado por el controlador
  }
};

/* ************************
 * Error Handler Middleware
 ************************ */
utilities.errorHandler = (callback) => {
  return async (req, res, next) => {
    try {
      await callback(req, res, next); // Ejecuta la función callback
    } catch (err) {
      console.error("Error in errorHandler:", err.message); // Log para depuración
      next(err); // Pasa el error al middleware de manejo de errores
    }
  };
};

/* ****************************************
 * Middleware to check token validity
 **************************************** */
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
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

 /* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

module.exports = utilities, Util; // Exporta el objeto utilities