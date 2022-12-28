const express = require('express');
const router = express.Router();
const { login, logout, logoutAllSessions, createNewUser, checkUsernameAvailability, checkEmailAvailability } = require("../controller/userController");
const { verifyAccessToken, verifyRefreshToken, verifyAdminStatus } = require("../middleware/auth");

router.post("/login", login);
router.post("/register", createNewUser);
router.delete("/logout", logout);
router.delete("/logout-all", logoutAllSessions);
router.post("/checkUsernameAvailability", checkUsernameAvailability);
router.post("/checkEmailAvailability", checkEmailAvailability);

router.get("/getUserWithToken", verifyAccessToken, async (req, res) => {
    return res.status(200).json({
        message: "User found",
        user: req.user,
    });
});

router.get("/refresh-token", verifyRefreshToken, async (req, res) => {
    return res.status(200).json({
        message: "Generated new access token",
        accesstoken: req.accessToken
    });
});

router.get("/admin", verifyAccessToken, verifyAdminStatus, async (req, res) => {
    return res.status(200).json({
        message: "User is an admin",
        user: req.user
    });
});

module.exports = router;
