const { body } = require("express-validator");

// ==========================================
// Apply Job Validator
// ==========================================
const applyJobValidator = [
    body("coverLetter")
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage("Cover letter cannot exceed 5000 characters"),

    body("resume")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Resume URL cannot be empty"),
];

// ==========================================
// Update Application Status Validator
// ==========================================
const updateStatusValidator = [
    body("status")
        .notEmpty()
        .withMessage("Status is required")
        .isIn([
            "Applied",
            "Reviewed",
            "Shortlisted",
            "Interview",
            "Rejected",
            "Hired",
        ])
        .withMessage("Invalid application status"),
];

module.exports = {
    applyJobValidator,
    updateStatusValidator,
};
