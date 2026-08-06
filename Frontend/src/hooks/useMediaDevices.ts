import { useState, useEffect, useRef } from "react";

export const useMediaDevices = (isCameraOn: boolean, isMicOn: boolean) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        let activeStream: MediaStream | null = null;

        const initMedia = async () => {
            try {
                const userStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
                    audio: true,
                });
                activeStream = userStream;
                setStream(userStream);
                setHasPermission(true);

                if (videoRef.current) {
                    videoRef.current.srcObject = userStream;
                }
            } catch (err: any) {
                console.error("Media devices access error:", err);
                setHasPermission(false);
                setError(err.message || "Failed to access camera or microphone");
            }
        };

        initMedia();

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        if (stream) {
            stream.getVideoTracks().forEach((t) => (t.enabled = isCameraOn));
        }
    }, [isCameraOn, stream]);

    useEffect(() => {
        if (stream) {
            stream.getAudioTracks().forEach((t) => (t.enabled = isMicOn));
        }
    }, [isMicOn, stream]);

    return { stream, videoRef, hasPermission, error };
};
