const axios = require("axios");

const downloadResume = async (url) => {
    const response = await axios.get(url, {
        responseType: "arraybuffer",
    });

    return Buffer.from(response.data);
};

module.exports = {
    downloadResume,
};