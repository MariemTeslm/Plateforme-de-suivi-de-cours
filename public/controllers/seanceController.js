const db = require('../config/db');
const Semaine = require('../models/semaineModels');

exports.getSeanceData = async (req, res) => {
    const data = {};
    const queries = {
        groupes: 'SELECT * FROM groupe',
        profs: 'SELECT * FROM professeur',
        matieres: 'SELECT * FROM matiere',
        salles: 'SELECT * FROM salle',
        periodes: 'SELECT * FROM periode' ,// <-- toutes les semaines
        semaines: 'SELECT * FROM semaines ORDER BY numSemaine DESC' // <-- toutes les semaines
    };

    try {
        for (const [key, sql] of Object.entries(queries)) {
            const [rows] = await db.query(sql); // <-- version promesse
            data[key] = rows;
            console.log(`Table ${key} chargée: ${rows.length} enregistrements`);
        }

        res.json({ success: true, data });
    } catch (err) {
        console.error('Erreur getSeanceData:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
// Ajouter une séance
// Ajouter une séance
exports.addSeance = (req, res) => {
    const { id_groupe, jour, id_periode, code_matiere, id_professeur, id_salle, id_semaine, type_seance } = req.body;

    if (!id_semaine) {
        return res.status(400).json({ success: false, message: "La semaine est obligatoire." });
    }

    if (!type_seance || !['CM', 'TD', 'TP'].includes(String(type_seance).toUpperCase())) {
        return res.status(400).json({ success: false, message: "Le type de séance est obligatoire (CM, TD, TP)." });
    }

    const sql = `INSERT INTO emploi_seance
                 (id_groupe, jour, id_periode, code_matiere, id_professeur, id_salle, id_semaine, type_seance)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [id_groupe, jour, id_periode, code_matiere, id_professeur, id_salle, id_semaine, String(type_seance).toUpperCase()], (err, result) => {
        if(err) return res.status(500).json({ success:false, message: err.message });
        res.json({ success:true, message:'Séance ajoutée avec succès', id_seance: result.insertId });
    });
};

// Mettre à jour une séance
// Mettre à jour une séance
exports.updateSeance = (req, res) => {
    const id = req.params.id;
    const { id_groupe, jour, id_periode, code_matiere, id_professeur, id_salle, id_semaine, type_seance } = req.body;

    if (!type_seance || !['CM', 'TD', 'TP'].includes(String(type_seance).toUpperCase())) {
        return res.status(400).json({ success: false, message: "Le type de séance est obligatoire (CM, TD, TP)." });
    }

    const sql = `UPDATE emploi_seance 
                 SET id_groupe=?, jour=?, id_periode=?, code_matiere=?, id_professeur=?, id_salle=?, id_semaine=?, type_seance=? 
                 WHERE id_seance=?`;

    db.query(sql, [id_groupe, jour, id_periode, code_matiere, id_professeur, id_salle, id_semaine, String(type_seance).toUpperCase(), id], (err, result) => {
        if(err) return res.status(500).json({ success:false, message: err.message });
        res.json({ success:true, message:'Séance modifiée' });
    });
};