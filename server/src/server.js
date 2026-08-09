require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        console.log("Connected Database:", mongoose.connection.name);

        const http = require("http");

        const app = require("./app");

        const { initializeSocket } = require("./socket");

        const server = http.createServer(app);

        initializeSocket(server);

        server.listen(PORT, () => {
            console.log(
                `Server running on port ${PORT}`
            );
        });
    } catch (error) {
        console.error(error);
    }
};

startServer();