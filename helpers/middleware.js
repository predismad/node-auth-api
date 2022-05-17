const jwt = require('../helpers/jwt');
const User = require('../database/Models/User.model');
const status = require('./httpStatusCodes');

// VERIFIES JWT AND RETURNS USER IF VALID
exports.verifyToken = async (req, res, next) => {
    var token = jwt.getTokenFromRequest(req.headers['authorization'], req.params.token);
    if (!token) {
        return res.status(status.BAD_REQUEST).json({
            message: "No token provided"
        });
    }
    try {
        const decodedToken = jwt.decodeJWT(token);
        const user = await User.findById(decodedToken.userID);
        // NO USER FOUND IN DATABASE
        if (!user) {
            return res.status(status.NOT_FOUND).json({
                message: "User does not exist"
            });
        }
        // USER FOUND IN DATABASE
        req.user = user;
        next();
    } catch(err) {
        // TOKEN IS INVALID
        return res.status(status.UNAUTHORIZED).json({
            message: "Invalid token",
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
        return res.status(status.UNAUTHORIZED).json({
            message: "Invalid credentials"
        });
    }
    const isPasswordValid = user.isPasswordValid(password, user.password);
    // IF PASSWORD IS INVALID
    if (!isPasswordValid) {
        return res.status(status.UNAUTHORIZED).json({
            message: "Invalid credentials"
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
        return res.status(status.UNAUTHORIZED).json({
            message: "Your account is not activated. Please check your email's for the activation link."
        });
    }
    next();
};

// CHECK ADMIN STATUS OF USER
exports.checkAdminStatus = async (req, res, next) => {
    const isAdmin = req.user.admin;
    // USER IS NOT ACTIVATED
    if (!isAdmin) {
        return res.status(status.FORBIDDEN).json({
            message: "Access denied. You need to be an admin to view this resource."
        });
    }
    next();
};