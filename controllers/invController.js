const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data[0]?.classification_name || "Unknown Classification"; // Manejo de datos faltantes
    res.render("./inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
    });
  } catch (error) {
    console.error("Error building classification view:", error);
    res.status(500).render("500", { title: "Server Error" });
  }
};

/* ***************************
 *  Build inventory details view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = req.params.invId;
    const data = await invModel.getInventoryById(inv_id);
    const nav = await utilities.getNav();
    if (data) {
      res.render("./inventory/details", {
        title: `${data.inv_make} ${data.inv_model}`,
        nav,
        vehicle: data,
      });
    } else {
      res.status(404).render("404", { title: "Vehicle Not Found", nav });
    }
  } catch (error) {
    console.error("Error building inventory details view:", error);
    res.status(500).render("500", { title: "Server Error" });
  }
};

/* ***************************
 *  Add a new classification
 * ************************** */
invCont.addClassification = async (req, res) => {
  const { classification_name } = req.body;
  try {
    const result = await invModel.insertClassification(classification_name);
    const nav = await utilities.getNav(); // Actualiza el menú de navegación
    if (result.rowCount) {
      req.flash("success", "Classification added successfully.");
      res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        messages: req.flash(),
      });
    } else {
      req.flash("error", "Failed to add classification.");
      res.status(500).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        messages: req.flash(),
      });
    }
  } catch (error) {
    console.error("Error adding classification:", error);
    req.flash("error", "An error occurred while adding the classification.");
    const nav = await utilities.getNav();
    res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: req.flash(),
    });
  }
};

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagementView = async (req, res, next) => {
  try {
    const nav = await utilities.getNav(); // Obtén el menú de navegación
    const classificationSelect = await utilities.buildClassificationList()
    
    res.render("inventory/management", {
      title: "Inventory Management",
      nav, // Pasa el menú de navegación a la vista
      messages: req.flash(),
      classificationSelect,
    });
  } catch (error) {
    console.error("Error building management view:", error);
    res.status(500).render("500", { title: "Server Error" });
  }
};

/* ***************************
 *  Build add-classification view
 * ************************** */
invCont.buildAddClassification = async (req, res, next) => {
  try {
    const nav = await utilities.getNav(); // Obtén el menú de navegación
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null, // No hay errores por defecto
      messages: req.flash(),
    });
  } catch (error) {
    console.error("Error building add-classification view:", error);
    res.status(500).render("500", { title: "Server Error" });
  }
};

/* ***************************
 *  Build add-inventory view
 * ************************** */
invCont.buildAddInventory = async (req, res, next) => {
  try {
    const nav = await utilities.getNav(); // Obtén el menú de navegación
    const classificationList = await utilities.buildClassificationList(); // Construye la lista desplegable de clasificaciones
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav, // Pasa el menú de navegación a la vista
      classificationList, // Pasa la lista de clasificaciones a la vista
      errors: null, // No hay errores por defecto
      messages: req.flash(), // Mensajes flash
    });
  } catch (error) {
    console.error("Error building add-inventory view:", error);
    res.status(500).render("500", { title: "Server Error" });
  }
};

/* ***************************
 *  Add a new inventory item
 * ************************** */
invCont.addInventory = async (req, res) => {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body;

  try {
    console.log("Datos recibidos del formulario:", req.body); // Log para depuración

    const result = await invModel.insertInventoryItem({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });

    if (result.rowCount) {
      req.flash("success", "Inventory item added successfully.");
      res.redirect("/inv");
    } else {
      req.flash("error", "Failed to add inventory item.");
      const nav = await utilities.getNav();
      const classificationList = await utilities.buildClassificationList();
      res.status(500).render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        errors: null,
        messages: req.flash(),
      });
    }
  } catch (error) {
    console.error("Error al intentar agregar el inventario:", error);
    req.flash("error", "An error occurred while adding the inventory item.");
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
      messages: req.flash(),
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
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
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
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
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}


module.exports = invCont;