const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

const reactionSchema = new mongoose.Schema({
    reactionType: {
        type: String,
        enum: ['like', 'dislike', 'love', 'funny', 'angry', 'wow', 'sad'],
        required: true
    },
    reactedTo: {
        type: String,
        enum: ['post', 'comment'],
        required: true
    },
    reactedToId: {
        type: ObjectId,
        required: true
    },
    user: {
        type: ObjectId,
        required: true
    },
    reactedAt: {
        type: Date,
        default: Date.now
    }
});

const Reaction = mongoose.model("Reaction", reactionSchema);
module.exports = Reaction;