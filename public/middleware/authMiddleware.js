const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "Authentification requise" 
        });
    }

    try {
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || "fallback_secret"
        );
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: "Token invalide ou expiré" 
        });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: "Authentification requise" 
            });
        }

        if (!Array.isArray(roles)) {
            roles = [roles];
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: "Accès refusé" 
            });
        }

        next();
    };
};

module.exports = { authMiddleware, requireRole };
