const AIInterviewSession = require("../../models/AIInterviewSession");
const Application = require("../../models/Application");

const GeminiService = require("./GeminiService");

class InterviewEngine {

    constructor() {

        this.stageLimits = {
            INTRODUCTION: 2,
            RESUME: 3,
            PROJECT: 3,
            TECHNICAL: 5,
            BEHAVIORAL: 2,
            CODING: 2,
            HR: 2,
        };

    }

    /**
     * ===========================
     * Start Interview
     * ===========================
     */

    async startInterview(sessionId) {

        const session =
            await AIInterviewSession.findById(sessionId);

        if (!session) {
            throw new Error("Interview session not found.");
        }

        if (session.status === "Completed") {
            throw new Error("Interview already completed.");
        }

        const application =
            await Application.findById(session.application)
                .populate("candidate")
                .populate("job");

        if (!application) {
            throw new Error("Application not found.");
        }

        session.status = "Running";

        session.startedAt = new Date();

        session.questionsAsked = 0;

        session.stageQuestionCount = 0;

        const context =
            this.buildContext(session, application);

        const question =
            await GeminiService.generateFirstQuestion(context);

        session.currentQuestion = question;

        session.transcript.push({

            role: "assistant",

            message: question,

            stage: session.currentStage,

        });

        await session.save();

        return {

            sessionId: session._id,

            question,

            stage: session.currentStage,

            status: session.status,

        };

    }

    /**
     * ===========================
     * Load Session
     * ===========================
     */

    async loadSession(sessionId) {

        const session =
            await AIInterviewSession.findById(sessionId);

        if (!session) {
            throw new Error("Interview session not found.");
        }

        if (session.status === "Completed") {
            throw new Error("Interview already completed.");
        }

        return session;

    }

    /**
     * ===========================
     * Load Application
     * ===========================
     */

    async loadApplication(session) {

        return await Application.findById(session.application)
            .populate("candidate")
            .populate("job");

    }

    /**
     * ===========================
     * Validate Candidate Answer
     * ===========================
     */

    validateAnswer(answer) {

        if (!answer) {

            throw new Error(
                "Answer cannot be empty."
            );

        }

        if (answer.trim().length < 5) {

            throw new Error(
                "Please provide a meaningful answer."
            );

        }

    }

    /**
     * ===========================
     * Save Candidate Answer
     * ===========================
     */

    saveCandidateAnswer(session, answer) {

        session.transcript.push({

            role: "candidate",

            message: answer,

            stage: session.currentStage,

        });

    }

    /**
     * ===========================
     * Save AI Question
     * ===========================
     */

    saveAIQuestion(session, question) {

        session.currentQuestion = question;

        session.transcript.push({

            role: "assistant",

            message: question,

            stage: session.currentStage,

        });

    }
    /**
 * ===========================
 * Candidate submits answer
 * ===========================
 */

    async submitAnswer(sessionId, answer) {

        this.validateAnswer(answer);

        const session =
            await this.loadSession(sessionId);

        const application =
            await this.loadApplication(session);

        this.saveCandidateAnswer(session, answer);

        const context =
            this.buildContext(session, application);

        context.latestAnswer = answer;

        context.currentQuestion =
            session.currentQuestion;

        /**
         * Evaluate Answer
         */

        const evaluation =
            await GeminiService.evaluateAnswer(
                context
            );

        /**
         * Save evaluation in transcript
         */

        session.transcript[
            session.transcript.length - 1
        ].evaluation = evaluation;

        /**
         * Save evaluation history
         */

        session.evaluations.push({

            technical:
                evaluation.technical || 0,

            communication:
                evaluation.communication || 0,

            confidence:
                evaluation.confidence || 0,

            overall:
                evaluation.overall || 0,

            feedback:
                evaluation.feedback || "",

        });

        /**
         * Update Average Scores
         */

        this.updateAverageScores(session);

        /**
         * Update Counters
         */

        session.questionsAsked++;

        session.stageQuestionCount++;

        /**
         * Stage Completed?
         */

        if (
            session.stageQuestionCount >=
            this.stageLimits[
            session.currentStage
            ]
        ) {

            session.stageQuestionCount = 0;

            await this.nextStage(session);

        }

        /**
         * Interview Finished
         */

        if (
            session.currentStage ===
            "COMPLETED"
        ) {

            return await this.completeInterview(
                session
            );

        }

        /**
         * Build Fresh Context
         */

        const nextContext =
            this.buildContext(
                session,
                application
            );

        nextContext.latestAnswer =
            answer;

        nextContext.currentQuestion =
            session.currentQuestion;

        /**
         * Generate Next Question
         */

        const nextQuestion =
            await GeminiService
                .generateNextQuestion(
                    nextContext
                );

        this.saveAIQuestion(
            session,
            nextQuestion
        );

        await session.save();

        return {

            completed: false,

            stage:
                session.currentStage,

            question:
                nextQuestion,

            score:
                session.score,

        };

    }

    /**
     * ===========================
     * Calculate Average Scores
     * ===========================
     */

    updateAverageScores(session) {

        const evaluations =
            session.evaluations;

        const total =
            evaluations.length;

        if (total === 0) {

            return;

        }

        session.score.technical =
            evaluations.reduce(

                (sum, item) =>
                    sum +
                    item.technical,

                0

            ) / total;

        session.score.communication =
            evaluations.reduce(

                (sum, item) =>
                    sum +
                    item.communication,

                0

            ) / total;

        session.score.confidence =
            evaluations.reduce(

                (sum, item) =>
                    sum +
                    item.confidence,

                0

            ) / total;

        session.score.overall =
            evaluations.reduce(

                (sum, item) =>
                    sum +
                    item.overall,

                0

            ) / total;

    }

    /**
     * ===========================
     * Finish Interview
     * ===========================
     */

    async completeInterview(session) {

        session.status =
            "Completed";

        session.completedAt =
            new Date();

        session.currentQuestion =
            "";

        await session.save();

        return {

            completed: true,

            stage: "COMPLETED",

            score: session.score,

            recommendation:
                session.recommendation,

            summary:
                session.summary,

        };

    }
    /**
 * ====================================
 * Move Interview To Next Stage
 * ====================================
 */

    async nextStage(session) {

        const stages = [
            "INTRODUCTION",
            "RESUME",
            "PROJECT",
            "TECHNICAL",
            "BEHAVIORAL",
            "CODING",
            "HR",
            "COMPLETED",
        ];

        let index =
            stages.indexOf(session.currentStage);

        while (index < stages.length - 1) {

            index++;

            const nextStage = stages[index];

            /**
             * Skip Behavioral Round
             */

            if (
                nextStage === "BEHAVIORAL" &&
                !session.settings.behavioralRound
            ) {
                continue;
            }

            /**
             * Skip Coding Round
             */

            if (
                nextStage === "CODING" &&
                !session.settings.codingRound
            ) {
                continue;
            }

            session.currentStage = nextStage;

            break;

        }

        return session.currentStage;

    }

    /**
     * ====================================
     * Build Context For Gemini
     * ====================================
     */

    buildContext(session, application) {

        const transcript =
            session.transcript
                .slice(-10)
                .map(item => {

                    return `${item.role}: ${item.message}`;

                })
                .join("\n");

        return {

            company:
                application.job?.company || "",

            jobTitle:
                application.job?.title || "",

            jobDescription:
                application.job?.description || "",

            skills:
                (
                    application.job?.skills || []
                ).join(", "),

            candidateName:
                application.candidate?.name || "",

            experience:
                application.candidate
                    ?.profile
                    ?.experience || 0,

            resumeText:
                application.resumeText || "",

            atsSummary:
                application.aiAnalysis
                    ?.summary || "",

            matchingSkills:
                (
                    application.aiAnalysis
                        ?.matchingSkills || []
                ).join(", "),

            missingSkills:
                (
                    application.aiAnalysis
                        ?.missingSkills || []
                ).join(", "),

            difficulty:
                session.settings.difficulty,

            duration:
                session.settings.duration,

            codingRound:
                session.settings.codingRound,

            behavioralRound:
                session.settings.behavioralRound,

            stage:
                session.currentStage,

            questionNumber:
                session.questionsAsked + 1,

            history:
                transcript,

        };

    }

}

module.exports = new InterviewEngine();