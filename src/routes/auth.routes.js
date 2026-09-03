const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();

router.get(
    "/me",
    authMiddleware.authMiddleware,
    authController.getCurrentUserController
);
router.post("/register", authController.UserRegisterController);
router.post("/login", authController.UserLoginController);
router.post("/refreshtoken", authController.RefreshtokenController);
router.post("/forgot-password", authController.ForgotPasswordController);
router.post("/resetPassword", authController.ResetPasswordController);
router.post("/emailverification",authController.EmailVerificationController);
router.post("/logout", authController.UserLogoutController);



module.exports = router;  