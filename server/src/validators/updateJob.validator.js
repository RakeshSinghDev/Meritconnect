// updateJob.validator.js

const { body } = require("express-validator");

const updateJobValidator = [
    body("title")
        .optional()
        .notEmpty()
        .withMessage("Title cannot be empty"),

    body("company")
        .optional()
        .notEmpty()
        .withMessage("Company cannot be empty"),

    body("description")
        .optional()
        .notEmpty()
        .withMessage("Description cannot be empty"),

    body("skills")
        .optional()
        .isArray()
        .withMessage("Skills must be an array"),

    body("salary")
        .optional()
        .isNumeric()
        .withMessage("Salary must be a number"),

    body("location")
        .optional()
        .notEmpty()
        .withMessage("Location cannot be empty"),

    body("employmentType")
        .optional()
        .isIn(["Full-Time", "Part-Time", "Internship", "Contract"])
        .withMessage("Invalid employment type"),
];

module.exports = updateJobValidator;