import React from "react";
import { useMediaDevices } from "../../hooks/useMediaDevices";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

interface CandidateVideoProps {
    isCameraOn: boolean;
    isMicOn: boolean;
    candidateName?: string;
    confidenceScore?: number;
    className?: string;
}

export const CandidateVideo = React.memo<CandidateVideoProps>(({
    isCameraOn,
    isMicOn,
    candidateName = "You",
    confidenceScore = 90,
    className = "",
}) => {
    const { videoRef, hasPermission } = useMediaDevices(isCameraOn, isMicOn);

    return (
        <div className={`relative overflow-hidden rounded-[28px] bg-white border border-[#ECECEC] shadow-[0_4px_24px_rgba(0,0,0,0.03)] ${className}`}>
            {isCameraOn && hasPermission !== false ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                />
            ) : (
                <div className="flex flex-col items-center justify-center w-full h-full min-h-[180px] bg-[#F6F6F7] text-[#6E6E73]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white border border-[#ECECEC] text-[#111111] font-semibold text-xl mb-2 shadow-xs">
                        {candidateName.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-xs font-medium text-[#6E6E73]">Camera turned off</p>
                </div>
            )}

            {/* Candidate Name Badge */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#111111] backdrop-blur-md border border-[#ECECEC] shadow-xs">
                <span>{candidateName}</span>
                <span className="text-[#6E6E73]">&bull;</span>
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    {confidenceScore}% Confidence
                </span>
            </div>

            {/* Audio & Video Status Indicators */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                <div className={`p-2 rounded-xl backdrop-blur-md border border-[#ECECEC] shadow-xs ${isMicOn ? "bg-white text-emerald-600" : "bg-white text-rose-500"}`}>
                    {isMicOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                </div>
                <div className={`p-2 rounded-xl backdrop-blur-md border border-[#ECECEC] shadow-xs ${isCameraOn ? "bg-white text-emerald-600" : "bg-white text-rose-500"}`}>
                    {isCameraOn ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
                </div>
            </div>
        </div>
    );
});
