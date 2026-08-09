const { ai, GEMINI_MODEL } = require("../../config/gemini");
const ApiError = require("../../utils/ApiError");

const MODEL = process.env.GEMINI_MODEL || GEMINI_MODEL || "gemini-1.5-flash";

class GeminiService {

    /**
     * =====================================
     * Ask Gemini (Text Response)
     * =====================================
     */
    async ask(prompt) {

        try {

            const response =
                await ai.models.generateContent({

                    model: MODEL,

                    contents: prompt,

                });

            return this.cleanResponse(
                response.text
            );

        } catch (error) {

            console.error(error);

            throw new ApiError(
                500,
                "Failed to communicate with Gemini."
            );

        }

    }

    /**
     * =====================================
     * Ask Gemini (JSON Response)
     * =====================================
     */
    async askJSON(prompt) {

        try {

            const response =
                await ai.models.generateContent({

                    model: MODEL,

                    contents: prompt,

                });

            return JSON.parse(
                this.cleanJSON(response.text)
            );

        } catch (error) {

            console.error(error);

            throw new ApiError(
                500,
                "Failed to parse Gemini JSON response."
            );

        }

    }

    /**
     * =====================================
     * Clean Text Response
     * =====================================
     */
    cleanResponse(text) {

        if (!text) return "";

        return text
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```$/i, "")
            .trim();

    }

    /**
     * =====================================
     * Extract JSON
     * =====================================
     */
    cleanJSON(text) {

        text = this.cleanResponse(text);

        const start = text.indexOf("{");

        const end = text.lastIndexOf("}");

        if (start === -1 || end === -1) {

            throw new Error("Invalid JSON response.");

        }

        return text.substring(
            start,
            end + 1
        );

    }

}

module.exports = new GeminiService();