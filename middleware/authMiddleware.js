const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer token

    if (!token) {
        return res.status(401).json({ error: 'No token provided, authorization denied' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token, authorization denied' });
        }
        req.user = user; // Attach the decoded user information to the request
        next();
    });
}

module.exports = authenticateToken;