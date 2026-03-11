const Student = require("../models/studentModels");
const ApiResponse = require("../middlewares/responseHandler");

exports.createStudent = async (req, res) => {
    try {
        const data = req.body;

        // Vérification des champs obligatoires
        if (!data.matricule || !data.nom || !data.email || !data.mot_de_passe) {
            return ApiResponse.error(res, "Champs obligatoires manquants", 400);
        }

        // Tentative de création de l'étudiant
        const result = await Student.create(data);
        ApiResponse.success(res, { id_etudiant: result.insertId }, "Étudiant ajouté avec succès", 201);

    } catch (err) {
        console.error(err);

        // Vérifier si c'est un duplicata de matricule
        if (err.code === "ER_DUP_ENTRY") {
            return ApiResponse.error(res, "Ce matricule existe déjà, veuillez en choisir un autre.", 400);
        }

        // Erreur générique
        ApiResponse.error(res, "Erreur lors de la création de l'étudiant");
    }
};

exports.getAllStudents = async (req, res) => {
    try {
        const results = await Student.getAll();
        ApiResponse.success(res, results);
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de la récupération des étudiants");
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const id = req.params.id;
        await Student.delete(id);
        ApiResponse.success(res, null, "Étudiant supprimé avec succès");
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de la suppression de l'étudiant");
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;

        // Tentative de mise à jour
        await Student.update(id, data);
        ApiResponse.success(res, null, "Étudiant mis à jour avec succès");
    } catch (err) {
        console.error(err);

        // Vérifier si c'est un duplicata de matricule lors de la mise à jour
        if (err.code === "ER_DUP_ENTRY") {
            return ApiResponse.error(res, "Ce matricule existe déjà, veuillez en choisir un autre.", 400);
        }

        ApiResponse.error(res, "Erreur lors de la mise à jour de l'étudiant");
    }
};