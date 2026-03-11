const nodemailer = require("nodemailer");

function createTransporter() {
    const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
    const emailPort = Number(process.env.EMAIL_PORT || 587);
    const emailUser = (process.env.EMAIL_USER || "").trim();
    const rawEmailPassword = (process.env.EMAIL_PASSWORD || "").trim();
    // Gmail affiche parfois le mot de passe d'application avec des espaces visuels.
    const emailPassword = emailHost.includes("gmail")
        ? rawEmailPassword.replace(/\s+/g, "")
        : rawEmailPassword;

    if (!emailUser || !emailPassword || emailUser.includes("your-email@") || emailPassword === "your-email-password") {
        return null;
    }

    return nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465,
        auth: {
            user: emailUser,
            pass: emailPassword
        }
    });
}

const sendOTP = async (email, otp) => {
    const htmlContent = `
        <div style='font-family:sans-serif;max-width:500px;margin:auto;padding:30px;background:#f8fafc;border-radius:16px;'>
            <h2 style='color:#2563eb;'>Réinitialisation du mot de passe</h2>
            <p>Votre code de vérification est :</p>
            <div style='font-size:36px;font-weight:bold;letter-spacing:12px;color:#1e40af;padding:20px;background:#eff6ff;border-radius:12px;text-align:center;'>
                ${otp}
            </div>
            <p style='color:#64748b;font-size:0.9rem;margin-top:16px;'>
                Ce code expire dans <strong>10 minutes</strong>.
            </p>
            <p style='color:#64748b;font-size:0.85rem;margin-top:20px;'>
                Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </p>
        </div>
    `;

    const transporter = createTransporter();

    if (!transporter) {
        throw new Error("Configuration email invalide. Renseignez EMAIL_HOST, EMAIL_PORT, EMAIL_USER et EMAIL_PASSWORD dans public/.env.");
    }

    try {
        await transporter.sendMail({
            from: (process.env.EMAIL_USER || "").trim(),
            to: email,
            subject: "Code de réinitialisation - SupNum",
            html: htmlContent
        });
        return { delivered: true, mode: "smtp" };
    } catch (error) {
        console.error("Email send error:", error);
        if (error && error.code === "EAUTH") {
            throw new Error("Echec d'authentification SMTP Gmail. Utilisez EMAIL_USER valide et un mot de passe d'application Google (16 caracteres).");
        }
        throw new Error("Impossible d'envoyer l'email de verification");
    }
};

module.exports = { sendOTP };
