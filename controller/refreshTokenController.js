const RefreshToken = require("../database/models/RefreshToken.model");

async function deleteRefreshToken(token) {
    await RefreshToken.findOneAndDelete({ token: token });
}

async function deleteAllRefreshTokensForUser(userID) {
    await RefreshToken.deleteMany({ user: userID });
}

async function findRefreshToken(token) {
    const tokenFromDatabase = await RefreshToken.findOne({ token: token });

    if (!tokenFromDatabase) {
        return null
    }

    return tokenFromDatabase;
}

async function saveRefreshTokenInDatabase(refreshToken, id) {
    const newToken = new RefreshToken({
        token: refreshToken,
        user: id
    });
    await newToken.save();
}

module.exports = {
    deleteRefreshToken,
    findRefreshToken,
    deleteAllRefreshTokensForUser,
    saveRefreshTokenInDatabase
}