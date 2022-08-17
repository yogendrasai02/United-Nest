const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        default: ''
    },
    contentType: {
        type: String, 
        enum: ['text', 'image', 'video', 'imageText', 'videoText'],
        required: true
    },
    user: {
        type: Schema.ObjectId,
        required: true
    },
    postedAt: {
        type: Date,
        required: true
    },
    reactionsCnt: {
        type: Map,
        of: Number,
        default: {'likes': 0, 'dislikes': 0, 'love': 0, 'funny': 0, 'angry': 0, 'wow': 0, 'sad': 0, 'comments': 0}
    },
    hashTags: {
        type: [String],
        required: true
    },
    images: {
        type: [String],
        default: []
    },
    video: {
        type: String,
        default: ''
    },
    updatedAt: {
        type: Date,
        required: true
    }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;