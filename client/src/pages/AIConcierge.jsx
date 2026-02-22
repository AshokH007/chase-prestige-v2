import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    Send,
    Bot,
    User,
    Shield,
    Sparkles,
    Loader2,
    Command,
    X
} from 'lucide-react';
import { clsx } from 'clsx';

const AIConcierge = () => {
    const { API_BASE, user } = useAuth();
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            content: `Excellence is a habit, not an act. Good evening, ${user?.fullName?.split(' ')[0] || 'Valued Client'}. I have synchronized with your institutional holdings. How shall we optimize your capital today?`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [thinkingState, setThinkingState] = useState(null);
    const chatContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, thinkingState]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(URL.createObjectURL(file));
                setImage(reader.result.split(',')[1]);
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
        if (e) e.preventDefault(); // Critical: Prevent page reload
        if ((!input.trim() && !image) || isLoading) return;

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
            const res = await axios.post(`${API_BASE}/api/ai/chat`, {
                message: userMsg,
                image: currentImage
            });

            setThinkingState(null);
            setMessages(prev => [...prev, {
                role: 'bot',
                content: res.data.response,
                timestamp: new Date()
            }]);
            setIsLoading(false);

        } catch (err) {
            setThinkingState(null);

            let errorMsg = "Institutional relay latency encountered.";

            if (err.response?.data?.message) {
                errorMsg = `ERROR: ${err.response.data.message}`;
            } else if (err.message) {
                errorMsg = `NETWORK ERROR: ${err.message}`;
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
        { label: "Analyze my portfolio status" },
        { label: "Strategy for Bitcoin volatility" },
        { label: "Verify institutional security" }
    ];

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#F7F6F3] font-sans antialiased animate-in fade-in duration-1000">
            {/* MINIMAL EXECUTIVE HEADER (Not scrollable) */}
            <header className="flex-none py-6 px-6 lg:px-12 flex items-center justify-between border-b border-black/[0.03] bg-[#F7F6F3] z-20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#000B1E] rounded-xl flex items-center justify-center text-[#C8AA6E] shadow-sm">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[#000B1E] tracking-tight font-['Playfair_Display'] text-black">Prestige <span className="text-[#C8AA6E]">Oracle</span></h1>
                        <p className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-400">Institutional Intelligence</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-slate-100 shadow-sm">
                        <Shield className="text-[#C8AA6E]" size={12} />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Diamond VII Secured</span>
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
                            {/* Minimal Avatar Area */}
                            <div className={clsx(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-500",
                                msg.role === 'bot'
                                    ? "bg-white text-[#C8AA6E] border-slate-200 shadow-sm"
                                    : "bg-[#000B1E] text-slate-400 border-transparent shadow-md"
                            )}>
                                {msg.role === 'bot' ? <Bot size={20} /> : <User size={20} />}
                            </div>

                            {/* Message Bubble Container */}
                            <div className={clsx(
                                "max-w-[80%] flex flex-col",
                                msg.role === 'user' ? "items-end" : "items-start"
                            )}>
                                {msg.image && (
                                    <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 shadow-sm max-w-sm">
                                        <img src={msg.image} alt="Uploaded context" className="w-full h-auto object-cover" />
                                    </div>
                                )}
                                <div className={clsx(
                                    "p-6 lg:p-7 rounded-2xl text-[15px] leading-relaxed transition-all duration-300 whitespace-pre-wrap",
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
                                    <span>• {msg.role === 'bot' ? 'SECURED STREAM' : 'CLIENT COMMAND'}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Minimal Thinking State */}
                    {thinkingState && (
                        <div className="flex gap-8 animate-in fade-in duration-500">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                                <Loader2 size={16} className="text-[#C8AA6E] animate-spin" />
                            </div>
                            <div className="flex items-center h-10">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8AA6E]">{thinkingState}</span>
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

                    {/* Elegant Topic Pills */}
                    {!input && !imagePreview && messages.length === 1 && (
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

                    {imagePreview && (
                        <div className="mb-6 flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-500">
                            <div className="relative group/preview">
                                <img src={imagePreview} className="w-16 h-16 rounded-xl object-cover border-2 border-[#C8AA6E]" alt="Upload preview" />
                                <button
                                    onClick={clearImage}
                                    className="absolute -top-2 -right-2 bg-[#000B1E] text-white rounded-full p-1 shadow-lg border border-white/20"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#C8AA6E]">Context Attached</span>
                                <span className="text-[8px] text-slate-400 font-bold">Multimodal Analysis Processing</span>
                            </div>
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
                                placeholder="Consult the Institutional Oracle..."
                                className="w-full bg-white text-slate-900 pl-8 pr-32 py-7 rounded-2xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#C8AA6E] focus:border-[#C8AA6E] transition-all text-sm font-medium placeholder:text-slate-400 shadow-sm"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
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
                                    title="Attach Command Document"
                                >
                                    <Command size={18} />
                                </button>
                                <button
                                    type="submit"
                                    disabled={(!input.trim() && !image) || isLoading}
                                    className="w-12 h-12 bg-[#000B1E] text-white rounded-xl flex items-center justify-center hover:bg-[#C8AA6E] transition-all active:scale-95 disabled:opacity-20 shadow-lg"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="mt-8 flex items-center justify-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                        <div className="flex items-center gap-2">
                            <Shield size={10} />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Institutional Sync Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIConcierge;
