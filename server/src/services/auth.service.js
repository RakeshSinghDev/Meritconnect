const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const {
    generateAccessToken,
    generateRefreshToken,
} = require("../utils/generateTokens");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const generateResetToken = require("../utils/generateResetToken");
const emailService = require("./email.service");

/**
 * Register User
 */
const registerUser = async ({ name, email, password, role }) => {
    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    // Validate role
    const allowedRoles = ["candidate", "recruiter"];

    const userRole = allowedRoles.includes(role)
        ? role
        : "candidate";

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: userRole,
    });

    // Generate Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Fetch safe user
    const safeUser = await User.findById(user._id).select(
        "-password -refreshToken -__v"
    );

    return {
        user: safeUser,
        accessToken,
        refreshToken,
    };
};

/**
 * Login User
 */
const loginUser = async ({ email, password }) => {

    const user = await User.findOne({ email }).select("+password");


    if (!user) {

        throw new ApiError(
            401,
            "Invalid email or password"
        );
    }


    const isPasswordCorrect =
        await user.comparePassword(password);



    if (!isPasswordCorrect) {
        throw new ApiError(
            401,
            "Invalid email or password"
        );
    }

    // Check account status
    if (!user.isActive) {
        throw new ApiError(
            403,
            "Your account has been suspended. Please contact the administrator."
        );
    }

    // Generate Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Fetch safe user
    const safeUser = await User.findById(user._id).select(
        "-password -refreshToken -__v"
    );

    return {
        user: safeUser,
        accessToken,
        refreshToken,
    };
};

/**
 * Forgot Password
 */
const forgotPassword = async (email) => {
    // Find user
    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Generate reset token
    const { resetToken, hashedToken } =
        generateResetToken();

    // Save hashed token
    user.resetPasswordToken = hashedToken;

    // Expires in 15 minutes
    user.resetPasswordExpire =
        Date.now() + 15 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Frontend reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send email
    await emailService.sendPasswordResetEmail(
        user,
        resetUrl
    );
};

/**
 * Reset Password
 */
const resetPassword = async (token, password) => {
    // Hash incoming token
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    // Find valid user
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: {
            $gt: Date.now(),
        },
    }).select("+password");

    if (!user) {
        throw new ApiError(
            400,
            "Invalid or expired reset token."
        );
    }

    // Update password
    user.password = password;

    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return;
};

const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || !user.isActive || user.refreshToken !== refreshToken) {
        throw new ApiError(401, "Invalid refresh token");
    }

    return generateAccessToken(user);
};

module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    refreshAccessToken,
};
