export interface ResumeAnalysis {
    overallScore: number;
    atsScore: number;

    recommendation: "Strong Hire" | "Hire" | "Consider" | "Reject";

    summary: string;

    strengths: string[];

    missingSkills: string[];

    matchedSkills: string[];

    experience: {
        required: number;
        candidate: number;
    };

    education: string;

    projectsScore: number;
}