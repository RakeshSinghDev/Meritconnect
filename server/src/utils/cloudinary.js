const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadResume = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "ai-recruitment/resumes",
                resource_type: "raw",
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            }
        );

        streamifier.createReadStream(buffer).pipe(stream);
    });
};

const deleteResume = async (publicId) => {
    return await cloudinary.uploader.destroy(publicId, {
        resource_type: "raw",
    });
};

module.exports = {
    uploadResume,
    deleteResume,
};