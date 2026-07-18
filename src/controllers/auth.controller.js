const jwt = require("jsonwebtoken");
const crypto = require("crypto");

/*
 * USER REGISTER CONTROLLER
 * POST /api/auth/register
 */

async function UserRegisterController(req, res) {
    try {

        const { name, email, password } = req.body;

        const token = jwt.sign(
            { email },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        res.status(201).json({
            message: "User registered successfully",
            user: {
                name,
                email
            },
            token
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

/*
 * USER LOGIN CONTROLLER
 * POST /api/auth/login
 */

async function UserLoginController(req, res) {
    try {

        const { email } = req.body;

        const token = jwt.sign(
            { email },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        res.status(200).json({
            message: "Login successful",
            token
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

/*
 * REFRESH TOKEN CONTROLLER
 * POST /api/auth/refresh-token
 */

async function RefreshTokenController(req, res) {
    try {

        res.status(200).json({
            message: "Access token refreshed successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

/*
 * FORGOT PASSWORD CONTROLLER
 * POST /api/auth/forgot-password
 */

async function ForgotPasswordController(req, res) {
    try {

        const resetToken = crypto.randomBytes(32).toString("hex");

        res.status(200).json({
            message: "Password reset link sent",
            resetToken
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

/*
 * RESET PASSWORD CONTROLLER
 * POST /api/auth/reset-password/:token
 */

async function ResetPasswordController(req, res) {
    try {

        const { token } = req.params;

        res.status(200).json({
            message: "Password reset successfully",
            token
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

/*
 * VERIFY EMAIL CONTROLLER
 * GET /api/auth/verify-email/:token
 */

async function VerifyEmailController(req, res) {
    try {

        const { token } = req.params;

        res.status(200).json({
            message: "Email verified successfully",
            token
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

/*
 * USER LOGOUT CONTROLLER
 * POST /api/auth/logout
 */

async function UserLogoutController(req, res) {
    try {

        res.status(200).json({
            message: "User logged out successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

module.exports = {
    UserRegisterController,
    UserLoginController,
    RefreshTokenController,
    ForgotPasswordController,
    ResetPasswordController,
    VerifyEmailController,
    UserLogoutController
};