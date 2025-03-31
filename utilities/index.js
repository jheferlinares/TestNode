const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const invModel = require("../models/inventory-model");
const utilities = {}; // Initialize the utilities object

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
      list +=
        '<a href="/inv/type/' +
        row.classification_id +
        '" title="See our inventory of ' +
        row.classification_name +
        ' vehicles">' +
        row.classification_name +
        "</a>";
      list += "</li>";
    });
    list += "</ul>";
    return list;
  } catch (error) {
    console.error("Error in getNav:", error.message); // Debugging log
    throw error; // Re-throw the error to be handled by the caller
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
        grid +=
          '<a href="/inv/detail/' +
          vehicle.inv_id +
          '" title="View ' +
          vehicle.inv_make +
          " " +
          vehicle.inv_model +
          ' details"><img src="' +
          vehicle.inv_thumbnail +
          '" alt="Image of ' +
          vehicle.inv_make +
          " " +
          vehicle.inv_model +
          ' on CSE Motors" /></a>';
        grid += '<div class="namePrice">';
        grid += "<hr />";
        grid += "<h2>";
        grid +=
          '<a href="/inv/detail/' +
          vehicle.inv_id +
          '" title="View ' +
          vehicle.inv_make +
          " " +
          vehicle.inv_model +
          ' details">' +
          vehicle.inv_make +
          " " +
          vehicle.inv_model +
          "</a>";
        grid += "</h2>";
        grid +=
          "<span>$" +
          new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
          "</span>";
        grid += "</div>";
        grid += "</li>";
      });
      grid += "</ul>";
    } else {
      grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
    }
    return grid;
  } catch (error) {
    console.error("Error in buildClassificationGrid:", error.message); // Debugging log
    throw error; // Re-throw the error to be handled by the caller
  }
};

/* ************************
 * Error Handler Middleware
 ************************ */
utilities.errorHandler = (callback) => {
  return async (req, res, next) => {
    try {
      await callback(req, res, next); // Execute the callback function
    } catch (err) {
      console.error("Error in errorHandler:", err.message); // Debugging log
      next(err); // Pass the error to the error-handling middleware
    }
  };
};

module.exports = utilities; // Export the utilities object