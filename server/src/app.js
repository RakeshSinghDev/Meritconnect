const express = require("express");

// Third-party packages
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const hpp = require("hpp");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { swaggerUi, specs } = require("./config/swagger");

// Routes
const authRoutes = require("./routes/auth.routes");
const jobRoutes = require("./routes/job.routes");
const resumeRoutes = require("./routes/resume.Routes");
const aiRoutes = require("./routes/ai.routes");
const recruiterRoutes = require("./routes/recruiter.routes");
const candidateRoutes = require("./routes/candidate.routes");
const interviewRoutes = require("./routes/interview.routes");
const adminRoutes = require("./routes/admin.routes");
const aiInterviewRoutes = require("./routes/aiInterview.routes");
const aiInterviewAgentRoutes = require("./routes/aiInterviewAgent.routes");
const notificationRoutes = require("./routes/notification.routes");
const activityRoutes = require("./routes/activity.routes");
const applicationRoutes = require("./routes/application.routes");
const userRoutes = require("./routes/user.routes");

// Middleware
const errorHandler = require("./middleware/errorHandler");

const path = require("path");

const app = express();

/* ===========================
   Security Middleware
=========================== */

app.use(
    helmet({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: false,
    })
);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(compression());
app.use(hpp());


/* ===========================
   Rate Limiter
=========================== */

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

/* ===========================
   Swagger
=========================== */

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs)
);

/* ===========================
   Global Middleware
=========================== */

const allowedOrigin = process.env.CLIENT_URL;

app.use(cors({
    origin: allowedOrigin || false,
    credentials: Boolean(allowedOrigin),
}));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ===========================
   Health Check
=========================== */

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
    });
});

/* ===========================
   API Routes
=========================== */

// Auth routes protected by rate limiter
app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/resume", resumeRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/recruiter", recruiterRoutes);
app.use("/api/v1/candidate", candidateRoutes);
app.use("/api/v1/interviews", interviewRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/ai", aiInterviewRoutes);
app.use("/api/v1/ai-interviews", aiInterviewAgentRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/applications", activityRoutes);
app.use("/api/v1/users", userRoutes);

/* ===========================
   404 Route Handler
=========================== */

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`,
    });
});

/* ===========================
   Global Error Handler
=========================== */

app.use(errorHandler);

module.exports = app;
