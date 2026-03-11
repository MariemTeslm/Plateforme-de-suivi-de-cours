// routes/emploi.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db.js'); // <-- ton fichier de connexion existant

// Middleware pour vérifier session
function authMiddleware(req, res, next) {
  if (!req.session.id_etudiant) {
    return res.send("Vous devez être connecté pour voir votre emploi du temps !");
  }
  next();
}

router.get('/', authMiddleware, async (req, res) => {
  const id_etudiant = req.session.id_etudiant;
  const id_groupe = req.session.id_groupe;

  try {
    // 🔹 Infos étudiant et groupe
    const [etudiantRows] = await pool.query(`
      SELECT e.nom AS nom_etudiant, g.nom AS nom_groupe 
      FROM etudiant e
      JOIN groupe g ON e.id_groupe = g.id_groupe
      WHERE e.id_etudiant = ?
    `, [id_etudiant]);

    if (!etudiantRows.length) return res.send("Étudiant introuvable !");
    const etudiant = etudiantRows[0];

    // 🔹 Semaine active ou courante
    let [semaineRows] = await pool.query(`SELECT * FROM semaines WHERE is_active = 1 LIMIT 1`);
    if (!semaineRows.length) {
      [semaineRows] = await pool.query(`
        SELECT * FROM semaines WHERE CURDATE() BETWEEN date_debut AND date_fin LIMIT 1
      `);
    }
    if (!semaineRows.length) return res.send("Aucune semaine valide trouvée !");
    const id_semaine = semaineRows[0].id;

    // 🔹 Périodes et jours
    const [periodes] = await pool.query(`SELECT * FROM periode ORDER BY heure_debut`);
    const jours = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

    // 🔹 Emploi du temps
    const [seances] = await pool.query(`
      SELECT e.jour, per.id_periode, per.heure_debut, per.heure_fin,
             m.nom AS matiere, p.nom AS professeur, s.nom_salle AS salle
      FROM emploi_seance e
      JOIN periode per ON e.id_periode = per.id_periode
      JOIN matiere m ON e.code_matiere = m.code
      JOIN professeur p ON e.id_professeur = p.id_professeur
      JOIN salle s ON e.id_salle = s.id_salle
      WHERE e.id_groupe = ? AND e.id_semaine = ?
    `, [id_groupe, id_semaine]);

    // Transformer en objet pour accès rapide par jour + période
    const emploi = {};
    seances.forEach(s => {
      if (!emploi[s.jour]) emploi[s.jour] = {};
      emploi[s.jour][s.id_periode] = s;
    });

    res.render('emploi', { etudiant, periodes, jours, emploi });

  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

module.exports = router;