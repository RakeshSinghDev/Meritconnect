import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Search,
    MapPin,
    Building2,
    Clock,
    ChevronRight,
    ExternalLink,
    BookmarkPlus,
    X,
    Star,
    TrendingUp,
    Target,
    FileText,
    Briefcase,
    Globe,
    CheckCircle2,
    XCircle,
    Copy,
    Edit3,
    Loader2,
    AlertTriangle,
    ArrowRight,
    RefreshCw,
    Filter,
    Zap,
    Award,
    BarChart3
} from "lucide-react";
import toast from "react-hot-toast";
import {
    getPreferences,
    updatePreferences,
    runSearch,
    generateApplicationKit,
    updateRecommendationStatus,
    getRecommendations
} from "../../services/jobFinder.service";

interface Preferences {
    targetTitles: string[];
    locations: string[];
    allowRemote: boolean;
    experienceMin: number;
    experienceMax: number;
    employmentTypes: string[];
    excludedTitles: string[];
}

interface Recommendation {
    _id: string;
    jobTitle?: string;
    companyName?: string;
    externalJob?: {
        title: string;
        company: string;
        location: string;
        remote: boolean;
        applicationUrl: string;
    };
    location?: string;
    remote?: boolean;
    matchScore: number;
    recommendation?: string;
    recommendationLevel?: string;
    whyYouMatch?: string;
    aiSummary?: string;
    reasons?: string[];
    matchingSkills: string[];
    missingSkills: string[];
    status: string;
    applicationUrl?: string;
}

interface ApplicationKit {
    whyThisRoleFits?: string;
    whyFits?: string;
    yourStrengths?: string[];
    evidence?: string[];
    potentialGaps?: string[];
    concerns?: string[];
    coverNote?: string;
    coverLetter?: string;
    applicationAnswers?: { question: string; answer: string }[];
}

const AIJobFinder: React.FC = () => {
    const [preferences, setPreferences] = useState<Preferences>({
        targetTitles: ["Backend Developer", "Software Engineer"],
        locations: ["India", "Remote"],
        allowRemote: true,
        experienceMin: 0,
        experienceMax: 3,
        employmentTypes: ["Full-Time"],
        excludedTitles: ["Staff", "Architect", "Lead"]
    });

    const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchStage, setSearchStage] = useState(0);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    
    // Application Kit Modal
    const [selectedJob, setSelectedJob] = useState<Recommendation | null>(null);
    const [isKitModalOpen, setIsKitModalOpen] = useState(false);
    const [kitData, setKitData] = useState<ApplicationKit | null>(null);
    const [isGeneratingKit, setIsGeneratingKit] = useState(false);
    const [editableCoverNote, setEditableCoverNote] = useState("");

    useEffect(() => {
        loadPreferences();
        loadExistingRecommendations();
    }, []);

    const loadPreferences = async () => {
        try {
            const res = await getPreferences();
            if (res.data?.data) {
                const data = res.data.data;
                setPreferences({
                    targetTitles: data.targetTitles || data.targetRoles || ["Backend Developer", "Software Engineer"],
                    locations: data.locations || ["India", "Remote"],
                    allowRemote: data.allowRemote ?? data.remote ?? true,
                    experienceMin: data.experienceMin ?? data.minExperience ?? 0,
                    experienceMax: data.experienceMax ?? data.maxExperience ?? 3,
                    employmentTypes: data.employmentTypes || ["Full-Time"],
                    excludedTitles: data.excludedTitles || ["Staff", "Architect"]
                });
            }
        } catch (error) {
            console.error("Failed to load preferences", error);
        }
    };

    const loadExistingRecommendations = async () => {
        try {
            const res = await getRecommendations(1, 20);
            const recs = res.data?.data?.recommendations || res.data?.data || [];
            if (Array.isArray(recs) && recs.length > 0) {
                setRecommendations(recs);
                setHasSearched(true);
            }
        } catch (error) {
            console.error("Failed to load recommendations", error);
        }
    };

    const handleSavePreferences = async () => {
        try {
            await updatePreferences(preferences);
            toast.success("Preferences saved successfully");
            setIsPreferencesOpen(false);
        } catch (error) {
            toast.error("Failed to save preferences");
        }
    };

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>, field: "targetTitles" | "locations" | "excludedTitles") => {
        if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
            const value = e.currentTarget.value.trim();
            setPreferences(prev => ({
                ...prev,
                [field]: [...(prev[field] || []), value]
            }));
            e.currentTarget.value = "";
        }
    };

    const handleRemoveTag = (index: number, field: "targetTitles" | "locations" | "excludedTitles") => {
        setPreferences(prev => ({
            ...prev,
            [field]: (prev[field] || []).filter((_, i) => i !== index)
        }));
    };

    const toggleEmploymentType = (type: string) => {
        setPreferences(prev => ({
            ...prev,
            employmentTypes: (prev.employmentTypes || []).includes(type)
                ? (prev.employmentTypes || []).filter(t => t !== type)
                : [...(prev.employmentTypes || []), type]
        }));
    };

    const handleRunSearch = async () => {
        setIsSearching(true);
        setHasSearched(false);
        setRecommendations([]);
        
        const stages = [
            "Searching company boards...",
            "Filtering irrelevant roles...",
            "Analyzing your profile...",
            "Ranking opportunities..."
        ];

        for (let i = 0; i < stages.length; i++) {
            setSearchStage(i);
            await new Promise(r => setTimeout(r, 800));
        }

        try {
            const res = await runSearch();
            const resultRecs = res.data?.data?.recommendations || res.data?.data || [];
            if (Array.isArray(resultRecs)) {
                setRecommendations(resultRecs);
            }
            setHasSearched(true);
            toast.success("AI Search completed!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Search failed. Please try again.");
        } finally {
            setIsSearching(false);
            setSearchStage(0);
        }
    };

    const openApplicationKit = (job: Recommendation) => {
        setSelectedJob(job);
        setKitData({
            whyThisRoleFits: job.aiSummary || (job.reasons && job.reasons[0]) || job.whyYouMatch || "High alignment with your technical profile and experience.",
            yourStrengths: job.matchingSkills || [],
            potentialGaps: job.missingSkills || [],
            coverNote: (job as any).coverLetter || "",
            applicationAnswers: (job as any).applicationAnswers || []
        });
        setEditableCoverNote((job as any).coverLetter || "");
        setIsKitModalOpen(true);
    };

    const handleGenerateKit = async () => {
        if (!selectedJob) return;
        setIsGeneratingKit(true);
        try {
            const res = await generateApplicationKit(selectedJob._id);
            const data = res.data?.data || {};
            setKitData({
                whyThisRoleFits: data.aiSummary || data.whyFits || "Strong technical alignment.",
                yourStrengths: data.evidence || data.matchingSkills || [],
                potentialGaps: data.concerns || data.missingSkills || [],
                coverNote: data.coverLetter || data.coverNote || "",
                applicationAnswers: data.applicationAnswers || []
            });
            setEditableCoverNote(data.coverLetter || data.coverNote || "");
            toast.success("Application Kit generated!");
        } catch (error) {
            toast.error("Failed to generate application kit");
        } finally {
            setIsGeneratingKit(false);
        }
    };

    const copyToClipboard = () => {
        if (editableCoverNote) {
            navigator.clipboard.writeText(editableCoverNote);
            toast.success("Copied cover note to clipboard!");
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await updateRecommendationStatus(id, status);
            setRecommendations(prev => 
                prev.map(r => r._id === id ? { ...r, status } : r)
            );
            if (status === 'SAVED') {
                toast.success("Job saved!");
            } else {
                toast.success("Job dismissed");
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "bg-emerald-100 text-emerald-800 border-emerald-200";
        if (score >= 60) return "bg-amber-100 text-amber-800 border-amber-200";
        return "bg-neutral-100 text-neutral-700 border-neutral-200";
    };

    const getLevelBadge = (level?: string) => {
        switch (level) {
            case "HIGH_PRIORITY": return <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">High Priority</span>;
            case "GOOD_MATCH": return <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">Good Match</span>;
            case "MAYBE": return <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">Maybe</span>;
            default: return <span className="px-2.5 py-1 rounded-full bg-neutral-50 border border-[#ECECEC] text-neutral-700 text-xs font-semibold">Match</span>;
        }
    };

    return (
        <div className="mx-auto max-w-6xl p-8 pb-20 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-sm">
                            <Sparkles size={24} className="text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">AI Job Finder</h1>
                            <p className="mt-1 text-neutral-500 font-medium">Find opportunities that actually fit your profile.</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleRunSearch}
                    disabled={isSearching}
                    className="flex items-center justify-center gap-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl px-6 py-3 text-sm font-semibold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    {isSearching ? "Searching..." : "Find Jobs"}
                </button>
            </div>

            {/* Feature Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-[#ECECEC] shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                            <FileText size={20} />
                        </div>
                        <h3 className="font-semibold text-neutral-900 text-sm">Resume-based matching</h3>
                    </div>
                    <p className="text-xs text-neutral-500">Analyzes your uploaded candidate resume and skills directly against live job specs.</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#ECECEC] shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                            <Globe size={20} />
                        </div>
                        <h3 className="font-semibold text-neutral-900 text-sm">Greenhouse / Lever / Ashby</h3>
                    </div>
                    <p className="text-xs text-neutral-500">Scans top tech company boards in real time for open roles.</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#ECECEC] shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                            <Zap size={20} />
                        </div>
                        <h3 className="font-semibold text-neutral-900 text-sm">AI match scoring</h3>
                    </div>
                    <p className="text-xs text-neutral-500">Calculates deterministic + Gemini AI hybrid fit scores [0–100].</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#ECECEC] shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                            <Star size={20} />
                        </div>
                        <h3 className="font-semibold text-neutral-900 text-sm">Personalized recommendations</h3>
                    </div>
                    <p className="text-xs text-neutral-500">Auto-generates custom application cover notes and interview answers.</p>
                </div>
            </div>

            {/* Preferences Collapsible Card */}
            <div className="mb-8 bg-white rounded-2xl border border-[#ECECEC] shadow-2xs overflow-hidden">
                <button 
                    onClick={() => setIsPreferencesOpen(!isPreferencesOpen)}
                    className="w-full flex items-center justify-between p-6 hover:bg-neutral-50/50 transition cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <Filter size={20} className="text-neutral-500" />
                        <h2 className="text-base font-semibold text-neutral-900">Job Preferences & Filters</h2>
                    </div>
                    <ChevronRight size={20} className={`text-neutral-400 transition-transform ${isPreferencesOpen ? 'rotate-90' : ''}`} />
                </button>
                
                <AnimatePresence>
                    {isPreferencesOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-[#ECECEC]"
                        >
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Target Titles */}
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-900 mb-2">Target Roles</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {(preferences.targetTitles || []).map((role, idx) => (
                                            <span key={idx} className="flex items-center gap-1 bg-neutral-100 text-neutral-700 px-3 py-1 rounded-lg text-xs font-medium">
                                                {role}
                                                <X size={14} className="cursor-pointer hover:text-rose-500" onClick={() => handleRemoveTag(idx, 'targetTitles')} />
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Add role & press Enter..."
                                        onKeyDown={(e) => handleAddTag(e, 'targetTitles')}
                                        className="w-full px-4 py-2.5 rounded-xl border border-[#ECECEC] text-xs focus:outline-none focus:border-neutral-400 bg-neutral-50 focus:bg-white transition"
                                    />
                                </div>

                                {/* Locations */}
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-900 mb-2">Locations</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {(preferences.locations || []).map((loc, idx) => (
                                            <span key={idx} className="flex items-center gap-1 bg-neutral-100 text-neutral-700 px-3 py-1 rounded-lg text-xs font-medium">
                                                {loc}
                                                <X size={14} className="cursor-pointer hover:text-rose-500" onClick={() => handleRemoveTag(idx, 'locations')} />
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Add location & press Enter..."
                                        onKeyDown={(e) => handleAddTag(e, 'locations')}
                                        className="w-full px-4 py-2.5 rounded-xl border border-[#ECECEC] text-xs focus:outline-none focus:border-neutral-400 bg-neutral-50 focus:bg-white transition"
                                    />
                                </div>

                                {/* Experience & Remote */}
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-neutral-900 mb-2">Experience Range (Years)</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="number"
                                                value={preferences.experienceMin ?? 0}
                                                onChange={(e) => setPreferences(p => ({ ...p, experienceMin: parseInt(e.target.value) || 0 }))}
                                                className="w-24 px-4 py-2.5 rounded-xl border border-[#ECECEC] text-xs focus:outline-none focus:border-neutral-400 bg-neutral-50"
                                                min="0"
                                            />
                                            <span className="text-neutral-400 text-xs">to</span>
                                            <input
                                                type="number"
                                                value={preferences.experienceMax ?? 5}
                                                onChange={(e) => setPreferences(p => ({ ...p, experienceMax: parseInt(e.target.value) || 0 }))}
                                                className="w-24 px-4 py-2.5 rounded-xl border border-[#ECECEC] text-xs focus:outline-none focus:border-neutral-400 bg-neutral-50"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={preferences.allowRemote ?? true}
                                            onChange={(e) => setPreferences(p => ({ ...p, allowRemote: e.target.checked }))}
                                            className="w-4 h-4 rounded border-[#ECECEC] text-neutral-900 focus:ring-neutral-900"
                                        />
                                        <span className="text-xs font-semibold text-neutral-900">Open to Remote work</span>
                                    </label>
                                </div>

                                {/* Employment Types & Excluded */}
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-neutral-900 mb-2">Employment Types</label>
                                        <div className="flex flex-wrap gap-2">
                                            {["Full-Time", "Part-Time", "Internship", "Contract"].map(type => (
                                                <label key={type} className="flex items-center gap-2 bg-neutral-50 px-3 py-2 rounded-lg border border-[#ECECEC] cursor-pointer hover:bg-neutral-100 transition">
                                                    <input
                                                        type="checkbox"
                                                        checked={(preferences.employmentTypes || []).includes(type)}
                                                        onChange={() => toggleEmploymentType(type)}
                                                        className="w-3.5 h-3.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                                    />
                                                    <span className="text-xs font-medium text-neutral-700">{type}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-neutral-900 mb-2">Excluded Titles</label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {(preferences.excludedTitles || []).map((title, idx) => (
                                                <span key={idx} className="flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1 rounded-lg text-xs font-medium">
                                                    {title}
                                                    <X size={14} className="cursor-pointer hover:text-rose-900" onClick={() => handleRemoveTag(idx, 'excludedTitles')} />
                                                </span>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Exclude role & press Enter..."
                                            onKeyDown={(e) => handleAddTag(e, 'excludedTitles')}
                                            className="w-full px-4 py-2.5 rounded-xl border border-[#ECECEC] text-xs focus:outline-none focus:border-neutral-400 bg-neutral-50 focus:bg-white transition"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-[#ECECEC] bg-neutral-50/50 flex justify-end">
                                <button
                                    onClick={handleSavePreferences}
                                    className="bg-neutral-900 text-white rounded-xl px-5 py-2 text-xs font-semibold shadow-2xs hover:bg-neutral-800 transition cursor-pointer"
                                >
                                    Save Preferences
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Search Progress */}
            {isSearching && (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-[#ECECEC] shadow-2xs mb-8">
                    <div className="relative flex items-center justify-center w-20 h-20 mb-6">
                        <div className="absolute inset-0 border-4 border-neutral-100 rounded-full"></div>
                        <motion.div
                            className="absolute inset-0 border-4 border-neutral-900 rounded-full border-t-transparent"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                        ></motion.div>
                        <Sparkles size={28} className="text-neutral-900" />
                    </div>
                    <div className="space-y-3 w-full max-w-sm">
                        {[
                            "Searching company boards...",
                            "Filtering irrelevant roles...",
                            "Analyzing your profile...",
                            "Ranking opportunities..."
                        ].map((stage, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${searchStage > idx ? 'bg-emerald-100 text-emerald-600' : searchStage === idx ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                                    {searchStage > idx ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                </div>
                                <span className={`text-xs font-medium ${searchStage >= idx ? 'text-neutral-900' : 'text-neutral-400'}`}>
                                    {stage}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations List */}
            {hasSearched && !isSearching && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Recommended Opportunities ({recommendations.length})</h2>
                        <button onClick={handleRunSearch} className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 font-medium cursor-pointer">
                            <RefreshCw size={14} /> Refresh Search
                        </button>
                    </div>

                    {recommendations.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-[#ECECEC] p-12 text-center">
                            <Briefcase size={36} className="mx-auto text-neutral-400 mb-3" />
                            <h3 className="text-base font-bold text-neutral-900">No matching jobs found</h3>
                            <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">Try broadening your target roles or experience range in Search Preferences above.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {recommendations.map((rec) => {
                                const title = rec.externalJob?.title || rec.jobTitle || "Software Engineer";
                                const company = rec.externalJob?.company || rec.companyName || "Tech Company";
                                const location = rec.externalJob?.location || rec.location || "Remote";
                                const isRemote = rec.externalJob?.remote ?? rec.remote ?? false;
                                const applyUrl = rec.externalJob?.applicationUrl || rec.applicationUrl || "#";
                                const score = Math.round(rec.matchScore || 0);

                                return (
                                    <motion.div
                                        key={rec._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-2xl border border-[#ECECEC] p-6 shadow-2xs hover:border-neutral-300 transition"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#ECECEC]">
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 text-white font-bold text-base shrink-0">
                                                    {company.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <h3 className="text-base font-bold text-neutral-900">{title}</h3>
                                                        {getLevelBadge(rec.recommendation || rec.recommendationLevel)}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1 flex-wrap">
                                                        <span className="flex items-center gap-1 font-medium text-neutral-700">
                                                            <Building2 size={14} /> {company}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin size={14} /> {location}
                                                        </span>
                                                        {isRemote && (
                                                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold">Remote</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Score pill */}
                                            <div className="flex items-center gap-3">
                                                <div className={`flex flex-col items-center px-3 py-1.5 rounded-xl border ${getScoreColor(score)}`}>
                                                    <span className="text-base font-black leading-none">{score}%</span>
                                                    <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5">Match</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reasons / Why fits */}
                                        <p className="text-xs text-neutral-600 my-4 leading-relaxed">
                                            {rec.aiSummary || (rec.reasons && rec.reasons[0]) || rec.whyYouMatch || "Matched based on your candidate skills and experience."}
                                        </p>

                                        {/* Skills tags */}
                                        <div className="flex flex-wrap gap-1.5 mb-5">
                                            {(rec.matchingSkills || []).map((skill, i) => (
                                                <span key={i} className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-medium">
                                                    ✓ {skill}
                                                </span>
                                            ))}
                                            {(rec.missingSkills || []).map((skill, i) => (
                                                <span key={i} className="px-2.5 py-1 rounded-md bg-rose-50 border border-rose-100 text-rose-700 text-[11px] font-medium">
                                                    missing: {skill}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between gap-3 pt-2">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openApplicationKit(rec)}
                                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition cursor-pointer"
                                                >
                                                    <Sparkles size={14} className="text-blue-600" /> Application Kit
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(rec._id, rec.status === 'SAVED' ? 'NEW' : 'SAVED')}
                                                    className={`p-2 rounded-xl border text-xs font-medium transition cursor-pointer ${rec.status === 'SAVED' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'border-[#ECECEC] text-neutral-600 hover:bg-neutral-50'}`}
                                                >
                                                    <BookmarkPlus size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(rec._id, 'DISMISSED')}
                                                    className="p-2 rounded-xl border border-[#ECECEC] text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>

                                            <a
                                                href={applyUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-2xs"
                                            >
                                                Apply Job <ExternalLink size={14} />
                                            </a>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Default Landing / Zero Search State */}
            {!hasSearched && !isSearching && (
                <div className="bg-white rounded-2xl border border-[#ECECEC] p-12 text-center shadow-2xs">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 text-white mx-auto mb-4 shadow-sm">
                        <Sparkles size={32} className="text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">AI Job Finder</h2>
                    <p className="mt-2 text-sm text-neutral-500 max-w-md mx-auto font-medium">
                        Find opportunities that actually fit your profile.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={handleRunSearch}
                            className="flex items-center gap-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl px-8 py-3.5 text-sm font-semibold transition shadow-sm cursor-pointer"
                        >
                            <Search size={18} /> Find Jobs
                        </button>
                    </div>
                </div>
            )}

            {/* Application Kit Modal */}
            <AnimatePresence>
                {isKitModalOpen && selectedJob && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsKitModalOpen(false)}
                            className="fixed inset-0 bg-black z-40"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white z-50 p-6 overflow-y-auto shadow-2xl flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between pb-4 border-b border-[#ECECEC]">
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={18} className="text-blue-600" />
                                        <h2 className="font-bold text-neutral-900 text-lg">Application Kit</h2>
                                    </div>
                                    <button onClick={() => setIsKitModalOpen(false)} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 cursor-pointer">
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="mt-6 space-y-6">
                                    <div>
                                        <h3 className="text-xs font-semibold uppercase text-neutral-400 tracking-wider">Role Summary</h3>
                                        <p className="text-base font-bold text-neutral-900 mt-1">
                                            {selectedJob.externalJob?.title || selectedJob.jobTitle} @ {selectedJob.externalJob?.company || selectedJob.companyName}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-semibold text-neutral-900 mb-2">Why This Role Fits</h3>
                                        <p className="text-xs text-neutral-600 bg-neutral-50 p-4 rounded-xl border border-[#ECECEC] leading-relaxed">
                                            {kitData?.whyThisRoleFits || "High match based on candidate profile analysis."}
                                        </p>
                                    </div>

                                    {kitData?.yourStrengths && kitData.yourStrengths.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-semibold text-neutral-900 mb-2">Key Strengths to Emphasize</h3>
                                            <ul className="space-y-1.5 text-xs text-neutral-700">
                                                {kitData.yourStrengths.map((st, i) => (
                                                    <li key={i} className="flex items-center gap-2">
                                                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                                                        <span>{st}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Cover Note */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xs font-semibold text-neutral-900">Tailored Cover Note</h3>
                                            <button onClick={copyToClipboard} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                                                <Copy size={12} /> Copy Note
                                            </button>
                                        </div>
                                        <textarea
                                            value={editableCoverNote}
                                            onChange={(e) => setEditableCoverNote(e.target.value)}
                                            rows={6}
                                            className="w-full p-3 rounded-xl border border-[#ECECEC] text-xs font-mono bg-neutral-50 focus:bg-white focus:outline-none focus:border-neutral-400 transition"
                                            placeholder="Generating custom cover note..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-[#ECECEC] flex items-center justify-between gap-3">
                                <button
                                    onClick={handleGenerateKit}
                                    disabled={isGeneratingKit}
                                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#ECECEC] text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer disabled:opacity-50"
                                >
                                    {isGeneratingKit ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                    Regenerate Kit
                                </button>

                                <a
                                    href={selectedJob.externalJob?.applicationUrl || selectedJob.applicationUrl || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl px-5 py-2.5 text-xs font-semibold shadow-2xs transition"
                                >
                                    Open Application <ArrowRight size={14} />
                                </a>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIJobFinder;
