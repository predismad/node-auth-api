const jwt = require('../helpers/jwt');
const User = require('../database/Models/User.model');
const { messages, statusCodes } = require('./constants');

// VERIFIES JWT AND RETURNS USER IF VALID
exports.verifyToken = async (req, res, next) => {
    var token = jwt.getTokenFromRequest(req.headers['authorization'], req.params.token);
    if (!token) {
        return res.status(statusCodes.BAD_REQUEST).json({
            message: messages.NO_TOKEN_PROVIDED
        });
    }
    try {
        const decodedToken = jwt.decodeJWT(token);
        const user = await User.findById(decodedToken.userID);
        // NO USER FOUND IN DATABASE
        if (!user) {
            return res.status(statusCodes.NOT_FOUND).json({
                message: messages.NO_USER
            });
        }
        // USER FOUND IN DATABASE
        req.user = user;
        next();
    } catch(err) {
        // TOKEN IS INVALID
        return res.status(statusCodes.UNAUTHORIZED).json({
            message: messages.INVALID_TOKEN,
            error: err
        });
    }
};

// GET THE USER WITH PROVIDED CREDENTIALS
exports.getUser = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    // NO USER FOUND IN DATABASE
    if (!user) {
        return res.status(statusCodes.UNAUTHORIZED).json({
            message: messages.INVALID_CREDENTIALS
        });
    }
    const isPasswordValid = user.isPasswordValid(password, user.password);
    // IF PASSWORD IS INVALID
    if (!isPasswordValid) {
        return res.status(statusCodes.UNAUTHORIZED).json({
            message: messages.INVALID_CREDENTIALS
        });
    }
    req.user = user;
    next();
};

// CHECK ACTIVATION STATUS OF USER
exports.checkActivationStatus = async (req, res, next) => {
    const userIsActivated = req.user.activated;
    // USER IS NOT ACTIVATED
    if (!userIsActivated) {
        return res.status(statusCodes.UNAUTHORIZED).json({
            message: messages.USER_NOT_ACTIVATED
        });
    }
    next();
};

// CHECK ADMIN STATUS OF USER
exports.checkAdminStatus = async (req, res, next) => {
    const isAdmin = req.user.admin;
    // USER IS NOT ACTIVATED
    if (!isAdmin) {
        return res.status(statusCodes.FORBIDDEN).json({
            message: messages.ACCESS_DENIED
        });
    }
    next();
};