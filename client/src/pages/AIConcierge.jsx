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
    Loader2
} from 'lucide-react';

const AIConcierge = () => {
    const { API_BASE, user } = useAuth();
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            content: `Good evening, ${user?.fullName || 'Valued Client'}. I am your Prestige Financial Concierge. I have synchronized with your global portfolio. How may I assist with your capital strategy today?`,
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
            const res = await axios.post(`${API_BASE}/api/ai/chat`, { message: userMsg });
            setMessages(prev => [...prev, { role: 'bot', content: res.data.response, timestamp: new Date() }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'bot',
                content: "I apologize, but my market analytical core is currently recalibrating. Please try again in a moment.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestions = [
        { label: "Analyze my portfolio status", icon: Briefcase },
        { label: "Should I buy more Bitcoin?", icon: TrendingUp },
        { label: "Check my upcoming liabilities", icon: ShieldCheck }
    ];

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col p-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#000B1E] rounded-2xl shadow-xl shadow-indigo-900/20">
                        <Sparkles className="text-[#C8AA6E]" size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-[#000B1E] tracking-tight font-['Playfair_Display']">Prestige GPT</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Institutional AI Online</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
                {/* 1. Chat Window */}
                <div className="flex-1 flex flex-col bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100/50 overflow-hidden relative">
                    {/* Chat Background Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-40 pointer-events-none"></div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative z-10">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'bot' ? 'bg-[#000B1E] text-[#C8AA6E]' : 'bg-slate-100 text-slate-400'}`}>
                                    {msg.role === 'bot' ? <Bot size={20} /> : <User size={20} />}
                                </div>
                                <div className={`max-w-[80%] p-6 rounded-3xl text-sm leading-relaxed shadow-sm ${msg.role === 'bot' ? 'bg-slate-50 text-[#000B1E] border border-slate-100 rounded-tl-none' : 'bg-[#C8AA6E] text-white rounded-tr-none'}`}>
                                    {msg.content}
                                    <div className={`text-[10px] mt-2 opacity-50 ${msg.role === 'bot' ? 'text-slate-400' : 'text-white'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-4 animate-pulse">
                                <div className="w-10 h-10 rounded-2xl bg-[#000B1E] flex items-center justify-center shrink-0">
                                    <Loader2 size={20} className="text-[#C8AA6E] animate-spin" />
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic text-slate-400 text-xs">
                                    Analyzing market data and portfolio metrics...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-8 bg-slate-50/50 border-t border-slate-100">
                        <form onSubmit={handleSend} className="relative">
                            <input
                                type="text"
                                multiline
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Inquire about your holdings or strategy..."
                                className="w-full bg-white text-[#000B1E] pl-6 pr-16 py-5 rounded-2xl shadow-inner border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C8AA6E] transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#000B1E] text-white rounded-xl flex items-center justify-center hover:bg-[#C8AA6E] transition-all active:scale-95 disabled:opacity-50"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* 2. Side Panel - Suggestions & Status */}
                <div className="w-full lg:w-80 space-y-6">
                    <div className="card-prestige !bg-[#000B1E] text-white">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8AA6E] mb-4">Concierge Level</h3>
                        <p className="text-xl font-bold font-['Playfair_Display']">Diamond Tier AI</p>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            Your assistant uses real-time liquidity and asset verification protocols.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Strategic Inquiries</h4>
                        {suggestions.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => setInput(item.label)}
                                className="w-full p-4 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 text-left transition-all group"
                            >
                                <div className="p-2 bg-slate-100 rounded-lg text-[#000B1E] group-hover:bg-[#000B1E] group-hover:text-white transition-all">
                                    <item.icon size={16} />
                                </div>
                                <span className="text-xs font-bold text-[#000B1E] flex-1">{item.label}</span>
                                <ChevronRight size={14} className="text-slate-300 group-hover:text-[#C8AA6E]" />
                            </button>
                        ))}
                    </div>

                    {/* Security Badge */}
                    <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-start gap-4">
                        <ShieldCheck className="text-emerald-600 shrink-0" size={24} />
                        <div>
                            <p className="text-xs font-bold text-emerald-900">End-to-End Encrypted</p>
                            <p className="text-[10px] text-emerald-700 mt-1">Chat history is not used for institutional training.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIConcierge;
