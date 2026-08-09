const { body } = require("express-validator");

exports.scheduleInterviewValidator = [

    body("applicationId")
        .notEmpty()
        .withMessage("Application ID is required"),

    body("interviewDate")
        .isISO8601()
        .withMessage("Valid interview date is required"),

    body("duration")
        .isInt({ min: 15, max: 300 })
        .withMessage("Duration must be between 15 and 300 minutes"),

    body("mode")
        .isIn(["Online", "Offline"])
        .withMessage("Invalid interview mode"),

    body("meetingLink")
        .optional()
        .isURL()
        .withMessage("Meeting link must be valid"),

    body("venue")
        .optional()
        .isString(),

    body("notes")
        .optional()
        .isString(),

];