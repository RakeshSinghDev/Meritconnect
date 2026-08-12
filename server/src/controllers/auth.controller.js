const authService = require("../services/auth.service");
const asyncHandler = require("../middleware/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true";
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
    };
};

exports.register = asyncHandler(async (req, res) => {
    const result = await authService.registerUser(req.body);
    const options = getCookieOptions();

    res
        .cookie("accessToken", result.accessToken, {
            ...options,
            maxAge: 15 * 60 * 1000,
        })
        .cookie("refreshToken", result.refreshToken, {
            ...options,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .status(201)
        .json(
            new ApiResponse(
                201,
                "User registered successfully",
                {
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                }
            )
        );
});

exports.login = asyncHandler(async (req, res) => {
    const result = await authService.loginUser(req.body);
    const options = getCookieOptions();

    res
        .cookie("accessToken", result.accessToken, {
            ...options,
            maxAge: 15 * 60 * 1000,
        })
        .cookie("refreshToken", result.refreshToken, {
            ...options,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Login successful",
                {
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
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
    const candidates = [];
    if (req.body?.refreshToken) candidates.push(req.body.refreshToken);
    if (req.cookies?.refreshToken && !candidates.includes(req.cookies.refreshToken)) {
        candidates.push(req.cookies.refreshToken);
    }

    if (candidates.length === 0) {
        throw new ApiError(401, "Refresh token is required");
    }

    let accessToken = null;
    let lastError = null;

    for (const token of candidates) {
        try {
            accessToken = await authService.refreshAccessToken(token);
            if (accessToken) break;
        } catch (err) {
            lastError = err;
        }
    }

    if (!accessToken) {
        throw lastError || new ApiError(401, "Invalid or expired refresh token");
    }

    const options = getCookieOptions();

    res
        .cookie("accessToken", accessToken, {
            ...options,
            maxAge: 15 * 60 * 1000,
        })
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Access token refreshed",
                { accessToken }
            )
        );
});

exports.logout = asyncHandler(async (req, res) => {
    const options = getCookieOptions();

    res
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Logout successful"
            )
        );
});
