const Periode = require('../models/periodeModels');
const ApiResponse = require("../middleware/responseHandler");

exports.getAllPeriodes = async (req, res) => {
    try {
        const result = await Periode.getAll();
        ApiResponse.success(res, result);
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de la récupération des périodes");
    }
};

exports.addPeriode = async (req, res) => {
    try {
        const data = req.body;
        if (!data.nom || !data.heure_debut || !data.heure_fin) {
            return ApiResponse.error(res, "Champs obligatoires manquants", 400);
        }
        const result = await Periode.add(data);
        ApiResponse.success(res, { id_periode: result.insertId }, "Période ajoutée", 201);
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de l'ajout de la période");
    }
};

exports.updatePeriode = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        await Periode.update(id, data);
        ApiResponse.success(res, null, "Période mise à jour");
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de la mise à jour de la période");
    }
};

exports.deletePeriode = async (req, res) => {
    try {
        const { id } = req.params;
        await Periode.delete(id);
        ApiResponse.success(res, null, "Période supprimée");
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de la suppression de la période");
    }
};
