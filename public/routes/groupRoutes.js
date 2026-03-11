// backend/routes/groupRoutes.js
const express = require("express");
const router = express.Router();
const groupCtrl = require("../controllers/groupControllers");

// Gestion des groupes
router.post("/add", groupCtrl.addOrUpdateGroupWithStudents);
router.put("/update/:id", groupCtrl.addOrUpdateGroupWithStudents);
router.get("/all", groupCtrl.getAllGroups);
router.delete("/delete/:id", groupCtrl.deleteGroup);

// Gestion des étudiants
router.get("/students/without-group", groupCtrl.getStudentsWithoutGroup);
router.get("/students/with-group", groupCtrl.getStudentsWithGroup);

module.exports = router;