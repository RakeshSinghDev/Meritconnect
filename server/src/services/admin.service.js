const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Interview = require("../models/Interview");
const ApiError = require("../utils/ApiError");
const getDashboard = async () => {
    // ==========================
    // Users
    // ==========================
    const totalUsers = await User.countDocuments();

    const totalCandidates =
        await User.countDocuments({
            role: "candidate",
        });

    const totalRecruiters =
        await User.countDocuments({
            role: "recruiter",
        });

    // ==========================
    // Jobs
    // ==========================
    const totalJobs = await Job.countDocuments();

    const activeJobs = await Job.countDocuments({
        isActive: true,
    });

    const closedJobs = await Job.countDocuments({
        isActive: false,
    });

    // ==========================
    // Applications
    // ==========================
    const totalApplications =
        await Application.countDocuments();

    const applied = await Application.countDocuments({
        status: "Applied",
    });

    const reviewed =
        await Application.countDocuments({
            status: "Reviewed",
        });

    const shortlisted =
        await Application.countDocuments({
            status: "Shortlisted",
        });

    const interviews =
        await Application.countDocuments({
            status: "Interview",
        });

    const hired = await Application.countDocuments({
        status: "Hired",
    });

    const rejected =
        await Application.countDocuments({
            status: "Rejected",
        });

    // ==========================
    // Interview
    // ==========================
    const scheduledInterviews =
        await Interview.countDocuments({
            status: "Scheduled",
        });

    const completedInterviews =
        await Interview.countDocuments({
            status: "Completed",
        });

    const cancelledInterviews =
        await Interview.countDocuments({
            status: "Cancelled",
        });

    // ==========================
    // Recent Jobs
    // ==========================
    const recentJobs = await Job.find()
        .sort({
            createdAt: -1,
        })
        .limit(5)
        .populate(
            "recruiter",
            "name email"
        );

    // ==========================
    // Recent Applications
    // ==========================
    const recentApplications =
        await Application.find()
            .sort({
                createdAt: -1,
            })
            .limit(5)
            .populate(
                "candidate",
                "name email"
            )
            .populate(
                "job",
                "title company"
            );

    return {
        totalUsers,
        totalCandidates,
        totalRecruiters,

        totalJobs,
        activeJobs,
        closedJobs,

        totalApplications,
        applied,
        reviewed,
        shortlisted,
        interviews,
        hired,
        rejected,

        scheduledInterviews,
        completedInterviews,
        cancelledInterviews,

        recentJobs,
        recentApplications,
    };
};
const getUsers = async ({
    page = 1,
    limit = 10,
    keyword = "",
    role,
}) => {
    const query = {};

    if (keyword) {
        query.$or = [
            {
                name: {
                    $regex: keyword,
                    $options: "i",
                },
            },
            {
                email: {
                    $regex: keyword,
                    $options: "i",
                },
            },
        ];
    }

    if (role) {
        query.role = role;
    }

    const users = await User.find(query)
        .select("-password -refreshToken")
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    const totalUsers =
        await User.countDocuments(query);

    return {
        users,
        pagination: {
            totalUsers,
            currentPage: Number(page),
            totalPages: Math.ceil(
                totalUsers / limit
            ),
        },
    };
};

const getUserById = async (id) => {
    const user = await User.findById(id).select(
        "-password -refreshToken"
    );

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    return user;
};

const updateUserStatus = async (
    id,
    isActive
) => {
    const user = await User.findById(id);

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    user.isActive = isActive;

    await user.save();

    return user;
};

const deleteUser = async (id) => {
    const user = await User.findById(id);

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    await user.deleteOne();

    return;
};

module.exports = {
    getDashboard,
    getUsers,
    getUserById,
    updateUserStatus,
    deleteUser,
};