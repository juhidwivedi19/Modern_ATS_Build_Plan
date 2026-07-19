import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../config/db.config.js";

export const UserRegisterController = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

      
        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

       
        const hashedPassword = await bcrypt.hash(password, 10);

       
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

     
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "3d"
            }
        );

     
        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};




//Login Controller


export const UserLoginController = async (req, res) => {
    try {

        const { email, password } = req.body;

    
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and Password are required"
            });
        }

       
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid Email or Password"
            });
        }

      
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid Email or Password"
            });
        }

       
        const accessToken = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRES
            }
        );

    
        const refreshToken = jwt.sign(
            {
                id: user.id
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRES
            }
        );

    
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days
        });

        return res.status(200).json({
            message: "Login Successful",
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }
};




//Refreshtoken controller


export const UserRefreshtokenController = async (req, res) => {
    try {

        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh Token is required"
            });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            }
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid Refresh Token"
            });
        }

        const accessToken = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRES
            }
        );

        return res.status(200).json({
            message: "Access Token Refreshed Successfully",
            accessToken
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }
};




//Forget Password Controller


export const ForgotPasswordController = async (req, res) => {
    try {

        const { email } = req.body;

        
        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

     
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

     
        const resetToken = crypto.randomBytes(32).toString("hex");

      
        const resetPasswordExpires = new Date(
            Date.now() + 15 * 60 * 1000
        );

       
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpires
            }
        });



        return res.status(200).json({
            message: "Password reset link sent successfully",
            resetToken
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }
};





//Logout Controller
export const UserLogoutController = async (req, res) => {
    try {

       
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        return res.status(200).json({
            message: "Logout Successful"
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }
};