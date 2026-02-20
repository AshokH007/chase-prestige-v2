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
    Zap
} from 'lucide-react';
import { clsx } from 'clsx';

const StaffAI = () => {
    const { API_BASE, user } = useAuth();
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            content: `Awaiting instructions, Officer ${user?.fullName.split(' ')[0] || 'Administrator'}. The Institutional Oracle is synchronized with the global ledger. I am prepared to analyze liquidity exposure, compliance anomalies, or customer portfolio health. How shall we proceed?`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);
        setIsLoading(true);

        try {
            // Prime the AI with staff context in the message or via a specific staff endpoint
            const res = await axios.post(`${API_BASE}/api/ai/chat`, {
                message: `[STAFF CONTEXT: User is a Staff/Admin] ${userMsg}`
            });
            setMessages(prev => [...prev, { role: 'bot', content: res.data.response, timestamp: new Date() }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'bot',
                content: "Institutional relay failure. The analytical core is temporarily offline for kernel synchronization.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestions = [
        { label: "Summarize total treasury liquidity", icon: BarChart3 },
        { label: "Identify high-risk compliance flags", icon: ShieldAlert },
        { label: "Analytic report on asset distribution", icon: Globe2 }
    ];

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col p-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#C8AA6E] rounded-2xl shadow-xl shadow-amber-900/20">
                        <Zap className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-[#000B1E] tracking-tight font-['Playfair_Display']">Institutional Oracle</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#C8AA6E] animate-pulse"></span>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Sovereign Intelligence Active</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
                {/* 1. Chat Window */}
                <div className="flex-1 flex flex-col bg-[#000B1E] rounded-[2.5rem] shadow-2xl shadow-indigo-900/40 overflow-hidden relative border border-white/5">
                    {/* Chat Background Decor */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#C8AA6E]/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar relative z-10">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={clsx(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border",
                                    msg.role === 'bot' ? "bg-[#C8AA6E] text-white border-amber-400/20" : "bg-white/10 text-slate-300 border-white/5"
                                )}>
                                    {msg.role === 'bot' ? <Bot size={24} /> : <User size={24} />}
                                </div>
                                <div className={clsx(
                                    "max-w-[75%] p-8 rounded-3xl text-sm leading-relaxed shadow-xl",
                                    msg.role === 'bot'
                                        ? "bg-white/5 text-slate-200 border border-white/10 rounded-tl-none backdrop-blur-md"
                                        : "bg-[#C8AA6E] text-white rounded-tr-none"
                                )}>
                                    {msg.content}
                                    <div className={clsx(
                                        "text-[10px] mt-3 font-bold uppercase tracking-widest opacity-40",
                                        msg.role === 'bot' ? "text-slate-400" : "text-white"
                                    )}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {msg.role === 'bot' ? 'Oracle Stream' : 'Admin Intent'}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-6 animate-pulse">
                                <div className="w-12 h-12 rounded-2xl bg-[#C8AA6E] flex items-center justify-center shrink-0 shadow-lg shadow-amber-900/20">
                                    <Loader2 size={24} className="text-white animate-spin" />
                                </div>
                                <div className="p-8 bg-white/5 rounded-3xl border border-white/10 italic text-slate-400 text-xs backdrop-blur-md">
                                    Synthesizing institutional metrics and cross-referencing ledger anomalies...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-8 bg-black/20 border-t border-white/5 backdrop-blur-xl">
                        <form onSubmit={handleSend} className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Issue an institutional command or inquiry..."
                                className="w-full bg-white/5 text-white pl-8 pr-20 py-6 rounded-[2rem] shadow-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#C8AA6E] transition-all placeholder:text-slate-600"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-[#C8AA6E] text-white rounded-2xl flex items-center justify-center hover:bg-[#B6965E] transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-amber-900/40"
                            >
                                <Send size={24} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* 2. Side Panel - Strategic Controls */}
                <div className="w-full lg:w-96 space-y-6">
                    <div className="card-prestige !bg-[#C8AA6E] text-white border-0 shadow-2xl shadow-amber-900/20">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mb-4">Analytical Clearance</h3>
                        <p className="text-2xl font-bold font-['Playfair_Display']">Level 5 Sovereign</p>
                        <p className="text-xs text-white/80 mt-2 leading-relaxed">
                            Full access to all institutional silos, including private wealth trajectories and liquidity pools.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Standard Operational Inquiries</h4>
                        {suggestions.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => setInput(item.label)}
                                className="w-full p-6 bg-white hover:bg-slate-50 border border-slate-100 rounded-3xl flex items-center gap-4 text-left transition-all group shadow-sm hover:shadow-md"
                            >
                                <div className="p-3 bg-slate-50 rounded-xl text-[#000B1E] group-hover:bg-[#000B1E] group-hover:text-white transition-all">
                                    <item.icon size={18} />
                                </div>
                                <span className="text-xs font-bold text-[#000B1E] flex-1">{item.label}</span>
                                <ChevronRight size={16} className="text-slate-300 group-hover:text-[#C8AA6E]" />
                            </button>
                        ))}
                    </div>

                    {/* Kernel Status */}
                    <div className="p-8 rounded-[2rem] bg-indigo-50 border border-indigo-100">
                        <div className="flex items-center gap-4 mb-4">
                            <Sparkles className="text-indigo-600" size={24} />
                            <p className="text-xs font-bold text-indigo-900 uppercase tracking-widest">System Health</p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className="text-slate-400 uppercase">Neural Load</span>
                                <span className="text-indigo-600">4.2%</span>
                            </div>
                            <div className="w-full bg-indigo-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-600 h-full w-[4.2%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffAI;
