const db = require('../database/db');

const Periode = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM periode');
        return rows;
    },

    add: async (data) => {
        const sql = 'INSERT INTO periode (nom, heure_debut, heure_fin) VALUES (?, ?, ?)';
        const [result] = await db.query(sql, [data.nom, data.heure_debut, data.heure_fin]);
        return result;
    },

    update: async (id, data) => {
        const sql = 'UPDATE periode SET nom=?, heure_debut=?, heure_fin=? WHERE id_periode=?';
        const [result] = await db.query(sql, [data.nom, data.heure_debut, data.heure_fin, id]);
        return result;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM periode WHERE id_periode=?', [id]);
        return result;
    }
};

module.exports = Periode;
