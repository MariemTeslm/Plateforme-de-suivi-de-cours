const express = require("express");
const router = express.Router();
const studentCtrl = require("../controllers/studentControllers");

// Ajouter un étudiant
router.post("/add", studentCtrl.createStudent);

// Récupérer tous les étudiants
router.get("/all", studentCtrl.getAllStudents);

// Supprimer un étudiant
router.delete("/delete/:id", studentCtrl.deleteStudent);

// Mettre à jour un étudiant
router.put("/update/:id", studentCtrl.updateStudent);

// Récupérer les groupes d'un étudiant
router.get("/groups/:id", studentCtrl.getStudentGroups);

module.exports = router;
