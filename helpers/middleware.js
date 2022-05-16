const jwt = require('../helpers/jwt');
const User = require('../database/models/user');
const bcrypt = require('bcrypt');

// VERIFIES JWT AND RETURNS USER IF VALID
exports.verifyToken = async (req, res, next) => {
    var token = jwt.getTokenFromRequest(req.headers['authorization'], req.params.token);
    if (!token) {
        return res.status(400).json({
            message: "No token provided"
        });
    }
    try {
        const decodedToken = jwt.decodeJWT(token);
        const user = await User.findById(decodedToken.userID);
        // NO USER FOUND IN DATABASE
        if (!user) {
            return res.status(404).json({
                message: "User does not exist"
            });
        }
        // USER FOUND IN DATABASE
        req.user = user;
        next();
    } catch(err) {
        // TOKEN IS INVALID
        return res.status(401).json({
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
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    // PASSWORD IS INVALID
    if (!isPasswordValid) {
        return res.status(401).json({
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
        return res.status(403).json({
            message: "Your account is not activated. Please check your email's for the activation link."
        });
    }
    next();
};