const db = require("../database/db");
const bcrypt = require("bcryptjs");

const Student = {
    create: async (data) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.mot_de_passe, salt);

        const sqlStudent = `
            INSERT INTO etudiant 
            (matricule, nom, email, departement, niveau, mot_de_passe)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sqlStudent, [
            data.matricule,
            data.nom,
            data.email,
            data.departement,
            data.niveau,
            hashedPassword
        ]);

        const id_etudiant = result.insertId;
        const groupes = data.groupes || [];

        if (groupes && groupes.length > 0) {
            const sqlGroupes = `
                INSERT INTO etudiant_groupe (id_etudiant, id_groupe)
                VALUES ?
            `;
            const values = groupes.map(id_groupe => [id_etudiant, id_groupe]);
            await db.query(sqlGroupes, [values]);
        }

        return result;
    },

    getAll: async () => {
        const sql = `
            SELECT 
                e.id_etudiant,
                e.matricule,
                e.nom,
                e.email,
                e.niveau,
                e.departement,
                GROUP_CONCAT(g.nom SEPARATOR ', ') AS groupe
            FROM etudiant e
            LEFT JOIN etudiant_groupe eg ON e.id_etudiant = eg.id_etudiant
            LEFT JOIN groupe g ON eg.id_groupe = g.id_groupe
            GROUP BY e.id_etudiant
        `;
        const [rows] = await db.query(sql);
        return rows;
    },

    delete: async (id) => {
        // etudiant_groupe should probably have ON DELETE CASCADE, 
        // but manually deleting for now to match original logic safely
        await db.query("DELETE FROM etudiant_groupe WHERE id_etudiant = ?", [id]);
        const [result] = await db.query("DELETE FROM etudiant WHERE id_etudiant = ?", [id]);
        return result;
    },

    update: async (id, data) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.mot_de_passe, salt);

        const sql = `
            UPDATE etudiant
            SET matricule = ?, nom = ?, email = ?, 
                departement = ?, niveau = ?, mot_de_passe = ?
            WHERE id_etudiant = ?
        `;

        const [result] = await db.query(sql, [
            data.matricule,
            data.nom,
            data.email,
            data.departement,
            data.niveau,
            hashedPassword,
            id
        ]);
        return result;
    }
};

module.exports = Student;
