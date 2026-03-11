const Salle = require("../models/salleModels");
const ApiResponse = require("../middleware/responseHandler");

exports.addSalle = async (req, res) => {
    try {
        const { nom, capacite } = req.body;
        if (!nom || !capacite) {
            return ApiResponse.error(res, "Veuillez remplir tous les champs.", 400);
        }
        const result = await Salle.create({ nom, capacite });
        ApiResponse.success(res, { id_salle: result.insertId }, "Salle ajoutée avec succès !", 201);
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de l'ajout de la salle");
    }
};

exports.getSalles = async (req, res) => {
    try {
        const rows = await Salle.getAll();
        ApiResponse.success(res, rows);
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de la récupération des salles");
    }
};

exports.deleteSalle = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Salle.delete(id);
        if (result.affectedRows === 0) {
            return ApiResponse.error(res, "Salle non trouvée.", 404);
        }
        ApiResponse.success(res, null, "Salle supprimée avec succès !");
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de la suppression de la salle");
    }
};

exports.updateSalle = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, capacite } = req.body;
        await Salle.update(id, { nom, capacite });
        ApiResponse.success(res, null, "Salle mise à jour avec succès !");
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de la mise à jour de la salle");
    }
};
