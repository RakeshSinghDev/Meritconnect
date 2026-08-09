let io;

const initializeSocket = (server) => {
    const { Server } = require("socket.io");

    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log(`Socket Connected: ${socket.id}`);

        socket.on("join", (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined room`);
        });

        socket.on("disconnect", () => {
            console.log(`Socket Disconnected: ${socket.id}`);
        });
    });

    const { setupAIInterviewNamespace } = require("./aiInterviewSocket");
    setupAIInterviewNamespace(io);

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error(
            "Socket.io has not been initialized."
        );
    }

    return io;
};

module.exports = {
    initializeSocket,
    getIO,
};