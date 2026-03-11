const db = require('../database/db');

const Semaine = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM semaines ORDER BY numSemaine DESC');
        return rows;
    },

    getActive: async () => {
        const [rows] = await db.query('SELECT * FROM semaines WHERE is_active = 1 LIMIT 1');
        return rows[0] || null;
    },

    add: async (data) => {
        const sql = 'INSERT INTO semaines (numSemaine, date_debut, date_fin, is_active) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(sql, [data.numSemaine, data.date_debut, data.date_fin, data.is_active || 0]);
        return result;
    },

    activate: async (id) => {
        // First deactivate all
        await db.query('UPDATE semaines SET is_active = 0');
        // Then activate the specific one
        const [result] = await db.query('UPDATE semaines SET is_active = 1 WHERE id = ?', [id]);
        return result;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM semaines WHERE id = ?', [id]);
        return result;
    }
};

module.exports = Semaine;
