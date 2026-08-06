export type AIInterviewType =
    | "Technical"
    | "Behavioral"
    | "Coding"
    | "SystemDesign"
    | "ResumeDeepDive"
    | "ProjectDeepDive"
    | "Communication"
    | "ProblemSolving"
    | "Leadership"
    | "HR"
    | "Mixed";

export type AIInterviewStatus = "Waiting" | "InProgress" | "Completed" | "Abandoned" | "Expired";

export interface AIInterviewConfig {
    duration: number;
    difficulty: "Easy" | "Medium" | "Hard" | "Adaptive";
    focusAreas: string[];
    questionCount: number;
    codingEnabled: boolean;
    systemDesignEnabled: boolean;
}

export interface AIQuestion {
    index: number;
    type: string;
    question: string;
    expectedAnswer?: string;
    candidateAnswer?: string;
    aiEvaluation?: {
        score: number;
        feedback: string;
        strengths: string[];
        weaknesses: string[];
    };
    timeSpent?: number;
    difficulty?: string;
    status: "Pending" | "Answered" | "Skipped";
    followUpOf?: number | null;
}

export interface CodingChallenge {
    title: string;
    description: string;
    boilerplate: string;
    language: string;
    candidateCode?: string;
    testCases?: Array<{
        input: string;
        expectedOutput: string;
        passed?: boolean;
    }>;
    aiEvaluation?: {
        correctness: number;
        efficiency: number;
        codeQuality: number;
        timeComplexity: string;
        spaceComplexity: string;
        feedback: string;
    };
    timeSpent?: number;
}

export interface AIInterviewReport {
    overallScore: number;
    technicalScore: number;
    communicationScore: number;
    confidenceScore: number;
    behaviorScore: number;
    problemSolvingScore: number;
    projectsScore: number;
    resumeAuthenticityScore: number;
    codingScore?: number;
    grammarScore?: number;
    vocabularyScore?: number;
    leadershipScore?: number;
    systemDesignScore?: number;
    hiringRecommendation: "Strong Hire" | "Hire" | "Lean Hire" | "Lean No Hire" | "No Hire" | "Pending";
    strengths: string[];
    weaknesses: string[];
    improvementPlan: string[];
    scoreExplanations?: Record<string, string>;
    detailedAnalysis: string;
    pdfUrl?: string;
    generatedAt?: string;
}

export interface TranscriptEntry {
    role: "interviewer" | "candidate";
    content: string;
    timestamp: string;
}

export interface AIInterviewSession {
    _id: string;
    application: string;
    candidate: {
        _id: string;
        name: string;
        email: string;
        profile?: any;
    };
    job: {
        _id: string;
        title: string;
        company: string;
        description?: string;
        skills?: string[];
        location?: string;
        salary?: number;
    };
    recruiter: {
        _id: string;
        name: string;
        email: string;
    };
    type: AIInterviewType;
    status: AIInterviewStatus;
    config: AIInterviewConfig;
    context: {
        resumeText?: string;
        atsScore?: number;
        matchingSkills?: string[];
        missingSkills?: string[];
        strengths?: string[];
        candidateProfile?: any;
        jobDescription?: string;
        jobSkills?: string[];
    };
    questions: AIQuestion[];
    codingChallenges: CodingChallenge[];
    metrics?: {
        confidenceScores: Array<{ timestamp: string; score: number }>;
        speakingSpeed: Array<{ timestamp: string; wpm: number }>;
        fillerWords: { count: number; words: string[] };
        eyeContactScore: number;
        overallEngagement: number;
    };
    report?: AIInterviewReport;
    transcript: TranscriptEntry[];
    recording?: {
        url: string;
        publicId: string;
        duration: number;
    };
    startedAt?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAIInterviewDto {
    applicationId?: string;
    candidateId?: string;
    jobId?: string;
    type?: AIInterviewType;
    config?: Partial<AIInterviewConfig>;
}
