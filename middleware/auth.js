const { getUserWithoutPassword } = require("../controller/userController");
const { generateAccessToken, getAccessTokenFromRequestAndVerify, getRefreshTokenFromRequestAndVerify } = require("../helpers/jwt");

async function verifyAccessToken(req, res, next) {
    const verifiedAccessToken = getAccessTokenFromRequestAndVerify(req);

    if (!verifiedAccessToken) {
        return res.status(401).json({
            message: "Access-Token is invalid"
        });
    }

    const user = await getUserWithoutPassword(verifiedAccessToken.userID);

    if (!user) {
        return res.status(404).json({
            message: "User referenced in the access-token was not found"
        });
    }

    req.user = user;

    next();
}

async function verifyRefreshToken(req, res, next) {
    const verifiedRefreshToken = await getRefreshTokenFromRequestAndVerify(req);

    if (!verifiedRefreshToken) {
        return res.status(401).json({
            message: "Refresh token is invalid"
        });
    }

    const newAccessToken = generateAccessToken(verifiedRefreshToken?.userID);
    req.accessToken = newAccessToken;

    next();
}

async function verifyAdminStatus(req, res, next) {
    if (!req?.user?.admin) {
        return res.status(403).json({
            message: "User needs to be an admin"
        });
    }

    next();
}

module.exports = { verifyAccessToken, verifyRefreshToken, verifyAdminStatus }