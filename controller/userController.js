const User = require('../database/models/User.model');
const log = require('npmlog');
const { saveRefreshTokenInDatabase, deleteRefreshToken, deleteAllRefreshTokensForUser } = require("./refreshTokenController");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../helpers/jwt");
const { refreshTokenCookieOptions } = require("../helpers/config");

async function login(req, res) {
    const { email, password } = req.body;
    let user = await getUserByEmail(email);
    
    // Return 401 if user does not exist
    if (!user) {
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }

    // Return 401 if password is invalid
    if (!user.isPasswordValid(password, user.password)) {
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }

    // Update the last login date and set the refresh token in a http-only cookie
    await updateLastLoginDate(user);
    await setRefreshTokenCookie(user, res);

    // Set the password to undefined, so the password doesn't get returned
    user.password = undefined;

    return res.status(200).json({
        message: "Login successful",
        user: user,
        token: generateAccessToken(user._id)
    });
}

async function logout(req, res) {
    const refreshToken = req?.signedCookies["refreshToken"];

    if (!refreshToken) {
        return res.status(401).json({
            message: "No refresh-token provided"
        });
    }
    
    try {
        await deleteRefreshToken(refreshToken);

        return res.status(200).json({
            message: "Successfully logged out"
        });
    } catch (error) {
        log.error(error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

async function logoutAllSessions(req, res) {
    const refreshToken = req?.signedCookies["refreshToken"];

    if (!refreshToken) {
        return res.status(401).json({
            message: "No refresh-token provided"
        });
    }

    const verifiedRefreshToken = await verifyRefreshToken(refreshToken);

    if (!verifiedRefreshToken) {
        return res.status(401).json({
            message: "Refresh-token is invalid"
        });
    }

    try {
        await deleteAllRefreshTokensForUser(verifiedRefreshToken.userID);

        return res.status(200).json({
            message: "Successfully logged out from all sessions"
        });
    } catch (error) {
        log.error(error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

async function setRefreshTokenCookie(user, res) {
    const refreshToken = generateRefreshToken(user._id);
    await saveRefreshTokenInDatabase(refreshToken, user._id);
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
}

async function checkUsernameAvailability(req, res) {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({
            message: "You have to provide a username"
        });
    }

    const user = await User.findOne({ username: username.toLowerCase() });

    if (user) {
        return res.status(409).json({
            message: `Username '${username}' is not available`
        });
    }
    return res.status(200).json({
        message: `Username '${username}' is available`
    });
}

async function checkEmailAvailability(req, res) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: "You have to provide an email"
        });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
        return res.status(409).json({
            message: `E-Mail '${email}' is not available`
        });
    }
    return res.status(200).json({
        message: `E-Mail '${email}' is available`
    });
}

async function createNewUser(req, res) {
    const { email, password, displayName, username} = req.body;

    const newUser = new User({
        email: email,
        password: password,
        displayName: displayName,
        username: username,
    });
    
    newUser.save(async (err, user) => {
        if (err) {
            log.error(err);
            return res.status(409).json({
                message: "E-Mail or username already exists"
            });
        }
        user.password = undefined;

        return res.status(201).json({
            message: "User created successfully",
            user: user
        });
    });
}

async function updateLastLoginDate(user) {
    try {
        await User.findByIdAndUpdate(user._id, { lastLogin: Date.now() });
    } catch (error) {
        log.error(error);
    }
}

async function getUserWithoutPassword(userID) {
    const user = await User.findById(userID, "-password");

    if (!user) {
        return null;
    }

    return user;
}

async function getUserByEmail(email) {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        return null;
    }

    return user;
}

module.exports = { 
    login,
    logout,
    logoutAllSessions,
    createNewUser,
    updateLastLoginDate, 
    checkUsernameAvailability, 
    checkEmailAvailability, 
    getUserWithoutPassword, 
    getUserByEmail 
}