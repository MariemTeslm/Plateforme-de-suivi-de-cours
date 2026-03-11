const express = require("express");
const router = express.Router();
const passwordResetControllers = require("../controllers/passwordResetControllers");

// Demander réinitialisation (envoyer OTP)
router.post("/forgot-password", passwordResetControllers.requestPasswordReset);

// Vérifier OTP
router.post("/verify-otp", passwordResetControllers.verifyOTP);

// Réinitialiser le mot de passe
router.post("/reset-password", passwordResetControllers.resetPassword);

module.exports = router;
