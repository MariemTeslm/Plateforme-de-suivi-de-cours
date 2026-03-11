const Semaine = require('../models/semaineModels');
const ApiResponse = require('../middleware/responseHandler');

exports.getAllWeeks = async (req, res) => {
    try {
        const weeks = await Semaine.getAll();
        ApiResponse.success(res, weeks);
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de la récupération des semaines");
    }
};

exports.getActiveWeek = async (req, res) => {
    try {
        const week = await Semaine.getActive();
        ApiResponse.success(res, week);
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de la récupération de la semaine active");
    }
};

exports.addWeek = async (req, res) => {
    try {
        const result = await Semaine.add(req.body);
        ApiResponse.success(res, { id: result.insertId }, "Semaine ajoutée avec succès", 201);
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de l'ajout de la semaine");
    }
};

exports.activateWeek = async (req, res) => {
    try {
        const { id } = req.params;
        await Semaine.activate(id);
        ApiResponse.success(res, null, "Semaine activée avec succès");
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de l'activation de la semaine");
    }
};

exports.deleteWeek = async (req, res) => {
    try {
        const { id } = req.params;
        await Semaine.delete(id);
        ApiResponse.success(res, null, "Semaine supprimée avec succès");
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de la suppression de la semaine");
    }
};
