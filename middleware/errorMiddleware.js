const utilities = require("../utilities/index");

const errorHandler = async (err, req, res, next) => {
  let nav = await utilities.getNav();
  
  // Log el error con más detalles
  console.error(`Error en ${req.originalUrl}: ${err.message}`);
  console.error(err.stack);

  // Determinar el estado y mensaje del error
  const status = err.status || 500;
  let message = err.message;
  let title = 'Server Error';

  // Personalizar mensaje según el tipo de error
  if (status === 404) {
    title = '404 Not Found';
    message = message || 'Sorry, the page you requested could not be found.';
  } else if (status === 500) {
    message = message || 'Internal Server Error. Please try again later.';
  } else if (status === 403) {
    title = 'Access Forbidden';
    message = message || 'You do not have permission to access this resource.';
  }

  // Renderizar la vista de error
  res.status(status).render("errors/error", {
    title,
    message,
    nav,
    status
  });
};

module.exports = errorHandler;
