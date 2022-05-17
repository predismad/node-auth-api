require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// CREATE LOGIN TOKEN
exports.createLoginToken = (userID) => {
    return jwt.sign({ userID }, JWT_SECRET, { expiresIn: '24h' });
};

// CREATE ACCOUNT ACTIVATION TOKEN
exports.createActivationToken = (userID) => {
    return jwt.sign({ userID }, JWT_SECRET, { expiresIn: '1h' });
};

// CREATE PASSWORD RESET TOKEN
exports.createResetToken = (userID) => {
    return jwt.sign({ userID }, JWT_SECRET, { expiresIn: '15m' });
};

// VERIFIES THE TOKEN
exports.decodeJWT = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

// GET TOKEN FROM REQUEST HEADER OR PARAMS
exports.getTokenFromRequest = (authHeader, reqParamsToken) => {
    if (authHeader) {
        return authHeader.split(' ')[1];
    } else if (reqParamsToken) {
        return reqParamsToken;
    } else {
        return undefined;
    }
};