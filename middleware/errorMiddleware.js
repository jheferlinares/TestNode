const utilities = require("../utilities/index") // Import utilities (adjust path if needed)

const errorHandler = async (err, req, res, next) => {
  console.error(err.stack) // Log the error stack
  const nav = await utilities.getNav() // Get navigation for the error view
  res.status(err.status || 500).render("error", {
    title: err.status === 404 ? "404" : "Server Error",
    message: err.message || "Something went wrong.",
    nav,
  })
}

module.exports = errorHandler