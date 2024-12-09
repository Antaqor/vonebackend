const mongoose = require('mongoose');
const { Schema, model, models } = mongoose;

const PostSchema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
        title: { type: String, required: true },
        content: { type: String, required: true },
    },
    { timestamps: true }
);

const Post = models.Post || model('Post', PostSchema);
module.exports = Post;