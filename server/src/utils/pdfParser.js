const pdf = require("pdf-parse");

const extractText = async (buffer) => {
    const data = await pdf(buffer);
    return data.text;
};

module.exports = { extractText };