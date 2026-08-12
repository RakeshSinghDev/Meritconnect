const request = require("supertest");
const app = require("../app");

describe("Job Finder API Integration", () => {
    test("GET /api/health returns 200", async () => {
        const res = await request(app).get("/api/health");
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

    test("GET /api/v1/job-finder/preferences requires auth (401)", async () => {
        const res = await request(app).get("/api/v1/job-finder/preferences");
        expect(res.statusCode).toEqual(401);
    });

    test("POST /api/v1/job-finder/search requires auth (401)", async () => {
        const res = await request(app).post("/api/v1/job-finder/search");
        expect(res.statusCode).toEqual(401);
    });

    test("GET /api/v1/job-finder/recommendations requires auth (401)", async () => {
        const res = await request(app).get("/api/v1/job-finder/recommendations");
        expect(res.statusCode).toEqual(401);
    });
});
