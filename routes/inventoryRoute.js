// Importa los módulos necesarios
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const validate = require("../utilities/inventory-validation");
const utilities = require("../utilities/")

router.get("/detail/:invId", invController.buildByInventoryId);
router.get("/type/:classificationId", invController.buildByClassificationId); 

router.get("/", invController.buildManagementView); 

router.get("/add-classification", invController.buildAddClassification); 
router.post(
  "/add-classification",
  validate.classificationRules(),  
  validate.checkClassificationData, 
  invController.addClassification 
);

router.get("/add-inventory", invController.buildAddInventory); o
router.post(
  "/add-inventory",
  validate.inventoryRules(), 
  validate.checkInventoryData,
  invController.addInventory
);

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

router.get("/edit/:inv_id", invController.editInventoryView, utilities.handleErrors(invController.editInventoryView))


router.post("/update/",
  validate.newInventoryRules(),
  validate.checkUpdateData,
  invController.updateInventory
)

module.exports = router;