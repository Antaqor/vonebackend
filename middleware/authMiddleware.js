const jwt = require("jsonwebtoken");

/**
 * Middleware to authenticate via Bearer token (JWT).
 */
module.exports = function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "Authorization header missing" });
        }

        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({ error: "Use 'Bearer <token>' format" });
        }

        const token = parts[1];
        if (!token) {
            return res.status(401).json({ error: "Token is missing" });
        }

        const secret = process.env.JWT_SECRET || "change-me";
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: "Token invalid or expired" });
            }
            req.user = decoded; // Attach user (decoded payload) to request
            next();
        });
    } catch (err) {
        console.error("Error in authenticateToken:", err);
        return res.status(500).json({ error: "Server error in authMiddleware" });
    }
};
