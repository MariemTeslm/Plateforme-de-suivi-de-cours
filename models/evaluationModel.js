const db = require('../config/db'); // ton fichier de connexion MySQL

// Récupérer toutes les séances de la semaine active pour un étudiant
exports.getSeancesByEtudiant = (id_etudiant, callback) => {
    const query = `
    SELECT 
        es.id_seance, 
        IFNULL(es.type_seance, '') AS type_seance,
        IFNULL(es.jour, '') AS jour,
        IFNULL(s.nom_salle, '') AS nom_salle,
        IFNULL(m.code, '') AS code_matiere,
        IFNULL(m.nom, '') AS nom_matiere,
        IFNULL(mg.id,0) AS matiere_groupe_id
    FROM emploi_seance es
    JOIN semaines sem ON sem.id = es.id_semaine AND sem.is_active = 1
    JOIN etudiant_groupe eg ON eg.id_groupe = es.id_groupe
    LEFT JOIN matiere m ON m.code = es.code_matiere
    LEFT JOIN matiere_groupe mg ON mg.matiere_id = m.id AND mg.groupe = es.id_groupe
    LEFT JOIN salle s ON s.id_salle = es.id_salle
    WHERE eg.id_etudiant = ?;
    `;
    db.query(query, [id_etudiant], (err, results) => {
        if(err) return callback(err);
        callback(null, results);
    });
};

// Mettre à jour la séance (fait / ratée)
exports.updateSeance = (id_seance, type, callback) => {
    // On récupère d'abord la séance
    const selectQuery = `SELECT * FROM emploi_seance es 
                         LEFT JOIN matiere m ON m.code = es.code_matiere
                         LEFT JOIN matiere_groupe mg ON mg.matiere_id = m.id AND mg.groupe = es.id_groupe
                         WHERE es.id_seance = ?`;
    db.query(selectQuery, [id_seance], (err, results) => {
        if(err) return callback(err);
        if(results.length === 0) return callback(new Error("Séance introuvable"));

        const seance = results[0];
        let field = '';
        if(seance.type_seance === 'CM') field = 'realise_CM';
        else if(seance.type_seance === 'TD') field = 'realise_TD';
        else if(seance.type_seance === 'TP') field = 'realise_TP';
        else {
            // Si type vide, on choisit le type passé dans body
            if(type === 'CM') field = 'realise_CM';
            else if(type === 'TD') field = 'realise_TD';
            else if(type === 'TP') field = 'realise_TP';
        }

        if(!field) return callback(new Error("Type de séance inconnu"));

        const updateQuery = `UPDATE matiere_groupe SET ${field} = ${field} + 1 WHERE id = ?`;
        db.query(updateQuery, [seance.matiere_groupe_id], (err2, result2) => {
            if(err2) return callback(err2);
            callback(null, { message: 'Séance mise à jour avec succès' });
        });
    });
};