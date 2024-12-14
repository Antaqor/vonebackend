import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import User from '../models/User.js';

const router = express.Router();
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extName) {
        return cb(null, true);
    }
    cb(new Error('Only JPEG and PNG images are allowed'));
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: fileFilter,
});

router.post('/register', upload.single('profilePicture'), async (req, res) => {
    const { username, email, phoneNumber, password, role } = req.body;
    const profilePicture = req.file ? req.file.buffer : null;
    const profilePictureType = req.file ? req.file.mimetype : null;

    try {
        const existingUser = await User.findOne({
            $or: [{ username }, { email }, { phoneNumber }],
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Username, Email, or Phone Number already in use' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let userRole = 'user';
        if (role === 'stylist') {
            userRole = 'stylist';
        }

        const newUser = new User({
            username,
            email,
            phoneNumber,
            password: hashedPassword,
            profilePicture,
            profilePictureType,
            role: userRole,
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Server error, please check logs for more details' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture ? `/api/auth/profile-picture/${user._id}` : '',
            },
            token,
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Server error, please check logs for more details' });
    }
});

router.get('/profile-picture/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user || !user.profilePicture) {
            return res.status(404).json({ error: 'Profile picture not found' });
        }

        res.set('Content-Type', user.profilePictureType || 'image/jpeg');
        res.send(user.profilePicture);
    } catch (err) {
        console.error('Error fetching profile picture:', err);
        res.status(500).json({ error: 'Server error, please check logs for more details' });
    }
});

router.use((err, req, res, next) => {
    if (err) {
        console.error('Unknown Error:', err.message);
        return res.status(400).json({ error: err.message });
    }
    next();
});

export default router;