class PromptBuilder {

    /**
     * ===========================
     * First Interview Question
     * ===========================
     */
    static buildInitialPrompt(data) {

        return `
You are an experienced Senior Software Engineering Interviewer.

==========================
COMPANY
==========================
${data.company}

==========================
JOB TITLE
==========================
${data.jobTitle}

==========================
JOB DESCRIPTION
==========================
${data.jobDescription}

==========================
REQUIRED SKILLS
==========================
${data.skills}

==========================
CANDIDATE
==========================
Name: ${data.candidateName}

Experience: ${data.experience} years

==========================
RESUME
==========================
${data.resumeText}

==========================
ATS SUMMARY
==========================
${data.atsSummary}

Matching Skills:
${data.matchingSkills}

Missing Skills:
${data.missingSkills}

==========================
INTERVIEW SETTINGS
==========================
Difficulty: ${data.difficulty}

Coding Round: ${data.codingRound}

Behavioral Round: ${data.behavioralRound}

Duration: ${data.duration} minutes

Focus Areas:
${data.focusAreas || "General"}

==========================
RULES
==========================

• Greet the candidate professionally.

• Ask ONLY ONE question.

• The first question MUST come from the candidate's resume.

• Do not answer your own question.

• Do not explain the interview process.

• Be conversational.

• Return ONLY the interviewer message.

`;
    }

    /**
     * ===========================
     * Next Question
     * ===========================
     */
    static buildNextQuestionPrompt(data) {

        return `
You are conducting a professional software engineering interview.

==========================
CURRENT STAGE
==========================
${data.stage}

==========================
JOB
==========================
${data.jobTitle}

==========================
REQUIRED SKILLS
==========================
${data.skills}

==========================
RESUME
==========================
${data.resumeText}

==========================
ATS SUMMARY
==========================
${data.atsSummary}

==========================
CONVERSATION
==========================
${data.history}

==========================
CURRENT QUESTION
==========================
${data.currentQuestion}

==========================
LATEST ANSWER
==========================
${data.latestAnswer}

==========================
CURRENT SCORES
==========================
Technical: ${data.technical}

Communication: ${data.communication}

Confidence: ${data.confidence}

==========================
STAGE GUIDE
==========================

INTRODUCTION
- Ice breaker
- Candidate background

RESUME
- Resume discussion
- Past experience
- Skills

PROJECT
- Deep dive into projects
- Design decisions
- Challenges

TECHNICAL
- DSA
- Backend
- Database
- API
- OOP
- System Design

BEHAVIORAL
- STAR questions
- Teamwork
- Conflict
- Leadership

CODING
- Coding challenge
- Complexity
- Edge cases

HR
- Motivation
- Career goals
- Company fit

==========================
RULES
==========================

• Ask ONLY ONE question.

• Never ask multiple questions.

• Never repeat previous questions.

• If the answer is weak, ask a follow-up.

• If the answer is good, increase difficulty.

• If the answer mentions an interesting technical topic, explore it.

• Stay within the CURRENT STAGE.

• Return ONLY the interviewer message.

`;
    }

    /**
     * ===========================
     * Evaluate Answer
     * ===========================
     */
    static buildEvaluationPrompt(data) {

        return `
You are evaluating a software engineering interview answer.

==========================
QUESTION
==========================
${data.currentQuestion}

==========================
ANSWER
==========================
${data.latestAnswer}

==========================
SCORING
==========================

Score every category from 0 to 100.

Technical:
Knowledge accuracy and correctness.

Communication:
Clarity and structure.

Confidence:
Confidence shown while answering.

Leadership:
Ownership, collaboration and decision making.

Overall:
Overall interview performance.

==========================
RETURN ONLY JSON
==========================

{
  "technical": 0,
  "communication": 0,
  "confidence": 0,
  "leadership": 0,
  "overall": 0,
  "feedback": "",
  "strengths": [],
  "weaknesses": []
}

Do not return markdown.

Do not return explanations.

Return ONLY valid JSON.

`;

    }
    static buildCommunicationPrompt(context){

return `
Candidate could not communicate clearly.

Ask them again in a simpler way.

Current Stage:
INTRODUCTION

Return only interviewer speech.
`;

}

static buildResumePrompt(context){

return `
Move interview to RESUME discussion.

Resume:

${context.resumeText}

Ask one resume based question.

Return only interviewer speech.
`;

}

static buildResumeFollowUpPrompt(context){

return `
Candidate gave weak resume explanation.

Ask one follow-up.

Return only interviewer speech.
`;

}

static buildResumeDeepDivePrompt(context){

return `
Candidate answered resume question well.

Challenge them.

Go deeper into technologies used.

Return only interviewer speech.
`;

}

static buildProjectPrompt(context){

return `
Move interview to PROJECT discussion.

Resume:

${context.resumeText}

Ask about the most impressive project.

Return only interviewer speech.
`;

}
static buildProjectFollowUpPrompt(context){

return `
Candidate explained project poorly.

Ask a simpler follow-up about the project.

Return only interviewer speech.
`;

}

static buildProjectArchitecturePrompt(context){

return `
Candidate explained project well.

Ask architecture-level questions.

Examples:

Why MongoDB?

Why JWT?

Why React?

Why Express?

Return only interviewer speech.
`;

}

static buildTechnicalPrompt(context){

return `
Move interview to technical round.

Use:

Resume

ATS

Skills

Projects

Generate ONE technical interview question.

Return only interviewer speech.
`;

}

static buildTechnicalFollowUpPrompt(context){

return `
Candidate struggled technically.

Ask an easier technical question.

Return only interviewer speech.
`;

}

static buildChallengePrompt(context){

return `
Candidate is very strong.

Ask a Senior Software Engineer level challenge.

Do not change topic.

Return only interviewer speech.
`;

}

static buildBehaviorPrompt(context){

return `
Move interview to behavioral round.

Ask ONE behavioral interview question.

Return only interviewer speech.
`;

}

static buildCodingPrompt(context){

return `
Move interview to coding round.

Generate ONE coding problem based on the job.

Return only interviewer speech.
`;

}

static buildHRPrompt(context){

return `
Move interview to HR round.

Ask ONE HR question.

Return only interviewer speech.
`;

}
/**
 * BEHAVIORAL STAGE
 */
async handleBehavioral(session, context, evaluation) {

    // Candidate lacks communication or leadership
    if (
        evaluation.communication < 5 ||
        evaluation.leadership < 5
    ) {

        return {

            evaluation,

            question: await this.ask(

                PromptBuilder.buildBehaviorFollowUpPrompt(
                    context,
                    evaluation
                )

            ),

            moveStage: false,

        };

    }

    // Excellent behavioral response
    if (
        evaluation.communication >= 8 &&
        evaluation.leadership >= 8
    ) {

        return {

            evaluation,

            question: await this.ask(

                PromptBuilder.buildBehaviorDeepDivePrompt(
                    context,
                    evaluation
                )

            ),

            moveStage: false,

        };

    }

    // Move ahead
    this.moveToNextStage(session);

    context.stage = session.currentStage;

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

/**
 * CODING STAGE
 */
async handleCoding(session, context, evaluation) {

    if (evaluation.problemSolving < 5) {

        return {

            evaluation,

            question: await this.ask(

                PromptBuilder.buildCodingHintPrompt(
                    context,
                    evaluation
                )

            ),

            moveStage: false,

        };

    }

    if (
        evaluation.problemSolving >= 8 &&
        evaluation.technical >= 8
    ) {

        return {

            evaluation,

            question: await this.ask(

                PromptBuilder.buildCodingOptimizationPrompt(
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

            PromptBuilder.buildHRPrompt(
                context
            )

        ),

        moveStage: true,

    };

}

/**
 * HR STAGE
 */
async handleHR(session, context, evaluation) {

    if (
        evaluation.communication < 6
    ) {

        return {

            evaluation,

            question: await this.ask(

                PromptBuilder.buildHRFollowUpPrompt(
                    context,
                    evaluation
                )

            ),

            moveStage: false,

        };

    }

    session.currentStage = STAGES.COMPLETED;

    return {

        evaluation,

        completed: true,

        moveStage: false,

        question:
            "Thank you. That concludes the interview. It was great speaking with you. Our recruitment team will review your interview and get back to you soon."

    };

}

}

module.exports = PromptBuilder;