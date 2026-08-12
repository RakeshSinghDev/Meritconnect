const { ai, GEMINI_MODEL } = require("../config/gemini");
const AIInterview = require("../models/AIInterview");
const ApiError = require("../utils/ApiError");
const { generateInterviewPDFReport } = require("./pdfReport.service");

/* ═══════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Call Gemini with single retry, status code checks, and fallback response support.
 */
const callGemini = async (prompt, retries = 1, fallback = null) => {
    const targetModel = process.env.GEMINI_MODEL || GEMINI_MODEL || "gemini-1.5-flash";
    let lastError;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: targetModel,
                contents: prompt,
            });

            let text = response.text.trim();
            // Strip markdown code fences
            text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

            // Try parsing directly first
            try {
                return JSON.parse(text);
            } catch (_) {
                // Fallback: extract the outermost JSON object
                const match = text.match(/\{[\s\S]*\}/);
                if (!match) throw new Error('AI response did not contain valid JSON');
                return JSON.parse(match[0]);
            }
        } catch (err) {
            lastError = err;
            console.error(
                `[AI Agent] Gemini attempt ${attempt}/${retries} failed using model ${targetModel}:`,
                err.message
            );

            if (attempt < retries) {
                await new Promise((r) => setTimeout(r, 1000));
            }
        }
    }

    if (fallback) {
        console.warn("[AI Agent] Returning fallback interview question due to Gemini API issue.");
        return fallback;
    }

    if (lastError?.message?.includes("429") || lastError?.message?.includes("RESOURCE_EXHAUSTED")) {
        throw new ApiError(503, "AI service temporarily unavailable (Quota limit reached). Please try again shortly.", true);
    }

    if (lastError?.message?.includes("404") || lastError?.message?.includes("NOT_FOUND")) {
        throw new ApiError(503, "Configured AI model is unavailable.");
    }

    throw new ApiError(503, `AI service temporarily unavailable: ${lastError?.message}`);
};

/**
 * Analyze candidate performance trajectory across answered questions
 */
const analyzePerformance = (questions) => {
    const answered = questions.filter(
        (q) => q.status === "Answered" && q.aiEvaluation?.score > 0
    );

    if (answered.length === 0) {
        return {
            avgScore: 0,
            trend: "stable",
            totalAnswered: 0,
            strongAreas: [],
            weakAreas: [],
            recentScores: [],
        };
    }

    const scores = answered.map((q) => q.aiEvaluation.score);
    const avgScore = +(
        scores.reduce((a, b) => a + b, 0) / scores.length
    ).toFixed(1);

    // Trend from the last 3 vs earlier scores
    let trend = "stable";
    if (scores.length >= 3) {
        const last3 = scores.slice(-3);
        const avg3 = last3.reduce((a, b) => a + b, 0) / last3.length;
        if (avg3 > avgScore + 1) trend = "improving";
        else if (avg3 < avgScore - 1) trend = "declining";
    }

    // Scores grouped by question type
    const byType = {};
    answered.forEach((q) => {
        const t = q.type || "General";
        (byType[t] = byType[t] || []).push(q.aiEvaluation.score);
    });

    const strongAreas = [];
    const weakAreas = [];
    for (const [type, typeScores] of Object.entries(byType)) {
        const avg = typeScores.reduce((a, b) => a + b, 0) / typeScores.length;
        if (avg >= 7.5) strongAreas.push(type);
        if (avg <= 5) weakAreas.push(type);
    }

    return {
        avgScore,
        trend,
        totalAnswered: answered.length,
        strongAreas,
        weakAreas,
        recentScores: scores.slice(-5),
    };
};

/**
 * Determine adaptive difficulty based on running performance
 */
const getAdaptiveDifficulty = (performance, configDifficulty) => {
    if (configDifficulty !== "Adaptive") return configDifficulty;
    if (performance.avgScore >= 8.5) return "Hard";
    if (performance.avgScore >= 6) return "Medium";
    return "Easy";
};

/**
 * Identify skill / topic areas that have not been covered yet
 */
const getUncoveredTopics = (questions, allSkills) => {
    const questionTexts = questions
        .map((q) => (q.question || "").toLowerCase())
        .join(" ");
    const covered = new Set();

    allSkills.forEach((skill) => {
        if (questionTexts.includes(skill.toLowerCase())) covered.add(skill);
    });

    return allSkills.filter((s) => !covered.has(s));
};

/**
 * Format the recent conversation transcript for prompt injection
 */
const formatTranscript = (transcript, maxEntries = 14) => {
    const recent = transcript.slice(-maxEntries);
    return recent
        .map(
            (t) =>
                `[${t.role === "interviewer" ? "AI INTERVIEWER" : "CANDIDATE"}]: ${t.content}`
        )
        .join("\n\n");
};

/**
 * Format scored Q&A history for the AI to review
 */
const formatQuestionHistory = (questions) => {
    return questions
        .filter((q) => q.status === "Answered")
        .map(
            (q) =>
                `Q${q.index + 1} [${q.type} | ${q.difficulty}]: "${q.question}"
   Answer: "${(q.candidateAnswer || "").substring(0, 400)}"
   Score: ${q.aiEvaluation?.score || "N/A"}/10 — ${q.aiEvaluation?.feedback || ""}`
        )
        .join("\n\n");
};

/* ═══════════════════════════════════════════════════════════════════
   Core Agent Functions
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Initialize the interview agent:
 * - Reads candidate dossier (resume, skills, ATS analysis)
 * - Generates a personalized greeting referencing specific resume details
 * - Creates an opening question tied to candidate's actual experience
 * - Builds an interview strategy with topics to probe and red flags
 *
 * @returns {{ greeting, firstQuestion, transcript }}
 */
const initializeInterviewAgent = async (aiInterviewId) => {
    console.log("[STEP 7: initializeInterviewAgent running]", aiInterviewId);
    const interview = await AIInterview.findById(aiInterviewId)
        .populate("candidate", "name email profile")
        .populate("job", "title company description skills experienceLevel");

    if (!interview) throw new ApiError(404, "AI Interview session not found");

    if (interview.questions && interview.questions.length > 0) {
        console.log("[STEP 7a: Session already has initialized questions]", interview.questions[0].question);
        return {
            greeting: `Welcome to your interview ${interview.candidate?.name || "Candidate"}.`,
            firstQuestion: interview.questions[0],
            transcript: interview.transcript || [],
        };
    }

    const { context, config } = interview;
    const candidateName = interview.candidate?.name || "Candidate";
    const company = interview.job?.company || "the company";
    const jobTitle = interview.job?.title || "Software Engineer";

    const prompt = `
You are MeritConnect AI, a professional interview system built by ${company}.
You are beginning a live ${config.duration}-minute video interview with ${candidateName} for the role of "${jobTitle}".
You must behave exactly like a real human interviewer — warm, professional, and conversational.

═══════════════════════════════════════════
CANDIDATE DOSSIER  (Confidential — do NOT reveal to candidate)
═══════════════════════════════════════════

Full Name: ${candidateName}

Resume / Background:
${context.resumeText || "No resume text available — use the skills listed below to infer background."}

Skills Candidate Claims (matched to JD): ${(context.matchingSkills || []).join(", ") || "None identified"}
Skills JD Requires but Candidate May Lack: ${(context.missingSkills || []).join(", ") || "None identified"}
Strengths Identified by ATS: ${(context.strengths || []).join(", ") || "None listed"}
ATS Match Score: ${context.atsScore || 0}/100

═══════════════════════════════════════════
JOB SPECIFICATION
═══════════════════════════════════════════

Title: ${jobTitle}
Company: ${company}
Description: ${context.jobDescription || interview.job?.description || "Engineering role"}
Required Skills: ${(context.jobSkills || interview.job?.skills || []).join(", ")}
Experience Level: ${interview.job?.experienceLevel || "Mid-Senior"}

═══════════════════════════════════════════
INTERVIEW SETTINGS
═══════════════════════════════════════════

Type: ${interview.type}
Duration: ${config.duration} min  |  Questions: ${config.questionCount}
Difficulty: ${config.difficulty}
Coding: ${config.codingEnabled ? "Yes" : "No"}  |  System Design: ${config.systemDesignEnabled ? "Yes" : "No"}
Focus Areas: ${(config.focusAreas || []).join(", ") || "General"}

═══════════════════════════════════════════
YOUR INTERVIEW STRATEGY
═══════════════════════════════════════════

Phase 1 (Q1): Warm opening — reference something SPECIFIC from their resume (a named project, a company, a particular technology stack). Ask an open-ended question about that experience.
Phase 2 (Q2–Q3): Technical depth — probe their strongest claimed skills with scenario-based "how" and "why" questions.
Phase 3 (Q4–Q5): Pressure test — dig into areas where their resume is thin or where they claim expertise the job requires. Look for genuine understanding vs surface knowledge.
Phase 4 (Q5–Q6): Coding or System Design challenge (if enabled).
Phase 5 (Final): Behavioral / wrap-up.

═══════════════════════════════════════════
CONDUCT RULES
═══════════════════════════════════════════

1. Your greeting must sound natural when spoken aloud (it will be converted to speech via TTS).
2. Address ${candidateName} by first name.
3. Reference a SPECIFIC project, role, technology, or achievement from their resume in your opening.
4. Your first question must be directly tied to their actual experience — NOT generic.
5. Keep total spoken text concise: greeting (2 sentences max) + question (1–2 sentences).
6. NEVER say "Tell me about yourself" or any generic opener.
7. You are evaluating from the first moment.

═══════════════════════════════════════════

Return ONLY valid JSON:
{
  "greeting": "Warm spoken welcome referencing something from their resume (2 sentences max)",
  "firstQuestion": {
    "question": "Specific opening question tied to their resume or the role",
    "type": "Technical|Behavioral|ResumeDeepDive|ProjectDeepDive",
    "difficulty": "Medium"
  }
}
`;

    const fallbackResponse = {
        greeting: `Welcome to your interview ${candidateName}. Thank you for joining us today.`,
        firstQuestion: {
            question: `Could you briefly introduce yourself and tell me about your background and core engineering experience relevant to the ${jobTitle} role?`,
            type: "ResumeDeepDive",
            difficulty: "Medium",
        },
        interviewPlan: {
            keyTopicsToProbe: ["Background", "Core Experience", "Technical Skills"],
            redFlagAreas: [],
            strengthAreas: ["Professional Experience"],
        },
    };

    const json = await callGemini(prompt, 1, fallbackResponse);

    // Save the first question into the session
    interview.questions = [
        {
            index: 0,
            type: json.firstQuestion?.type || "ResumeDeepDive",
            question: json.firstQuestion?.question,
            difficulty: json.firstQuestion?.difficulty || "Medium",
            status: "Pending",
        },
    ];

    // Set status to InProgress
    interview.status = "InProgress";

    // Persist interview plan for adaptive questioning in later turns
    if (json.interviewPlan) {
        interview.context.candidateProfile = {
            ...(interview.context.candidateProfile || {}),
            interviewPlan: json.interviewPlan,
        };
    }

    interview.transcript.push({
        role: "interviewer",
        content: `${json.greeting} ${json.firstQuestion?.question}`,
        timestamp: new Date(),
    });

    await interview.save();

    return {
        greeting: json.greeting,
        firstQuestion: json.firstQuestion,
        transcript: interview.transcript,
    };
};

/**
 * Evaluate the candidate's answer and adaptively decide the next step:
 * - Scores the answer (0–10) with strengths/weaknesses
 * - Tracks cumulative performance for adaptive difficulty
 * - Identifies uncovered topics from the interview plan
 * - Decides: follow-up | next question | coding challenge | wrap-up
 *
 * @returns {{ interviewStatus, interviewerSpeech, nextStep, nextQuestion?, codingChallenge?, evaluation? }}
 */
const processAnswerAndNextStep = async (
    aiInterviewId,
    { questionIndex, answer }
) => {
    const interview = await AIInterview.findById(aiInterviewId).populate(
        "job",
        "title company description skills"
    );

    if (!interview) throw new ApiError(404, "AI Interview not found");

    // ── Record candidate transcript ──
    interview.transcript.push({
        role: "candidate",
        content: answer,
        timestamp: new Date(),
    });

    // ── Locate and update the current question ──
    const currentQuestion =
        interview.questions.find((q) => q.index === questionIndex) ||
        interview.questions[interview.questions.length - 1];

    console.log("[INTERVIEW] Current question object:", currentQuestion);

    if (currentQuestion) {
        currentQuestion.candidateAnswer = answer;
        currentQuestion.status = "Answered";
    }

    console.log("[INTERVIEW] Updating conversation memory");
    console.log("[INTERVIEW] Generating next question");

    // ── Performance analysis ──
    const performance = analyzePerformance(interview.questions);
    const nextDifficulty = getAdaptiveDifficulty(
        performance,
        interview.config.difficulty
    );

    const answeredCount = interview.questions.filter(q => q.status === 'Answered').length;
    const questionCount = interview.questions.length;
    const maxQuestions = interview.config.questionCount || 6;
    const codingEnabled = interview.config.codingEnabled;
    const codingIssued = interview.codingChallenges.length > 0;

    // ── Uncovered topics ──
    const allSkills = [
        ...new Set([
            ...(interview.context.jobSkills || interview.job?.skills || []),
            ...(interview.context.matchingSkills || []),
        ]),
    ];
    const uncoveredTopics = getUncoveredTopics(interview.questions, allSkills);

    // ── Interview plan from initialization ──
    const interviewPlan =
        interview.context.candidateProfile?.interviewPlan || {};

    const prompt = `
You are MeritConnect AI, a professional interview system for ${interview.job?.company || 'the company'}.
You are mid-interview with a candidate for "${interview.job?.title || "Engineer"}".
Respond like a real human interviewer — natural, adaptive, evaluative.

═══════════════════════════════════════════
CANDIDATE'S LATEST ANSWER
═══════════════════════════════════════════

Question [${currentQuestion?.type || "Technical"} | ${currentQuestion?.difficulty || "Medium"}]:
"${currentQuestion?.question}"

Candidate's Answer:
"${answer}"

═══════════════════════════════════════════
FULL INTERVIEW HISTORY (scored)
═══════════════════════════════════════════

${formatQuestionHistory(interview.questions) || "No prior questions answered yet."}

═══════════════════════════════════════════
CONVERSATION TRANSCRIPT (recent)
═══════════════════════════════════════════

${formatTranscript(interview.transcript)}

═══════════════════════════════════════════
PERFORMANCE ANALYTICS
═══════════════════════════════════════════

Questions Answered: ${performance.totalAnswered} of ${maxQuestions}
Average Score: ${performance.avgScore}/10
Performance Trend: ${performance.trend}
Recent Scores: [${performance.recentScores.join(", ")}]
Strong Areas: ${performance.strongAreas.join(", ") || "Not enough data yet"}
Weak Areas: ${performance.weakAreas.join(", ") || "Not enough data yet"}
Recommended Next Difficulty: ${nextDifficulty}

═══════════════════════════════════════════
CANDIDATE CONTEXT
═══════════════════════════════════════════

Job Required Skills: ${(interview.context.jobSkills || interview.job?.skills || []).join(", ")}
Candidate Matching Skills: ${(interview.context.matchingSkills || []).join(", ")}
Candidate Missing Skills: ${(interview.context.missingSkills || []).join(", ")}
Resume (abbreviated): ${(interview.context.resumeText || "").substring(0, 1000)}
Topics Still Uncovered: ${uncoveredTopics.join(", ") || "All major topics covered"}
Red Flags to Probe: ${(interviewPlan.redFlagAreas || []).join(", ") || "None flagged"}
Key Topics from Plan: ${(interviewPlan.keyTopicsToProbe || []).join(", ") || "General"}

Coding Challenge: ${codingEnabled ? (codingIssued ? "Already issued" : "Not yet issued — consider issuing around question " + Math.ceil(maxQuestions * 0.6)) : "Disabled"}

═══════════════════════════════════════════
ADAPTIVE BEHAVIOR RULES
═══════════════════════════════════════════

1. EVALUATE the candidate's answer honestly (0–10):
   9–10: Exceptional — deep expertise, real-world nuance, original thinking.
   7–8 : Strong — correct and detailed, genuine understanding.
   5–6 : Adequate — surface-level, missing key details.
   3–4 : Weak — vague, partially wrong, lacks depth.
   1–2 : Poor — fundamentally wrong or unable to answer.

2. DECIDE your next move:
   • Score >= 8 AND trend "improving" → ESCALATE: harder question in same or new domain ("nextQuestion" with difficulty "${nextDifficulty === "Hard" ? "Hard" : "Hard"}").
   • Score 5–7 → FOLLOW-UP: targeted follow-up probing the specific weakness ("followUp").
   • Score <= 4 → PIVOT: brief encouraging feedback, pivot to a different topic ("nextQuestion" with easier difficulty).
   • Question ${questionCount} >= ${Math.ceil(maxQuestions * 0.6)} AND coding enabled AND no coding challenge yet → Issue CODING challenge ("coding").
   • Question ${questionCount} >= ${maxQuestions} → WRAP UP ("wrapup").

3. "interviewerReaction" MUST:
   • Sound human and natural (will be spoken aloud).
   • Acknowledge something specific the candidate said (1 sentence max).
   • Transition naturally to the next question.
   • NEVER say "Great answer!" generically — reference specifics.

4. Next question MUST:
   • Draw from the candidate's resume, their previous answers, or uncovered job-required skills.
   • Never repeat a topic already discussed.
   • Prioritize uncovered topics: ${uncoveredTopics.slice(0, 3).join(", ") || "general depth"}.

═══════════════════════════════════════════

Return ONLY valid JSON:
{
  "answerEvaluation": {
    "score": 8,
    "feedback": "Concise evaluation referencing specifics from the answer",
    "strengths": ["Specific strength"],
    "weaknesses": ["Specific gap or weakness"]
  },
  "interviewerReaction": "Natural spoken reaction + transition (1–2 sentences)",
  "nextStep": "nextQuestion|followUp|coding|wrapup",
  "nextQuestion": {
    "question": "Next specific question",
    "type": "Technical|Behavioral|Coding|SystemDesign|ProjectDeepDive|ResumeDeepDive",
    "difficulty": "${nextDifficulty}"
  },
  "codingChallenge": {
    "title": "Problem Title",
    "description": "Full problem statement with examples and constraints",
    "boilerplate": "function solve(input) {\\n  // Your solution here\\n}",
    "language": "javascript",
    "testCases": [
      { "input": "sample input", "expectedOutput": "expected output" }
    ]
  }
}

IMPORTANT: Include "codingChallenge" ONLY when nextStep is "coding".
Include "nextQuestion" ONLY when nextStep is NOT "wrapup".
`;

    const json = await callGemini(prompt);

    // ── Record evaluation on the current question ──
    if (currentQuestion) {
        currentQuestion.aiEvaluation = {
            score: json.answerEvaluation?.score ?? 5,
            feedback: json.answerEvaluation?.feedback || "",
            strengths: json.answerEvaluation?.strengths || [],
            weaknesses: json.answerEvaluation?.weaknesses || [],
        };
    }

    let interviewerSpeech = "";

    // ── WRAP-UP ──
    if (json.nextStep === "wrapup" || answeredCount >= maxQuestions) {
        interviewerSpeech =
            json.interviewerReaction || "Thank you for your time today.";
        interviewerSpeech +=
            " That wraps up all my questions. I've really enjoyed our discussion — let me compile the evaluation report now.";

        interview.status = "Completed";
        interview.completedAt = new Date();

        interview.transcript.push({
            role: "interviewer",
            content: interviewerSpeech,
            timestamp: new Date(),
        });

        await interview.save();

        return {
            interviewStatus: "Completed",
            interviewerSpeech,
            nextStep: "wrapup",
            evaluation: json.answerEvaluation,
        };
    }

    // ── CODING CHALLENGE ──
    if (
        json.nextStep === "coding" &&
        json.codingChallenge &&
        codingEnabled
    ) {
        const codingItem = {
            title:
                json.codingChallenge.title || "Coding Challenge",
            description:
                json.codingChallenge.description ||
                "Implement the function according to the specification.",
            boilerplate:
                json.codingChallenge.boilerplate ||
                "function solution(data) {\n  // Your code here\n}",
            language: json.codingChallenge.language || "javascript",
            testCases: (json.codingChallenge.testCases || []).map((tc) => ({
                input: tc.input || "",
                expectedOutput: tc.expectedOutput || "",
                passed: false,
            })),
        };

        interview.codingChallenges.push(codingItem);

        interviewerSpeech = `${json.interviewerReaction || "Nice work so far."} I'd like to see how you approach a coding problem. Take a look at the challenge on screen — take your time, and feel free to think out loud.`;

        interview.transcript.push({
            role: "interviewer",
            content: interviewerSpeech,
            timestamp: new Date(),
        });

        await interview.save();

        return {
            interviewStatus: "InProgress",
            interviewerSpeech,
            nextStep: "coding",
            codingChallenge: codingItem,
            evaluation: json.answerEvaluation,
        };
    }

    // ── STANDARD NEXT QUESTION / FOLLOW-UP ──
    const nextQObj = {
        index: interview.questions.length,
        type: json.nextQuestion?.type || "Technical",
        question:
            json.nextQuestion?.question ||
            "Could you elaborate on how you approached that technical challenge?",
        difficulty: json.nextQuestion?.difficulty || nextDifficulty,
        status: "Pending",
        followUpOf: json.nextStep === "followUp" ? questionIndex : null,
    };

    interview.questions.push(nextQObj);

    interviewerSpeech = `${json.interviewerReaction || ""} ${nextQObj.question}`.trim();

    interview.transcript.push({
        role: "interviewer",
        content: interviewerSpeech,
        timestamp: new Date(),
    });

    await interview.save();

    return {
        interviewStatus: "InProgress",
        interviewerSpeech,
        nextStep: json.nextStep || "nextQuestion",
        nextQuestion: nextQObj,
        evaluation: json.answerEvaluation,
        transcript: interview.transcript,
    };
};

/**
 * Evaluate candidate code submission with detailed correctness,
 * efficiency, and quality analysis.
 *
 * @returns {{ evaluation, interviewerSpeech }}
 */
const evaluateCodeSubmission = async (
    aiInterviewId,
    { challengeIndex, code, language }
) => {
    const interview = await AIInterview.findById(aiInterviewId);
    if (!interview) throw new ApiError(404, "AI Interview not found");

    const idx = challengeIndex ?? 0;
    const challenge = interview.codingChallenges[idx];
    if (!challenge) throw new ApiError(404, "Coding challenge not found");

    const prompt = `
You are MeritConnect AI, evaluating candidate code during a live interview.

═══════════════════════════════════════════
PROBLEM
═══════════════════════════════════════════

Title: ${challenge.title}
Description:
${challenge.description}

Test Cases:
${(challenge.testCases || [])
    .map(
        (tc, i) =>
            `  Case ${i + 1}: Input: ${tc.input} → Expected Output: ${tc.expectedOutput}`
    )
    .join("\n")}

═══════════════════════════════════════════
CANDIDATE CODE (${language})
═══════════════════════════════════════════

\`\`\`${language}
${code}
\`\`\`

═══════════════════════════════════════════
EVALUATION CRITERIA
═══════════════════════════════════════════

Rate each dimension 0–10:
1. Correctness: Does the code solve the problem? Does it handle edge cases (empty input, large input, boundary values)?
2. Efficiency: Is the time complexity optimal or near-optimal? Any unnecessary work?
3. Code Quality: Readability, naming conventions, structure, idiomatic usage of ${language}.

Also determine:
- Big O time complexity
- Big O space complexity
- Whether each test case would pass
- Specific constructive feedback referencing their code
- A natural spoken reaction (will be spoken via TTS, 1–2 sentences)

═══════════════════════════════════════════

Return ONLY valid JSON:
{
  "correctness": 9,
  "efficiency": 8,
  "codeQuality": 8,
  "timeComplexity": "O(N)",
  "spaceComplexity": "O(1)",
  "feedback": "Specific constructive feedback referencing their code",
  "testResults": [
    { "input": "test input", "expectedOutput": "expected", "actualOutput": "actual", "passed": true }
  ],
  "interviewerReaction": "Natural spoken reaction (1–2 sentences)"
}
`;

    const json = await callGemini(prompt);

    // ── Persist evaluation ──
    challenge.candidateCode = code;
    challenge.aiEvaluation = {
        correctness: json.correctness ?? 7,
        efficiency: json.efficiency ?? 7,
        codeQuality: json.codeQuality ?? 7,
        timeComplexity: json.timeComplexity || "Unknown",
        spaceComplexity: json.spaceComplexity || "Unknown",
        feedback: json.feedback || "Code reviewed.",
    };

    // Update test case pass/fail from AI analysis
    if (json.testResults && challenge.testCases) {
        json.testResults.forEach((result, i) => {
            if (challenge.testCases[i]) {
                challenge.testCases[i].passed = result.passed ?? false;
            }
        });
    }

    const interviewerSpeech =
        json.interviewerReaction ||
        "Thanks for working through that — let me take a closer look at your approach.";

    interview.transcript.push(
        {
            role: "candidate",
            content: `[Submitted Code — ${language}]\n${code}`,
            timestamp: new Date(),
        },
        {
            role: "interviewer",
            content: interviewerSpeech,
            timestamp: new Date(),
        }
    );

    await interview.save();

    return {
        evaluation: challenge.aiEvaluation,
        interviewerSpeech,
    };
};

/**
 * Generate the final comprehensive AI Interview evaluation report.
 * Analyzes the full transcript, all Q&A pairs, coding submissions,
 * and behavioral metrics to produce a structured hiring recommendation.
 *
 * @returns {AIInterviewReport}
 */
const generateFinalReport = async (aiInterviewId) => {
    const interview = await AIInterview.findById(aiInterviewId)
        .populate("candidate", "name email profile")
        .populate("job", "title company description skills experienceLevel");

    if (!interview) throw new ApiError(404, "Interview not found");

    const performance = analyzePerformance(interview.questions);

    const prompt = `
You are MeritConnect AI, generating a comprehensive evaluation report for ${interview.job?.company || 'the company'}.
Review the complete interview record and produce a rigorous evaluation report.
Base your scores ONLY on the evidence below — do not infer or assume.

═══════════════════════════════════════════
INTERVIEW METADATA
═══════════════════════════════════════════

Candidate: ${interview.candidate?.name}
Position: ${interview.job?.title}
Company: ${interview.job?.company}
Interview Type: ${interview.type}
Duration: ${interview.config?.duration} min
Questions Asked: ${interview.questions.length}
Coding Challenges: ${interview.codingChallenges.length}

═══════════════════════════════════════════
PERFORMANCE SUMMARY
═══════════════════════════════════════════

Average Question Score: ${performance.avgScore}/10
Performance Trend: ${performance.trend}
Strong Areas: ${performance.strongAreas.join(", ") || "None identified"}
Weak Areas: ${performance.weakAreas.join(", ") || "None identified"}
Score Distribution: [${performance.recentScores.join(", ")}]

═══════════════════════════════════════════
CANDIDATE CONTEXT
═══════════════════════════════════════════

ATS Match Score: ${interview.context?.atsScore || 0}/100
Matching Skills: ${(interview.context?.matchingSkills || []).join(", ")}
Missing Skills: ${(interview.context?.missingSkills || []).join(", ")}

═══════════════════════════════════════════
FULL TRANSCRIPT
═══════════════════════════════════════════

${interview.transcript
    .map((t) => `[${t.role.toUpperCase()}]: ${t.content}`)
    .join("\n\n")}

═══════════════════════════════════════════
QUESTION-BY-QUESTION BREAKDOWN
═══════════════════════════════════════════

${interview.questions
    .map(
        (q) =>
            `Q${q.index + 1} [${q.type} | ${q.difficulty} | ${q.status}]:
  Question: "${q.question}"
  Answer: "${(q.candidateAnswer || "No answer").substring(0, 600)}"
  Score: ${q.aiEvaluation?.score || "N/A"}/10
  Feedback: ${q.aiEvaluation?.feedback || "N/A"}
  Strengths: ${(q.aiEvaluation?.strengths || []).join(", ") || "N/A"}
  Weaknesses: ${(q.aiEvaluation?.weaknesses || []).join(", ") || "N/A"}`
    )
    .join("\n\n")}

═══════════════════════════════════════════
CODING EVALUATIONS
═══════════════════════════════════════════

${
    interview.codingChallenges.length > 0
        ? interview.codingChallenges
              .map(
                  (c) =>
                      `"${c.title}":
  Correctness: ${c.aiEvaluation?.correctness || "N/A"}/10
  Efficiency: ${c.aiEvaluation?.efficiency || "N/A"}/10
  Code Quality: ${c.aiEvaluation?.codeQuality || "N/A"}/10
  Complexity: ${c.aiEvaluation?.timeComplexity || "?"} time / ${c.aiEvaluation?.spaceComplexity || "?"} space
  Feedback: ${c.aiEvaluation?.feedback || "N/A"}`
              )
              .join("\n\n")
        : "No coding challenges administered."
}

═══════════════════════════════════════════
BEHAVIORAL METRICS
═══════════════════════════════════════════

Eye Contact: ${interview.metrics?.eyeContactScore ?? "N/A"}/100
Engagement: ${interview.metrics?.overallEngagement ?? "N/A"}/100
Filler Words: ${interview.metrics?.fillerWords?.count ?? 0} (${(interview.metrics?.fillerWords?.words || []).join(", ") || "none"})
Confidence Avg: ${
        interview.metrics?.confidenceScores?.length
            ? (
                  interview.metrics.confidenceScores.reduce(
                      (a, b) => a + b.score,
                      0
                  ) / interview.metrics.confidenceScores.length
              ).toFixed(1)
            : "N/A"
    }

═══════════════════════════════════════════
SCORING INSTRUCTIONS
═══════════════════════════════════════════

Rate each of the following 10 dimensions from 0–100 based ONLY on transcript evidence:
1. technicalScore: Depth, accuracy, and domain mastery.
2. communicationScore: Structure, clarity, and articulation.
3. confidenceScore: Vocal poise, lack of hesitation, conviction under pressure.
4. problemSolvingScore: Analytical decomposition, edge-case thinking, and logical progression.
5. codingScore: Correctness, efficiency, and code cleanliness demonstrated during coding challenges (or 80 if no coding round).
6. behaviorScore: STAR format responses, teamwork signals, adaptability, professional maturity.
7. grammarScore: Syntax accuracy, sentence construction, and linguistic correctness in spoken/written text.
8. vocabularyScore: Industry-standard terminology, precision, and technical vocabulary usage.
9. leadershipScore: Initiative, ownership, cross-functional collaboration, and decision-making.
10. systemDesignScore: Architectural trade-offs, scalability considerations, data flow design (or 80 if not evaluated).

overallScore: Weighted composite score reflecting all 10 dimensions.

Hiring Recommendation:
  "Strong Hire": overall >= 85 AND no red flags
  "Hire": overall 70–84 AND solid across dimensions
  "Lean Hire": overall 60–69 OR some weak areas but net positive
  "Lean No Hire": overall 45–59 OR significant gaps in key areas
  "No Hire": overall < 45 OR critical red flags

scoreExplanations — Provide a 2–3 sentence detailed explanation for EVERY score dimension above, citing specific quotes or moments from the interview transcript.

detailedAnalysis — Write 3–4 paragraphs:
1. Overall impression and standout moments (cite specific answers)
2. Technical depth assessment with concrete examples from the interview
3. Communication and behavioral assessment
4. Final recommendation with clear reasoning

═══════════════════════════════════════════

Return ONLY valid JSON:
{
  "overallScore": 84,
  "technicalScore": 85,
  "communicationScore": 82,
  "confidenceScore": 80,
  "problemSolvingScore": 86,
  "codingScore": 88,
  "behaviorScore": 82,
  "grammarScore": 90,
  "vocabularyScore": 88,
  "leadershipScore": 78,
  "systemDesignScore": 82,
  "projectsScore": 84,
  "resumeAuthenticityScore": 90,
  "hiringRecommendation": "Hire",
  "strengths": ["Specific strength 1", "Specific strength 2", "Specific strength 3"],
  "weaknesses": ["Specific weakness 1", "Specific weakness 2"],
  "improvementPlan": ["Actionable suggestion 1", "Actionable suggestion 2"],
  "scoreExplanations": {
    "technicalScore": "Explanation citing transcript...",
    "communicationScore": "Explanation citing transcript...",
    "confidenceScore": "Explanation citing transcript...",
    "problemSolvingScore": "Explanation citing transcript...",
    "codingScore": "Explanation citing transcript...",
    "behaviorScore": "Explanation citing transcript...",
    "grammarScore": "Explanation citing transcript...",
    "vocabularyScore": "Explanation citing transcript...",
    "leadershipScore": "Explanation citing transcript...",
    "systemDesignScore": "Explanation citing transcript..."
  },
  "detailedAnalysis": "Multi-paragraph analysis citing specific interview moments..."
}
`;

    const json = await callGemini(prompt);

    interview.report = {
        overallScore: json.overallScore ?? 0,
        technicalScore: json.technicalScore ?? 0,
        communicationScore: json.communicationScore ?? 0,
        confidenceScore: json.confidenceScore ?? 0,
        behaviorScore: json.behaviorScore ?? 0,
        problemSolvingScore: json.problemSolvingScore ?? 0,
        projectsScore: json.projectsScore ?? 0,
        resumeAuthenticityScore: json.resumeAuthenticityScore ?? 0,
        codingScore: json.codingScore ?? 0,
        grammarScore: json.grammarScore ?? 0,
        vocabularyScore: json.vocabularyScore ?? 0,
        leadershipScore: json.leadershipScore ?? 0,
        systemDesignScore: json.systemDesignScore ?? 0,
        hiringRecommendation: json.hiringRecommendation || "Pending",
        strengths: json.strengths || [],
        weaknesses: json.weaknesses || [],
        improvementPlan: json.improvementPlan || [],
        scoreExplanations: json.scoreExplanations || {},
        detailedAnalysis: json.detailedAnalysis || "",
        generatedAt: new Date(),
    };

    interview.status = "Completed";
    interview.completedAt = interview.completedAt || new Date();
    await interview.save();

    // Generate PDF report, upload to Cloudinary, and save pdfUrl to MongoDB
    try {
        const pdfUrl = await generateInterviewPDFReport(aiInterviewId);
        interview.report.pdfUrl = pdfUrl;
    } catch (pdfErr) {
        console.error("[PDF Report Error]:", pdfErr.message);
    }

    return interview.report;
};

module.exports = {
    initializeInterviewAgent,
    processAnswerAndNextStep,
    evaluateCodeSubmission,
    generateFinalReport,
};
