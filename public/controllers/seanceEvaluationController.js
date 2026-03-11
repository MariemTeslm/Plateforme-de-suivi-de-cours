const SeanceEvaluation = require('../models/seanceEvaluationModel');
const ApiResponse = require('../middleware/responseHandler');

// Middleware pour vérifier si l'étudiant est chef de classe
exports.checkIsChef = async (req, res, next) => {
    try {
        const id_etudiant = req.params.id_etudiant || req.body.evaluee_par;
        
        if (!id_etudiant) {
            return ApiResponse.error(res, "ID étudiant manquant", 400);
        }
        
        const groupe = await SeanceEvaluation.isChefDeClasse(id_etudiant);
        
        if (!groupe) {
            return ApiResponse.error(res, "Accès réservé aux chefs de classe uniquement", 403);
        }
        
        req.id_groupe = groupe.id_groupe;
        req.nom_groupe = groupe.nom;
        next();
    } catch (error) {
        console.error("Erreur vérification chef:", error);
        ApiResponse.error(res, "Erreur lors de la vérification des droits", 500);
    }
};

// Récupérer les séances de la semaine active pour un groupe
exports.getSeancesOfWeek = async (req, res) => {
    try {
        const id_groupe = req.id_groupe; // Défini par le middleware checkIsChef
        
        const seances = await SeanceEvaluation.getSeancesForWeek(id_groupe);
        const stats = await SeanceEvaluation.getStatistics(id_groupe);
        
        ApiResponse.success(res, { 
            seances, 
            stats,
            nom_groupe: req.nom_groupe 
        });
    } catch (error) {
        console.error("Erreur getSeancesOfWeek:", error);
        ApiResponse.error(res, "Erreur lors de la récupération des séances", 500);
    }
};

// Soumettre une évaluation de séance
exports.submitEvaluation = async (req, res) => {
    try {
        const { id_seance, status, commentaire } = req.body;
        const evaluee_par = req.body.evaluee_par;
        const id_groupe = req.id_groupe;
        
        // Validation
        if (!id_seance || !status) {
            return ApiResponse.error(res, "Données manquantes (id_seance, status)", 400);
        }
        
        if (!['effectuee', 'ratee'].includes(status)) {
            return ApiResponse.error(res, "Status invalide (effectuee ou ratee)", 400);
        }
        
        // Sécuriser les données côté serveur: type/code viennent de la séance en base
        const seance = await SeanceEvaluation.getSeanceByIdAndGroup(id_seance, id_groupe);
        if (!seance) {
            return ApiResponse.error(res, "Séance introuvable pour ce groupe", 404);
        }

        const code_matiere = seance.code_matiere;
        const type_seance = seance.type_seance || 'CM';

        if (!['CM', 'TD', 'TP'].includes(type_seance)) {
            return ApiResponse.error(res, "Type de séance invalide dans la base (CM, TD ou TP)", 400);
        }
        
        const data = {
            id_seance,
            id_groupe,
            code_matiere,
            type_seance,
            status,
            evaluee_par,
            commentaire: commentaire || null
        };
        
        const result = await SeanceEvaluation.evaluateSeance(data);
        
        ApiResponse.success(res, result, `Séance marquée comme ${status === 'effectuee' ? 'effectuée' : 'ratée'}`);
    } catch (error) {
        console.error("Erreur submitEvaluation:", error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return ApiResponse.error(res, "Cette séance a déjà été évaluée", 400);
        }
        
        ApiResponse.error(res, error.message || "Erreur lors de l'évaluation de la séance", 500);
    }
};

// Récupérer les statistiques d'un groupe
exports.getStatistics = async (req, res) => {
    try {
        const id_groupe = req.id_groupe;
        const stats = await SeanceEvaluation.getStatistics(id_groupe);
        
        ApiResponse.success(res, stats);
    } catch (error) {
        console.error("Erreur getStatistics:", error);
        ApiResponse.error(res, "Erreur lors de la récupération des statistiques", 500);
    }
};

// Récupérer l'historique des évaluations
exports.getEvaluationHistory = async (req, res) => {
    try {
        const id_groupe = req.id_groupe;
        const limit = parseInt(req.query.limit) || 50;
        
        const history = await SeanceEvaluation.getEvaluationHistory(id_groupe, limit);
        
        ApiResponse.success(res, history);
    } catch (error) {
        console.error("Erreur getEvaluationHistory:", error);
        ApiResponse.error(res, "Erreur lors de la récupération de l'historique", 500);
    }
};
