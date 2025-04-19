const utilities = require("../utilities/");
const invModel = require("../models/inventory-model");

/* ****************************************
 *  Deliver compare view
 **************************************** */
async function buildComparePage(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const vehicles = await invModel.getInventory();
    
    res.render("./compare/compare", {
      title: "Compare Vehicles",
      nav,
      vehicles,
      errors: null
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Process comparison
 **************************************** */
async function processComparison(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const { vehicle1_id, vehicle2_id } = req.query;

    if (vehicle1_id === vehicle2_id) {
      req.flash("notice", "Please select two different vehicles to compare");
      return res.redirect("/compare");
    }

    const vehicle1 = await invModel.getInventoryById(vehicle1_id);
    const vehicle2 = await invModel.getInventoryById(vehicle2_id);

    if (!vehicle1 || !vehicle2) {
      req.flash("notice", "One or both vehicles not found");
      return res.redirect("/compare");
    }

    res.render("./compare/results", {
      title: "Comparison Results",
      nav,
      vehicle1,
      vehicle2,
      errors: null
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  buildComparePage,
  processComparison
};


