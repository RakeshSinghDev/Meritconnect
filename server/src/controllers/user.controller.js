const asyncHandler = require("../middleware/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const userService = require("../services/user.service");

// ===============================
// GET CURRENT USER
// ===============================
exports.getCurrentUser = asyncHandler(async (req, res) => {
    const user = await userService.getCurrentUser(
        req.user._id
    );

    res.status(200).json(
        new ApiResponse(
            200,
            "User fetched successfully",
            user
        )
    );
});

// ===============================
// UPDATE CURRENT USER
// ===============================
exports.updateCurrentUser = asyncHandler(
    async (req, res) => {
        const user =
            await userService.updateCurrentUser(
                req.user._id,
                req.body
            );

        res.status(200).json(
            new ApiResponse(
                200,
                "Profile updated successfully",
                user
            )
        );
    }
);