const db = require("../config/db");

// Récupérer tous les groupes
exports.getGroupes = async (req, res) => {
    try {
        const [groupes] = await db.query("SELECT id_groupe, nom FROM groupe ORDER BY nom");
        if (groupes.length === 0) return res.status(404).json({ success: false, message: "Aucun groupe trouvé" });
        res.json({ success: true, data: groupes });
    } catch (error) {
        console.error("Erreur getGroupes:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Récupérer tous les professeurs
exports.getProfesseurs = async (req, res) => {
    try {
        const [profs] = await db.query("SELECT id_professeur, nom FROM professeur ORDER BY nom");
        if (profs.length === 0) return res.status(404).json({ success: false, message: "Aucun professeur trouvé" });
        res.json({ success: true, data: profs });
    } catch (error) {
        console.error("Erreur getProfesseurs:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Récupérer l'emploi du temps avec filtres
exports.getEmploiData = async (req, res) => {
    try {
        const { id_groupe, id_professeur } = req.query;

        // Périodes
        const [periodes] = await db.query("SELECT id_periode, heure_debut, heure_fin FROM periode ORDER BY heure_debut");

        // Semaine active
        let [semaine_active] = await db.query("SELECT id FROM semaines WHERE is_active = 1 LIMIT 1");
        if (semaine_active.length === 0) {
            [semaine_active] = await db.query(
                "SELECT id FROM semaines WHERE CURDATE() BETWEEN date_debut AND date_fin LIMIT 1"
            );
        }
        if (semaine_active.length === 0) return res.status(404).json({ success: false, message: "Aucune semaine active trouvée" });
        const id_semaine = semaine_active[0].id;

        // Construire la requête dynamique selon les filtres
        let query = `
            SELECT e.jour, per.id_periode, per.heure_debut, per.heure_fin,
                   m.nom AS matiere, p.nom AS professeur, g.nom AS groupe, s.nom_salle AS salle
            FROM emploi_seance e
            JOIN periode per ON e.id_periode = per.id_periode
            JOIN matiere m ON e.code_matiere = m.code
            JOIN professeur p ON e.id_professeur = p.id_professeur
            JOIN groupe g ON e.id_groupe = g.id_groupe
            JOIN salle s ON e.id_salle = s.id_salle
            WHERE e.id_semaine = ?
        `;
        const params = [id_semaine];
        if (id_groupe) { query += " AND e.id_groupe = ?"; params.push(id_groupe); }
        if (id_professeur) { query += " AND e.id_professeur = ?"; params.push(id_professeur); }
        query += " ORDER BY e.jour, per.heure_debut";

        const [emploi] = await db.query(query, params);

        // Récupérer le nom du groupe si filtré
        let nomGroupe = null;
        if (id_groupe) {
            const [groupe] = await db.query("SELECT nom FROM groupe WHERE id_groupe = ?", [id_groupe]);
            if (groupe.length > 0) nomGroupe = groupe[0].nom;
        }

        res.json({
            success: true,
            data: {
                periodes,
                emploi,
                jours: ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
                nomGroupe
            }
        });
    } catch (error) {
        console.error("Erreur getEmploiData:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};