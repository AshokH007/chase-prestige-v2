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
        <div className="h-[calc(100vh-120px)] flex flex-col p-6 lg:p-10 animate-in fade-in zoom-in-95 duration-1000 max-w-6xl mx-auto w-full relative">
            {/* FLOATING STAFF CLEARANCE BADGE */}
            <div className="absolute top-10 right-10 hidden xl:flex flex-col items-end gap-2 animate-in slide-in-from-right-10 duration-1000">
                <div className="px-4 py-2 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#C8AA6E] animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Institutional Access: SOVEREIGN V</span>
                </div>
                <div className="px-4 py-2 bg-[#000B1E] rounded-2xl shadow-xl flex items-center gap-3">
                    <Fingerprint className="text-[#C8AA6E]" size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white">Officer: 004-CP Verified</span>
                </div>
            </div>

            {/* MINIMAL STAFF HEADER */}
            <div className="mb-12 text-center">
                <div className="inline-flex items-center gap-6 mb-4">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-[#C8AA6E]/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                        <div className="relative p-3 bg-[#C8AA6E] rounded-2xl border border-white/10 shadow-2xl flex items-center justify-center">
                            <Zap className="text-white fill-white" size={24} />
                        </div>
                    </div>
                    <div className="text-left">
                        <h2 className="text-4xl font-bold text-[#000B1E] tracking-tight font-['Playfair_Display']">Institutional <span className="text-[#C8AA6E]">Oracle</span></h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400">Command & Analysis Terminal</span>
                            <span className="px-1.5 py-0.5 bg-slate-100 text-[#000B1E] text-[8px] font-black uppercase tracking-widest rounded border border-slate-200">Staff</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center min-h-0">
                {/* TRANSFORMED CENTERED COMMAND ARENA */}
                <div className="w-full max-w-4xl flex-1 flex flex-col bg-[#000B1E] rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,11,30,0.5)] border border-white/5 overflow-hidden relative">

                    {/* Dark Mode Decor - POINT-EVENTS-NONE FIXED */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#C8AA6E]/5 rounded-full blur-[120px] -mr-48 -mt-48 opacity-40 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] -ml-40 -mb-40 opacity-30 pointer-events-none"></div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-8 lg:p-14 space-y-12 custom-scrollbar relative z-10 scroll-smooth pb-32 lg:pb-40">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={clsx("flex gap-8 group animate-in slide-in-from-bottom-6 duration-700", msg.role === 'user' ? 'flex-row-reverse' : '')}>
                                <div className={clsx(
                                    "w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl border transition-all duration-500 group-hover:rotate-12",
                                    msg.role === 'bot'
                                        ? "bg-gradient-to-br from-[#C8AA6E] to-[#B6965E] text-white border-white/20"
                                        : "bg-white/5 text-slate-400 border-white/10"
                                )}>
                                    {msg.role === 'bot' ? <Cpu size={26} /> : <User size={26} />}
                                </div>
                                <div className={clsx(
                                    "max-w-[80%] lg:max-w-[75%] p-9 rounded-[2.5rem] text-sm leading-[1.8] shadow-2xl relative transition-all",
                                    msg.role === 'bot'
                                        ? "bg-white/[0.04] text-slate-200 border border-white/10 rounded-tl-none backdrop-blur-3xl font-medium"
                                        : "bg-[#C8AA6E] text-white rounded-tr-none font-bold"
                                )}>
                                    {msg.content}

                                    <div className={clsx(
                                        "text-[9px] mt-6 flex items-center gap-4 font-black uppercase tracking-[0.3em] opacity-30 group-hover:opacity-100 transition-opacity",
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
                            <div className="flex gap-8">
                                <div className="w-13 h-13 rounded-2xl bg-[#C8AA6E] flex items-center justify-center shrink-0 shadow-2xl border border-white/20">
                                    <Loader2 size={26} className="text-white animate-spin-slow" />
                                </div>
                                <div className="flex items-center">
                                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#C8AA6E] animate-pulse">{processingStep}</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* INPUT TERMINAL - STREAMLINED */}
                    <div className="p-8 lg:p-12 bg-black/40 border-t border-white/5 backdrop-blur-3xl relative w-full">

                        {/* MINIMAL PILL SUGGESTIONS */}
                        {!input && messages.length === 1 && (
                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-700 w-full justify-center px-6">
                                {suggestions.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setInput(item.label)}
                                        className="px-5 py-2.5 bg-[#000B1E]/80 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-[#C8AA6E] hover:border-[#C8AA6E] hover:bg-[#000B1E] transition-all shadow-xl hover:shadow-amber-900/20 hover:-translate-y-0.5"
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSend} className="relative flex gap-4 items-center">
                            <div className="relative flex-1 group">
                                <div className="absolute -inset-1 bg-[#C8AA6E]/10 rounded-[2.5rem] opacity-0 group-within:opacity-100 blur transition-opacity pointer-events-none"></div>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="ISSUE AN INSTITUTIONAL COMMAND..."
                                    className="w-full bg-white/5 text-white pl-10 pr-24 py-8 rounded-[2.5rem] border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#C8AA6E]/50 transition-all font-mono text-[11px] tracking-widest placeholder:text-slate-700 uppercase font-black relative z-20"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-16 h-16 bg-[#C8AA6E] text-white rounded-2xl flex items-center justify-center hover:bg-[#D4B982] transition-all active:scale-95 disabled:opacity-20 shadow-2xl shadow-amber-900/40 z-30"
                                >
                                    <Send size={24} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* INSTITUTIONAL STATUS FOOTNOTE */}
                <div className="mt-8 flex items-center gap-6 opacity-20 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2">
                        <Database className="text-[#C8AA6E]" size={12} />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Synapse Integrity: 99.8%</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                    <div className="flex items-center gap-2">
                        <Globe2 className="text-[#C8AA6E]" size={12} />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Global Ledger Ready</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffAI;

