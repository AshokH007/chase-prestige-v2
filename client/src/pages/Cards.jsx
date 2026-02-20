import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PrestigeMetalCard from '../components/PrestigeMetalCard';
import { Plus, ShieldCheck, Zap, ArrowRight, Lock, Unlock } from 'lucide-react';

const Cards = () => {
    const { user, API_BASE } = useAuth();
    const [cards, setCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isIssuing, setIsIssuing] = useState(false);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/cards`);
            setCards(res.data);
        } catch (err) {
            console.error('Failed to fetch cards');
        } finally {
            setIsLoading(false);
        }
    };

    const handleIssueCard = async (style = 'METAL') => {
        setIsIssuing(true);
        try {
            await axios.post(`${API_BASE}/api/cards/issue`, { style });
            await fetchCards();
        } catch (err) {
            console.error('Failed to issue card');
        } finally {
            setIsIssuing(false);
        }
    };

    const toggleCardStatus = async (cardId, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'FROZEN' : 'ACTIVE';
        try {
            await axios.patch(`${API_BASE}/api/cards/${cardId}/status`, { status: newStatus });
            // Local update for immediate feedback
            setCards(cards.map(c => c.id === cardId ? { ...c, status: newStatus } : c));
        } catch (err) {
            console.error('Failed to update status');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#C8AA6E] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#C8AA6E]"></span>
                    <h1 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                        Wealth Asset Management
                    </h1>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-4xl font-bold text-[#000B1E] tracking-tight font-['Playfair_Display']">
                            Institutional Cards
                        </h2>
                        <p className="text-slate-400 mt-1 font-bold text-[10px] uppercase tracking-widest">
                            Secure Digital Asset Portfolio
                        </p>
                    </div>

                    <button
                        onClick={() => handleIssueCard('METAL')}
                        disabled={isIssuing}
                        className="bg-[#C8AA6E] text-white px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-[#B6965E] transition-all shadow-xl shadow-amber-900/10 active:scale-95 disabled:opacity-50"
                    >
                        <Plus size={20} />
                        <span className="font-bold text-xs uppercase tracking-widest">{isIssuing ? 'Issuing...' : 'Issue New Card'}</span>
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                {/* Left: Card Display Area */}
                <div className="xl:col-span-12 space-y-12">
                    {cards.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 border-dashed">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck size={40} className="text-slate-200" />
                            </div>
                            <h3 className="text-xl font-bold text-[#000B1E] font-['Playfair_Display'] mb-2">No Active Instruments</h3>
                            <p className="text-slate-400 text-xs mb-8">Begin your premium banking experience by issuing your first prestige card.</p>
                            <button
                                onClick={() => handleIssueCard('METAL')}
                                className="px-10 py-4 bg-[#000B1E] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                            >
                                Get Started
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {cards.map(card => (
                                <div key={card.id} className="space-y-6 group">
                                    <PrestigeMetalCard
                                        number={card.card_number}
                                        holderName={card.card_holder_name}
                                        expiryMonth={card.expiry_month}
                                        expiryYear={card.expiry_year}
                                        cvv={card.cvv}
                                        style={card.style}
                                        status={card.status}
                                    />

                                    <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button
                                            onClick={() => toggleCardStatus(card.id, card.status)}
                                            className={clsx(
                                                "flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest border transition-all active:scale-95",
                                                card.status === 'ACTIVE'
                                                    ? "bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100"
                                                    : "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                                            )}
                                        >
                                            {card.status === 'ACTIVE' ? (
                                                <><Lock size={14} /> Freeze Card</>
                                            ) : (
                                                <><Unlock size={14} /> Reactivate</>
                                            )}
                                        </button>
                                        <button className="flex-1 py-4 rounded-2xl bg-[#000B1E] text-white font-bold text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Information / Perks Section */}
                <div className="xl:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    {[
                        { icon: Zap, title: "Instant Issuance", desc: "Digital identifiers generated in milliseconds for immediate utility." },
                        { icon: ShieldCheck, title: "Zero Liability", desc: "Institutional grade fraud protection on all virtual transactions." },
                        { icon: ArrowRight, title: "Auto-Migration", desc: "Seamlessly transition between digital and physical metal identifiers." }
                    ].map((perk, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#C8AA6E]/10 transition-colors">
                                <perk.icon size={24} className="text-[#C8AA6E]" />
                            </div>
                            <h4 className="font-bold text-[#000B1E] mb-2">{perk.title}</h4>
                            <p className="text-slate-400 text-xs leading-relaxed">{perk.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Cards;
