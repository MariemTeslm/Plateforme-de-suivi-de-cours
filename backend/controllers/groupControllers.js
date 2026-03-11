// backend/controllers/groupControllers.js
const Group = require("../models/groupModels");
const ApiResponse = require("../middlewares/responseHandler");

exports.getAllGroups = async (req, res) => {
    try {
        const groups = await Group.getAll();
        ApiResponse.success(res, groups);
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de la récupération des groupes");
    }
};

exports.addOrUpdateGroupWithStudents = async (req, res) => {
    try {
        const { nom, id_chef, etudiants } = req.body;

        if (!nom) return ApiResponse.error(res, "Le nom du groupe est obligatoire", 400);

        // Validation des étudiants
        if (etudiants && etudiants.length > 0) {
            for (let id of etudiants) {
                const exists = await Group.studentExists(id);
                if (!exists) return ApiResponse.error(res, `L'étudiant avec l'ID ${id} n'existe pas`, 400);
            }
        }

        // Validation du chef
        if (id_chef) {
            const chefExists = await Group.studentExists(id_chef);
            if (!chefExists) return ApiResponse.error(res, "L'étudiant chef n'existe pas", 400);
            if (etudiants && !etudiants.includes(parseInt(id_chef))) {
                return ApiResponse.error(res, "Le chef doit faire partie du groupe", 400);
            }
        }

        let groupId;
        if (req.params.id) {
            await Group.update(req.params.id, { nom, id_chef: id_chef || null });
            groupId = req.params.id;
        } else {
            const result = await Group.create({ nom, id_chef: id_chef || null });
            groupId = result.insertId;
        }

        if (etudiants && etudiants.length > 0) {
            await Group.addStudentsToGroup(groupId, etudiants);
        }

        // Retour complet du groupe
        const allGroups = await Group.getAll();
        ApiResponse.success(res, allGroups, "Groupe enregistré avec succès");

    } catch (err) {
        console.error(err);
        ApiResponse.error(res, err.sqlMessage || err.message || "Erreur lors de l'enregistrement du groupe");
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        await Group.delete(id);
        ApiResponse.success(res, null, "Groupe supprimé avec succès");
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de la suppression du groupe");
    }
};

exports.getStudentsWithoutGroup = async (req, res) => {
    try {
        const students = await Group.getStudentsWithoutGroup();
        ApiResponse.success(res, students);
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de la récupération des étudiants sans groupe");
    }
};

exports.getStudentsWithGroup = async (req, res) => {
    try {
        const students = await Group.getStudentsWithGroup();
        ApiResponse.success(res, students);
    } catch (err) {
        console.error(err);
        ApiResponse.error(res, "Erreur lors de la récupération des étudiants avec groupe");
    }
};