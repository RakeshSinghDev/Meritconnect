const GeminiService = require("./GeminiService");
const PromptBuilder = require("./PromptBuilder");

const STAGES = Object.freeze({
    INTRODUCTION: "INTRODUCTION",
    RESUME: "RESUME",
    PROJECT: "PROJECT",
    TECHNICAL: "TECHNICAL",
    BEHAVIORAL: "BEHAVIORAL",
    CODING: "CODING",
    HR: "HR",
    COMPLETED: "COMPLETED",
});

const MODES = Object.freeze({
    FOLLOW_UP: "FOLLOW_UP",
    DEEP_DIVE: "DEEP_DIVE",
    NEXT_STAGE: "NEXT_STAGE",
    WRAP_UP: "WRAP_UP",
});

class ConversationManager {

    constructor() {

        this.maxRetry = 3;

    }

    /**
     * Main entry point.
     * InterviewEngine should ONLY call this method.
     */
    async next(session, context) {

        if (!session) {
            throw new Error("Interview session is required.");
        }

        if (!context) {
            throw new Error("Conversation context is required.");
        }

        if (!context.latestAnswer) {
            throw new Error("Candidate answer is missing.");
        }

        const evaluation =
            await GeminiService.evaluateAnswer(context);

        switch (session.currentStage) {

            case STAGES.INTRODUCTION:

                return await this.handleIntroduction(
                    session,
                    context,
                    evaluation
                );

            case STAGES.RESUME:

                return await this.handleResume(
                    session,
                    context,
                    evaluation
                );

            case STAGES.PROJECT:

                return await this.handleProject(
                    session,
                    context,
                    evaluation
                );

            case STAGES.TECHNICAL:

                return await this.handleTechnical(
                    session,
                    context,
                    evaluation
                );

            case STAGES.BEHAVIORAL:

                return await this.handleBehavioral(
                    session,
                    context,
                    evaluation
                );

            case STAGES.CODING:

                return await this.handleCoding(
                    session,
                    context,
                    evaluation
                );

            case STAGES.HR:

                return await this.handleHR(
                    session,
                    context,
                    evaluation
                );

            default:

                return {

                    completed: true,

                    evaluation,

                };

        }

    }

    /**
     * Generate interviewer response safely.
     */

    async ask(prompt) {

        let lastError;

        for (let i = 0; i < this.maxRetry; i++) {

            try {

                return await GeminiService.ask(prompt);

            }

            catch (error) {

                lastError = error;

            }

        }

        throw lastError;

    }

    /**
     * Move interview to next stage
     */

    moveToNextStage(session) {

        switch (session.currentStage) {

            case STAGES.INTRODUCTION:

                session.currentStage =
                    STAGES.RESUME;

                break;

            case STAGES.RESUME:

                session.currentStage =
                    STAGES.PROJECT;

                break;

            case STAGES.PROJECT:

                session.currentStage =
                    STAGES.TECHNICAL;

                break;

            case STAGES.TECHNICAL:

                session.currentStage =
                    session.settings.behavioralRound
                        ? STAGES.BEHAVIORAL
                        : session.settings.codingRound
                            ? STAGES.CODING
                            : STAGES.HR;

                break;

            case STAGES.BEHAVIORAL:

                session.currentStage =
                    session.settings.codingRound
                        ? STAGES.CODING
                        : STAGES.HR;

                break;

            case STAGES.CODING:

                session.currentStage =
                    STAGES.HR;

                break;

            case STAGES.HR:

                session.currentStage =
                    STAGES.COMPLETED;

                break;

        }




        return session.currentStage;

    }
    /**
 * INTRODUCTION
 */
    async handleIntroduction(session, context, evaluation) {

        if (evaluation.communication < 5) {

            const prompt =
                PromptBuilder.buildCommunicationPrompt(
                    context,
                    evaluation
                );

            return {
                evaluation,
                question: await this.ask(prompt),
                moveStage: false,
            };
        }

        if (evaluation.overall >= 7) {

            this.moveToNextStage(session);

            context.stage = session.currentStage;

            const prompt =
                PromptBuilder.buildResumePrompt(context);

            return {
                evaluation,
                question: await this.ask(prompt),
                moveStage: true,
            };
        }

        return {
            evaluation,
            question: await this.ask(
                PromptBuilder.buildFollowUpPrompt(
                    context,
                    evaluation
                )
            ),
            moveStage: false,
        };

    }

    /**
     * RESUME
     */
    async handleResume(session, context, evaluation) {

        if (evaluation.technical < 5) {

            return {

                evaluation,

                question: await this.ask(

                    PromptBuilder.buildResumeFollowUpPrompt(

                        context,

                        evaluation

                    )

                ),

                moveStage: false,

            };

        }

        if (evaluation.overall >= 8) {

            return {

                evaluation,

                question: await this.ask(

                    PromptBuilder.buildResumeDeepDivePrompt(

                        context,

                        evaluation

                    )

                ),

                moveStage: false,

            };

        }

        this.moveToNextStage(session);

        context.stage = session.currentStage;

        return {

            evaluation,

            question: await this.ask(

                PromptBuilder.buildProjectPrompt(

                    context

                )

            ),

            moveStage: true,

        };



    }
    /**
 * PROJECT STAGE
 */
    async handleProject(session, context, evaluation) {

        // Weak project explanation
        if (evaluation.technical < 5) {

            return {

                evaluation,

                question: await this.ask(

                    PromptBuilder.buildProjectFollowUpPrompt(
                        context,
                        evaluation
                    )

                ),

                moveStage: false,

            };

        }

        // Candidate explained project very well
        if (
            evaluation.technical >= 8 &&
            evaluation.problemSolving >= 8
        ) {

            return {

                evaluation,

                question: await this.ask(

                    PromptBuilder.buildProjectArchitecturePrompt(
                        context,
                        evaluation
                    )

                ),

                moveStage: false,

            };

        }

        // Move to technical round
        this.moveToNextStage(session);

        context.stage = session.currentStage;

        return {

            evaluation,

            question: await this.ask(

                PromptBuilder.buildTechnicalPrompt(
                    context
                )

            ),

            moveStage: true,

        };

    }


    /**
     * TECHNICAL STAGE
     */
    async handleTechnical(session, context, evaluation) {

        // Candidate is struggling technically
        if (evaluation.technical < 5) {

            return {

                evaluation,

                question: await this.ask(

                    PromptBuilder.buildTechnicalFollowUpPrompt(
                        context,
                        evaluation
                    )

                ),

                moveStage: false,

            };

        }

        // Candidate is excellent
        if (
            evaluation.technical >= 9 &&
            evaluation.problemSolving >= 8
        ) {

            return {

                evaluation,

                question: await this.ask(

                    PromptBuilder.buildChallengePrompt(
                        context,
                        evaluation
                    )

                ),

                moveStage: false,

            };

        }

        // Medium answer -> move ahead
        this.moveToNextStage(session);

        context.stage = session.currentStage;

        if (session.currentStage === "BEHAVIORAL") {

            return {

                evaluation,

                question: await this.ask(

                    PromptBuilder.buildBehaviorPrompt(
                        context
                    )

                ),

                moveStage: true,

            };

        }

        if (session.currentStage === "CODING") {

            return {

                evaluation,

                question: await this.ask(

                    PromptBuilder.buildCodingPrompt(
                        context
                    )

                ),

                moveStage: true,

            };

        }

        return {

            evaluation,

            question: await this.ask(

                PromptBuilder.buildHRPrompt(
                    context
                )

            ),

            moveStage: true,

        };

    }

}

module.exports = new ConversationManager();