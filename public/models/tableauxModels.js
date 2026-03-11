const db = require("../config/db");

const EmploiSeance = {

    // Création d'une séance par noms
    createByNames: async (data) => {
        try {
            const { id_periode, jour, id_semaine, nom_groupe, nom_professeur, nom_matiere, nom_salle, type_seance } = data;

            // Vérifier semaine
            const [semaines] = await db.query("SELECT id FROM semaines LIMIT 1");
            const weekId = id_semaine || (semaines.length > 0 ? semaines[0].id : null);

            if (!weekId) {
                throw new Error("Aucune semaine n'existe dans la base de données.");
            }

            // Vérifier groupe
            const [grp] = await db.query(
                "SELECT id_groupe FROM groupe WHERE nom = ? LIMIT 1",
                [nom_groupe]
            );
            if (grp.length === 0) throw new Error(`Le groupe '${nom_groupe}' n'existe pas.`);

            // Vérifier professeur
            const [prf] = await db.query(
                "SELECT id_professeur FROM professeur WHERE nom = ? LIMIT 1",
                [nom_professeur]
            );
            if (prf.length === 0) throw new Error(`Le professeur '${nom_professeur}' n'existe pas.`);

            // Vérifier matière (CORRIGÉ)
            const [mat] = await db.query(
                "SELECT code FROM matiere WHERE nom = ? LIMIT 1",
                [nom_matiere]
            );
            if (mat.length === 0) throw new Error(`La matière '${nom_matiere}' n'existe pas.`);

            // Vérifier salle
            const [sal] = await db.query(
                "SELECT id_salle FROM salle WHERE nom_salle = ? LIMIT 1",
                [nom_salle]
            );
            if (sal.length === 0) throw new Error(`La salle '${nom_salle}' n'existe pas.`);

            // Vérifier période
            const [per] = await db.query(
                "SELECT id_periode FROM periode WHERE id_periode = ?",
                [id_periode]
            );
            if (per.length === 0) throw new Error(`La période ${id_periode} n'existe pas.`);

            // Collision salle
            const [roomCollision] = await db.query(
                `SELECT id_seance FROM emploi_seance 
                 WHERE id_salle = ? AND jour = ? AND id_periode = ? AND id_semaine = ?`,
                [sal[0].id_salle, jour, id_periode, weekId]
            );
            if (roomCollision.length > 0)
                throw new Error(`La salle '${nom_salle}' est déjà occupée.`);

            // Collision professeur
            const [profCollision] = await db.query(
                `SELECT id_seance FROM emploi_seance 
                 WHERE id_professeur = ? AND jour = ? AND id_periode = ? AND id_semaine = ?`,
                [prf[0].id_professeur, jour, id_periode, weekId]
            );
            if (profCollision.length > 0)
                throw new Error(`Le professeur '${nom_professeur}' est déjà occupé.`);

            // Collision groupe
            const [groupCollision] = await db.query(
                `SELECT id_seance FROM emploi_seance 
                 WHERE id_groupe = ? AND jour = ? AND id_periode = ? AND id_semaine = ?`,
                [grp[0].id_groupe, jour, id_periode, weekId]
            );
            if (groupCollision.length > 0)
                throw new Error(`Le groupe '${nom_groupe}' a déjà une séance.`);

            // Insertion
            const sql = `
                INSERT INTO emploi_seance 
                (id_groupe, id_professeur, code_matiere, id_salle, id_periode, jour, id_semaine, type_seance)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            const [result] = await db.query(sql, [
                grp[0].id_groupe,
                prf[0].id_professeur,
                mat[0].code,
                sal[0].id_salle,
                id_periode,
                jour,
                weekId,
                type_seance || "CM"
            ]);

            return result;

        } catch (err) {
            console.error("[MODEL ERROR]", err);
            throw err;
        }
    },

    // Récupérer toutes les séances
    getAllWithNames: async (idSemaine = null) => {

        let sql = `
            SELECT 
                e.id_seance,
                g.nom AS nom_groupe,
                p.id_professeur,
                p.nom AS nom_professeur,
                m.nom AS nom_matiere,
                s.nom_salle AS nom_salle,
                e.id_periode,
                e.jour,
                e.id_semaine,
                e.type_seance
            FROM emploi_seance e
            LEFT JOIN groupe g ON e.id_groupe = g.id_groupe
            LEFT JOIN professeur p ON e.id_professeur = p.id_professeur
            LEFT JOIN matiere m ON e.code_matiere = m.code
            LEFT JOIN salle s ON e.id_salle = s.id_salle
        `;

        const params = [];

        if (idSemaine) {
            sql += " WHERE e.id_semaine = ?";
            params.push(idSemaine);
        }

        const [rows] = await db.query(sql, params);
        return rows;
    },

    // Supprimer une séance
    delete: async (id) => {

        const sql = "DELETE FROM emploi_seance WHERE id_seance = ?";
        const [result] = await db.query(sql, [id]);

        return result;
    },

    // Mise à jour
    updateByNames: async (id, data) => {

        const { id_periode, jour, id_semaine, nom_groupe, nom_professeur, nom_matiere, nom_salle, type_seance } = data;

        const [grp] = await db.query(
            "SELECT id_groupe FROM groupe WHERE nom = ?",
            [nom_groupe]
        );

        const [prf] = await db.query(
            "SELECT id_professeur FROM professeur WHERE nom = ?",
            [nom_professeur]
        );

        const [sal] = await db.query(
            "SELECT id_salle FROM salle WHERE nom_salle = ?",
            [nom_salle]
        );

        if (grp.length === 0 || prf.length === 0 || sal.length === 0) {
            throw new Error("Référence invalide.");
        }

        const sql = `
            UPDATE emploi_seance 
            SET id_groupe = ?,
                id_professeur = ?,
                code_matiere = (SELECT code FROM matiere WHERE nom = ? LIMIT 1),
                id_salle = ?,
                id_periode = ?,
                jour = ?,
                id_semaine = ?,
                type_seance = ?
            WHERE id_seance = ?
        `;

        const [result] = await db.query(sql, [
            grp[0].id_groupe,
            prf[0].id_professeur,
            nom_matiere,
            sal[0].id_salle,
            id_periode,
            jour,
            id_semaine,
            type_seance || "CM",
            id
        ]);

        return result;
    }

};

module.exports = EmploiSeance;