const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('../helpers/jwt');
const mail = require('../helpers/sendMail');
const User = require('../database/Models/User.model');
const middleware = require('../helpers/middleware');
const { messages, statusCodes } = require('../helpers/constants');

// CREATE NEW USER
router.post("/create", async (req, res) => {
    const { email, password } = req.body;
    const newUser = new User({
        email: email,
        password: password,
    });
    newUser.save(async (err, user) => {
        if (err) {
            return res.status(statusCodes.CONFLICT).json({
                message: messages.EMAIL_ALREADY_EXISTS,
                error: err
            });
        }
        const activationToken = jwt.createActivationToken(user._id);
        await mail.sendAccountActivationMail(email, activationToken);
        return res.status(statusCodes.CREATED).json({
            message: messages.USER_CREATED
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
        return res.status(statusCodes.OK).json({
            message: messages.USER_ACTIVATED
        });
    }
    // IF USER IS ALREADY ACTIVATED
    return res.status(statusCodes.OK).json({
        message: messages.USER_ALREADY_ACTIVATED
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
        return res.status(statusCodes.OK).json({
            message: messages.ACTIVATION_MAIL_SEND
        });
    }
    // USER IS ALREADY ACTIVATED
    return res.status(statusCodes.OK).json({
        message: messages.USER_ALREADY_ACTIVATED
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
            return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
                message: messages.LOGIN_FAILED,
                error: err
            });
        }
         // RETURN TOKEN AND USER DATA
        return res.status(statusCodes.OK).json({
            message: messages.LOGIN_SUCCESSFUL,
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
    return res.status(statusCodes.OK).json({
        message: messages.USER_FOUND,
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
    return res.status(statusCodes.OK).json({
        message: messages.USER_IS_ADMIN
    });
});

// FORGOT PASSWORD - SEND EMAIL WITH LINK TO RESET PASSWORD
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    // NO USER FOUND IN DATABASE
    if (!user) {
        return res.status(statusCodes.NOT_FOUND).json({
            message: messages.NO_USER
        });
    }
    // send password reset link to user
    const resetToken = jwt.createResetToken(user._id);
    mail.sendPasswordResetMail(email, resetToken);
    return res.status(statusCodes.OK).json({
        message: messages.RESET_MAIL_SEND
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
            return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
                message: messages.RESET_FAILED,
                error: err
            });
        }
        // SUCCESSFULLY RESET PASSWORD
        return res.status(statusCodes.OK).json({
            message: messages.RESET_SUCCESSFUL
        });
    });
});

// DELETE USER
router.delete("/", middleware.verifyToken, async (req, res) => {
    const user = req.user;
    // DELETE USER OUT OF DATABASE
    await User.findByIdAndDelete(user._id);
    return res.status(statusCodes.OK).json({
        message: messages.USER_DELETED
    });
});

module.exports = router;