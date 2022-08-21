const mongoose = require("mongoose");

const chatMessagesSchema = new mongoose.Schema({
    roomId: {
        type: String
    },
    fromUsername: {
        type: String
    },
    toUsername: {
        type: String
    },
    message: {
        type: String,
    },
    dateAndTime: {
        type: String
    }
});

const ChatMessages = mongoose.model("ChatMessages", chatMessagesSchema);
module.exports = ChatMessages;