const express = require("express");
const router = express.Router();
const salleController = require("../controllers/salleControllers");

// Ajouter une salle
router.post("/add", salleController.addSalle);

// Récupérer toutes les salles
router.get("/all", salleController.getSalles);

// Supprimer une salle
router.delete("/delete/:id", salleController.deleteSalle);

// Mettre à jour une salle
router.put("/update/:id", salleController.updateSalle);

module.exports = router;
