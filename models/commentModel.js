const mongoose = require("mongoose");
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    post: {
        type: ObjectId,
        required: true,
    },
    user: {
        type: ObjectId,
        required: true,
    },
    commentedAt: {
        type: Date,
        required: true,
    },
    reactionsCnt: {
        type: Map,
        of: Number,
        default: {'likes': 0, 'dislikes': 0, 'love': 0, 'funny': 0, 'angry': 0, 'wow': 0, 'sad': 0, 'comments': 0}
    },
    subComment: {
        type: [ObjectId], 
        default: [],
    },
    parentComment: {
        type: ObjectId,
        default: null,
    },
    updatedAt: {
        type: Date,
        required: true
    }
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;