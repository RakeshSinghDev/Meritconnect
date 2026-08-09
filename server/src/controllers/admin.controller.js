const adminService = require("../services/admin.service");

const asyncHandler = require("../middleware/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

exports.getDashboard = asyncHandler(
    async (req, res) => {
        const dashboard =
            await adminService.getDashboard();

        res.status(200).json(
            new ApiResponse(
                200,
                "Admin dashboard fetched successfully",
                dashboard
            )
        );
    }
);
exports.getUsers = asyncHandler(async (req, res) => {
    const data = await adminService.getUsers(req.query);

    res.status(200).json(
        new ApiResponse(
            200,
            "Users fetched successfully",
            data
        )
    );
});

exports.getUserById = asyncHandler(async (req, res) => {
    const user = await adminService.getUserById(
        req.params.id
    );

    res.status(200).json(
        new ApiResponse(
            200,
            "User fetched successfully",
            user
        )
    );
});

exports.updateUserStatus = asyncHandler(
    async (req, res) => {
        const user =
            await adminService.updateUserStatus(
                req.params.id,
                req.body.isActive
            );

        res.status(200).json(
            new ApiResponse(
                200,
                "User status updated successfully",
                user
            )
        );
    }
);

exports.deleteUser = asyncHandler(async (req, res) => {
    await adminService.deleteUser(
        req.params.id
    );

    res.status(200).json(
        new ApiResponse(
            200,
            "User deleted successfully"
        )
    );
});