import React from 'react';
import { clsx } from 'clsx';
import { ShieldCheck, Zap } from 'lucide-react';

const PrestigeMetalCard = ({
    number,
    holderName,
    expiryMonth,
    expiryYear,
    cvv,
    style = 'METAL',
    status = 'ACTIVE'
}) => {
    // Format card number: 4444 4444 4444 4444
    const formattedNumber = number.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
    const isFrozen = status === 'FROZEN';

    const styles = {
        METAL: 'bg-gradient-to-br from-slate-900 via-slate-800 to-black border-slate-700 text-white',
        GOLD: 'bg-gradient-to-br from-[#000B1E] via-[#2A3447] to-[#000B1E] border-[#C8AA6E]/30 text-white',
        TITANIUM: 'bg-gradient-to-br from-slate-200 via-slate-400 to-slate-200 border-white/40 text-slate-900',
    };

    return (
        <div className={clsx(
            "relative w-full aspect-[1.586/1] rounded-3xl p-8 overflow-hidden border shadow-2xl transition-all duration-700 group hover:scale-[1.02]",
            styles[style] || styles.METAL,
            isFrozen && "grayscale opacity-80"
        )}>
            {/* Texture Overlay (Brushed Metal Effect) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')]"></div>

            {/* Glossy Reflective Layer */}
            <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>

            <div className="relative h-full flex flex-col justify-between">
                {/* Top Section: Chip & Brand */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-4">
                        {/* Smart Chip */}
                        <div className="w-12 h-10 rounded-lg bg-gradient-to-br from-[#C8AA6E] via-[#E6D4AF] to-[#B6965E] relative overflow-hidden flex items-center justify-center border border-white/10">
                            <div className="absolute inset-0 grid grid-cols-2 gap-px opacity-30">
                                <div className="border border-black/10"></div>
                                <div className="border border-black/10"></div>
                                <div className="border border-black/10"></div>
                                <div className="border border-black/10"></div>
                            </div>
                        </div>
                        {/* Contactless Icon */}
                        <Zap size={16} className="text-white/40 rotate-90 ml-2" />
                    </div>

                    <div className="text-right">
                        <div className="flex items-center gap-2 justify-end mb-1">
                            <div className="w-6 h-6 bg-[#C8AA6E] rounded-md flex items-center justify-center shadow-lg">
                                <span className="text-white text-[10px] font-bold">C</span>
                            </div>
                            <span className="text-sm font-bold tracking-tighter font-['Playfair_Display']">
                                PRESTIGE <span className="text-[#C8AA6E]">GLOBAL</span>
                            </span>
                        </div>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em]">Institutional Reserve</p>
                    </div>
                </div>

                {/* Middle Section: Card Number */}
                <div className="py-4">
                    <p className="text-2xl font-mono tracking-[0.15em] font-bold drop-shadow-md">
                        {formattedNumber || '•••• •••• •••• ••••'}
                    </p>
                </div>

                {/* Bottom Section: Info & Secondary Logo */}
                <div className="flex justify-between items-end">
                    <div className="space-y-4">
                        <div className="flex gap-10">
                            <div>
                                <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mb-1">Valid Thru</p>
                                <p className="text-xs font-bold font-mono">{expiryMonth.toString().padStart(2, '0')}/{expiryYear.toString().slice(-2)}</p>
                            </div>
                            <div>
                                <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mb-1">Security</p>
                                <p className="text-xs font-bold font-mono">•••</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mb-1">Principal Identifier</p>
                            <p className="text-sm font-bold tracking-wide uppercase">{holderName}</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 text-white/20">
                        <ShieldCheck size={24} />
                        <span className="text-[8px] font-bold uppercase tracking-widest">VISA PLATINUM</span>
                    </div>
                </div>
            </div>

            {isFrozen && (
                <div className="absolute inset-0 bg-rose-900/10 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="px-6 py-2 bg-rose-600 text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-full shadow-2xl">
                        Account Frozen
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrestigeMetalCard;
