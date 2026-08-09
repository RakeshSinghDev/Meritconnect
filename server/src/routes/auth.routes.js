const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth.controller");

const validate = require("../middleware/validate");

const protect = require("../middleware/auth.middleware");


const {
    registerValidator,
    loginValidator,
} = require("../validators/auth.validator");

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: Rakesh Singh
 *               email:
 *                 type: string
 *                 example: rakesh@gmail.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *               role:
 *                 type: string
 *                 example: candidate
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */

router.post(
    "/register",
    registerValidator,
    validate,
    authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: rakesh@gmail.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */


router.post(
    "/login",
    loginValidator,
    validate,
    authController.login
);
router.get("/me", protect, authController.getMe);
router.post(
    "/forgot-password",
    authController.forgotPassword
);

router.post(
    "/reset-password/:token",
    authController.resetPassword
);
router.post("/refresh-token", authController.refresh);

router.post(
    "/logout",
    authController.logout
);
module.exports = router;
