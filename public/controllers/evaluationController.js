const evaluationModel = require('../models/evaluationModel');

// GET toutes les séances de la semaine active pour un étudiant
exports.getSeances = (req, res) => {
    const id_etudiant = req.params.id_etudiant;
    evaluationModel.getSeancesByEtudiant(id_etudiant, (err, results) => {
        if(err) return res.status(500).json({ message: err.message });
        res.json(results);
    });
};

// PUT mettre à jour la séance (fait / ratée)
exports.updateSeance = (req, res) => {
    const id_seance = req.params.id_seance;
    const type = req.body.type; // "CM", "TD", "TP"
    evaluationModel.updateSeance(id_seance, type, (err, result) => {
        if(err) return res.status(500).json({ message: err.message });
        res.json(result);
    });
};