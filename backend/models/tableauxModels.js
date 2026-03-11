const db = require("../database/db");

const EmploiSeance = {
    createByNames: async (data) => {
        try {
            const { id_periode, jour, id_semaine, nom_groupe, nom_professeur, nom_matiere, nom_salle, type_seance } = data;
            // 0. Verify if week exists
            const [semaines] = await db.query("SELECT id FROM semaines LIMIT 1");
            const weekId = id_semaine || (semaines.length > 0 ? semaines[0].id : null);

            if (!weekId) {
                throw new Error("Configuration requise: Aucune semaine n'existe dans la base de données. Veuillez d'abord ajouter une semaine.");
            }

            // 1. Verify existence of all references to give specific error
            const [grp] = await db.query("SELECT id_groupe FROM groupe WHERE nom = ? LIMIT 1", [nom_groupe]);
            if (grp.length === 0) throw new Error(`Le groupe '${nom_groupe}' n'existe pas.`);

            const [prf] = await db.query("SELECT id_professeur FROM professeur WHERE nom = ? LIMIT 1", [nom_professeur]);
            if (prf.length === 0) throw new Error(`Le professeur '${nom_professeur}' n'existe pas.`);

            const [mat] = await db.query("SELECT code_matiere FROM matiere WHERE nom = ? LIMIT 1", [nom_matiere]);
            if (mat.length === 0) throw new Error(`La matière '${nom_matiere}' n'existe pas.`);

            const [sal] = await db.query("SELECT id_salle FROM salle WHERE nom_salle = ? LIMIT 1", [nom_salle]);
            if (sal.length === 0) throw new Error(`La salle '${nom_salle}' n'existe pas.`);

            const [per] = await db.query("SELECT id_periode FROM periode WHERE id_periode = ?", [id_periode]);
            if (per.length === 0) throw new Error(`La période (ID: ${id_periode}) n'existe pas.`);

            // 2. Collision Detection
            // 2.1 Room Collision
            const [roomCollision] = await db.query(
                "SELECT id_seance FROM emploi_seance WHERE id_salle = ? AND jour = ? AND id_periode = ? AND id_semaine = ?",
                [sal[0].id_salle, jour, id_periode, weekId]
            );
            if (roomCollision.length > 0) throw new Error(`La salle '${nom_salle}' est déjà occupée pour ce créneau.`);

            // 2.2 Professor Collision
            const [profCollision] = await db.query(
                "SELECT id_seance FROM emploi_seance WHERE id_professeur = ? AND jour = ? AND id_periode = ? AND id_semaine = ?",
                [prf[0].id_professeur, jour, id_periode, weekId]
            );
            if (profCollision.length > 0) throw new Error(`Le professeur '${nom_professeur}' a déjà une autre séance prévue pour ce créneau.`);

            // 2.3 Group Collision
            const [groupCollision] = await db.query(
                "SELECT id_seance FROM emploi_seance WHERE id_groupe = ? AND jour = ? AND id_periode = ? AND id_semaine = ?",
                [grp[0].id_groupe, jour, id_periode, weekId]
            );
            if (groupCollision.length > 0) throw new Error(`Le groupe '${nom_groupe}' a déjà une séance prévue pour ce créneau.`);

            const sql = `
                INSERT INTO emploi_seance (id_groupe, id_professeur, code_matiere, id_salle, id_periode, jour, id_semaine, type_seance)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            const [result] = await db.query(sql, [
                grp[0].id_groupe,
                prf[0].id_professeur,
                mat[0].code_matiere,
                sal[0].id_salle,
                id_periode,
                jour,
                weekId,
                type_seance || 'CM'
            ]);
            return result;
        } catch (err) {
            console.error("[MODEL ERROR] createByNames:", err);
            if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                throw new Error(`Erreur SQL (FK): Une référence (Semaine, Période, etc.) est invalide.`);
            }
            if (err.code === 'ER_DUP_ENTRY' || (err.message && err.message.toLowerCase().includes('duplicate entry'))) {
                throw new Error(`هذه الحصة مضافة بالفعل في هذا الوقت (Cette séance existe déjà pour ce groupe/créneau).`);
            }
            throw err;
        }
    },

    // Récupérer toutes les séances avec noms
    getAllWithNames: async (idSemaine = null) => {
        let sql = `
            SELECT e.id_seance, g.nom AS nom_groupe, p.id_professeur, p.nom AS nom_professeur, m.nom AS nom_matiere,
                    s.nom_salle AS nom_salle, e.id_periode, e.jour, e.id_semaine, e.type_seance
            FROM emploi_seance e
            LEFT JOIN groupe g ON e.id_groupe = g.id_groupe
            LEFT JOIN professeur p ON e.id_professeur = p.id_professeur
            LEFT JOIN matiere m ON e.code_matiere = m.code_matiere
            LEFT JOIN salle s ON e.id_salle = s.id_salle`;

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

    // Mettre à jour une séance par noms
    updateByNames: async (id, data) => {
        const { id_periode, jour, id_semaine, nom_groupe, nom_professeur, nom_matiere, nom_salle, type_seance } = data;

        // 1. Get IDs for checks
        const [grp] = await db.query("SELECT id_groupe FROM groupe WHERE nom = ?", [nom_groupe]);
        const [prf] = await db.query("SELECT id_professeur FROM professeur WHERE nom = ?", [nom_professeur]);
        const [sal] = await db.query("SELECT id_salle FROM salle WHERE nom_salle = ?", [nom_salle]);

        if (grp.length === 0 || prf.length === 0 || sal.length === 0) {
            throw new Error("Une ou plusieurs références (Groupe, Professeur, Salle) sont invalides.");
        }

        const id_groupe = grp[0].id_groupe;
        const id_professeur = prf[0].id_professeur;
        const id_salle = sal[0].id_salle;

        // 2. Collision Detection (Excluding current ID)
        const [roomCollision] = await db.query(
            "SELECT id_seance FROM emploi_seance WHERE id_salle = ? AND jour = ? AND id_periode = ? AND id_semaine = ? AND id_seance != ?",
            [id_salle, jour, id_periode, id_semaine, id]
        );
        if (roomCollision.length > 0) throw new Error(`La salle '${nom_salle}' est déjà occupée.`);

        const [profCollision] = await db.query(
            "SELECT id_seance FROM emploi_seance WHERE id_professeur = ? AND jour = ? AND id_periode = ? AND id_semaine = ? AND id_seance != ?",
            [id_professeur, jour, id_periode, id_semaine, id]
        );
        if (profCollision.length > 0) throw new Error(`Le professeur '${nom_professeur}' est déjà occupé.`);

        const [groupCollision] = await db.query(
            "SELECT id_seance FROM emploi_seance WHERE id_groupe = ? AND jour = ? AND id_periode = ? AND id_semaine = ? AND id_seance != ?",
            [id_groupe, jour, id_periode, id_semaine, id]
        );
        if (groupCollision.length > 0) throw new Error(`Le groupe '${nom_groupe}' a déjà une séance.`);

        const sql = `
            UPDATE emploi_seance 
            SET id_groupe = ?,
                id_professeur = ?,
                code_matiere = (SELECT code_matiere FROM matiere WHERE nom = ? LIMIT 1),
                id_salle = ?,
                id_periode = ?,
                jour = ?,
                id_semaine = ?,
                type_seance = ?
            WHERE id_seance = ?`;

        const [result] = await db.query(sql, [
            id_groupe,
            id_professeur,
            nom_matiere,
            id_salle,
            id_periode,
            jour,
            id_semaine,
            type_seance || 'CM',
            id
        ]);
        return result;
    }
};

module.exports = EmploiSeance;
