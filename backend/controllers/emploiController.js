const db = require('../database/db');

exports.getEmploiGroupe = (req, res) => {

    const id_groupe = req.params.id;

    const sql = `
    SELECT e.*, m.nom AS matiere,
           p.nom AS professeur,
           s.nom_salle AS salle
    FROM emploi_seance e
    JOIN matiere m ON e.code_matiere=m.code
    JOIN professeur p ON e.id_professeur=p.id_professeur
    JOIN salle s ON e.id_salle=s.id_salle
    WHERE id_groupe=?
    `;

    db.query(sql, [id_groupe], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};