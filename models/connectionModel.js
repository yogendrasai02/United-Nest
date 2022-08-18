const mongoose = require('mongoose');

const userConnectionSchema = new mongoose.Schema({
    requestSender: {
        type: String,
        required: [true, 'A connection request needs to be sent by a valid user']
    },
    requestReceiver: {
        type: String,
        required: [true, 'A connection request must be sent to a valid user'],
        validate: {
            validator: function(val) {
                return val != this.requestSender;
            },
            message: 'A connection request cannot be sent to the same user'
        }
    },
    requestSentTime: {
        type: Date,
        default: Date.now()
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    requestAcceptedTime: {
        type: Date
    }
});

// *** INDEXES ***

// ** Compound index between requestSender & requestReceiver, to avoid multiple duplicate requests **
userConnectionSchema.index({ requestSender: 1, requestReceiver: 1 }, { unique: true });

const UserConnection = mongoose.model('UserConnection', userConnectionSchema);

module.exports = UserConnection;