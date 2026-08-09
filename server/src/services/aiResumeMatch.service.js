const { ai, GEMINI_MODEL } = require("../config/gemini");
const Application = require("../models/Application");
const ApiError = require("../utils/ApiError");

const generateResumeMatch = async (applicationId) => {
    const application = await Application.findById(applicationId)
        .populate("candidate", "name email")
        .populate("job");

    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    if (!application.resumeText) {
        throw new ApiError(
            400,
            "Resume has not been parsed yet."
        );
    }

    const prompt = `
You are an expert ATS and Technical Recruiter.

Compare the following candidate resume with the job description.

=========================
JOB TITLE
=========================
${application.job.title}

=========================
COMPANY
=========================
${application.job.company}

=========================
JOB DESCRIPTION
=========================
${application.job.description}

=========================
REQUIRED SKILLS
=========================
${application.job.skills.join(", ")}

=========================
CANDIDATE RESUME
=========================
${application.resumeText}

Return ONLY valid JSON.

{
  "overallScore": 0,
  "skillMatch": 0,
  "experienceMatch": 0,
  "educationMatch": 0,
  "strengths": [],
  "missingSkills": [],
  "weaknesses": [],
  "recommendations": [],
  "hireRecommendation": "",
  "summary": ""
}
`;

    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
    });

    let text = response.text.trim();

    text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
        throw new ApiError(
            500,
            "Invalid AI response."
        );
    }

    const json = text.substring(start, end + 1);

    try {
        return JSON.parse(json);
    } catch (err) {
        throw new ApiError(
            500,
            "Failed to parse AI response."
        );
    }
};

module.exports = {
    generateResumeMatch,
};