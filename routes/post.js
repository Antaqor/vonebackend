// server/routes/post.js

import express from 'express';
import Post from '../models/Post.js';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();

// Fetch all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('user', 'username'); // Populate user data
        res.status(200).json(posts); // Return posts as JSON
    } catch (err) {
        console.error('Error fetching posts:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new post (secured route)
router.post('/', authenticateToken, async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    try {
        const newPost = new Post({
            title,
            content,
            user: req.user.id, // Associate post with authenticated user
        });

        const savedPost = await newPost.save();
        const populatedPost = await savedPost.populate('user', 'username'); // Populate user data

        res.status(201).json({
            message: 'Post created successfully',
            post: populatedPost,
        });
    } catch (err) {
        console.error('Error in POST /api/posts:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;