const db = require('../config/db');

const SeanceEvaluation = {
    // Récupérer une séance par ID dans le groupe du chef
    getSeanceByIdAndGroup: async (id_seance, id_groupe) => {
        const sql = `
            SELECT id_seance, id_groupe, code_matiere, type_seance
            FROM emploi_seance
            WHERE id_seance = ? AND id_groupe = ?
            LIMIT 1
        `;
        const [rows] = await db.query(sql, [id_seance, id_groupe]);
        return rows.length ? rows[0] : null;
    },

    // Récupérer les séances de la semaine active pour un groupe avec leur statut d'évaluation
    getSeancesForWeek: async (id_groupe) => {
        const sql = `
            SELECT 
                es.id_seance,
                es.jour,
                es.type_seance,
                es.code_matiere,
                es.id_groupe,
                es.id_semaine,
                m.nom AS nom_matiere,
                p.nom AS nom_professeur,
                s.nom_salle,
                per.heure_debut,
                per.heure_fin,
                se.status,
                se.date_evaluation,
                se.commentaire,
                se.evaluee_par,
                e.nom AS evaluee_par_nom,
                mg.realise_CM,
                mg.realise_TD,
                mg.realise_TP
            FROM emploi_seance es
            JOIN semaines sem ON sem.id = es.id_semaine AND sem.is_active = 1
            JOIN matiere m ON m.code = es.code_matiere
            JOIN professeur p ON p.id_professeur = es.id_professeur
            JOIN salle s ON s.id_salle = es.id_salle
            JOIN periode per ON per.id_periode = es.id_periode
            LEFT JOIN matiere_groupe mg ON mg.matiere_id = m.id AND mg.groupe = es.id_groupe
            LEFT JOIN seance_evaluation se ON se.id_seance = es.id_seance AND se.id_groupe = es.id_groupe
            LEFT JOIN etudiant e ON e.id_etudiant = se.evaluee_par
            WHERE es.id_groupe = ?
            ORDER BY 
                FIELD(es.jour, 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'),
                per.heure_debut
        `;
        const [rows] = await db.query(sql, [id_groupe]);
        return rows;
    },

    // Évaluer une séance (effectuée ou ratée)
    evaluateSeance: async (data) => {
        const { id_seance, id_groupe, code_matiere, type_seance, status, evaluee_par, commentaire } = data;
        
        // Démarrer une transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();
        
        try {
            // Lire l'etat precedent pour eviter les doubles increments
            const [previousEval] = await connection.query(
                `SELECT status FROM seance_evaluation WHERE id_seance = ? AND id_groupe = ? LIMIT 1 FOR UPDATE`,
                [id_seance, id_groupe]
            );
            const previousStatus = previousEval.length > 0 ? previousEval[0].status : null;

            // 1. Insérer ou mettre à jour l'évaluation
            const sqlEval = `
                INSERT INTO seance_evaluation 
                    (id_seance, id_groupe, code_matiere, type_seance, status, evaluee_par, commentaire)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    status = VALUES(status),
                    evaluee_par = VALUES(evaluee_par),
                    commentaire = VALUES(commentaire),
                    date_evaluation = CURRENT_TIMESTAMP
            `;
            await connection.query(sqlEval, [id_seance, id_groupe, code_matiere, type_seance, status, evaluee_par, commentaire]);
            
            // 2. Incrementer une seule fois: uniquement transition vers "effectuee"
            const shouldIncrement = status === 'effectuee' && previousStatus !== 'effectuee';
            if (shouldIncrement) {
                // Récupérer la ligne matiere_groupe liée à la séance.
                // Priorité: ligne spécifique au groupe, sinon ligne générique (groupe NULL).
                const [mgRows] = await connection.query(
                    `SELECT mg.id
                     FROM emploi_seance es
                     JOIN matiere m ON m.code = es.code_matiere
                     LEFT JOIN matiere_groupe mg
                        ON mg.matiere_id = m.id
                       AND (mg.groupe = es.id_groupe OR mg.groupe IS NULL)
                     WHERE es.id_seance = ? AND es.id_groupe = ?
                     ORDER BY CASE WHEN mg.groupe = es.id_groupe THEN 0 ELSE 1 END
                     LIMIT 1 FOR UPDATE`,
                    [id_seance, id_groupe]
                );

                if (!mgRows.length || !mgRows[0].id) {
                    throw new Error('Aucune ligne matiere_groupe trouvée pour cette matière');
                }

                const normalizedType = String(type_seance || '').trim().toUpperCase();
                const incCM = normalizedType === 'CM' ? 1 : 0;
                const incTD = normalizedType === 'TD' ? 1 : 0;
                const incTP = normalizedType === 'TP' ? 1 : 0;

                if (incCM + incTD + incTP === 0) {
                    throw new Error(`Type de séance invalide pour incrément: ${type_seance}`);
                }

                await connection.query(
                    `UPDATE matiere_groupe
                     SET realise_CM = COALESCE(realise_CM, 0) + ?,
                         realise_TD = COALESCE(realise_TD, 0) + ?,
                         realise_TP = COALESCE(realise_TP, 0) + ?
                     WHERE id = ?`,
                    [incCM, incTD, incTP, mgRows[0].id]
                );
            }
            
            await connection.commit();
            connection.release();
            
            return { success: true, message: 'Séance évaluée avec succès' };
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    },

    // Récupérer les statistiques d'un groupe
    getStatistics: async (id_groupe) => {
        const sql = `
            SELECT 
                COUNT(*) AS total_seances,
                SUM(CASE WHEN se.status = 'effectuee' THEN 1 ELSE 0 END) AS seances_effectuees,
                SUM(CASE WHEN se.status = 'ratee' THEN 1 ELSE 0 END) AS seances_ratees,
                SUM(CASE WHEN se.status IS NULL THEN 1 ELSE 0 END) AS seances_non_evaluees
            FROM emploi_seance es
            JOIN semaines sem ON sem.id = es.id_semaine AND sem.is_active = 1
            LEFT JOIN seance_evaluation se ON se.id_seance = es.id_seance AND se.id_groupe = es.id_groupe
            WHERE es.id_groupe = ?
        `;
        const [rows] = await db.query(sql, [id_groupe]);
        return rows[0];
    },

    // Vérifier si un étudiant est chef de classe
    isChefDeClasse: async (id_etudiant) => {
        const sql = "SELECT id_groupe, nom FROM groupe WHERE id_chef = ?";
        const [rows] = await db.query(sql, [id_etudiant]);
        return rows.length > 0 ? rows[0] : null;
    },

    // Récupérer l'historique des évaluations
    getEvaluationHistory: async (id_groupe, limit = 50) => {
        const sql = `
            SELECT 
                se.*,
                m.nom AS nom_matiere,
                e.nom AS evaluee_par_nom,
                es.jour
            FROM seance_evaluation se
            JOIN matiere m ON m.code = se.code_matiere
            JOIN etudiant e ON e.id_etudiant = se.evaluee_par
            JOIN emploi_seance es ON es.id_seance = se.id_seance
            WHERE se.id_groupe = ?
            ORDER BY se.date_evaluation DESC
            LIMIT ?
        `;
        const [rows] = await db.query(sql, [id_groupe, limit]);
        return rows;
    }
};

module.exports = SeanceEvaluation;
