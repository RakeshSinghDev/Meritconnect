const asyncHandler = require("../middleware/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const sessionService = require("../services/aiInterviewSession.service");
const agentService = require("../services/aiInterviewAgent.service");
const { getIO } = require("../socket");

/**
 * Emit a Socket.IO event to the AI Interview namespace room.
 * Failures are caught silently — socket issues must never break REST responses.
 */
const emitToInterview = (interviewId, event, data) => {
    try {
        const io = getIO();
        io.of("/ai-interview").to(interviewId).emit(event, data);
    } catch (err) {
        console.error(`[Socket] Emission error (${event}):`, err.message);
    }
};

/**
 * Create AI Interview session
 * POST /api/v1/ai-interviews
 * Access: Recruiter
 */
exports.createSession = asyncHandler(async (req, res) => {
    const { applicationId, candidateId, jobId, type, config } = req.body;
    if (!applicationId && (!candidateId || !jobId)) {
        throw new ApiError(400, "Either applicationId or both candidateId and jobId are required");
    }
    const session = await sessionService.createAIInterviewSession(req.user._id, {
        applicationId,
        candidateId,
        jobId,
        type,
        config,
    });
    return res.status(201).json(new ApiResponse(201, "AI Interview session created successfully", session));
});

/**
 * Get single AI Interview details
 * GET /api/v1/ai-interviews/:id
 * Access: Candidate / Recruiter
 */
exports.getSession = asyncHandler(async (req, res) => {
    const session = await sessionService.getAIInterviewById(req.params.id, req.user._id);
    return res.status(200).json(new ApiResponse(200, "Interview session retrieved", session));
});

/**
 * Candidate lists their AI Interviews
 * GET /api/v1/ai-interviews/candidate
 * Access: Candidate
 */
exports.getCandidateInterviews = asyncHandler(async (req, res) => {
    const interviews = await sessionService.getCandidateAIInterviews(req.user._id);
    return res.status(200).json(new ApiResponse(200, "Candidate AI interviews retrieved", interviews));
});

/**
 * Recruiter lists their created AI Interviews
 * GET /api/v1/ai-interviews/recruiter
 * Access: Recruiter
 */
exports.getRecruiterInterviews = asyncHandler(async (req, res) => {
    const interviews = await sessionService.getRecruiterAIInterviews(req.user._id);
    return res.status(200).json(new ApiResponse(200, "Recruiter AI interviews retrieved", interviews));
});

/**
 * Start AI Interview (Triggers personalized greeting & opening question)
 * POST /api/v1/ai-interviews/:id/start
 * Access: Candidate
 */
exports.startInterview = asyncHandler(async (req, res) => {
    console.log("[STEP 5: Express Controller startInterview called]", req.params.id);
    const session = await sessionService.getAIInterviewById(req.params.id, req.user._id);

    if (session.status !== "Waiting" && session.status !== "InProgress") {
        throw new ApiError(400, `Cannot start interview — current status is "${session.status}".`);
    }

    if (session.status === "Waiting") {
        session.status = "InProgress";
        session.startedAt = new Date();
        await session.save();
    }

    console.log("[STEP 6: Calling agentService.initializeInterviewAgent]");
    const agentData = await agentService.initializeInterviewAgent(req.params.id);
    const updatedSession = await sessionService.getAIInterviewById(req.params.id, req.user._id);

    console.log("[STEP 8: Controller returning HTTP 200 with agentData]", agentData.firstQuestion?.question);
    return res.status(200).json(new ApiResponse(200, "Interview started successfully", {
        session: updatedSession,
        agentData,
    }));
});

/**
 * Submit candidate spoken/written answer & receive AI evaluation and next step
 * POST /api/v1/ai-interviews/:id/answer
 * Access: Candidate
 */
exports.submitAnswer = asyncHandler(async (req, res) => {
    console.log("[INTERVIEW] ANSWER ENDPOINT HIT");
    console.log("[INTERVIEW] BODY:", req.body);
    console.log("[INTERVIEW] PARAMS:", req.params);

    const interviewId = req.params.id;
    console.log("[INTERVIEW] Interview ID:", interviewId);

    // Ownership check — getAIInterviewById verifies candidate/recruiter access
    const session = await sessionService.getAIInterviewById(interviewId, req.user._id);
    console.log("[INTERVIEW] Session found:", !!session);

    if (session.status !== "InProgress") {
        throw new ApiError(400, "Cannot submit answers — interview is not in progress");
    }

    const { questionIndex, answer } = req.body;
    if (!answer || typeof answer !== "string" || !answer.trim()) {
        throw new ApiError(400, "Candidate answer is required");
    }

    console.log("[INTERVIEW] Evaluating candidate answer");
    const result = await agentService.processAnswerAndNextStep(interviewId, {
        questionIndex: questionIndex ?? 0,
        answer,
    });

    // Real-time: broadcast interviewer speech and status changes
    emitToInterview(interviewId, "interviewer:speaking", {
        isSpeaking: true,
        text: result.interviewerSpeech,
    });

    if (result.interviewStatus === "Completed") {
        emitToInterview(interviewId, "interview:completed", {
            interviewId,
        });
    }

    if (result.nextStep === "coding" && result.codingChallenge) {
        emitToInterview(interviewId, "interview:codingStarted", {
            challenge: result.codingChallenge,
        });
    }

    console.log("[INTERVIEW] Returning interview response");
    return res.status(200).json(new ApiResponse(200, "Answer processed successfully", result));
});

/**
 * Submit candidate code solution
 * POST /api/v1/ai-interviews/:id/code/submit
 * Access: Candidate
 */
exports.submitCode = asyncHandler(async (req, res) => {
    // Ownership check
    const session = await sessionService.getAIInterviewById(req.params.id, req.user._id);

    if (session.status !== "InProgress") {
        throw new ApiError(400, "Cannot submit code — interview is not in progress");
    }

    const { challengeIndex, code, language } = req.body;
    if (code === undefined || code === null) {
        throw new ApiError(400, "Code submission is required");
    }
    const result = await agentService.evaluateCodeSubmission(req.params.id, {
        challengeIndex: challengeIndex ?? 0,
        code,
        language: language || "javascript",
    });

    // Real-time: broadcast code evaluation result
    emitToInterview(req.params.id, "interviewer:speaking", {
        isSpeaking: true,
        text: result.interviewerSpeech,
    });
    emitToInterview(req.params.id, "interview:codeEvaluated", {
        evaluation: result.evaluation,
    });

    return res.status(200).json(new ApiResponse(200, "Code evaluated successfully", result));
});

/**
 * Update candidate real-time performance metrics
 * POST /api/v1/ai-interviews/:id/metrics
 * Access: Candidate
 */
exports.updateMetrics = asyncHandler(async (req, res) => {
    // Ownership check
    await sessionService.getAIInterviewById(req.params.id, req.user._id);

    const metrics = await sessionService.updateSessionMetrics(req.params.id, req.body);
    return res.status(200).json(new ApiResponse(200, "Metrics updated", metrics));
});

/**
 * Generate final AI Interview Report
 * POST /api/v1/ai-interviews/:id/complete
 * Access: Candidate / Recruiter
 */
exports.completeInterview = asyncHandler(async (req, res) => {
    // Ownership check
    const session = await sessionService.getAIInterviewById(req.params.id, req.user._id);

    // Idempotent — if report already generated, return it
    if (session.status === "Completed" && session.report?.generatedAt) {
        return res.status(200).json(new ApiResponse(200, "AI Interview report already generated", session.report));
    }

    const report = await agentService.generateFinalReport(req.params.id);

    // Real-time: notify all connected clients that report is ready
    emitToInterview(req.params.id, "interview:completed", {
        interviewId: req.params.id,
        hiringRecommendation: report.hiringRecommendation,
        overallScore: report.overallScore,
    });

    return res.status(200).json(new ApiResponse(200, "AI Interview report generated successfully", report));
});

/**
 * Get AI Interview Report
 * GET /api/v1/ai-interviews/:id/report
 * Access: Candidate / Recruiter (ownership verified)
 */
exports.getReport = asyncHandler(async (req, res) => {
    const session = await sessionService.getAIInterviewById(req.params.id, req.user._id);

    if (!session.report || session.report.hiringRecommendation === "Pending") {
        throw new ApiError(404, "Interview report has not been generated yet");
    }

    return res.status(200).json(new ApiResponse(200, "AI Interview report retrieved", session.report));
});

/**
 * Cancel AI Interview session
 * DELETE /api/v1/ai-interviews/:id
 * Access: Recruiter
 */
exports.cancelSession = asyncHandler(async (req, res) => {
    const session = await sessionService.cancelAIInterviewSession(req.params.id, req.user._id);
    emitToInterview(req.params.id, "interview:cancelled", { interviewId: req.params.id });
    return res.status(200).json(new ApiResponse(200, "AI Interview session cancelled successfully", session));
});

/**
 * Update / Reschedule AI Interview session configuration
 * PATCH /api/v1/ai-interviews/:id
 * Access: Recruiter
 */
exports.updateSession = asyncHandler(async (req, res) => {
    const { type, config } = req.body;
    const session = await sessionService.updateAIInterviewSession(req.params.id, req.user._id, { type, config });
    return res.status(200).json(new ApiResponse(200, "AI Interview session updated successfully", session));
});

