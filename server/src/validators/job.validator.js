const { body } = require("express-validator");

// =========================
// Create Job Validator
// =========================
const createJobValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Job title is required"),

    body("company")
        .trim()
        .notEmpty()
        .withMessage("Company name is required"),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Job description is required"),

    body("skills")
        .isArray({ min: 1 })
        .withMessage("At least one skill is required"),

    body("skills.*")
        .trim()
        .notEmpty()
        .withMessage("Skill cannot be empty"),

    body("experience")
        .optional()
        .isNumeric()
        .withMessage("Experience must be a number")
        .isFloat({ min: 0 })
        .withMessage("Experience cannot be negative"),

    body("salary")
        .notEmpty()
        .withMessage("Salary is required")
        .isNumeric()
        .withMessage("Salary must be a number")
        .isFloat({ min: 0 })
        .withMessage("Salary cannot be negative"),

    body("location")
        .trim()
        .notEmpty()
        .withMessage("Location is required"),

    body("employmentType")
        .optional()
        .isIn([
            "Full-Time",
            "Part-Time",
            "Internship",
            "Contract",
        ])
        .withMessage("Invalid employment type"),
];

// =========================
// Update Job Validator
// =========================
const updateJobValidator = [
    body("title")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Job title cannot be empty"),

    body("company")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Company name cannot be empty"),

    body("description")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Description cannot be empty"),

    body("skills")
        .optional()
        .isArray({ min: 1 })
        .withMessage("Skills must be an array"),

    body("skills.*")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Skill cannot be empty"),

    body("experience")
        .optional()
        .isNumeric()
        .withMessage("Experience must be a number")
        .isFloat({ min: 0 })
        .withMessage("Experience cannot be negative"),

    body("salary")
        .optional()
        .isNumeric()
        .withMessage("Salary must be a number")
        .isFloat({ min: 0 })
        .withMessage("Salary cannot be negative"),

    body("location")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Location cannot be empty"),

    body("employmentType")
        .optional()
        .isIn([
            "Full-Time",
            "Part-Time",
            "Internship",
            "Contract",
        ])
        .withMessage("Invalid employment type"),
];

module.exports = {
    createJobValidator,
    updateJobValidator,
};