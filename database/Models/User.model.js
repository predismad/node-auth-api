const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const { days } = require('../../helpers/timeUtils');

const UserSchema = new Schema({
    email: {
        unique: true,
        type: String,
        lowercase: true,
        required: true,
        trim: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    admin: {
        type: Boolean,
        default: false,
    },
    activated: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: null
    },
    profileImagePath: {
        type: String
    },
    isSuspended: {
        type: Boolean,
        default: false
    },
    suspensionUntil: {
        type: Date,
    },
});

// Hash the password if the user is new or password was changed
// Also check the admin status before saving the user
UserSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified("password")) {
        const hashedPassword = bcrypt.hashSync(this.password, 10);
        this.password = hashedPassword;
        if (!this.admin) {
            this.admin = checkAdminStatus(this.email);
        }
    }
    next();
});

// Suspend the user for 'n' amount of days
UserSchema.methods.suspendForDays = (n) => {
    this.isSuspended = true;
    this.suspensionUntil = Date.now() + days(n);
}

// Revoke the suspension
UserSchema.methods.revokeSuspension = () => {
    this.isSuspended = false;
    this.suspensionUntil = undefined;
}

// Validate the password
UserSchema.methods.isPasswordValid = (password, savedPassword) => {
    return bcrypt.compareSync(password, savedPassword);
};

// Check if email of user is listed as an admin-mail
function checkAdminStatus(email) {
    const ADMIN_MAILS = process.env.ADMIN_MAILS.split(', ');
    return ADMIN_MAILS.includes(email.toLowerCase());
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
