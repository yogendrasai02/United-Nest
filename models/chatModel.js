const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
    },
    users: {
        type: [String],
        required: true,
    }    
});

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;