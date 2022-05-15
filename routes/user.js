const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const admin = require('../helpers/checkAdminStatus');
const jwt = require('../helpers/jwt');
const mail = require('../helpers/sendMail');
const User = require('../database/models/user');

// CREATE NEW USER
router.post("/create", async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({
        email: email.toLowerCase(),
        password: hashedPassword ,
        admin: admin.checkAdminStatus(email),
        activated: false,
    });
    newUser.save(async (err, user) => {
        if (err) {
            return res.status(403).json({
                message: "E-Mail already exists",
                error: err
            });
        }
        const activationToken = jwt.createActivationToken(user._id);
        await mail.sendAccountActivationMail(email, activationToken);
        return res.status(201).json({
            message: "User created successfully. Check your emails to activate your account."
        });
    });
});

// ACTIVATE USER
router.get("/activate/:token", async (req, res) => {
    const { token } = req.params;
    try {
        const decodedToken = jwt.decodeJWT(token);
        User.findOneAndUpdate({ _id: decodedToken.userID }, { activated: true }, (err, user) => {
            if (err) {
                return res.status(403).json({
                    message: "Activation failed",
                    error: err
                });
            }
            // USER FOUND
            if (user) {
                const userIsActivated = user.activated;
                // IF USER IS NOT ACTIVATED
                if (!userIsActivated) {
                    return res.status(200).json({
                        message: "Account activated successfully"
                    });
                }
                // IF USER IS ALREADY ACTIVATED
                return res.status(200).json({
                    message: "Account already activated"
                });
            } else {
                return res.status(404).json({
                    message: "No user found",
                });
            }
        });
    // IF TOKEN IS INVALID
    } catch(err) {
        return res.status(403).json({
            message: "Activation failed",
            error: err
        });
    }
});

// RESEND ACTIVATION LINK
router.post("/resend-activation-link", async (req, res) => {
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
    const userIsActivated = user.activated;
    // USER IS NOT ACTIVATED
    if (!userIsActivated) {
        const activationToken = jwt.createActivationToken(user._id);
        mail.sendAccountActivationMail(email, activationToken);

        return res.status(200).json({
            message: "Account activation mail send successfully"
        });
    }
    // USER IS ALREADY ACTIVATED
    return res.status(200).json({
        message: "Account is already activated"
    });
});

// LOGIN WITH EXISTING USER
router.post("/login", async (req, res) => {
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
    const userIsActivated = user.activated;
    // USER IS NOT ACTIVATED
    if (!userIsActivated) {
        return res.status(403).json({
            message: "Your account is not activated. Please check your email for activation link."
        });
    }
    // CREATE JWT
    const token = jwt.generateJWT(user._id);
    // SET LAST LOGIN DATE
    await User.findOneAndUpdate({ _id: user._id }, { lastLogin: Date.now() }, { new: true }, (err, user) => {
        if (err) {
            return res.status(403).json({
                message: "Login failed",
                error: err
            });
        }
         // RETURN TOKEN AND USER DATA
        return res.status(200).json({
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
router.get("/", async (req, res) => {
    const token = jwt.getTokenFromAuthHeader(req.headers['authorization']);
    // NO TOKEN PROVIDED
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
        const userIsActivated = user.activated;
        // USER IS NOT ACTIVATED
        if (!userIsActivated) {
            return res.status(403).json({
                message: "Your account is not activated. Please check your email for activation link."
            });
        }
        // USER FOUND IN DATABASE
        return res.status(200).json({
            message: "User found",
            user: {
                email: user.email,
                admin: user.admin,
                lastLogin: user.lastLogin.toString(),
                createdAt: user.createdAt.toString()
            }
        });
    } catch(err) {
        // TOKEN IS INVALID
        return res.status(401).json({
            message: "Invalid token"
        });
    }
});

// FORGOT PASSWORD - SEND EMAIL WITH LINK TO RESET PASSWORD
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    // NO USER FOUND IN DATABASE
    if (!user) {
        return res.status(404).json({
            message: "No user found with this email"
        });
    }
    // send password reset link to user
    const resetToken = jwt.createResetToken(user._id);
    mail.sendPasswordResetMail(email, resetToken);
    return res.status(200).json({
        message: "Send reset instructions to your email"
    });
});

// RESET PASSWORD
router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    try {
        const decodedToken = jwt.decodeJWT(token);
        User.findOneAndUpdate({ _id: decodedToken.userID }, { password: bcrypt.hashSync(newPassword, 10) }, (err, user) => {
            if (err) {
                return res.status(403).json({
                    message: "Password reset failed",
                    error: err
                });
            }
            // USER FOUND
            if (user) {
                return res.status(200).json({
                    message: "Password reset successfully"
                });
            } else {
                return res.status(404).json({
                    message: "No user found",
                });
            }
        });
    // IF TOKEN IS INVALID
    } catch(err) {
        return res.status(403).json({
            message: "Password reset failed",
            error: err
        });
    }
});

// DELETE USER
router.delete("/", async (req, res) => {
    const token = jwt.getTokenFromAuthHeader(req.headers['authorization']);
    // NO TOKEN PROVIDED
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
        // DELETE USER OUT OF DATABASE
        await User.findByIdAndDelete(decodedToken.userID);
        return res.status(200).json({
            message: "User deleted successfully"
        });
    } catch (err) {
        // TOKEN IS INVALID
        return res.status(401).json({
            message: "Invalid token",
            error: err
        });
    }  
});

module.exports = router;