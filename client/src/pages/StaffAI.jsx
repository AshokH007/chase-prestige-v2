import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    Sparkles,
    Send,
    Bot,
    User,
    BarChart3,
    ShieldAlert,
    Globe2,
    ChevronRight,
    Loader2,
    Zap,
    Cpu,
    Database,
    Fingerprint
} from 'lucide-react';
import { clsx } from 'clsx';

const StaffAI = () => {
    const { API_BASE, user } = useAuth();
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            content: `Awaiting instructions, Officer ${user?.fullName.split(' ')[0] || 'Administrator'}. The Institutional Oracle is synchronized with the global ledger. I am prepared to analyze liquidity exposure, compliance anomalies, or customer portfolio health.`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [processingStep, setProcessingStep] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, processingStep]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);
        setIsLoading(true);
        setProcessingStep('Kernel Initialization...');

        try {
            // Simulated high-tech processing steps
            setTimeout(() => setProcessingStep('Querying Asset Silos...'), 800);
            setTimeout(() => setProcessingStep('Verifying Institutional KYC...'), 1600);
            setTimeout(() => setProcessingStep('Cross-Referencing Compliance...'), 2400);

            const res = await axios.post(`${API_BASE}/api/ai/chat`, { message: userMsg });

            setTimeout(() => {
                setProcessingStep(null);
                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: res.data.response,
                    isSimulated: res.data.isSimulated,
                    model: res.data.model,
                    timestamp: new Date()
                }]);
                setIsLoading(false);
            }, 3000);
        } catch (err) {
            setProcessingStep(null);
            setMessages(prev => [...prev, {
                role: 'bot',
                content: "Institutional relay failure. The analytical core is temporarily offline for kernel synchronization.",
                timestamp: new Date()
            }]);
            setIsLoading(false);
        }
    };

    const suggestions = [
        { label: "Summarize total treasury liquidity", icon: BarChart3 },
        { label: "Identify high-risk compliance flags", icon: ShieldAlert },
        { label: "Analytic report on asset distribution", icon: Globe2 }
    ];

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col p-6 lg:p-10 animate-in fade-in duration-1000">
            {/* STAFF ORACLE HEADER */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="absolute -inset-2 bg-[#C8AA6E]/20 rounded-full blur-xl animate-pulse"></div>
                        <div className="relative p-4 bg-[#C8AA6E] rounded-2xl shadow-2xl shadow-amber-900/40 border border-white/20">
                            <Zap className="text-white fill-white" size={28} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-4xl font-bold text-[#000B1E] tracking-tight font-['Playfair_Display']">Institutional <span className="text-[#C8AA6E]">Oracle</span></h2>
                        <div className="flex items-center gap-3 lg:gap-6 mt-1">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#C8AA6E] animate-[ping_2s_linear_infinite]"></span>
                                <span className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-400">Sovereign Intel Active</span>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                                <Fingerprint size={12} className="text-slate-400" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Officer: 004-CP</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Compute Load</p>
                        <div className="flex items-center gap-3">
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[12%]"></div>
                            </div>
                            <span className="text-[11px] font-mono font-bold text-slate-700 uppercase leading-none">L-04</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
                {/* 1. COMMAND INTERFACE */}
                <div className="flex-1 flex flex-col bg-[#000B1E] rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,11,30,0.5)] border border-white/5 overflow-hidden relative">

                    {/* Dark Mode Decor */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C8AA6E]/5 rounded-full blur-[150px] -mr-[300px] -mt-[300px] pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none"></div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-8 lg:p-14 space-y-12 custom-scrollbar relative z-10">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={clsx("flex gap-8 group animate-in slide-in-from-bottom-6 duration-700", msg.role === 'user' ? 'flex-row-reverse' : '')}>
                                <div className={clsx(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl border transition-all duration-500 group-hover:rotate-12",
                                    msg.role === 'bot'
                                        ? "bg-gradient-to-br from-[#C8AA6E] to-[#B6965E] text-white border-white/20"
                                        : "bg-white/5 text-slate-400 border-white/10"
                                )}>
                                    {msg.role === 'bot' ? <Cpu size={28} /> : <User size={28} />}
                                </div>
                                <div className={clsx(
                                    "max-w-[80%] lg:max-w-[70%] p-10 rounded-[2.5rem] text-sm leading-[1.8] shadow-2xl relative",
                                    msg.role === 'bot'
                                        ? "bg-white/[0.03] text-slate-200 border border-white/10 rounded-tl-none backdrop-blur-3xl font-medium"
                                        : "bg-[#C8AA6E] text-white rounded-tr-none font-bold"
                                )}>
                                    {msg.content}

                                    {msg.isSimulated && (
                                        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8AA6E]">Kernel Simulation Mode</span>
                                            <span className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">Loom Protocol V2.4</span>
                                        </div>
                                    )}

                                    <div className={clsx(
                                        "text-[10px] mt-6 flex items-center gap-4 font-black uppercase tracking-[0.3em] opacity-30",
                                        msg.role === 'bot' ? "text-slate-400" : "text-white"
                                    )}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {msg.model && <span>• {msg.model.split('/').pop()}</span>}
                                        <span>• {msg.role === 'bot' ? 'SECURED STREAM' : 'SYSTEM CMD'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* HIGH-TECH PROCESSING STATE */}
                        {processingStep && (
                            <div className="flex gap-8 animate-pulse">
                                <div className="w-14 h-14 rounded-2xl bg-[#C8AA6E] flex items-center justify-center shrink-0 shadow-2xl shadow-amber-900/40">
                                    <Loader2 size={28} className="text-white animate-spin-slow" />
                                </div>
                                <div className="px-10 py-8 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl flex items-center gap-6">
                                    <div className="flex gap-1.5">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-1.5 h-1.5 bg-[#C8AA6E] rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }}></div>
                                        ))}
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#C8AA6E]">{processingStep}</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* INPUT TERMINAL */}
                    <div className="p-10 bg-black/40 border-t border-white/10 backdrop-blur-3xl">
                        <form onSubmit={handleSend} className="relative group max-w-5xl mx-auto">
                            <div className="absolute -inset-1 bg-[#C8AA6E]/20 rounded-[2.5rem] blur opacity-0 group-within:opacity-100 transition-opacity duration-700"></div>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="ISSUE AN INSTITUTIONAL COMMAND..."
                                className="w-full bg-white/5 text-white pl-10 pr-24 py-8 rounded-[2.5rem] shadow-3xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#C8AA6E] transition-all font-mono text-xs tracking-widest placeholder:text-slate-700 uppercase font-black"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-[#C8AA6E] text-white rounded-2xl flex items-center justify-center hover:bg-[#D4B982] transition-all active:scale-90 disabled:opacity-30 shadow-2xl shadow-amber-900/40"
                            >
                                <Send size={28} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* 2. INSTITUTIONAL STATUS PANEL */}
                <div className="w-full lg:w-[420px] space-y-8 contents-scrollbar">
                    <div className="p-10 rounded-[3.5rem] bg-gradient-to-br from-[#C8AA6E] to-[#B6965E] text-white shadow-3xl border border-white/20 relative overflow-hidden">
                        <Database className="absolute bottom-[-20px] right-[-20px] text-white/10 w-48 h-48 -rotate-12" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/70 mb-8">Access Level</h3>
                        <p className="text-4xl font-bold font-['Playfair_Display'] mb-4 font-black">SOVEREIGN V</p>
                        <p className="text-[11px] text-white/80 leading-relaxed font-bold uppercase tracking-widest">
                            Authorized to analyze all client data silos and institutional liquidity pools.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-6">Operational Protocols</p>
                        {suggestions.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => setInput(item.label)}
                                className="w-full p-8 bg-white hover:bg-slate-50 border border-slate-100 rounded-[2.5rem] flex items-center gap-6 text-left transition-all group shadow-sm hover:shadow-2xl hover:-translate-y-1"
                            >
                                <div className="p-4 bg-slate-50 rounded-2xl text-[#000B1E] group-hover:bg-[#000B1E] group-hover:text-white transition-all shadow-inner">
                                    <item.icon size={22} />
                                </div>
                                <span className="text-[11px] font-black text-[#000B1E] uppercase tracking-[0.2em] flex-1">{item.label}</span>
                                <ChevronRight size={20} className="text-slate-300 group-hover:text-[#C8AA6E] group-hover:translate-x-2 transition-all" />
                            </button>
                        ))}
                    </div>

                    {/* CORE HEALTH MOD */}
                    <div className="p-10 rounded-[3.5rem] bg-slate-50 border border-slate-200 shadow-inner relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-8">
                            <Sparkles className="text-[#C8AA6E]" size={28} />
                            <p className="text-[11px] font-black text-slate-800 uppercase tracking-[0.3em]">Synapse Integrity</p>
                        </div>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center text-[10px] font-black">
                                <span className="text-slate-400 uppercase tracking-widest">Neural Coherence</span>
                                <span className="text-[#000B1E]">99.8%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-gradient-to-r from-[#C8AA6E] to-gold-400 w-[99.8%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffAI;

