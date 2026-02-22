import React from 'react';

const LoadingScreen = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-1000">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-2 border-[#C8AA6E]/20 rounded-full"></div>
                <div className="absolute inset-0 border-t-2 border-[#C8AA6E] rounded-full animate-spin"></div>
            </div>
            <div className="mt-8 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 animate-pulse">
                    Synchronizing Satellite Terminal
                </p>
                <div className="flex items-center justify-center gap-1 mt-2">
                    <span className="w-1 h-1 bg-[#C8AA6E] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1 h-1 bg-[#C8AA6E] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1 h-1 bg-[#C8AA6E] rounded-full animate-bounce"></span>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
