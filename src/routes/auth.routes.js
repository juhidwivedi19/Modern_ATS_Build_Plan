const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", authController.UserRegisterController);
router.post("/login", authController.UserLoginController);
router.post("/refresh-token", authController.RefreshTokenController);
router.post("/forgot-password", authController.ForgotPasswordController);

router.post("/logout", authController.UserLogoutController);

module.exports = router;  