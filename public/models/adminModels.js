const db = require("../config/db");
const bcrypt = require("bcryptjs");

const Admin = {
    create: async (data) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.mot_de_passe, salt);

        const sql = `INSERT INTO administrateur (nom, email, mot_de_passe) VALUES (?, ?, ?)`;
        const [result] = await db.query(sql, [data.nom, data.email, hashedPassword]);
        return result;
    },

    getAll: async () => {
        const sql = `
            SELECT id_admin, nom, email
            FROM administrateur
            ORDER BY nom
        `;
        const [rows] = await db.query(sql);
        return rows;
    },

    countAll: async () => {
        const [rows] = await db.query("SELECT COUNT(*) AS total FROM administrateur");
        return Number(rows[0]?.total) || 0;
    },

    update: async (id, data) => {
        if (data.mot_de_passe && data.mot_de_passe.trim()) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(data.mot_de_passe, salt);
            const sql = `UPDATE administrateur SET nom = ?, email = ?, mot_de_passe = ? WHERE id_admin = ?`;
            const [result] = await db.query(sql, [data.nom, data.email, hashedPassword, id]);
            return result;
        }

        const sql = `UPDATE administrateur SET nom = ?, email = ? WHERE id_admin = ?`;
        const [result] = await db.query(sql, [data.nom, data.email, id]);
        return result;
    },

    delete: async (id) => {
        const [result] = await db.query(`DELETE FROM administrateur WHERE id_admin = ?`, [id]);
        return result;
    }
};

module.exports = Admin;
