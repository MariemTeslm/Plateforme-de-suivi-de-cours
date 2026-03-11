const express = require("express");
const router = express.Router();
const emploiSeanceCtrl = require("../controllers/tableauxControllers");

// Ajouter une séance par noms
router.post("/add", emploiSeanceCtrl.addSeance);

// Récupérer toutes les séances avec noms
router.get("/all", emploiSeanceCtrl.getSeances);

// Supprimer une séance
router.delete("/delete/:id", emploiSeanceCtrl.deleteSeance);

// Mettre à jour une séance par noms
router.put("/update/:id", emploiSeanceCtrl.updateSeance);

module.exports = router;
