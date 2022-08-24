const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    users: {
        type: [String],
        required: true
    },
    groupname: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;