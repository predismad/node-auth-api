const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('../helpers/jwt');
const mail = require('../helpers/sendMail');
const User = require('../database/Models/User.model');
const middleware = require('../helpers/middleware');
const status = require('../helpers/httpStatusCodes');

// CREATE NEW USER
router.post("/create", async (req, res) => {
    const { email, password } = req.body;
    const newUser = new User({
        email: email,
        password: password,
    });
    newUser.save(async (err, user) => {
        if (err) {
            return res.status(status.CONFLICT).json({
                message: "E-Mail already exists",
                error: err
            });
        }
        const activationToken = jwt.createActivationToken(user._id);
        await mail.sendAccountActivationMail(email, activationToken);
        return res.status(status.CREATED).json({
            message: "User created successfully. Check your emails to activate your account."
        });
    });
});

// ACTIVATE USER
router.get("/activate/:token", middleware.verifyToken, async (req, res) => {
    const user = req.user;
    const userIsActivated = user.activated;
    // IF USER IS NOT ACTIVATED
    if (!userIsActivated) {
        await User.findByIdAndUpdate(user._id, { activated: true });
        return res.status(status.OK).json({
            message: "Account activated successfully"
        });
    }
    // IF USER IS ALREADY ACTIVATED
    return res.status(status.OK).json({
        message: "Account already activated"
    });
});

// RESEND ACTIVATION LINK
router.post("/resend-activation-link", middleware.getUser, async (req, res) => {
    const user = req.user;
    const userIsActivated = user.activated;
    // USER IS NOT ACTIVATED
    if (!userIsActivated) {
        const activationToken = jwt.createActivationToken(user._id);
        mail.sendAccountActivationMail(user.email, activationToken);
        return res.status(status.OK).json({
            message: "Account activation mail send successfully"
        });
    }
    // USER IS ALREADY ACTIVATED
    return res.status(status.OK).json({
        message: "Account is already activated"
    });
});

// LOGIN WITH EXISTING USER
router.post("/login", middleware.getUser, middleware.checkActivationStatus, async (req, res) => {
    const user = req.user;
    // CREATE 
    const token = jwt.createLoginToken(user._id);
    // SET LAST LOGIN DATE
    User.findOneAndUpdate({ _id: user._id }, { lastLogin: Date.now() }, { new: true }, (err, user) => {
        if (err) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({
                message: "Login failed",
                error: err
            });
        }
         // RETURN TOKEN AND USER DATA
        return res.status(status.OK).json({
            message: "User logged in successfully",
            token: token,
            user: {
                email: user.email,
                admin: user.admin,
                lastLogin: user.lastLogin.toString(),
                createdAt: user.createdAt.toString()
            },
        });
    });
});

// GET USER VIA TOKEN
router.get("/", middleware.verifyToken, middleware.checkActivationStatus, async (req, res) => {
    return res.status(status.OK).json({
        message: "User found",
        user: {
            email: req.user.email,
            admin: req.user.admin,
            lastLogin: req.user.lastLogin.toString(),
            createdAt: req.user.createdAt.toString()
        }
    });
});

// EXAMPLE ROUTE FOR ADMINS ONLY
router.get("/admin", middleware.verifyToken, middleware.checkActivationStatus, middleware.checkAdminStatus, async (req, res) => {
    return res.status(status.OK).json({
        message: "You are an admin!"
    });
});

// FORGOT PASSWORD - SEND EMAIL WITH LINK TO RESET PASSWORD
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    // NO USER FOUND IN DATABASE
    if (!user) {
        return res.status(status.NOT_FOUND).json({
            message: "No user found with this email"
        });
    }
    // send password reset link to user
    const resetToken = jwt.createResetToken(user._id);
    mail.sendPasswordResetMail(email, resetToken);
    return res.status(status.OK).json({
        message: "Send reset instructions to your email"
    });
});

// RESET PASSWORD
router.post("/reset-password/:token", middleware.verifyToken, async (req, res) => {
    const { newPassword } = req.body;
    const user = req.user;
    // HASH NEW PASSWORD
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // UPDATE USER PASSWORD
    User.findOneAndUpdate({ _id: user._id }, { password: hashedPassword }, (err, user) => {
        if (err) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({
                message: "Password reset failed",
                error: err
            });
        }
        // SUCCESSFULLY RESET PASSWORD
        return res.status(status.OK).json({
            message: "Password reset successfully"
        });
    });
});

// DELETE USER
router.delete("/", middleware.verifyToken, async (req, res) => {
    const user = req.user;
    // DELETE USER OUT OF DATABASE
    await User.findByIdAndDelete(user._id);
    return res.status(status.OK).json({
        message: "User deleted successfully"
    });
});

module.exports = router;