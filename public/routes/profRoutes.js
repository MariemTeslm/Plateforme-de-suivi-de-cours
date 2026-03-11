// backend/routes/teacher.routes.js
const express = require("express");
const router = express.Router();
const teacherCtrl = require("../controllers/profControllers");

// Ajouter un professeur
router.post("/add", teacherCtrl.addTeacher);

// Récupérer tous les professeurs
router.get("/all", teacherCtrl.getAllTeachers);

// Supprimer un professeur
router.delete("/delete/:id", teacherCtrl.deleteTeacher);

// Mettre à jour un professeur
router.put("/update/:id", teacherCtrl.updateTeacher);

module.exports = router;
