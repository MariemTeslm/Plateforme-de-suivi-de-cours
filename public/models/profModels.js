const db = require("../config/db");
const bcrypt = require("bcryptjs");

const Teacher = {

    /* =========================
       Ajouter professeur + matières
    ========================= */
    create: async (data) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.mot_de_passe, salt);

        // Ajouter professeur
        const sqlProf = `INSERT INTO professeur (nom, email, mot_de_passe) VALUES (?, ?, ?)`;
        const [result] = await db.query(sqlProf, [data.nom, data.email, hashedPassword]);
        const id_professeur = result.insertId;

        // Ajouter matières
        if (data.matieres && data.matieres.length > 0) {
            const sqlMatieres = `INSERT INTO professeur_matiere (id_professeur, id_matiere) VALUES ?`;
            const values = data.matieres.map(m => [id_professeur, m]); // m = id de matiere_groupe
            await db.query(sqlMatieres, [values]);
        }

        return result;
    },

    /* =========================
       Récupérer professeurs + matières
    ========================= */
    getAll: async () => {
        const sql = `
            SELECT 
                p.id_professeur,
                p.nom,
                p.email,
                GROUP_CONCAT(CONCAT(mat.nom, '(', mat.code, ')') SEPARATOR ', ') AS matieres
            FROM professeur p
            LEFT JOIN professeur_matiere pm ON p.id_professeur = pm.id_professeur
            LEFT JOIN matiere_groupe mg ON pm.id_matiere = mg.id
            LEFT JOIN matiere mat ON mg.matiere_id = mat.id
            GROUP BY p.id_professeur
            ORDER BY p.nom
        `;
        const [rows] = await db.query(sql);
        return rows;
    },

    /* =========================
       Supprimer professeur
    ========================= */
    delete: async (id) => {
        await db.query(`DELETE FROM professeur_matiere WHERE id_professeur = ?`, [id]);
        const [result] = await db.query(`DELETE FROM professeur WHERE id_professeur = ?`, [id]);
        return result;
    },

    /* =========================
       Mettre à jour professeur + matières
    ========================= */
    update: async (id, data) => {
        let sqlProf, params;
        if (data.mot_de_passe) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(data.mot_de_passe, salt);
            sqlProf = `UPDATE professeur SET nom = ?, email = ?, mot_de_passe = ? WHERE id_professeur = ?`;
            params = [data.nom, data.email, hashedPassword, id];
        } else {
            sqlProf = `UPDATE professeur SET nom = ?, email = ? WHERE id_professeur = ?`;
            params = [data.nom, data.email, id];
        }

        await db.query(sqlProf, params);

        // Supprimer anciennes matières
        await db.query(`DELETE FROM professeur_matiere WHERE id_professeur = ?`, [id]);

        // Ajouter nouvelles matières
        if (data.matieres && data.matieres.length > 0) {
            const insertSql = `INSERT INTO professeur_matiere (id_professeur, id_matiere) VALUES ?`;
            const values = data.matieres.map(m => [id, m]); // m = id de matiere_groupe
            await db.query(insertSql, [values]);
        }
    }
};

module.exports = Teacher;