const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RefreshTokenSchema = new Schema({
    token: {
        unique: true,
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

const RefreshRoken = mongoose.model('RefreshToken', RefreshTokenSchema);
module.exports = RefreshRoken;