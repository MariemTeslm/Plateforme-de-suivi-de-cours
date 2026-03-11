const express = require('express');
const router = express.Router();
const seanceController = require('../controllers/seanceController');

// Charger les données du formulaire
router.get('/seance-data', seanceController.getSeanceData);

// Ajouter une séance
router.post('/seance', seanceController.addSeance);

// Mettre à jour une séance
router.put('/seance/:id', seanceController.updateSeance);

module.exports = router;