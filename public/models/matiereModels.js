const db = require("../config/db");

const Matiere = {
    create: async (data) => {
        const { code_matiere, nom_matiere, credit, total_CM, total_TD, total_TP, groupe } = data;
        if (!code_matiere || !nom_matiere || !credit || !groupe) {
            throw new Error("code_matiere, nom_matiere, credit et groupe sont obligatoires");
        }

        const [matieres] = await db.query(`SELECT id FROM matiere WHERE code = ?`, [code_matiere]);
        let matiereId;

        if (matieres.length === 0) {
            const [result] = await db.query(
                `INSERT INTO matiere (code, nom) VALUES (?, ?)`,
                [code_matiere, nom_matiere]
            );
            matiereId = result.insertId;
        } else {
            matiereId = matieres[0].id;
        }

        const sql = `
            INSERT INTO matiere_groupe
            (matiere_id, groupe, credit, total_CM, total_TD, total_TP, realise_CM, realise_TD, realise_TP)
            VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0)
        `;
        const [result] = await db.query(sql, [matiereId, groupe, credit, total_CM || 0, total_TD || 0, total_TP || 0]);
        return result;
    },

    getAll: async () => {
        const sql = `
            SELECT mg.id, mg.groupe, g.nom AS nom_groupe, m.code AS code_matiere, m.nom AS nom_matiere, mg.credit,
                (mg.credit*25) AS nombre_horaire,
                mg.total_CM, mg.total_TD, mg.total_TP,
                mg.realise_CM, mg.realise_TD, mg.realise_TP
            FROM matiere_groupe mg
            JOIN matiere m ON mg.matiere_id = m.id
            LEFT JOIN groupe g ON g.id_groupe = mg.groupe
            ORDER BY m.nom
        `;
        const [rows] = await db.query(sql);
        return rows;
    },

    update: async (id, data) => {
        const { credit, total_CM, total_TD, total_TP, groupe } = data;
        const sql = `
            UPDATE matiere_groupe
            SET groupe=?, credit=?, total_CM=?, total_TD=?, total_TP=?
            WHERE id=?
        `;
        const [result] = await db.query(sql, [groupe, credit, total_CM, total_TD, total_TP, id]);
        return result;
    },

    delete: async (id) => {
        const sql = `DELETE FROM matiere_groupe WHERE id = ?`;
        const [result] = await db.query(sql, [id]);
        return result;
    }
};

module.exports = Matiere;