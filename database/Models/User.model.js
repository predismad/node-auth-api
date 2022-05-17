const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
require('dotenv').config();

const UserSchema = new Schema({
    email: {
        unique: true,
        type: String,
        lowercase: true,
        required: true
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
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

// HASH PASSWORD AND CHECK IF USER IS AN ADMIN BEFORE SAVING TO DATABASE
UserSchema.pre('save', async function (next) {
    if (this.isNew) {
        const hashedPassword = await bcrypt.hashSync(this.password, 10);
        this.password = hashedPassword;
        this.admin = checkAdminStatus(this.email);
    }
    next();
});

// VALIDATE PASSWORD
UserSchema.methods.isPasswordValid = (password, savedPassword) => {
    return bcrypt.compareSync(password, savedPassword);
};

// CHECK IF EMAIL OF USER IS LISTED IN ADMIN MAILS
function checkAdminStatus(email) {
    const ADMIN_MAILS = process.env.ADMIN_MAILS.split(', ');
    return ADMIN_MAILS.includes(email.toLowerCase());
};

const User = mongoose.model('User', UserSchema);
module.exports = User;