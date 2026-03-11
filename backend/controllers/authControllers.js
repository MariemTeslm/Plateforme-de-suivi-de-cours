const db = require("../database/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Table names in database are 'admin', 'professeur', 'etudiant'
        const roleConfig = [
            { role: 'professeur', table: 'professeur', idField: 'id_professeur' },
            { role: 'etudiant', table: 'etudiant', idField: 'id_etudiant' },
            { role: 'administrateur', table: 'admin', idField: 'id_admin' }
        ];

        let user = null;
        let matchedConfig = null;

        for (const config of roleConfig) {
            const [rows] = await db.query(`SELECT * FROM ${config.table} WHERE email = ?`, [email]);
            if (rows.length > 0) {
                user = rows[0];
                matchedConfig = config;
                break;
            }
        }

        if (!user) {
            return res.status(401).json({ success: false, message: "Utilisateur non trouvé" });
        }

        const isMatch = await bcrypt.compare(password, user.mot_de_passe);
        const isPlainTextMatch = password === user.mot_de_passe;

        if (!isMatch && !isPlainTextMatch) {
            return res.status(401).json({ success: false, message: "Mot de passe incorrect" });
        }

        const userId = user[matchedConfig.idField];
        let userGroup = null;

        if (matchedConfig.role === 'etudiant') {
            const [grpRows] = await db.query(`
                SELECT g.nom FROM groupe g
                JOIN etudiant_groupe eg ON g.id_groupe = eg.id_groupe
                WHERE eg.id_etudiant = ?
            `, [userId]);
            if (grpRows.length > 0) {
                userGroup = grpRows[0].nom; // Take first group for schedule purposes
            }
        }

        const token = jwt.sign(
            { id: userId, role: matchedConfig.role, nom: user.nom, groupe: userGroup },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "1d" }
        );

        res.json({
            success: true,
            message: "Connexion réussie",
            token,
            user: {
                id: userId,
                id_etudiant: userId,
                nom: user.nom,
                email: user.email,
                role: matchedConfig.role,
                groupe: userGroup
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

module.exports = { login };
