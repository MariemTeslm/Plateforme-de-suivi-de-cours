const Matiere = require("../models/matiereModels");
const ApiResponse = require("../middlewares/responseHandler");

exports.addMatiere = async (req, res) => {
    try {
        const result = await Matiere.create(req.body);
        ApiResponse.success(res, { id: result.insertId }, "Matière ajoutée avec succès", 201);
    } catch (err) {
        ApiResponse.error(res, err.message);
    }
};

exports.getAllMatieres = async (req, res) => {
    try {
        const matieres = await Matiere.getAll();
        ApiResponse.success(res, matieres);
    } catch (err) {
        ApiResponse.error(res, err.message);
    }
};

exports.updateMatiere = async (req, res) => {
    try {
        await Matiere.update(req.params.id, req.body);
        ApiResponse.success(res, null, "Matière mise à jour avec succès");
    } catch (err) {
        ApiResponse.error(res, err.message);
    }
};

exports.deleteMatiere = async (req, res) => {
    try {
        await Matiere.delete(req.params.id);
        ApiResponse.success(res, null, "Matière supprimée");
    } catch (err) {
        ApiResponse.error(res, err.message);
    }
};