const User = require("../models/User");
const ApiError = require("../utils/ApiError");

const {
    uploadResume,
    deleteResume,
} = require("../utils/cloudinary");

/**
 * Upload Resume
 */
const uploadResumeService = async (userId, file) => {
    if (!file) {
        throw new ApiError(400, "Please upload a resume.");
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    // Delete previous resume if exists
    if (user.profile.resume.publicId) {
        await deleteResume(user.profile.resume.publicId);
    }

    // Upload new resume
    const uploadedResume = await uploadResume(file.buffer);

    // Save resume details
    user.profile.resume = {
        url: uploadedResume.secure_url,
        publicId: uploadedResume.public_id,
        fileName: file.originalname,
        uploadedAt: new Date(),
    };

    await user.save();

    return user.profile.resume;
};

/**
 * Get Resume
 */
const getResume = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return user.profile.resume;
};
const deleteResumeService = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    if (!user.profile.resume.publicId) {
        throw new ApiError(404, "No resume found.");
    }

    // Delete from Cloudinary
    await deleteResume(user.profile.resume.publicId);

    // Remove from MongoDB
    user.profile.resume = {
        url: "",
        publicId: "",
        fileName: "",
        uploadedAt: null,
    };

    await user.save();

    return null;
};

module.exports = {
    uploadResume: uploadResumeService,
    getResume,
    deleteResume: deleteResumeService,
};