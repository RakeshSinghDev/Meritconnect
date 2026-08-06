import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, Brain, Sparkles, ArrowUpRight, Calendar } from "lucide-react";
import { getRecruiterDashboard } from "../../services/recruiter.service";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";

export default function Analytics() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        getRecruiterDashboard()
            .then((res) => setData(res))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    const chartData = [
        { stage: "Applied", count: data?.applied || 18 },
        { stage: "Screened", count: data?.reviewed || 12 },
        { stage: "Shortlisted", count: data?.shortlisted || 6 },
        { stage: "AI Interview", count: data?.interview || 4 },
        { stage: "Hired", count: data?.hired || 3 },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto font-sans antialiased text-neutral-900">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ECECEC]">
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1">
                        <BarChart3 className="h-3.5 w-3.5 text-neutral-400" />
                        <span>Executive Talent Intelligence</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
                        Hiring Analytics
                    </h1>
                    <p className="mt-0.5 text-xs text-neutral-500">
                        Conversion funnels, ATS matching efficiency, and AI interview completion velocity.
                    </p>
                </div>
            </div>

            {/* KPI Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-5 rounded-2xl bg-white border border-[#ECECEC] shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-1">
                    <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Funnel Conversion</p>
                    <p className="text-2xl font-semibold tracking-tight text-neutral-900">16.6%</p>
                    <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
                        <ArrowUpRight className="h-3 w-3" /> +2.4% vs last month
                    </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#ECECEC] shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-1">
                    <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Avg Time-To-Hire</p>
                    <p className="text-2xl font-semibold tracking-tight text-neutral-900">8.4 Days</p>
                    <p className="text-[11px] text-neutral-400">Industry benchmark: 14 days</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#ECECEC] shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-1">
                    <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">ATS Match Index</p>
                    <p className="text-2xl font-semibold tracking-tight text-neutral-900">{data?.averageATSScore || 84}%</p>
                    <p className="text-[11px] text-neutral-400">Semantic resume accuracy</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#ECECEC] shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-1">
                    <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">AI Evaluation Rate</p>
                    <p className="text-2xl font-semibold tracking-tight text-neutral-900">94.2%</p>
                    <p className="text-[11px] text-neutral-400">Interview completion yield</p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white border border-[#ECECEC] shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900">Recruitment Conversion Funnel</h3>
                        <p className="text-xs text-neutral-500">Volume distribution across recruitment stages</p>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="stage" stroke="#94a3b8" fontSize={11} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#ECECEC", borderRadius: "12px", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                                />
                                <Bar dataKey="count" fill="#171717" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-[#ECECEC] shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900">Candidate Velocity Trend</h3>
                        <p className="text-xs text-neutral-500">Stage progression speed and candidate throughput</p>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="stage" stroke="#94a3b8" fontSize={11} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#ECECEC", borderRadius: "12px", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                                />
                                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={{ fill: "#2563eb", r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}