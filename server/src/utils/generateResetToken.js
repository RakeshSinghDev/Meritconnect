const crypto = require("crypto");

const generateResetToken = () => {
    // Generate random token
    const resetToken = crypto
        .randomBytes(32)
        .toString("hex");

    // Hash the token before storing it in DB
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    return {
        resetToken,
        hashedToken,
    };
};

module.exports = generateResetToken;