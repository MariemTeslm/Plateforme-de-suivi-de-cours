const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Table names in database are 'administrateur', 'professeur', 'etudiant'
        const roleConfig = [
            { role: 'professeur', table: 'professeur', idField: 'id_professeur' },
            { role: 'etudiant', table: 'etudiant', idField: 'id_etudiant' },
            { role: 'administrateur', table: 'administrateur', idField: 'id_admin' }
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

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Mot de passe incorrect" });
        }

        const userId = user[matchedConfig.idField];
        let userGroup = null;
        let userGroupId = null;
        let allGroups = [];

        if (matchedConfig.role === 'etudiant') {
            const [grpRows] = await db.query(`
                SELECT g.id_groupe, g.nom FROM groupe g
                JOIN etudiant_groupe eg ON g.id_groupe = eg.id_groupe
                WHERE eg.id_etudiant = ?
                ORDER BY g.nom
            `, [userId]);
            
            if (grpRows.length > 0) {
                allGroups = grpRows;
                userGroupId = grpRows[0].id_groupe;
                userGroup = grpRows[0].nom; // Take first group as default
            }
        }

        const token = jwt.sign(
            { id: userId, role: matchedConfig.role, nom: user.nom, groupe: userGroup, id_groupe: userGroupId },
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
                groupe: userGroup,
                id_groupe: userGroupId,
                groupes: allGroups
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

const logout = async (req, res) => {
    try {
        // In JWT-based authentication, logout is typically handled client-side
        // by removing the token from localStorage
        // This endpoint can be used for server-side logging or cleanup
        res.json({
            success: true,
            message: "Déconnexion réussie"
        });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

const verify = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: "Token manquant" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
        res.json({
            success: true,
            user: decoded
        });
    } catch (error) {
        res.status(401).json({ success: false, message: "Token invalide" });
    }
};

module.exports = { login, logout, verify };
