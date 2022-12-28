const jwt = require('jsonwebtoken');
const { findRefreshToken, deleteRefreshToken } = require("../controller/refreshTokenController");
const { refreshTokenOptions, accessTokenOptions } = require("./config");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "unsafe_access_token_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "unsafe_refresh_token_secret";

function generateAccessToken(userID) {
    return jwt.sign({ userID }, ACCESS_TOKEN_SECRET, accessTokenOptions);
}

function generateRefreshToken(userID) {
    return jwt.sign({ userID }, REFRESH_TOKEN_SECRET, refreshTokenOptions);
}

function verifyAccessToken(token) {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch {
        return null;
    }
}

async function verifyRefreshToken(token) {
    const refreshTokenInDatabase = await findRefreshToken(token);
    
    if (!refreshTokenInDatabase) {
        return null;
    }

    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch {
        await deleteRefreshToken(refreshTokenInDatabase);
        return null;
    }
}

function getAccessTokenFromRequestAndVerify(req) {
    const authHeader = req?.headers?.authorization;
    const accessToken = authHeader?.split(" ")[1] || null;

    if (!accessToken) {
        return null;
    }

    const verifiedAccessToken = verifyAccessToken(accessToken);

    if (!verifiedAccessToken) {
        return null;
    }

    return verifiedAccessToken;
}

async function getRefreshTokenFromRequestAndVerify(req) {
    const refreshToken = req?.signedCookies["refreshToken"] || null;

    if (!refreshToken) {
        return null;
    }

    const verifiedRefreshToken = await verifyRefreshToken(refreshToken);
    if (!verifiedRefreshToken) {
        return null;
    }

    return verifiedRefreshToken;
}

module.exports = { generateAccessToken, generateRefreshToken, verifyRefreshToken, getAccessTokenFromRequestAndVerify, getRefreshTokenFromRequestAndVerify }