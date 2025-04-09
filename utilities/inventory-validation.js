const { body, validationResult } = require("express-validator");
const utilities = require("../utilities"); // Importa el módulo utilities

const validate = {};

// Reglas de validación para agregar un inventario
validate.inventoryRules = () => {
  return [
    body("classification_id")
      .isNumeric()
      .withMessage("Classification ID must be a number.")
      .notEmpty()
      .withMessage("Classification ID is required."),
    body("inv_make")
      .isAlphanumeric()
      .withMessage("Make must contain only letters and numbers.")
      .notEmpty()
      .withMessage("Make is required."),
    body("inv_model")
      .isAlphanumeric()
      .withMessage("Model must contain only letters and numbers.")
      .notEmpty()
      .withMessage("Model is required."),
    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number.")
      .notEmpty()
      .withMessage("Price is required."),
    body("inv_color")
      .isAlpha()
      .withMessage("Color must contain only letters.")
      .notEmpty()
      .withMessage("Color is required."),
    body("inv_miles")
      .isNumeric()
      .withMessage("Miles must be a number.")
      .notEmpty()
      .withMessage("Miles are required."),
    body("inv_description")
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters long.")
      .notEmpty()
      .withMessage("Description is required."),
  ];
};

// Middleware para verificar errores de validación
validate.checkInventoryData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      try {
        const nav = await utilities.getNav(); // Obtén el menú de navegación
        const classificationList = await utilities.buildClassificationList(); // Construye la lista desplegable de clasificaciones
        return res.status(400).render("inventory/add-inventory", {
          title: "Add Inventory",
          nav, // Pasa el menú de navegación a la vista
          classificationList, // Pasa la lista de clasificaciones a la vista
          errors, // Pasa los errores de validación
          messages: req.flash(), // Mensajes flash
        });
      } catch (error) {
        console.error("Error in checkInventoryData middleware:", error);
        res.status(500).render("500", { title: "Server Error" });
      }
    }
    next();
  };

// Reglas de validación para agregar una clasificación
validate.classificationRules = () => {
  return [
    body("classification_name")
      .isAlphanumeric()
      .withMessage("Classification name must contain only letters and numbers.")
      .notEmpty()
      .withMessage("Classification name is required."),
  ];
};

// Middleware para verificar errores de validación
validate.checkClassificationData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("inventory/add-classification", {
      title: "Add Classification",
      errors, // Pasa el objeto completo de errores
      messages: req.flash(),
    });
  }
  next();
};

/* ******************************
 * Check data and return errors for Update Inventory
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  } = req.body

  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    res.render("inventory/edit-inventory", {
      title: "Edit " + inv_make + " " + inv_model,
      nav,
      errors,
      classificationSelect,
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    })
    return
  }
  next()
}


module.exports = validate;