import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err);
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}

export default authenticateToken;