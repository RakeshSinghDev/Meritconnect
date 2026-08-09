const request = require("supertest");
const app = require("../app");
const User = require("../models/User");

describe("Auth API", () => {
    it("should reject invalid login", async () => {
        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: "invalid@test.com",
                password: "wrongpassword",
            });

        expect(res.statusCode).toBe(401);
    });

    it("should reject a refresh request without a refresh token", async () => {
        const res = await request(app).post("/api/v1/auth/refresh-token");

        expect(res.statusCode).toBe(401);
    });

    it("stores password-reset fields at the user document root", () => {
        expect(User.schema.path("resetPasswordToken")).toBeDefined();
        expect(User.schema.path("resetPasswordExpire")).toBeDefined();
        expect(User.schema.path("profile.resume.resetPasswordToken")).toBeUndefined();
    });
});
