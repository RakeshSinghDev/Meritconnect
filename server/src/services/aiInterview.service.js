const { GoogleGenAI } = require("@google/genai");

const AIInterviewSession = require("../models/AIInterviewSession");
const Application = require("../models/Application");

const ApiError = require("../utils/ApiError");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

/*
|--------------------------------------------------------------------------
| Interview Stages
|--------------------------------------------------------------------------
*/

const STAGES = {
    INTRODUCTION: "INTRODUCTION",
    RESUME: "RESUME",
    PROJECT: "PROJECT",
    TECHNICAL: "TECHNICAL",
    BEHAVIORAL: "BEHAVIORAL",
    CODING: "CODING",
    HR: "HR",
    COMPLETED: "COMPLETED",
};

/*
|--------------------------------------------------------------------------
| Build Interview Context
|--------------------------------------------------------------------------
*/

const buildInterviewContext = (application) => {

    return {

        candidate: {

            id: application.candidate._id,

            name: application.candidate.name,

            email: application.candidate.email,

        },

        job: {

            id: application.job._id,

            title: application.job.title,

            company: application.job.company,

            description: application.job.description,

            skills: application.job.skills || [],

            experience: application.job.experience || 0,

        },

        resume: {

            text: application.resumeText || "",

            atsScore:
                application.aiAnalysis?.atsScore || 0,

            summary:
                application.aiAnalysis?.summary || "",

            matchingSkills:
                application.aiAnalysis?.matchingSkills || [],

            missingSkills:
                application.aiAnalysis?.missingSkills || [],

            strengths:
                application.aiAnalysis?.strengths || [],

            suggestions:
                application.aiAnalysis?.suggestions || [],

        }

    };

};

/*
|--------------------------------------------------------------------------
| Create Interview Session
|--------------------------------------------------------------------------
*/

const createInterviewSession = async (

    applicationId,

    recruiterId,

    options = {}

) => {

    const application =
        await Application.findById(applicationId)

            .populate("candidate")

            .populate("job");

    if (!application) {

        throw new ApiError(

            404,

            "Application not found."

        );

    }

    const existing =
        await AIInterviewSession.findOne({

            application: application._id,

            status: {

                $in: [

                    "scheduled",

                    "running"

                ]

            }

        });

    if (existing) {

        return existing;

    }

    const context =
        buildInterviewContext(application);

    const session =
        await AIInterviewSession.create({

            application:
                application._id,

            recruiter:
                recruiterId,

            candidate:
                application.candidate._id,

            job:
                application.job._id,

            resumeText:
                context.resume.text,

            atsScore:
                context.resume.atsScore,

            currentStage:
                STAGES.INTRODUCTION,

            currentQuestion:
                "",

            currentQuestionIndex:
                0,

            transcript: [],

            score: {

                technical: 0,

                communication: 0,

                confidence: 0,

                coding: 0,

                leadership: 0,

                overall: 0,

            },

            settings: {

                difficulty:
                    options.difficulty || "Medium",

                duration:
                    options.duration || 45,

                codingRound:
                    options.codingRound ?? true,

                behavioralRound:
                    options.behavioralRound ?? true,

                focusAreas:
                    options.focusAreas || [],

            },

            recommendation: "",

            summary: "",

            status: "scheduled",

        });

    return session;

};
/*
|--------------------------------------------------------------------------
| Start Interview
|--------------------------------------------------------------------------
*/

const startInterview = async (sessionId) => {

    const session = await AIInterviewSession.findById(sessionId)
        .populate("candidate")
        .populate("job")
        .populate("application");

    if (!session) {
        throw new ApiError(404, "Interview session not found.");
    }

    if (session.status === "completed") {
        throw new ApiError(400, "Interview already completed.");
    }

    const application = session.application;

    const prompt = `
You are a Senior Software Engineering interviewer.

Conduct a REAL interview.

Candidate

Name:
${session.candidate.name}

Job

Title:
${session.job.title}

Company:
${session.job.company}

Required Skills:
${session.job.skills.join(", ")}

Job Description:

${session.job.description}

Resume

${application.resumeText || session.resumeText}

ATS Score:
${application.aiAnalysis?.atsScore || 0}

ATS Summary:

${application.aiAnalysis?.summary || ""}

Instructions

- Welcome the candidate naturally.
- Introduce yourself briefly.
- Explain there will be Technical, Behavioural and Coding rounds.
- Ask ONLY ONE question.
- The first question MUST come from the candidate resume.
- Do not answer your own question.
- Return plain text only.
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    const question = response.text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    session.status = "running";
    session.startedAt = new Date();

    session.currentStage = STAGES.INTRODUCTION;
    session.currentQuestionIndex = 1;
    session.currentQuestion = question;

    session.transcript.push({
        role: "assistant",
        message: question,
        stage: STAGES.INTRODUCTION,
    });

    await session.save();

    return {
        sessionId: session._id,
        stage: session.currentStage,
        question,
    };

};
/*
|--------------------------------------------------------------------------
| Submit Candidate Answer
|--------------------------------------------------------------------------
*/

const submitAnswer = async (sessionId, answer) => {

    const session = await AIInterviewSession.findById(sessionId)
        .populate("candidate")
        .populate("job")
        .populate("application");

    if (!session) {
        throw new ApiError(404, "Interview session not found.");
    }

    if (session.status !== "running") {
        throw new ApiError(400, "Interview is not running.");
    }

    // Save candidate answer
    session.transcript.push({
        role: "candidate",
        message: answer,
        stage: session.currentStage,
    });

    const transcript = session.transcript
        .map(m => `${m.role.toUpperCase()}: ${m.message}`)
        .join("\n\n");

    const prompt = `
You are a Senior Software Engineer interviewer.

Interview Stage:
${session.currentStage}

Job Title:
${session.job.title}

Skills:
${session.job.skills.join(", ")}

Conversation

${transcript}

Candidate's latest answer

${answer}

Tasks

1. Evaluate the latest answer.

2. Give scores out of 10 for

- Technical
- Communication
- Confidence

3. Give one-line feedback.

4. Decide whether to

FOLLOW_UP

or

NEXT_STAGE

5. If FOLLOW_UP,
ask ONE follow-up question.

6. If NEXT_STAGE,
move naturally to the next interview topic and ask ONE question.

Return ONLY valid JSON.

{
    "technical":8,
    "communication":7,
    "confidence":8,
    "feedback":"...",
    "decision":"FOLLOW_UP",
    "nextQuestion":"..."
}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    let text = response.text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
        throw new ApiError(500, "Gemini returned invalid JSON.");
    }

    const result = JSON.parse(
        text.substring(start, end + 1)
    );

    session.score.technical =
        Math.round(
            (session.score.technical + result.technical) / 2
        );

    session.score.communication =
        Math.round(
            (session.score.communication + result.communication) / 2
        );

    session.score.confidence =
        Math.round(
            (session.score.confidence + result.confidence) / 2
        );

    session.score.overall =
        Math.round(
            (
                session.score.technical +
                session.score.communication +
                session.score.confidence
            ) / 3
        );

    if (result.decision === "NEXT_STAGE") {

        switch (session.currentStage) {

            case STAGES.INTRODUCTION:
                session.currentStage = STAGES.RESUME;
                break;

            case STAGES.RESUME:
                session.currentStage = STAGES.PROJECT;
                break;

            case STAGES.PROJECT:
                session.currentStage = STAGES.TECHNICAL;
                break;

            case STAGES.TECHNICAL:

                if (session.settings.behavioralRound) {

                    session.currentStage = STAGES.BEHAVIORAL;

                } else if (session.settings.codingRound) {

                    session.currentStage = STAGES.CODING;

                } else {

                    session.currentStage = STAGES.HR;

                }

                break;

            case STAGES.BEHAVIORAL:

                if (session.settings.codingRound) {

                    session.currentStage = STAGES.CODING;

                } else {

                    session.currentStage = STAGES.HR;

                }

                break;

            case STAGES.CODING:

                session.currentStage = STAGES.HR;

                break;

            case STAGES.HR:

                session.currentStage = STAGES.COMPLETED;

                break;

        }

    }

    session.currentQuestion = result.nextQuestion;

    session.currentQuestionIndex++;

    session.transcript.push({

        role: "assistant",

        message: result.nextQuestion,

        stage: session.currentStage,

    });

    await session.save();

    return {

        completed:
            session.currentStage === STAGES.COMPLETED,

        stage:
            session.currentStage,

        question:
            result.nextQuestion,

        score:
            session.score,

        feedback:
            result.feedback,

    };

};
/*
|--------------------------------------------------------------------------
| End Interview
|--------------------------------------------------------------------------
*/

const endInterview = async (sessionId) => {

    const session = await AIInterviewSession.findById(sessionId)
        .populate("candidate")
        .populate("job")
        .populate("application");

    if (!session) {
        throw new ApiError(404, "Interview session not found.");
    }

    const transcript = session.transcript
        .map(item => `${item.role.toUpperCase()}: ${item.message}`)
        .join("\n\n");

    const prompt = `
You are a Senior Engineering Hiring Manager.

Below is a complete interview transcript.

Candidate:
${session.candidate.name}

Job:
${session.job.title}

Company:
${session.job.company}

Transcript

${transcript}

Current Scores

Technical: ${session.score.technical}

Communication: ${session.score.communication}

Confidence: ${session.score.confidence}

Coding: ${session.score.coding}

Leadership: ${session.score.leadership}

Overall: ${session.score.overall}

Generate ONLY valid JSON.

{
    "summary":"",

    "strengths":[
        "",
        "",
        ""
    ],

    "weaknesses":[
        "",
        "",
        ""
    ],

    "recommendation":"Hire",

    "overallScore":85
}
`;

    const response = await ai.models.generateContent({

        model: "gemini-2.5-flash",

        contents: prompt,

    });

    let text = response.text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
        throw new ApiError(
            500,
            "Invalid response received from Gemini."
        );
    }

    const report = JSON.parse(
        text.substring(start, end + 1)
    );

    session.summary = report.summary;

    session.recommendation =
        report.recommendation;

    session.score.overall =
        report.overallScore;

    session.status = "completed";

    session.currentStage = STAGES.COMPLETED;

    session.completedAt = new Date();

    await session.save();

    return {

        interviewId: session._id,

        completed: true,

        summary: report.summary,

        strengths: report.strengths,

        weaknesses: report.weaknesses,

        recommendation:
            report.recommendation,

        score: session.score,

    };

};

/*
|--------------------------------------------------------------------------
| Get Interview Report
|--------------------------------------------------------------------------
*/

const getInterviewReport = async (sessionId) => {

    const session = await AIInterviewSession.findById(sessionId)
        .populate("candidate")
        .populate("job");

    if (!session) {
        throw new ApiError(404, "Interview session not found.");
    }

    return {

        candidate: {

            id: session.candidate._id,

            name: session.candidate.name,

            email: session.candidate.email,

        },

        job: {

            id: session.job._id,

            title: session.job.title,

            company: session.job.company,

        },

        stage: session.currentStage,

        status: session.status,

        transcript: session.transcript,

        score: session.score,

        recommendation:
            session.recommendation,

        summary:
            session.summary,

        startedAt:
            session.startedAt,

        completedAt:
            session.completedAt,

    };

};

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {

    createInterviewSession,

    startInterview,

    submitAnswer,

    endInterview,

    getInterviewReport,

};