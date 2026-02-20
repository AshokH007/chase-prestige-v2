import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    Sparkles,
    Send,
    Bot,
    User,
    TrendingUp,
    ShieldCheck,
    Briefcase,
    ChevronRight,
    Loader2,
    Command,
    Orbit
} from 'lucide-react';
import { clsx } from 'clsx';

const AIConcierge = () => {
    const { API_BASE, user } = useAuth();
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            content: `Excellence is a habit, not an act. Good evening, ${user?.fullName.split(' ')[0] || 'Valued Client'}. I have synchronized with your institutional holdings. How shall we optimize your capital today?`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [thinkingState, setThinkingState] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, thinkingState]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);
        setIsLoading(true);
        setThinkingState('Accessing Institutional Ledger...');

        try {
            // Simulated reasoning steps for "Sleek" feel
            setTimeout(() => setThinkingState('Analyzing Risk Exposure...'), 1000);
            setTimeout(() => setThinkingState('Synthesizing Portfolio Strategy...'), 2000);

            const res = await axios.post(`${API_BASE}/api/ai/chat`, { message: userMsg });

            setTimeout(() => {
                setThinkingState(null);
                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: res.data.response,
                    isSimulated: res.data.isSimulated,
                    model: res.data.model,
                    timestamp: new Date()
                }]);
                setIsLoading(false);
            }, 2500);

        } catch (err) {
            setThinkingState(null);
            setMessages(prev => [...prev, {
                role: 'bot',
                content: "I apologize, but my market analytical core is currently recalibrating for high-volatility events. Please try again.",
                timestamp: new Date()
            }]);
            setIsLoading(false);
        }
    };

    const suggestions = [
        { label: "Analyze my portfolio status", icon: Briefcase, color: "text-blue-500" },
        { label: "Strategy for Bitcoin volatility", icon: TrendingUp, color: "text-amber-500" },
        { label: "Verify institutional security", icon: ShieldCheck, color: "text-emerald-500" }
    ];

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col p-6 lg:p-10 animate-in fade-in zoom-in-95 duration-1000">
            {/* NEW SLEEK HEADER */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#C8AA6E] to-[#E5D2A8] rounded-2xl blur opacity-30 animate-pulse"></div>
                        <div className="relative p-4 bg-[#000B1E] rounded-2xl border border-white/5 shadow-2xl shrink-0">
                            <Orbit className="text-[#C8AA6E] animate-[spin_10s_linear_infinite]" size={28} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-4xl font-bold text-[#000B1E] tracking-tight font-['Playfair_Display']">Prestige <span className="text-[#C8AA6E]">Oracle</span></h2>
                            <span className="px-2 py-0.5 bg-[#C8AA6E]/10 text-[#C8AA6E] text-[10px] font-black uppercase tracking-[0.2em] rounded-md border border-[#C8AA6E]/20">Pro</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500/30"></div>)}
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400">Neural Link Stable • UHNW Protocol Tier 5</span>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-4 text-slate-300">
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Response Latency</p>
                        <p className="text-sm font-mono text-[#000B1E]">14ms Global</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Context Window</p>
                        <p className="text-sm font-mono text-[#000B1E]">128k Tokens</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-10 min-h-0">
                {/* 1. MAIN CHAT ARENA */}
                <div className="flex-1 flex flex-col bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden relative">

                    {/* Glass Decor */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-50 rounded-full blur-[120px] -mr-[250px] -mt-[250px] opacity-60 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C8AA6E]/5 rounded-full blur-[100px] -ml-[200px] -mb-[200px] opacity-40 pointer-events-none"></div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10 custom-scrollbar relative z-10">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={clsx("flex gap-6 animate-in slide-in-from-bottom-4 duration-500", msg.role === 'user' ? 'flex-row-reverse' : '')}>
                                <div className={clsx(
                                    "w-12 h-12 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-xl border transition-transform hover:scale-110",
                                    msg.role === 'bot'
                                        ? "bg-[#000B1E] text-[#C8AA6E] border-white/10"
                                        : "bg-white text-slate-400 border-slate-100"
                                )}>
                                    {msg.role === 'bot' ? <Bot size={24} /> : <User size={24} />}
                                </div>
                                <div className={clsx(
                                    "max-w-[85%] lg:max-w-[70%] p-8 rounded-[2.5rem] text-sm leading-[1.8] shadow-sm relative group",
                                    msg.role === 'bot'
                                        ? "bg-slate-50/50 backdrop-blur-sm text-[#000B1E] border border-slate-100 rounded-tl-none font-medium"
                                        : "bg-[#000B1E] text-white rounded-tr-none font-medium shadow-2xl shadow-indigo-900/10"
                                )}>
                                    {msg.content}

                                    {msg.isSimulated && (
                                        <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C8AA6E]">Simulation Active</span>
                                            <span className="text-[9px] text-slate-400 italic">Configure HF_TOKEN for live LLM</span>
                                        </div>
                                    )}

                                    <div className={clsx(
                                        "text-[10px] mt-4 flex items-center gap-3 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity",
                                        msg.role === 'bot' ? 'text-slate-400' : 'text-slate-500'
                                    )}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {msg.model && <span>• {msg.model.split('/').pop()}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* THINKING STATE UI */}
                        {thinkingState && (
                            <div className="flex gap-6 animate-pulse">
                                <div className="w-12 h-12 rounded-[1.25rem] bg-[#000B1E] flex items-center justify-center shrink-0 border border-white/10 shadow-xl">
                                    <Loader2 size={24} className="text-[#C8AA6E] animate-spin" />
                                </div>
                                <div className="px-8 py-6 bg-slate-50/50 backdrop-blur-sm rounded-[2rem] border border-slate-100 flex items-center gap-4">
                                    <div className="flex gap-1">
                                        <div className="w-1 h-1 bg-[#C8AA6E] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1 h-1 bg-[#C8AA6E] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1 h-1 bg-[#C8AA6E] rounded-full animate-bounce"></div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{thinkingState}</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* INPUT SECTION - GLOW ON FOCUS */}
                    <div className="p-8 lg:p-12 bg-white/50 backdrop-blur-md border-t border-slate-100 relative max-w-5xl mx-auto w-full">
                        <form onSubmit={handleSend} className="relative group">
                            <div className="absolute -inset-2 bg-gradient-to-r from-[#C8AA6E]/20 to-transparent rounded-[2.5rem] opacity-0 group-within:opacity-100 blur transition-opacity duration-500"></div>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Consult the Oracle on your capital strategy..."
                                className="w-full bg-slate-50 text-[#000B1E] pl-8 pr-20 py-7 rounded-[2rem] shadow-inner border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C8AA6E]/30 transition-all font-medium placeholder:text-slate-400 placeholder:font-bold placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px]"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-[#000B1E] text-white rounded-[1.5rem] flex items-center justify-center hover:bg-[#C8AA6E] transition-all active:scale-90 disabled:opacity-50 shadow-2xl shadow-indigo-900/20"
                            >
                                <Send size={24} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* 2. STRATEGIC SIDEBAR */}
                <div className="w-full lg:w-[380px] space-y-8 contents-scrollbar">
                    <div className="p-8 rounded-[3rem] bg-[#000B1E] text-white shadow-2xl shadow-indigo-900/30 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8AA6E]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8AA6E] mb-6">Security Clearance</h3>
                        <p className="text-3xl font-bold font-['Playfair_Display'] mb-2">Diamond VII</p>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                            Your session is protected by Chase Prestige quantum-resistant encryption. All inquiries are strictly private.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-4">Strategic Fast-Action</p>
                        {suggestions.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => setInput(item.label)}
                                className="w-full p-6 bg-white hover:bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center gap-5 text-left transition-all group shadow-sm hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className={clsx("p-4 bg-slate-100 rounded-2xl group-hover:bg-[#000B1E] group-hover:text-white transition-all", item.color)}>
                                    <item.icon size={20} />
                                </div>
                                <span className="text-[11px] font-black text-[#000B1E] uppercase tracking-widest flex-1">{item.label}</span>
                                <ChevronRight size={18} className="text-slate-300 group-hover:text-[#C8AA6E] group-hover:translate-x-1 transition-all" />
                            </button>
                        ))}
                    </div>

                    {/* STATS CARD */}
                    <div className="p-8 rounded-[3rem] bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <ShieldCheck className="text-emerald-600" size={24} />
                                <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Privacy Protected</span>
                            </div>
                            <p className="text-[10px] text-emerald-800/70 leading-relaxed font-bold italic">
                                "Institutional data silos remain isolated. No personal identifiers are transmitted to global LLM kernels."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIConcierge;

