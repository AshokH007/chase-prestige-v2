import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    Send,
    Bot,
    User,
    Shield,
    Zap,
    Loader2,
    Cpu,
    Fingerprint,
    Globe2,
    Database
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
    const chatContainerRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, processingStep]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);
        setIsLoading(true);
        setProcessingStep('Kernel Initialization...');

        try {
            const res = await axios.post(`${API_BASE}/api/ai/chat`, { message: userMsg });

            setProcessingStep(null);
            setMessages(prev => [...prev, {
                role: 'bot',
                content: res.data.response,
                timestamp: new Date()
            }]);
            setIsLoading(false);
        } catch (err) {
            setProcessingStep(null);

            let errorMsg = "Institutional relay connectivity failure.";

            if (err.response?.data?.message) {
                errorMsg = `CRITICAL ERROR: ${err.response.data.message}`;
            } else if (err.message) {
                errorMsg = `SYSTEM FAILURE: ${err.message}`;
            }

            setMessages(prev => [...prev, {
                role: 'bot',
                content: errorMsg,
                timestamp: new Date()
            }]);
            setIsLoading(false);
        }
    };

    const suggestions = [
        { label: "Summarize total treasury liquidity" },
        { label: "Identify high-risk compliance flags" },
        { label: "Analytic report on asset distribution" }
    ];

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#F7F6F3] font-sans antialiased animate-in fade-in duration-1000">
            {/* MINIMAL STAFF HEADER (Not scrollable) */}
            <header className="flex-none py-6 px-6 lg:px-12 flex items-center justify-between border-b border-black/[0.03] bg-[#F7F6F3] z-20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#000B1E] rounded-xl flex items-center justify-center text-[#C8AA6E] shadow-sm">
                        <Zap size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[#000B1E] tracking-tight font-['Playfair_Display']">Institutional <span className="text-[#C8AA6E]">Oracle</span></h1>
                        <p className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-400">Control Terminal • Staff</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-[#000B1E] rounded-full border border-white/10 shadow-lg">
                        <Fingerprint className="text-[#C8AA6E]" size={12} />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">Officer Verified</span>
                    </div>
                </div>
            </header>

            {/* MESSAGES AREA (Scrollable) */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth"
            >
                <div className="max-w-[820px] mx-auto px-6 lg:px-0 py-12 space-y-12">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={clsx(
                            "flex gap-8 group animate-in slide-in-from-bottom-2 duration-700",
                            msg.role === 'user' ? 'flex-row-reverse' : ''
                        )}>
                            <div className={clsx(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-500",
                                msg.role === 'bot'
                                    ? "bg-white text-[#C8AA6E] border-slate-200 shadow-sm"
                                    : "bg-[#000B1E] text-slate-400 border-transparent shadow-md"
                            )}>
                                {msg.role === 'bot' ? <Cpu size={20} /> : <User size={20} />}
                            </div>

                            <div className={clsx(
                                "max-w-[80%] flex flex-col",
                                msg.role === 'user' ? "items-end" : "items-start"
                            )}>
                                <div className={clsx(
                                    "p-6 lg:p-7 rounded-2xl text-[15px] leading-relaxed transition-all duration-300",
                                    msg.role === 'bot'
                                        ? "bg-white text-slate-800 rounded-tl-none font-medium border border-black/[0.03] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.03)]"
                                        : "bg-[#F2EDE4] text-slate-800 rounded-tr-none font-semibold shadow-[0_4px_12px_-4px_rgba(200,170,110,0.1)]"
                                )}>
                                    {msg.content}
                                </div>

                                <div className={clsx(
                                    "text-[9px] mt-4 flex items-center gap-3 font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity",
                                    msg.role === 'bot' ? "text-slate-500" : "text-slate-600"
                                )}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    <span>• {msg.role === 'bot' ? 'INSTITUTIONAL STREAM' : 'OFFICER COMMAND'}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {processingStep && (
                        <div className="flex gap-8 animate-in fade-in duration-500">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                                <Loader2 size={16} className="text-[#C8AA6E] animate-spin" />
                            </div>
                            <div className="flex items-center h-10">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8AA6E]">{processingStep}</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                    <div className="h-20 flex-none" />
                </div>
            </div>

            {/* INPUT SECTION (Fixed with Flex, No absolute/fixed) */}
            <div className="flex-none bg-[#F7F6F3]/95 backdrop-blur-xl border-t border-black/[0.03] pt-6 pb-10">
                <div className="max-w-[820px] mx-auto px-6 lg:px-0">

                    {!input && messages.length === 1 && (
                        <div className="flex flex-wrap gap-2 mb-6 animate-in fade-in slide-in-from-bottom-1 duration-1000">
                            {suggestions.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setInput(item.label)}
                                    className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 hover:border-[#C8AA6E] hover:text-[#C8AA6E] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSend} className="relative group flex items-center gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        handleSend(e);
                                    }
                                }}
                                placeholder="Issue an Institutional Command..."
                                className="w-full bg-white text-slate-900 pl-8 pr-20 py-7 rounded-2xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#C8AA6E] focus:border-[#C8AA6E] transition-all text-sm font-medium placeholder:text-slate-400 shadow-sm uppercase tracking-widest font-mono text-[11px]"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="w-12 h-12 bg-[#000B1E] text-white rounded-xl flex items-center justify-center hover:bg-[#C8AA6E] transition-all active:scale-95 disabled:opacity-20 shadow-lg"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="mt-8 flex items-center justify-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                        <div className="flex items-center gap-2">
                            <Database size={10} />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Synapse Integrity: 99.8%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffAI;
