const mongoose = require("mongoose");

const groupMessageSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
    },
    fromUser: {
        type: String,
        required: true,
    },
    message: {
        type: String, 
        required: true,
    },
    dateAndTime: {
        type: Date,  
        required: true
    }
});

const GroupMessages = mongoose.model("GroupMessages", groupMessageSchema);
module.exports = GroupMessages;