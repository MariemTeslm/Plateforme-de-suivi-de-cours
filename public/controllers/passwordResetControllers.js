const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { sendOTP } = require("../utils/mailer");

// 1. Demander réinitialisation (envoyer OTP)
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        const roleConfig = [
            { role: 'professeur', table: 'professeur' },
            { role: 'etudiant', table: 'etudiant' },
            { role: 'administrateur', table: 'administrateur' }
        ];

        let user = null;
        let role = null;

        for (const config of roleConfig) {
            const [rows] = await db.query(`SELECT * FROM ${config.table} WHERE email = ?`, [email]);
            if (rows.length > 0) {
                user = rows[0];
                role = config.role;
                break;
            }
        }

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "Aucun compte trouvé avec cet email" 
            });
        }

        // Générer OTP (6 chiffres)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Supprimer anciens OTP
        await db.query("DELETE FROM password_resets WHERE email = ?", [email]);

        // Insérer nouvel OTP
        await db.query(
            "INSERT INTO password_resets (email, role, otp, expires_at) VALUES (?, ?, ?, ?)",
            [email, role, otp, expiresAt]
        );

        // Envoyer OTP par email
        await sendOTP(email, otp);

        res.json({
            success: true,
            message: "Code de verification envoye a votre email",
            email: email // Pour afficher dans le formulaire suivant
        });

    } catch (error) {
        console.error("Password reset request error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Erreur serveur" 
        });
    }
};

// 2. Vérifier OTP
const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const [resets] = await db.query(
            "SELECT * FROM password_resets WHERE email = ? AND otp = ? AND expires_at > NOW()",
            [email, otp]
        );

        if (resets.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: "Code incorrect ou expiré" 
            });
        }

        res.json({
            success: true,
            message: "Code vérifié",
            resetToken: Buffer.from(`${email}:${otp}`).toString('base64')
        });

    } catch (error) {
        console.error("OTP verification error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Erreur serveur" 
        });
    }
};

// 3. Réinitialiser le mot de passe
const resetPassword = async (req, res) => {
    const { email, otp, newPassword, confirmPassword } = req.body;

    try {
        // Vérifications basiques
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: "Les mots de passe ne correspondent pas" 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: "Le mot de passe doit contenir au moins 6 caractères" 
            });
        }

        // Vérifier OTP
        const [resets] = await db.query(
            "SELECT * FROM password_resets WHERE email = ? AND otp = ? AND expires_at > NOW()",
            [email, otp]
        );

        if (resets.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: "Code incorrect ou expiré" 
            });
        }

        const role = resets[0].role;
        const table = role === 'administrateur' ? 'administrateur' : role;

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe
        await db.query(
            `UPDATE ${table} SET mot_de_passe = ? WHERE email = ?`,
            [hashedPassword, email]
        );

        // Supprimer l'OTP
        await db.query(
            "DELETE FROM password_resets WHERE email = ? AND role = ?",
            [email, role]
        );

        res.json({
            success: true,
            message: "Mot de passe réinitialisé avec succès",
            redirect: "/views/Login/index.html"
        });

    } catch (error) {
        console.error("Password reset error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Erreur serveur" 
        });
    }
};

module.exports = { requestPasswordReset, verifyOTP, resetPassword };
