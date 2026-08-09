const setupAIInterviewNamespace = (io) => {
    const aiNamespace = io.of("/ai-interview");

    aiNamespace.on("connection", (socket) => {
        console.log(`[AI-Interview Socket] Connected: ${socket.id}`);

        socket.on("join-interview", (payload) => {
            try {
                const { aiInterviewId, candidateName } = payload || {};
                if (!aiInterviewId) return;
                socket.join(aiInterviewId);
                console.log(`[AI-Interview Socket] Candidate ${candidateName || socket.id} joined session ${aiInterviewId}`);
                socket.to(aiInterviewId).emit("candidate:joined", { socketId: socket.id });
            } catch (err) {
                console.error("[Socket join-interview Error]:", err.message);
            }
        });

        // Telemetry event for facial analysis, eye contact, and confidence streaming
        socket.on("candidate:telemetry", (payload) => {
            try {
                const { aiInterviewId, eyeContactScore, confidenceScore, speakingSpeed } = payload || {};
                if (!aiInterviewId) return;
                aiNamespace.to(aiInterviewId).emit("metrics:updated", {
                    eyeContactScore,
                    confidenceScore,
                    speakingSpeed,
                    timestamp: new Date(),
                });
            } catch (err) {
                console.error("[Socket candidate:telemetry Error]:", err.message);
            }
        });

        // Speech-to-text transcript streaming
        socket.on("candidate:speech", (payload) => {
            try {
                const { aiInterviewId, text, isFinal } = payload || {};
                if (!aiInterviewId) return;
                aiNamespace.to(aiInterviewId).emit("transcript:stream", {
                    role: "candidate",
                    text,
                    isFinal,
                });
            } catch (err) {
                console.error("[Socket candidate:speech Error]:", err.message);
            }
        });

        // AI interviewer lip-sync audio/speech animation sync
        socket.on("interviewer:speech-start", (payload) => {
            try {
                const { aiInterviewId, text } = payload || {};
                if (!aiInterviewId) return;
                aiNamespace.to(aiInterviewId).emit("interviewer:speaking", {
                    isSpeaking: true,
                    text,
                });
            } catch (err) {
                console.error("[Socket interviewer:speech-start Error]:", err.message);
            }
        });

        socket.on("interviewer:speech-end", (payload) => {
            try {
                const { aiInterviewId } = payload || {};
                if (!aiInterviewId) return;
                aiNamespace.to(aiInterviewId).emit("interviewer:speaking", {
                    isSpeaking: false,
                });
            } catch (err) {
                console.error("[Socket interviewer:speech-end Error]:", err.message);
            }
        });

        socket.on("disconnect", () => {
            console.log(`[AI-Interview Socket] Disconnected: ${socket.id}`);
        });
    });

    return aiNamespace;
};

module.exports = {
    setupAIInterviewNamespace,
};
