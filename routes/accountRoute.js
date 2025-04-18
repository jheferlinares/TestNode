const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const regValidate = require("../utilities/account-validation");

// Ruta para mostrar la página de login
router.get("/login", utilities.errorHandler(accountController.buildLogin));

// Ruta para mostrar la página de gestión de cuenta
router.get("/", 
  utilities.checkLogin, 
  utilities.errorHandler(accountController.buildAccountPage)
);

// Ruta para mostrar la página de registro
router.get("/register", utilities.errorHandler(accountController.buildRegister));

// Ruta para procesar el registro
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.errorHandler(accountController.registerAccount)
);

// Ruta para procesar el login
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.errorHandler(accountController.accountLogin)
);

// Ruta para mostrar el formulario de actualización
router.get(
  "/update",
  utilities.checkLogin,
  utilities.errorHandler(accountController.buildAccountUpdate)
);

// Ruta para mostrar el formulario de actualización de contraseña
router.get(
  "/update/password",
  utilities.checkLogin,
  utilities.errorHandler(accountController.buildPasswordUpdate)
);

// Ruta para procesar la actualización de la cuenta
router.post(
  "/update",
  utilities.checkLogin,
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.errorHandler(accountController.updateAccountInfo)  // Cambiado de updateAccount a updateAccountInfo
);

// Ruta para procesar la actualización de la contraseña
router.post(
  "/update/password",
  utilities.checkLogin,
  regValidate.updatePasswordRules(),
  regValidate.checkPasswordData,
  utilities.errorHandler(accountController.updatePassword)
);

// Ruta para procesar el logout
router.get(
  "/logout", 
  utilities.errorHandler(accountController.logoutAccount)
);

// Ruta para el manejo de errores específicos de la cuenta
router.use(async (err, req, res, next) => {
  try {
    let nav = await utilities.getNav();
    console.error(`Error en la ruta de cuenta: ${err.message}`);
    res.status(err.status || 500).render("account/error", {
      title: err.status === 404 ? "Página no encontrada" : "Error",
      message: err.message,
      nav,
      errors: null  // Añadido para evitar errores en la vista
    });
  } catch (error) {
    console.error("Error en el manejador de errores:", error);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;




