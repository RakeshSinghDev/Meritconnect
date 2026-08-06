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

export const CandidateVideo: React.FC<CandidateVideoProps> = ({
    isCameraOn,
    isMicOn,
    candidateName = "You",
    confidenceScore = 90,
    className = "",
}) => {
    const { videoRef, hasPermission } = useMediaDevices(isCameraOn, isMicOn);

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-xl ${className}`}>
            {isCameraOn && hasPermission !== false ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                />
            ) : (
                <div className="flex flex-col items-center justify-center w-full h-full min-h-[180px] bg-slate-900 text-slate-400">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-slate-300 font-semibold text-xl mb-2">
                        {candidateName.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-xs font-medium text-slate-500">Camera turned off</p>
                </div>
            )}

            {/* Candidate Name Badge */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-lg bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-slate-200 backdrop-blur-md border border-slate-700/50">
                <span>{candidateName}</span>
                <span className="text-slate-500">|</span>
                <span className="flex items-center gap-1 text-emerald-400">
                    {confidenceScore}% Confidence
                </span>
            </div>

            {/* Audio & Video Status Indicators */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                <div className={`p-1.5 rounded-lg backdrop-blur-md ${isMicOn ? "bg-slate-900/80 text-emerald-400" : "bg-rose-950/90 text-rose-400"}`}>
                    {isMicOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                </div>
                <div className={`p-1.5 rounded-lg backdrop-blur-md ${isCameraOn ? "bg-slate-900/80 text-emerald-400" : "bg-rose-950/90 text-rose-400"}`}>
                    {isCameraOn ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
                </div>
            </div>
        </div>
    );
};
