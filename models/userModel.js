const bcryptjs = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must have a name'],
        minLength: [1, 'Name must be atleast 1 character long']
    },
    username: { // TODO: add regex validation
        type: String,
        unique: [true, 'Username must be unique. Specified username was already chosen.'],
        required: [true, 'User must have a username'],
        minLength: [1, 'Username must be atleast 1 character long']
    },
    email: {
        type: String,
        unique: [true, 'Email must be unique. Specified email was already chosen.'],
        required: [true, 'User must have an email'],
        validate: {
            validator: emailVal => validator.isEmail(emailVal),
            message: 'You must provide a valid email id'
        }
    },
    mobile: {
        type: Number,
        unique: [true, 'Mobile number must be unique. Specified mobile number was already chosen'],
        required: [true, 'User must have a mobile number'],
        validate: {
            validator: mobileNum => validator.isMobilePhone(`${mobileNum}`),
            message: 'You must provide a valid mobile number'
        }
    },
    password: { // TODO: add regex validation
        type: String,
        required: [true, 'Password is required'],
        minLength: [8, 'Password must be atleast 8 characters long'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: true,
        validate: {
            validator: function(confirmPwd) {
                return this.password === confirmPwd;
            },
            message: 'Password and PasswordConfirm must match' 
        }
    },
    passwordChangedAt: {
        type: Date
    },
    profilePhoto: {
        type: String,
        default: ''
    },
    following: {
        type: [mongoose.Types.ObjectId],
        default: []
    },
    followers: {
        type: [mongoose.Types.ObjectId],
        default: []
    },
    pendingReqSent: {
        type: [mongoose.Types.ObjectId],
        default: []
    },
    pendingReqReceived: {
        type: [mongoose.Types.ObjectId],
        default: []
    },
    description: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'merchant', 'admin'],
        default: 'user'
    }   // TODO: add fields to support RESET PASSWORD feature
}, {    // This option adds createdAt, updatedAt fields which are handled automatically
    timestamps: true
});

// *** INSTANCE METHODS ***

// ** Method to compare passwordFromCLIENT with hashedPasswordStoreInDB **
userSchema.methods.comparePasswords = async function(givenPassword, actualHashedPassword) {
    const res = await bcryptjs.compare(givenPassword, actualHashedPassword);
    return res;
};

// ** Method to check if user pwd was changed after a specified time **
userSchema.methods.passwordChangedAfter = function(candidateTimeInSeconds) {
    if(!this.passwordChangedAt) return false;
    return this.passwordChangedAt.getTime() >= (candidateTimeInSeconds * 1000);
}

// *** MIDDLEWARES ***

// ** Pre Save middleware to encrypt password **
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) {  // encrypt only when pwd is saved/changed
        return next();
    }
    this.password = await bcryptjs.hash(this.password, 10);
    this.passwordConfirm = undefined;
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;