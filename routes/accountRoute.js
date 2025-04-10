// Importar módulos necesarios
const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController"); // Controlador de cuentas
const utilities = require("../utilities/index"); // Utilidades
const regValidate = require("../utilities/account-validation"); // Validaciones

router.get("/login", utilities.errorHandler(accountController.buildLogin));

router.get("/myAccount", utilities.errorHandler(accountController.buildAccountPage));

router.get("/", utilities.errorHandler(accountController.buildAccountPage));

router.get("/register", utilities.errorHandler(accountController.buildRegister));

router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.errorHandler(accountController.registerAccount)
);

router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.errorHandler(accountController.accountLogin)
);

router.post("/login", (req, res) => {
  res.status(200).send('login process');
});

router.get('/update', (req, res) => {
  res.render('account/update-account', {
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    accountId: req.user.accountId,
    errors: req.flash('errors'),
  });
});


router.post('/update-password', updatePassword);

router.get('/update', accountController.showAccountUpdateForm);

router.post('/update', accountController.updateAccountInfo);

router.post('/update-password', accountController.updatePassword);

module.exports = router;
