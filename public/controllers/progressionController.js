const ApiResponse = require('../middleware/responseHandler');
const ProgressionModel = require('../models/progressionModel');

exports.getDashboard = async (req, res) => {
    try {
        const role = req.query.role;
        const idUser = Number(req.query.id_user);
        const idGroupe = req.query.id_groupe ? Number(req.query.id_groupe) : null;

        if (!role || Number.isNaN(idUser)) {
            return ApiResponse.error(res, 'Parametres requis: role, id_user', 400);
        }

        if (!['administrateur', 'professeur', 'etudiant'].includes(role)) {
            return ApiResponse.error(res, 'Role invalide', 400);
        }

        const groups = await ProgressionModel.getAccessibleGroups(role, idUser);

        // Protection supplementaire: si filtre groupe impose, il doit appartenir aux groupes accessibles
        if (idGroupe && role !== 'administrateur' && !groups.some(g => Number(g.id_groupe) === idGroupe)) {
            return ApiResponse.error(res, 'Groupe non autorise pour cet utilisateur', 403);
        }

        const progressionRows = await ProgressionModel.getProgressionRows(role, idUser, idGroupe);
        const weeklyStats = await ProgressionModel.getWeeklyStats(role, idUser, idGroupe);

        const matieres = progressionRows.map((r) => {
            const total = Number(r.total_global) || 0;
            const realise = Number(r.realise_global) || 0;
            const progression = total > 0 ? Math.min(100, Math.round((realise / total) * 100)) : 0;

            return {
                id: r.id,
                id_groupe: r.id_groupe,
                nom_groupe: r.nom_groupe || 'Sans groupe',
                code_matiere: r.code_matiere,
                nom_matiere: r.nom_matiere,
                total_CM: Number(r.total_CM) || 0,
                total_TD: Number(r.total_TD) || 0,
                total_TP: Number(r.total_TP) || 0,
                realise_CM: Number(r.realise_CM) || 0,
                realise_TD: Number(r.realise_TD) || 0,
                realise_TP: Number(r.realise_TP) || 0,
                total,
                realise,
                progression
            };
        });

        const globalTotals = matieres.reduce((acc, m) => {
            acc.total += m.total;
            acc.realise += m.realise;
            return acc;
        }, { total: 0, realise: 0 });

        const globalProgression = globalTotals.total > 0
            ? Math.min(100, Math.round((globalTotals.realise / globalTotals.total) * 100))
            : 0;

        return ApiResponse.success(res, {
            role,
            groups,
            selected_group: idGroupe,
            matieres,
            stats: {
                ...weeklyStats,
                total_heures: globalTotals.total,
                heures_realisees: globalTotals.realise,
                progression_globale: globalProgression
            }
        });
    } catch (error) {
        console.error('Erreur getDashboard progression:', error);
        return ApiResponse.error(res, error.message || 'Erreur serveur', 500);
    }
};
