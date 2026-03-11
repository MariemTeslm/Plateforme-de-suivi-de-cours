const express = require("express");
const router = express.Router();
const adminCtrl = require("../controllers/adminControllers");

router.get("/all", adminCtrl.getAllAdmins);
router.post("/add", adminCtrl.addAdmin);
router.put("/update/:id", adminCtrl.updateAdmin);
router.delete("/delete/:id", adminCtrl.deleteAdmin);

module.exports = router;
