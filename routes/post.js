const express = require('express');
const Post = require('../models/Post');
const router = express.Router();

// Fetch all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find(); // Fetch posts from MongoDB
        res.status(200).json(posts); // Return posts as JSON
    } catch (err) {
        console.error('Error fetching posts:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new post
router.post('/', async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    try {
        const newPost = new Post({
            title,
            content,
            user: null, // Optional for now
        });

        const savedPost = await newPost.save();
        res.status(201).json({
            message: 'Post created successfully',
            post: savedPost,
        });
    } catch (err) {
        console.error('Error in POST /api/posts:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;