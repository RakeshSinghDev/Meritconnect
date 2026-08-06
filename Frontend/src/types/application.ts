export interface Application {
    _id: string;
    id?: string;

    jobId?: string;

    candidateName?: string;
    email?: string;
    phone?: string;

    resume?:
        | {
              url?: string;
              publicId?: string;
              fileName?: string;
          }
        | string;

    score?: number;

    status:
        | "Applied"
        | "Pending"
        | "Reviewed"
        | "Shortlisted"
        | "Interview"
        | "Rejected"
        | "Hired";

    appliedAt?: string;
    createdAt?: string;

    candidate?: {
        _id: string;
        name: string;
        email: string;
        profile?: {
            phone?: string;
            location?: string;
            resume?: {
                url?: string;
                publicId?: string;
                fileName?: string;
            };
        };
    };

    aiAnalysis?: {
        atsScore?: number;
        overallScore?: number;
        summary?: string;
        matchedSkills?: string[];
        missingSkills?: string[];
        strengths?: string[];
        suggestions?: string[];
        analyzedAt?: string;
    };
}