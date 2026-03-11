const db = require('../config/db');

exports.getSeancesByGroupe = (id_groupe, semaine, callback) => {
    const sql = `
    SELECT e.*, m.nom AS matiere,
           p.nom AS professeur,
           s.nom_salle AS salle
    FROM emploi_seance e
    JOIN matiere m ON e.code_matiere = m.code
    JOIN professeur p ON e.id_professeur = p.id_professeur
    JOIN salle s ON e.id_salle = s.id_salle
    WHERE e.id_groupe=? AND e.id_semaine=?
    `;

    db.query(sql, [id_groupe, semaine], callback);
};

exports.updateSeance = (id, data, callback) => {
    const sql = `
    UPDATE emploi_seance 
    SET id_professeur=?, code_matiere=?, id_salle=? 
    WHERE id_seance=?`;

    db.query(sql, [
        data.id_professeur,
        data.code_matiere,
        data.id_salle,
        id
    ], callback);
};