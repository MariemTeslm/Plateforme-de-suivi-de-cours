const EmploiSeance = require("../models/tableauxModels");
const ApiResponse = require("../middleware/responseHandler");

// Ajouter une séance par noms
exports.addSeance = async (req, res) => {
    try {
        const { nom_groupe, nom_professeur, nom_matiere, nom_salle, id_periode, jour, id_semaine, type_seance } = req.body;
        console.log(`[BACKEND] Tentative d'ajout séance - Groupe: ${nom_groupe}, Matière: ${nom_matiere}, Jour: ${jour}, Période: ${id_periode}, Semaine: ${id_semaine}, Type: ${type_seance}`);

        if (!nom_groupe || !nom_professeur || !nom_matiere || !nom_salle || !id_periode || !jour || !id_semaine || !type_seance) {
            console.warn("[BACKEND] Champs manquants dans la requête:", req.body);
            return ApiResponse.error(res, "Veuillez remplir tous les champs.", 400);
        }

        await EmploiSeance.createByNames({ nom_groupe, nom_professeur, nom_matiere, nom_salle, id_periode, jour, id_semaine, type_seance });
        ApiResponse.success(res, null, "Séance ajoutée avec succès !", 201);
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de l'ajout: " + err.message);
    }
};

// Récupérer toutes les séances avec noms
exports.getSeances = async (req, res) => {
    try {
        const { id_semaine } = req.query;
        const rows = await EmploiSeance.getAllWithNames(id_semaine);
        ApiResponse.success(res, Array.isArray(rows) ? rows : []);
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de la récupération");
    }
};

// Supprimer une séance
exports.deleteSeance = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await EmploiSeance.delete(id);
        if (result && result.affectedRows === 0) {
            return ApiResponse.error(res, "Séance non trouvée.", 404);
        }
        ApiResponse.success(res, null, "Séance supprimée avec succès !");
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur suppression");
    }
};

// Mettre à jour une séance par noms
exports.updateSeance = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        await EmploiSeance.updateByNames(id, data);
        ApiResponse.success(res, null, "Séance mise à jour avec succès !");
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur mise à jour");
    }
};
