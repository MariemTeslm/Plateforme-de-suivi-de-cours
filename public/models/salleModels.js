const db = require("../config/db");

const Salle = {
    create: async (data) => {
        const sql = "INSERT INTO salle (nom_salle, capacite) VALUES (?, ?)";
        const [result] = await db.query(sql, [data.nom, data.capacite]);
        return result;
    },

    getAll: async () => {
        const sql = "SELECT * FROM salle";
        const [rows] = await db.query(sql);
        return rows;
    },

    delete: async (id) => {
        const sql = "DELETE FROM salle WHERE id_salle = ?";
        const [result] = await db.query(sql, [id]);
        return result;
    },

    update: async (id, data) => {
        const sql = "UPDATE salle SET nom_salle = ?, capacite = ? WHERE id_salle = ?";
        const [result] = await db.query(sql, [data.nom, data.capacite, id]);
        return result;
    }
};

module.exports = Salle;
