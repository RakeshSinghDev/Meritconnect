const { ai, GEMINI_MODEL } = require("../config/gemini");

const analyzeResume = async (resumeText, jobDescription) => {

    const prompt = `
You are an expert ATS and Technical Recruiter.

Compare the resume against the job description.

Return ONLY valid JSON.

{
  "overallScore": 0,
  "atsScore": 0,
  "recommendation": "Strong Hire",
  "summary": "",
  "strengths": [],
  "matchedSkills": [],
  "missingSkills": [],
  "experience": {
      "candidate": 0,
      "required": 0
  },
  "education": "",
  "projectsScore": 0
}

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

    const response =
        await ai.models.generateContent({

            model: GEMINI_MODEL,

            contents: prompt,

        });
    console.log("===== RAW GEMINI RESPONSE =====");
    console.log(response);
    console.log("===== RESPONSE TEXT =====");
    console.log(response.text);

    let text = response.text;

    text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    let result;
    console.log(response.text);

    try {
        result = JSON.parse(text);
    } catch {
        throw new Error("The AI service returned an invalid analysis response.");
    }

    return {

        overallScore:
            result.overallScore ??
            result.atsScore ??
            0,

        atsScore:
            result.atsScore ?? 0,

        recommendation:
            result.recommendation ??
            "Consider",

        summary:
            result.summary ?? "",

        strengths:
            result.strengths ?? [],

        matchedSkills:
            result.matchedSkills ??
            result.matchingSkills ??
            [],

        missingSkills:
            result.missingSkills ?? [],

        experience:
            result.experience ?? {

                candidate: 0,

                required: 0,

            },

        education:
            result.education ??
            "Not Available",

        projectsScore:
            result.projectsScore ?? 0,

    };

};

module.exports = {
    analyzeResume,
};
