const Teacher = require("../models/profModels");
const ApiResponse = require("../middleware/responseHandler");

exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.getAll();
        ApiResponse.success(res, teachers);
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de la récupération des professeurs");
    }
};

exports.addTeacher = async (req, res) => {
    try {
        const data = req.body;
        if (!data.nom || !data.email || !data.mot_de_passe) {
            return ApiResponse.error(res, "Champs obligatoires manquants", 400);
        }
        const result = await Teacher.create(data);
        ApiResponse.success(res, { id_professeur: result.insertId }, "Professeur ajouté avec succès", 201);
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de l'ajout du professeur");
    }
};

exports.deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        await Teacher.delete(id);
        ApiResponse.success(res, null, "Professeur supprimé avec succès");
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de la suppression du professeur");
    }
};

exports.updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        await Teacher.update(id, data);
        ApiResponse.success(res, null, "Professeur mis à jour avec succès");
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de la mise à jour du professeur");
    }
};