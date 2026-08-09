const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

module.exports = {
    ai,
    GEMINI_MODEL,
};