const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("./asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
    let token = null;

    // 1. Read token from Authorization Header FIRST (primary for SPAs with localStorage)
    if (req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    // 2. Fallback to HTTP-only cookie if no Bearer header present
    if (!token && req.cookies?.accessToken) {
        token = req.cookies.accessToken;
    }

    // 3. Fallback to Query Parameter (for media/iframe file requests)
    if (!token && req.query?.token) {
        token = req.query.token;
    }

    // If still no token, try checking cookie if Bearer verification fails later
    let candidateTokens = [];
    if (token) candidateTokens.push(token);
    if (req.cookies?.accessToken && !candidateTokens.includes(req.cookies.accessToken)) {
        candidateTokens.push(req.cookies.accessToken);
    }

    if (candidateTokens.length === 0) {
        console.warn(`[Protect Auth] Unauthorized access attempt to ${req.method} ${req.originalUrl} - No token present`);
        throw new ApiError(401, "Not authorized");
    }

    // Verify JWT against candidate tokens
    let decoded = null;
    let lastError = null;

    for (const candidateToken of candidateTokens) {
        try {
            decoded = jwt.verify(candidateToken, process.env.JWT_SECRET);
            if (decoded) break;
        } catch (err) {
            lastError = err;
        }
    }

    if (!decoded) {
        console.warn(`[Protect Auth] Token verification failed for ${req.method} ${req.originalUrl}:`, lastError?.message);
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
