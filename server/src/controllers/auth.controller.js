const authService = require("../services/auth.service");
const asyncHandler = require("../middleware/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

exports.register = asyncHandler(async (req, res) => {
    const result = await authService.registerUser(req.body);

    res
        .status(201)
        .json(
            new ApiResponse(
                201,
                "User registered successfully",
                {
                    user: result.user,
                }
            )
        );
});

exports.login = asyncHandler(async (req, res) => {
    const result = await authService.loginUser(req.body);

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    res
        .cookie("accessToken", result.accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        })
        .cookie("refreshToken", result.refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Login successful",
                {
                    user: result.user,
                }
            )
        );
});
exports.getMe = asyncHandler(async (req, res) => {
    res.status(200).json(
        new ApiResponse(
            200,
            "User fetched successfully",
            req.user
        )
    );
});
exports.forgotPassword = asyncHandler(async (req, res) => {
    await authService.forgotPassword(req.body.email);

    res.status(200).json(
        new ApiResponse(
            200,
            "Password reset link sent successfully."
        )
    );
});

exports.resetPassword = asyncHandler(async (req, res) => {
    await authService.resetPassword(
        req.params.token,
        req.body.password
    );

    res.status(200).json(
        new ApiResponse(
            200,
            "Password reset successfully."
        )
    );
});
exports.refresh = asyncHandler(async (req, res) => {
    const accessToken = await authService.refreshAccessToken(
        req.cookies?.refreshToken
    );

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
    }).status(200).json(new ApiResponse(200, "Access token refreshed"));
});
exports.logout = asyncHandler(async (req, res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    };

    res
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Logout successful"
            )
        );
});
