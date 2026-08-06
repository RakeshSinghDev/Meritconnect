import api from "../lib/api";

export const uploadResume = async (
    file: File
) => {
    const formData = new FormData();

    formData.append("resume", file);

    const { data } = await api.post(
        "/resume/upload",
        formData,
        {
            headers: {
                "Content-Type":
                    "multipart/form-data",
            },
        }
    );

    return data.data;
};

export const getResume = async () => {
    const { data } = await api.get("/resume");

    return data.data;
};

export const deleteResume = async () => {
    const { data } = await api.delete("/resume");

    return data.data;
};