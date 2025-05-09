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
    // Agregar Compare al final de todo
    list += '<li><a href="/compare" title="Compare Vehicles">Compare</a></li>';
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
// En utilities/index.js
utilities.errorHandler = (callback) => {
  return async (req, res, next) => {
    try {
      // Verificar que callback sea una función
      if (typeof callback !== 'function') {
        throw new Error('Error Handler requires a function as parameter');
      }
      await callback(req, res, next);
    } catch (err) {
      console.error("Error in errorHandler:", err.message);
      next(err);
    }
  };
};


utilities.handleErrors = async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).render("account/errors/error", {  // Cambiado para usar tu vista existente
    title: status,
    message,
    nav
  });
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

utilities.checkEmployeeOrAdmin = (req, res, next) => {
  if (res.locals.accountData.account_type === "Employee" || 
      res.locals.accountData.account_type === "Admin") {
    next()
  } else {
    req.flash("notice", "Access Denied. Employees and Admins only.")
    return res.redirect("/account/")
  }
}

/* ****************************************
 * Build Vehicle Comparison Grid
 **************************************** */
utilities.buildComparisonGrid = function(vehicle1, vehicle2) {
  try {
    let grid = '<div class="comparison-grid">';
    grid += '<table>';
    grid += '<tr><th>Features</th>';
    grid += `<th>${vehicle1.inv_make} ${vehicle1.inv_model}</th>`;
    grid += `<th>${vehicle2.inv_make} ${vehicle2.inv_model}</th></tr>`;
    
    // Año
    grid += '<tr><td>Year</td>';
    grid += `<td>${vehicle1.inv_year}</td>`;
    grid += `<td>${vehicle2.inv_year}</td></tr>`;
    
    // Precio
    grid += '<tr><td>Price</td>';
    grid += `<td>${utilities.formatPrice(vehicle1.inv_price)}</td>`;
    grid += `<td>${utilities.formatPrice(vehicle2.inv_price)}</td></tr>`;
    
    // Millas
    grid += '<tr><td>Miles</td>';
    grid += `<td>${new Intl.NumberFormat().format(vehicle1.inv_miles)}</td>`;
    grid += `<td>${new Intl.NumberFormat().format(vehicle2.inv_miles)}</td></tr>`;
    
    // Color
    grid += '<tr><td>Color</td>';
    grid += `<td>${vehicle1.inv_color}</td>`;
    grid += `<td>${vehicle2.inv_color}</td></tr>`;
    
    grid += '</table></div>';
    return grid;
  } catch (error) {
    console.error("Error in buildComparisonGrid:", error.message);
    throw error;
  }
};

utilities.getNav = async function () {
  try {
    const data = await invModel.getClassifications();
    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    // Agregar el nuevo enlace de comparación
    list += '<li><a href="/compare" title="Compare Vehicles">Compare Vehicles</a></li>';
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

module.exports = utilities;
