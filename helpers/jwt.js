require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.createLoginToken = (userID) => {
    return jwt.sign({ userID }, JWT_SECRET, { expiresIn: '24h' });
};

exports.createActivationToken = (userID) => {
    return jwt.sign({ userID }, JWT_SECRET, { expiresIn: '1h' });
};

exports.createResetToken = (userID) => {
    return jwt.sign({ userID }, JWT_SECRET, { expiresIn: '15m' });
};

exports.decodeJWT = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

exports.getTokenFromRequest = (authHeader, reqParamsToken) => {
    if (authHeader) {
        return authHeader.split(' ')[1];
    } else if (reqParamsToken) {
        return reqParamsToken;
    } else {
        return undefined;
    }
};