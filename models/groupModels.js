// backend/models/groupModels.js
const db = require("../config/db");

const Group = {
    // Ajouter un groupe
    create: async (data) => {
        const sql = "INSERT INTO groupe (nom, id_chef) VALUES (?, ?)";
        const [result] = await db.query(sql, [data.nom, data.id_chef || null]);
        return result;
    },

    // Mettre à jour un groupe
    update: async (id, data) => {
        const sql = "UPDATE groupe SET nom = ?, id_chef = ? WHERE id_groupe = ?";
        const [result] = await db.query(sql, [data.nom, data.id_chef || null, id]);
        return result;
    },

    // Supprimer un groupe
    delete: async (id) => {
        const sql = "DELETE FROM groupe WHERE id_groupe = ?";
        const [result] = await db.query(sql, [id]);
        return result;
    },

    // Récupérer tous les groupes
    getAll: async () => {
        const sql = "SELECT * FROM groupe";
        const [rows] = await db.query(sql);
        return rows;
    },

    // Ajouter / modifier des étudiants dans un groupe
    addStudentsToGroup: async (id_groupe, etudiants) => {
        if (!etudiants || etudiants.length === 0) return;

        // Supprimer les étudiants retirés
        await db.query(
            "DELETE FROM etudiant_groupe WHERE id_groupe = ? AND id_etudiant NOT IN (?)",
            [id_groupe, etudiants.length ? etudiants : [0]] // éviter liste vide
        );

        // Ajouter ou mettre à jour les étudiants
        const sql = `
            INSERT INTO etudiant_groupe (id_etudiant, id_groupe)
            VALUES ?
            ON DUPLICATE KEY UPDATE id_groupe = VALUES(id_groupe)
        `;
        const values = etudiants.map(id_etudiant => [id_etudiant, id_groupe]);
        if (values.length > 0) await db.query(sql, [values]);
    },

    // Récupérer tous les étudiants
    getAllStudents: async () => {
        const sql = `
            SELECT e.id_etudiant, e.nom, e.matricule, eg.id_groupe
            FROM etudiant e
            LEFT JOIN etudiant_groupe eg ON e.id_etudiant = eg.id_etudiant
        `;
        const [rows] = await db.query(sql);
        return rows;
    },

    // Récupérer uniquement les étudiants sans groupe
    getStudentsWithoutGroup: async () => {
        const sql = `
            SELECT e.id_etudiant, e.nom, e.matricule
            FROM etudiant e
            LEFT JOIN etudiant_groupe eg ON e.id_etudiant = eg.id_etudiant
            WHERE eg.id_groupe IS NULL
        `;
        const [rows] = await db.query(sql);
        return rows;
    },

    // Récupérer uniquement les étudiants déjà affectés à un groupe
    getStudentsWithGroup: async () => {
        const sql = `
            SELECT e.id_etudiant, e.nom, e.matricule, eg.id_groupe
            FROM etudiant e
            INNER JOIN etudiant_groupe eg ON e.id_etudiant = eg.id_etudiant
        `;
        const [rows] = await db.query(sql);
        return rows;
    },

    // Vérifier si un étudiant existe
    studentExists: async (id_etudiant) => {
        const sql = "SELECT COUNT(*) AS count FROM etudiant WHERE id_etudiant = ?";
        const [rows] = await db.query(sql, [id_etudiant]);
        return rows[0].count > 0;
    }
};

module.exports = Group;