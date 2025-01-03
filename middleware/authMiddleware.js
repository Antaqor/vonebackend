// middleware/authMiddleware.js
// ===============================================================
const jwtMiddleware = require("jsonwebtoken");

// This middleware checks for a valid JWT in the Authorization header
module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Malformed token" });
    jwtMiddleware.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
};