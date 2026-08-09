require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./src/config/db");

beforeAll(async () => {
    console.log(">>> Jest beforeAll started");
    await connectDB();
    console.log(">>> Jest beforeAll finished");
});

afterAll(async () => {
    await mongoose.connection.close();
});