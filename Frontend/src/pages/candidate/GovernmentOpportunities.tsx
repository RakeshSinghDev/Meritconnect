import { useEffect, useState } from "react";
import { Landmark, Search, Clock, Calendar, FileText, Briefcase, ExternalLink, RefreshCw, MapPin, Users, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { 
    getGovernmentOpportunities, 
    getLatestGovernmentOpportunities, 
    getClosingSoonGovernmentOpportunities,
    getRecommendedGovernmentOpportunities,
    syncGovernmentOpportunities 
} from "../../services/governmentOpportunity.service";
import type { GovernmentOpportunity } from "../../services/governmentOpportunity.service";

const GovernmentOpportunities = () => {
    const [opportunities, setOpportunities] = useState<GovernmentOpportunity[]>([]);
    const [latest, setLatest] = useState<GovernmentOpportunity[]>([]);
    const [closingSoon, setClosingSoon] = useState<GovernmentOpportunity[]>([]);
    const [recommended, setRecommended] = useState<GovernmentOpportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState("");
    
    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "latest" | "closing" | "recommended">("all");

    const loadData = async () => {
        try {
            setLoading(true);
            const [resAll, resLatest, resClosing, resRec] = await Promise.all([
                getGovernmentOpportunities(1, 50, searchQuery),
                getLatestGovernmentOpportunities(),
                getClosingSoonGovernmentOpportunities(),
                getRecommendedGovernmentOpportunities().catch(() => ({ data: [] }))
            ]);
            setOpportunities(resAll.data?.jobs || []);
            setLatest(resLatest.data || []);
            setClosingSoon(resClosing.data || []);
            setRecommended(resRec.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load government opportunities.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadData();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSync = async () => {
        try {
            setSyncing(true);
            await syncGovernmentOpportunities();
            await loadData();
        } catch (err) {
            console.error(err);
            alert("Failed to sync data from official sources");
        } finally {
            setSyncing(false);
        }
    };

    const displayList = activeTab === "all" ? opportunities : 
                        activeTab === "latest" ? latest : 
                        activeTab === "recommended" ? recommended :
                        closingSoon;

    if (loading && opportunities.length === 0) {
        return (
            <div className="p-12 text-center text-xs font-medium text-neutral-400 animate-pulse bg-white border border-[#ECECEC] rounded-2xl max-w-7xl mx-auto">
                Loading opportunities...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl max-w-7xl mx-auto">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto font-sans antialiased text-neutral-900 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#ECECEC]">
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-blue-600 mb-2">
                        <Landmark className="h-4 w-4" />
                        <span className="uppercase tracking-wider">Government Careers</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">
                        Never miss the next opportunity
                    </h1>
                    <p className="mt-2 text-sm text-neutral-500 max-w-xl leading-relaxed">
                        Track newly released government exams, recruitments, and application deadlines in one place. We verify official notifications so you can apply with confidence.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search exams, ministries, roles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full transition shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={handleSync}
                        disabled={syncing}
                        className={`p-2.5 bg-neutral-100 text-neutral-600 rounded-xl hover:bg-neutral-200 transition shrink-0 tooltip ${syncing ? 'animate-spin' : ''}`} 
                        title="Sync from official sources"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button 
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === "all" ? "bg-neutral-900 text-white" : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"}`}
                >
                    All Opportunities
                </button>
                <button 
                    onClick={() => setActiveTab("latest")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === "latest" ? "bg-neutral-900 text-white" : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"}`}
                >
                    Latest Releases
                </button>
                <button 
                    onClick={() => setActiveTab("closing")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === "closing" ? "bg-neutral-900 text-white" : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"}`}
                >
                    Closing Soon
                </button>
                <button 
                    onClick={() => setActiveTab("recommended")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === "recommended" ? "bg-neutral-900 text-white" : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"}`}
                >
                    Recommended For You
                </button>
            </div>

            {/* List or Empty */}
            {displayList.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50/50 p-16 text-center space-y-3">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-neutral-100 mb-4">
                        <Landmark className="h-8 w-8 text-neutral-400" />
                    </div>
                    <h2 className="text-base font-semibold text-neutral-900">No Government Opportunities Found</h2>
                    <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                        We currently only show verified official sources. Click the sync icon to fetch the latest official data.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {displayList.map((opp) => (
                        <div
                            key={opp._id}
                            className="group rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            {/* Card Header */}
                            <div className="p-6 border-b border-neutral-100 bg-neutral-50/50 flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                            {opp.organization} • {opp.source} Official
                                        </span>
                                        {opp.status === "APPLICATION_OPEN" && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                                                Active
                                            </span>
                                        )}
                                        {opp.status === "UPCOMING" && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wide">
                                                Upcoming
                                            </span>
                                        )}
                                        {opp.status === "CLOSING_SOON" && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 uppercase tracking-wide">
                                                Closing Soon
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold tracking-tight text-neutral-900 group-hover:text-blue-600 transition-colors">
                                        {opp.title}
                                    </h2>
                                    {opp.postName && (
                                        <p className="text-sm font-medium text-neutral-600 flex items-center gap-1.5">
                                            <Briefcase className="h-4 w-4 text-neutral-400" />
                                            {opp.postName}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                                    {opp.applicationLastDate && (
                                        <div className="bg-white border border-neutral-200 rounded-lg px-4 py-2 flex items-center gap-2 shadow-sm">
                                            <Clock className="h-4 w-4 text-rose-500" />
                                            <div>
                                                <p className="text-[10px] font-medium text-neutral-400 uppercase">Closes On</p>
                                                <p className="text-sm font-semibold text-neutral-900">{new Date(opp.applicationLastDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6">
                                {opp.description && (
                                    <p className="text-sm text-neutral-600 leading-relaxed mb-6 line-clamp-2">
                                        {opp.description}
                                    </p>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {opp.qualification && (
                                        <div>
                                            <p className="text-[11px] font-medium text-neutral-500 mb-1 flex items-center gap-1"><FileText className="h-3 w-3" /> Eligibility</p>
                                            <p className="text-sm font-medium text-neutral-900">{opp.qualification}</p>
                                        </div>
                                    )}
                                    {opp.vacancies && (
                                        <div>
                                            <p className="text-[11px] font-medium text-neutral-500 mb-1 flex items-center gap-1"><Users className="h-3 w-3" /> Vacancies</p>
                                            <p className="text-sm font-medium text-neutral-900">{opp.vacancies.toLocaleString()} Posts</p>
                                        </div>
                                    )}
                                    {opp.state && (
                                        <div>
                                            <p className="text-[11px] font-medium text-neutral-500 mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> State</p>
                                            <p className="text-sm font-medium text-neutral-900">{opp.state}</p>
                                        </div>
                                    )}
                                    {opp.examDate && (
                                        <div>
                                            <p className="text-[11px] font-medium text-neutral-500 mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> Exam Date</p>
                                            <p className="text-sm font-medium text-neutral-900">{new Date(opp.examDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p>
                                        </div>
                                    )}
                                </div>
                                
                                {opp.eligibilityLabel ? (
                                    <div className={`flex items-center gap-2 p-3 border rounded-lg mb-6 ${opp.isMatch ? 'bg-emerald-50/50 border-emerald-100' : 'bg-neutral-50 border-neutral-200'}`}>
                                        {opp.isMatch ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> : <AlertCircle className="h-4 w-4 text-neutral-500 shrink-0" />}
                                        <div className="text-xs">
                                            <p className={`font-semibold ${opp.isMatch ? 'text-emerald-800' : 'text-neutral-700'}`}>
                                                {opp.eligibilityLabel} {opp.matchPercentage ? `(${opp.matchPercentage}% match)` : ''}
                                            </p>
                                            {opp.reasons && opp.reasons.length > 0 && (
                                                <p className="text-neutral-500 mt-0.5">{opp.reasons.join(" • ")}</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 p-3 bg-blue-50/50 border border-blue-100 rounded-lg mb-6">
                                        <Info className="h-4 w-4 text-blue-500 shrink-0" />
                                        <p className="text-xs text-blue-800">
                                            <span className="font-semibold">Important:</span> Check the official notification to verify your exact age and educational eligibility for this post.
                                        </p>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-neutral-100">
                                    {opp.applicationUrl && (
                                        <a
                                            href={opp.applicationUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-neutral-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-800 transition shadow-sm"
                                        >
                                            Apply Officially <ExternalLink className="h-4 w-4" />
                                        </a>
                                    )}
                                    {opp.notificationUrl && (
                                        <a
                                            href={opp.notificationUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-neutral-700 border border-neutral-200 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-50 transition"
                                        >
                                            <FileText className="h-4 w-4" /> View Notification
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GovernmentOpportunities;
