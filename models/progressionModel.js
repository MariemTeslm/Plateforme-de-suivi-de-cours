const db = require('../config/db');

const ProgressionModel = {
    getAccessibleGroups: async (role, userId) => {
        if (role === 'administrateur') {
            const [rows] = await db.query('SELECT id_groupe, nom FROM groupe ORDER BY nom');
            return rows;
        }

        if (role === 'etudiant') {
            const [rows] = await db.query(
                `SELECT g.id_groupe, g.nom
                 FROM etudiant_groupe eg
                 JOIN groupe g ON g.id_groupe = eg.id_groupe
                 WHERE eg.id_etudiant = ?
                 ORDER BY g.nom`,
                [userId]
            );
            return rows;
        }

        if (role === 'professeur') {
            const [rows] = await db.query(
                `SELECT DISTINCT g.id_groupe, g.nom
                 FROM groupe g
                 JOIN (
                    SELECT mg.groupe AS id_groupe
                    FROM professeur_matiere pm
                    JOIN matiere_groupe mg ON mg.id = pm.id_matiere
                    WHERE pm.id_professeur = ? AND mg.groupe IS NOT NULL
                    UNION
                    SELECT es.id_groupe
                    FROM emploi_seance es
                    WHERE es.id_professeur = ?
                 ) x ON x.id_groupe = g.id_groupe
                 ORDER BY g.nom`,
                [userId, userId]
            );
            return rows;
        }

        return [];
    },

    getProgressionRows: async (role, userId, id_groupe = null) => {
        const where = [];
        const params = [];

        if (id_groupe) {
            where.push('mg.groupe = ?');
            params.push(id_groupe);
        }

        if (role === 'etudiant') {
            where.push('EXISTS (SELECT 1 FROM etudiant_groupe eg WHERE eg.id_etudiant = ? AND eg.id_groupe = mg.groupe)');
            params.push(userId);
        }

        if (role === 'professeur') {
            where.push(`(
                EXISTS (SELECT 1 FROM professeur_matiere pm WHERE pm.id_professeur = ? AND pm.id_matiere = mg.id)
                OR EXISTS (
                    SELECT 1 FROM emploi_seance es
                    WHERE es.id_professeur = ? AND es.id_groupe = mg.groupe AND es.code_matiere = m.code
                )
            )`);
            params.push(userId, userId);
        }

        const sql = `
            SELECT
                mg.id,
                g.id_groupe,
                g.nom AS nom_groupe,
                m.code AS code_matiere,
                m.nom AS nom_matiere,
                COALESCE(mg.total_CM, 0) AS total_CM,
                COALESCE(mg.total_TD, 0) AS total_TD,
                COALESCE(mg.total_TP, 0) AS total_TP,
                COALESCE(mg.realise_CM, 0) AS realise_CM,
                COALESCE(mg.realise_TD, 0) AS realise_TD,
                COALESCE(mg.realise_TP, 0) AS realise_TP,
                (COALESCE(mg.total_CM, 0) + COALESCE(mg.total_TD, 0) + COALESCE(mg.total_TP, 0)) AS total_global,
                (COALESCE(mg.realise_CM, 0) + COALESCE(mg.realise_TD, 0) + COALESCE(mg.realise_TP, 0)) AS realise_global
            FROM matiere_groupe mg
            JOIN matiere m ON m.id = mg.matiere_id
            LEFT JOIN groupe g ON g.id_groupe = mg.groupe
            ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
            ORDER BY g.nom, m.nom
        `;

        const [rows] = await db.query(sql, params);
        return rows;
    },

    getWeeklyStats: async (role, userId, id_groupe = null) => {
        const where = ['sem.is_active = 1'];
        const params = [];

        if (id_groupe) {
            where.push('es.id_groupe = ?');
            params.push(id_groupe);
        }

        if (role === 'etudiant') {
            where.push('EXISTS (SELECT 1 FROM etudiant_groupe eg WHERE eg.id_etudiant = ? AND eg.id_groupe = es.id_groupe)');
            params.push(userId);
        }

        if (role === 'professeur') {
            where.push('es.id_professeur = ?');
            params.push(userId);
        }

        const sql = `
            SELECT
                COUNT(*) AS seances_planifiees,
                SUM(CASE WHEN se.status = 'effectuee' THEN 1 ELSE 0 END) AS seances_effectuees,
                SUM(CASE WHEN se.status = 'ratee' THEN 1 ELSE 0 END) AS seances_ratees,
                SUM(CASE WHEN se.status IS NULL THEN 1 ELSE 0 END) AS seances_non_evaluees
            FROM emploi_seance es
            JOIN semaines sem ON sem.id = es.id_semaine
            LEFT JOIN seance_evaluation se ON se.id_seance = es.id_seance AND se.id_groupe = es.id_groupe
            WHERE ${where.join(' AND ')}
        `;

        const [rows] = await db.query(sql, params);
        return rows[0] || {
            seances_planifiees: 0,
            seances_effectuees: 0,
            seances_ratees: 0,
            seances_non_evaluees: 0
        };
    }
};

module.exports = ProgressionModel;
