const Admin = require("../models/adminModels");
const ApiResponse = require("../middleware/responseHandler");

exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.getAll();
        return ApiResponse.success(res, admins);
    } catch (err) {
        console.error(err);
        return ApiResponse.error(res, "Erreur lors de la récupération des administrateurs");
    }
};

exports.addAdmin = async (req, res) => {
    try {
        const data = req.body;

        if (!data.nom || !data.email || !data.mot_de_passe) {
            return ApiResponse.error(res, "Champs obligatoires manquants", 400);
        }

        const result = await Admin.create(data);
        return ApiResponse.success(res, { id_admin: result.insertId }, "Administrateur ajouté avec succès", 201);
    } catch (err) {
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") {
            return ApiResponse.error(res, "Cet email existe déjà", 400);
        }
        return ApiResponse.error(res, "Erreur lors de l'ajout de l'administrateur");
    }
};

exports.updateAdmin = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;

        if (!data.nom || !data.email) {
            return ApiResponse.error(res, "Nom et email sont obligatoires", 400);
        }

        await Admin.update(id, data);
        return ApiResponse.success(res, null, "Administrateur mis à jour avec succès");
    } catch (err) {
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") {
            return ApiResponse.error(res, "Cet email existe déjà", 400);
        }
        return ApiResponse.error(res, "Erreur lors de la mise à jour de l'administrateur");
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        const id = req.params.id;

        const totalAdmins = await Admin.countAll();
        if (totalAdmins <= 1) {
            return ApiResponse.error(res, "Suppression impossible: au moins un administrateur doit rester actif", 400);
        }

        await Admin.delete(id);
        return ApiResponse.success(res, null, "Administrateur supprimé avec succès");
    } catch (err) {
        console.error(err);
        return ApiResponse.error(res, "Erreur lors de la suppression de l'administrateur");
    }
};
