import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
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
            content: `Excellence is a habit, not an act. Good evening, ${user?.full_name?.split(' ')[0] || 'Valued Client'}. I have synchronized with your institutional holdings. How shall we optimize your capital today?`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [image, setImage] = useState(null); // Base64 string
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [thinkingState, setThinkingState] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, thinkingState]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(URL.createObjectURL(file));
                setImage(reader.result.split(',')[1]); // Just the base64 part
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        const currentImage = image;
        const currentPreview = imagePreview;

        setInput('');
        clearImage();

        setMessages(prev => [...prev, {
            role: 'user',
            content: userMsg,
            image: currentPreview,
            timestamp: new Date()
        }]);

        setIsLoading(true);
        setThinkingState('Accessing Institutional Ledger...');

        try {
            // Simulated reasoning steps for "Sleek" feel
            setTimeout(() => setThinkingState('Analyzing Risk Exposure...'), 1000);
            if (currentImage) {
                setTimeout(() => setThinkingState('Processing Visual Stimuli...'), 2000);
            } else {
                setTimeout(() => setThinkingState('Synthesizing Portfolio Strategy...'), 2000);
            }

            const res = await axios.post(`${API_BASE}/api/ai/chat`, {
                message: userMsg,
                image: currentImage
            });

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
        <div className="h-[calc(100vh-120px)] flex flex-col p-6 lg:p-10 animate-in fade-in zoom-in-95 duration-1000 max-w-6xl mx-auto w-full relative">
            {/* FLOATING SECURITY BADGE */}
            <div className="absolute top-10 right-10 hidden xl:flex flex-col items-end gap-2 animate-in slide-in-from-right-10 duration-1000">
                <div className="px-4 py-2 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Diamond VII Security Baseline</span>
                </div>
                <div className="px-4 py-2 bg-[#000B1E] rounded-2xl shadow-xl flex items-center gap-3">
                    <ShieldCheck className="text-[#C8AA6E]" size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white">Quantum Encryption Active</span>
                </div>
            </div>

            {/* MINIMAL HEADER */}
            <div className="mb-12 text-center">
                <div className="inline-flex items-center gap-6 mb-4">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#C8AA6E] to-[#E5D2A8] rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative p-3 bg-[#000B1E] rounded-2xl border border-white/5 shadow-2xl flex items-center justify-center">
                            <Orbit className="text-[#C8AA6E] animate-[spin_15s_linear_infinite]" size={24} />
                        </div>
                    </div>
                    <div className="text-left">
                        <h2 className="text-4xl font-bold text-[#000B1E] tracking-tight font-['Playfair_Display']">Prestige <span className="text-[#C8AA6E]">Oracle</span></h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400">Institutional Intelligence Protocol</span>
                            <span className="px-1.5 py-0.5 bg-[#C8AA6E]/10 text-[#C8AA6E] text-[8px] font-black uppercase tracking-widest rounded border border-[#C8AA6E]/20">Pro</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center min-h-0">
                {/* TRANSFORMED CENTERED CHAT ARENA */}
                <div className="w-full max-w-4xl flex-1 flex flex-col bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] border border-slate-100/50 overflow-hidden relative">

                    {/* Minimalist Glass Decor - POINT-EVENTS-NONE FIXED */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-slate-50 rounded-full blur-[100px] -mr-48 -mt-48 opacity-40 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C8AA6E]/5 rounded-full blur-[80px] -ml-40 -mb-40 opacity-30 pointer-events-none"></div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-8 lg:p-14 space-y-12 custom-scrollbar relative z-10 scroll-smooth pb-32 lg:pb-40">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={clsx("flex gap-6 animate-in slide-in-from-bottom-4 duration-500", msg.role === 'user' ? 'flex-row-reverse' : '')}>
                                <div className={clsx(
                                    "w-11 h-11 rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-lg border transition-all",
                                    msg.role === 'bot'
                                        ? "bg-[#000B1E] text-[#C8AA6E] border-white/10"
                                        : "bg-white text-slate-300 border-slate-100"
                                )}>
                                    {msg.role === 'bot' ? <Bot size={22} /> : <User size={22} />}
                                </div>
                                <div className={clsx(
                                    "max-w-[85%] lg:max-w-[75%] p-7 rounded-[2.2rem] text-sm leading-[1.8] shadow-sm relative group transition-all",
                                    msg.role === 'bot'
                                        ? "bg-slate-50/40 backdrop-blur-sm text-[#000B1E] border border-slate-100 rounded-tl-none font-medium"
                                        : "bg-[#000B1E] text-white rounded-tr-none font-medium shadow-xl shadow-indigo-900/10"
                                )}>
                                    {msg.image && (
                                        <div className="mb-4 rounded-2xl overflow-hidden border border-white/10 shadow-lg max-w-sm">
                                            <img src={msg.image} alt="Uploaded context" className="w-full h-auto object-cover" />
                                        </div>
                                    )}
                                    {msg.content}

                                    <div className={clsx(
                                        "text-[9px] mt-4 flex items-center gap-3 font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity",
                                        msg.role === 'bot' ? 'text-slate-400' : 'text-slate-500'
                                    )}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {msg.model && <span>• {msg.model.split('/').pop()}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* MINIMAL THINKING STATE */}
                        {thinkingState && (
                            <div className="flex gap-6">
                                <div className="w-11 h-11 rounded-[1.2rem] bg-[#000B1E] flex items-center justify-center shrink-0 border border-white/10 shadow-xl">
                                    <div className="w-1.5 h-1.5 bg-[#C8AA6E] rounded-full animate-ping"></div>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8AA6E]/60 animate-pulse">{thinkingState}</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* INPUT SECTION - STREAMLINED */}
                    <div className="p-8 lg:p-12 bg-white/50 backdrop-blur-xl border-t border-slate-50 relative w-full">

                        {/* MINIMAL PILL SUGGESTIONS */}
                        {!input && !image && messages.length === 1 && (
                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-700 w-full justify-center px-6">
                                {suggestions.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setInput(item.label)}
                                        className="px-5 py-2.5 bg-white/80 backdrop-blur-md border border-slate-100 rounded-full text-[9px] font-black uppercase tracking-widest text-[#000B1E] hover:border-[#C8AA6E] hover:bg-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {imagePreview && (
                            <div className="mb-6 flex items-center gap-4 animate-in slide-in-from-bottom-2">
                                <div className="relative group/preview">
                                    <img src={imagePreview} className="w-16 h-16 rounded-xl object-cover border-2 border-[#C8AA6E]" alt="Upload preview" />
                                    <button
                                        onClick={clearImage}
                                        className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-lg"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#C8AA6E]">Context Attached</span>
                                    <span className="text-[8px] text-slate-400 font-bold">Multimodal Analysis Ready</span>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSend} className="relative flex gap-4 items-center">
                            <div className="relative flex-1 group">
                                {/* FIXED POINTER EVENTS ON DECORATIVE DIV */}
                                <div className="absolute -inset-1 bg-[#C8AA6E]/10 rounded-[2rem] opacity-0 group-within:opacity-100 blur transition-opacity pointer-events-none"></div>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your strategic inquiry..."
                                    className="w-full bg-slate-50 text-[#000B1E] pl-8 pr-32 py-6 rounded-[2rem] border border-slate-100 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C8AA6E]/20 transition-all font-medium placeholder:text-slate-300 placeholder:font-black placeholder:uppercase placeholder:tracking-[0.2em] placeholder:text-[9px] relative z-20"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-30">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current.click()}
                                        className="p-3 text-slate-300 hover:text-[#C8AA6E] transition-colors"
                                    >
                                        <Command size={20} />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={(!input.trim() && !image) || isLoading}
                                        className="w-14 h-14 bg-[#000B1E] text-white rounded-2xl flex items-center justify-center hover:bg-[#C8AA6E] transition-all active:scale-95 disabled:opacity-30 shadow-xl shadow-indigo-900/10"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* INSTITUTIONAL FOOTNOTE */}
                <div className="mt-8 flex items-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={12} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">End-To-End Encrypted</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Institutional Tier V</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIConcierge;

