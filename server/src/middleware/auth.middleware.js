const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("./asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Read token from HTTP-only cookie
    if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
    }

    // OR Read token from Authorization Header
    if (
        !token &&
        req.headers.authorization?.startsWith("Bearer ")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    // OR Read token from Query Parameter (for media/iframe file requests)
    if (!token && req.query?.token) {
        token = req.query.token;
    }

    // No token found
    if (!token) {
        console.warn(`[Protect Auth] Unauthorized access attempt to ${req.method} ${req.originalUrl} - No token present`);
        throw new ApiError(401, "Not authorized");
    }

    // Verify JWT
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        console.warn(`[Protect Auth] Token verification failed for ${req.method} ${req.originalUrl}`);
        throw new ApiError(401, "Not authorized, token failed");
    }

    // Find user
    const user = await User.findById(decoded.id).select(
        "-password -refreshToken"
    );

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    // Check if account is active
    if (!user.isActive) {
        throw new ApiError(
            403,
            "Your account has been suspended."
        );
    }

    // Attach user to request
    req.user = user;

    next();
});

module.exports = protect;
