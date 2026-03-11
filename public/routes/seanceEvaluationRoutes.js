const express = require("express");
const router = express.Router();
const seanceEvaluationController = require("../controllers/seanceEvaluationController");

// Récupérer les séances de la semaine active pour un chef de classe
router.get(
    "/semaine/:id_etudiant",
    seanceEvaluationController.checkIsChef,
    seanceEvaluationController.getSeancesOfWeek
);

// Soumettre une évaluation de séance
router.post(
    "/evaluer",
    seanceEvaluationController.checkIsChef,
    seanceEvaluationController.submitEvaluation
);

// Récupérer les statistiques
router.get(
    "/stats/:id_etudiant",
    seanceEvaluationController.checkIsChef,
    seanceEvaluationController.getStatistics
);

// Récupérer l'historique des évaluations
router.get(
    "/history/:id_etudiant",
    seanceEvaluationController.checkIsChef,
    seanceEvaluationController.getEvaluationHistory
);

module.exports = router;
