require("dotenv").config();

const mongoose = require("mongoose");

jest.setTimeout(30000);

beforeAll(async () => {
    // Unit tests do not require live DB connection
});

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
});