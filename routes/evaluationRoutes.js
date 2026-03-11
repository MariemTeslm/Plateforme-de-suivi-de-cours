const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');

// Séances de l’étudiant connecté (semaine active)
router.get('/seances/groupe/:id_etudiant', evaluationController.getSeances);

// Mettre à jour une séance
router.put('/seances/:id_seance', evaluationController.updateSeance);

module.exports = router;