const { ai, GEMINI_MODEL } = require("../../config/gemini");

const generateApplicationKit = async (externalJob, candidateProfile, matchResult) => {
    const prompt = `
        Generate an application kit for this candidate and job.
        Job: ${externalJob.title} at ${externalJob.company}
        Job Description: ${externalJob.description.substring(0, 2000)}
        
        Candidate Name: ${candidateProfile.name}
        Candidate Skills: ${candidateProfile.skills.join(', ')}
        Candidate Bio: ${candidateProfile.bio || 'N/A'}
        Candidate Resume: ${candidateProfile.resumeText ? candidateProfile.resumeText.substring(0, 2000) : 'N/A'}
        
        Match Context:
        Match Score: ${matchResult.matchScore}
        Concerns: ${matchResult.concerns?.join(', ')}
        
        Return JSON ONLY:
        {
            "whyFits": "Brief explanation of fit",
            "resumeEmphasis": ["bullet 1", "bullet 2"],
            "potentialGaps": ["gap 1"],
            "coverNote": "A short cover letter draft",
            "applicationAnswers": [{"question": "Why do you want to work here?", "answer": "..."}]
        }
    `;

    try {
        const response = await ai.models.generateContent({ model: GEMINI_MODEL, contents: prompt });
        let text = response.text || '';
        text = text.replace(/\\`\\`\\`json/g, '').replace(/\\`\\`\\`/g, '').trim();
        
        return JSON.parse(text);
    } catch (error) {
        console.error('[JobFinder] Application Kit generation failed:', error.message);
        return {
            whyFits: "Kit generation failed",
            resumeEmphasis: [],
            potentialGaps: [],
            coverNote: "Failed to generate cover note.",
            applicationAnswers: []
        };
    }
};

module.exports = { generateApplicationKit };
