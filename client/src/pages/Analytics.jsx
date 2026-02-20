import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import {
    PieChart as PieIcon,
    TrendingUp,
    Globe,
    ShieldCheck,
    ArrowUpRight,
    ArrowDownRight,
    Activity
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const Analytics = () => {
    const { API_BASE } = useAuth();
    const [spendingData, setSpendingData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [distributionData, setDistributionData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const PRESTIGE_COLORS = ['#C8AA6E', '#001B3A', '#4B5563', '#2A3447'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [spendingRes, trendRes, distRes] = await Promise.all([
                    axios.get(`${API_BASE}/api/analytics/spending`),
                    axios.get(`${API_BASE}/api/analytics/trend`),
                    axios.get(`${API_BASE}/api/analytics/distribution`)
                ]);
                setSpendingData(spendingRes.data);
                setTrendData(trendRes.data);
                setDistributionData(distRes.data);
            } catch (err) {
                console.error('Failed to fetch analytics data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [API_BASE]);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#C8AA6E] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#000B1E] border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-md">
                    <p className="text-[10px] font-bold text-[#C8AA6E] uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-sm font-bold text-white">
                        ${parseFloat(payload[0].value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#C8AA6E]"></span>
                    <h1 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                        Institutional Intelligence
                    </h1>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-4xl font-bold text-[#000B1E] tracking-tight font-['Playfair_Display']">
                            Wealth Analytics
                        </h2>
                        <p className="text-slate-400 mt-1 font-bold text-[10px] uppercase tracking-widest">
                            Real-time global asset monitoring & insights
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-50 px-4 py-2 rounded-full flex items-center gap-2 border border-emerald-100">
                            <TrendingUp size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">+12.4% MoM</span>
                        </div>
                        <div className="bg-slate-50 px-4 py-2 rounded-full flex items-center gap-2 border border-slate-100">
                            < Globe size={14} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Portfolio</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Insights Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
                {/* Wealth Evolution Chart */}
                <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-sm font-bold text-[#000B1E] uppercase tracking-widest flex items-center gap-2">
                                <Activity size={16} className="text-[#C8AA6E]" />
                                Wealth Evolution
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional Liquidity Index</p>
                        </div>
                        <div className="flex gap-2">
                            {['1M', '6M', '1Y', 'ALL'].map(t => (
                                <button key={t} className={clsx(
                                    "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                    t === '6M' ? "bg-[#000B1E] text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                                )}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#C8AA6E" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#C8AA6E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#C8AA6E"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Spending Breakdown */}
                <div className="bg-[#000B1E] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-900/40 relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8AA6E]/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#C8AA6E]/10 transition-all duration-1000"></div>

                    <div className="relative z-10 flex flex-col h-full">
                        <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-8">
                            <PieIcon size={16} className="text-[#C8AA6E]" />
                            Allocation breakdown
                        </h3>

                        <div className="h-[200px] w-full mb-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={spendingData.length > 0 ? spendingData : [{ category: 'Equities', total: 1 }]}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="total"
                                    >
                                        {spendingData.length > 0 ? spendingData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PRESTIGE_COLORS[index % PRESTIGE_COLORS.length]} stroke="rgba(255,255,255,0.05)" />
                                        )) : <Cell fill="#1e293b" />}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto">
                            {spendingData.length > 0 ? spendingData.map((item, index) => (
                                <div key={item.category} className="flex items-center justify-between group/item">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PRESTIGE_COLORS[index % PRESTIGE_COLORS.length] }}></div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover/item:text-white transition-colors">{item.category}</span>
                                    </div>
                                    <span className="text-xs font-bold font-mono tracking-tighter">${parseFloat(item.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )) : (
                                <div className="text-center py-10">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No allocations recorded</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Assets & Insights */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Global Asset Distribution */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm group">
                    <h3 className="text-sm font-bold text-[#000B1E] uppercase tracking-widest mb-10 flex items-center gap-2">
                        <Globe size={16} className="text-[#C8AA6E]" />
                        Asset Distribution
                    </h3>

                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distributionData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 700, fill: '#4B5563' }}
                                    width={140}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                <Bar
                                    dataKey="value"
                                    radius={[0, 10, 10, 0]}
                                    barSize={30}
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PRESTIGE_COLORS[index % PRESTIGE_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Institutional Security Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#C8AA6E]/5 rounded-[2rem] p-8 border border-[#C8AA6E]/20 flex flex-col justify-between group hover:bg-[#C8AA6E]/10 transition-all">
                        <ShieldCheck className="text-[#C8AA6E] mb-6" size={32} />
                        <div>
                            <h4 className="font-bold text-[#000B1E] mb-2 uppercase text-[10px] tracking-widest">Vault Security</h4>
                            <p className="text-slate-500 text-[10px] leading-relaxed">Your assets are protected by **AES-512 Institutional Protocols**. Multi-signature state verification active.</p>
                        </div>
                    </div>

                    <div className="bg-[#000B1E] rounded-[2rem] p-8 border border-white/5 flex flex-col justify-between group hover:bg-[#001B3A] transition-all text-white">
                        <div className="flex justify-between items-start mb-6">
                            <TrendingUp className="text-[#C8AA6E]" size={32} />
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-emerald-400">+5.2k</p>
                                <p className="text-[8px] font-bold text-slate-500 uppercase">Yield Port.</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-2 uppercase text-[10px] tracking-widest">Dynamic Portfolios</h4>
                            <p className="text-slate-400 text-[10px] leading-relaxed">Liquid assets currently diversified across 14 institutional settlement nodes for maximum yield.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
