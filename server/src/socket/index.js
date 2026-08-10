let io;

const initializeSocket = (server) => {
    const { Server } = require("socket.io");

    const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://meritconnects.netlify.app",
    ];

    if (process.env.CLIENT_URL) {
        const envOrigin = process.env.CLIENT_URL.trim().replace(/\/+$/, "");
        if (envOrigin && !allowedOrigins.includes(envOrigin)) {
            allowedOrigins.push(envOrigin);
        }
    }

    io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                if (!origin) return callback(null, true);
                const cleanOrigin = origin.trim().replace(/\/+$/, "");
                if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.includes(origin)) {
                    return callback(null, true);
                }
                return callback(new Error("Not allowed by Socket CORS"));
            },
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