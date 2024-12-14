import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const PostSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
}, { timestamps: true });

const Post = models.Post || model('Post', PostSchema);
export default Post;