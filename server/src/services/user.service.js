const User = require("../models/User");
const ApiError = require("../utils/ApiError");

// ===============================
// Get Current User
// ===============================
const getCurrentUser = async (userId) => {
    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return user;
};

// ===============================
// Update Current User
// ===============================
const updateCurrentUser = async (userId, body) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const {
        name,
        phone,
        location,
        bio,
        skills,
        experience,
        education,
        college,
        currentCompany,
        currentPosition,
        github,
        linkedin,
        portfolio,
    } = body;

    if (name !== undefined) user.name = name;

    if (bio !== undefined) user.profile.bio = bio;
    if (phone !== undefined) user.profile.phone = phone;
    if (location !== undefined) user.profile.location = location;
    if (education !== undefined) user.profile.education = education;
    if (college !== undefined) user.profile.college = college;
    if (experience !== undefined)
        user.profile.experience = Number(experience);

    if (currentCompany !== undefined)
        user.profile.currentCompany = currentCompany;

    if (currentPosition !== undefined)
        user.profile.currentPosition = currentPosition;

    if (github !== undefined)
        user.profile.github = github;

    if (linkedin !== undefined)
        user.profile.linkedin = linkedin;

    if (portfolio !== undefined)
        user.profile.portfolio = portfolio;

    if (skills !== undefined) {
        user.profile.skills = Array.isArray(skills)
            ? skills
            : skills
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);
    }

    await user.save();

    return await User.findById(userId).select(
        "-password -refreshToken"
    );
};

module.exports = {
    getCurrentUser,
    updateCurrentUser,
};