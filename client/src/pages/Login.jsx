import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Placeholder for the luxury image - using CSS gradient fallback until generation succeeds
// import LoginBg from '../assets/images/luxury_bank_pillars.webp'; 

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('CLIENT'); // CLIENT or STAFF
    const [isLoading, setIsLoading] = useState(false);
    const { login, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await login(identifier, password);
        setIsLoading(false);
        if (success) {
            navigate('/dashboard');
        }
    };

    const isStaff = role === 'STAFF';

    return (
        <div className="min-h-screen w-full flex bg-[#000B1E]">
            {/* LEFT COLUMN - LOGIN FORM */}
            <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center px-8 sm:px-12 lg:px-20 relative z-10">

                {/* Branding Header */}
                <div className="mb-16">
                    <div className="inline-flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#C8AA6E] to-[#B6965E] rounded-xl flex items-center justify-center shadow-2xl shadow-amber-900/20">
                            <span className="text-[#000B1E] font-bold text-3xl font-serif">C</span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white tracking-tight font-['Playfair_Display']">
                                CHASE <span className="text-[#C8AA6E]">PRESTIGE</span>
                            </h1>
                            <p className="text-[#C8AA6E]/60 text-[10px] uppercase tracking-[0.4em] font-bold mt-1 pl-1">
                                Institutional Access
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Container */}
                <div className="animate-in fade-in slide-in-from-left-4 duration-1000">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-white mb-3 font-['Playfair_Display']">
                            {isStaff ? 'Internal Clearance' : 'Welcome Back'}
                        </h2>
                        <p className="text-slate-400 font-light text-sm leading-relaxed max-w-sm">
                            {isStaff
                                ? 'Secure channel active. Biometric verification required for Level 4+ access.'
                                : 'Access your global portfolio with institutional-grade security.'}
                        </p>
                    </div>

                    {/* Role Toggles */}
                    <div className="flex gap-6 mb-10 border-b border-white/5 pb-6">
                        <button
                            onClick={() => setRole('CLIENT')}
                            className={clsx(
                                "text-[11px] font-bold uppercase tracking-widest pb-1 transition-all duration-300",
                                !isStaff
                                    ? "text-[#C8AA6E] border-b-2 border-[#C8AA6E]"
                                    : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            Client Portal
                        </button>
                        <button
                            onClick={() => setRole('STAFF')}
                            className={clsx(
                                "text-[11px] font-bold uppercase tracking-widest pb-1 transition-all duration-300",
                                isStaff
                                    ? "text-[#C8AA6E] border-b-2 border-[#C8AA6E]"
                                    : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            Staff Access
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <div className="group">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 group-focus-within:text-[#C8AA6E] transition-colors">
                                    {isStaff ? 'Clearance ID' : 'Identity'}
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-[#00163A]/50 border-b border-white/10 px-0 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-[#C8AA6E] transition-all font-medium"
                                    placeholder={isStaff ? "EMP-ID" : "Client ID / Email"}
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                />
                            </div>

                            <div className="group">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 group-focus-within:text-[#C8AA6E] transition-colors">
                                    Passkey
                                </label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-[#00163A]/50 border-b border-white/10 px-0 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-[#C8AA6E] transition-all font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold tracking-wide text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-6 bg-[#C8AA6E] hover:bg-[#B6965E] text-[#000B1E] font-bold text-xs uppercase tracking-[0.2em] rounded-none transition-all duration-500 shadow-2xl shadow-amber-900/20 hover:shadow-amber-900/40"
                        >
                            {isLoading ? 'Authenticating...' : 'Access Vault'}
                        </button>
                    </form>

                    {/* Pre-fills for Demo */}
                    <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-2 gap-4 opacity-40 hover:opacity-100 transition-opacity duration-500">
                        <button
                            onClick={() => { setIdentifier('john@bank.com'); setPassword('SecurePass123'); setRole('CLIENT'); }}
                            className="text-left"
                        >
                            <p className="text-[9px] text-[#C8AA6E] uppercase font-bold tracking-widest mb-1">Demo Client</p>
                            <p className="text-xs text-slate-400">john@bank.com</p>
                        </button>
                        <button
                            onClick={() => { setIdentifier('admin@bank.com'); setPassword('SecurePass123'); setRole('STAFF'); }}
                            className="text-left"
                        >
                            <p className="text-[9px] text-[#C8AA6E] uppercase font-bold tracking-widest mb-1">Demo Staff</p>
                            <p className="text-xs text-slate-400">admin@bank.com</p>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-8 left-8 lg:left-20 right-8 flex justify-between text-[9px] text-slate-600 uppercase tracking-widest font-bold">
                    <span>Server: US-EAST-1</span>
                    <span>v2.5.5 Secure</span>
                </div>
            </div>

            {/* RIGHT COLUMN - IMAGE */}
            <div className="hidden lg:block lg:w-[55%] xl:w-[60%] relative overflow-hidden bg-[#0A0A0A]">
                {/* The Luxury Image */}
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-105"
                    style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                    }}>
                </div>

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#000B1E] via-[#000B1E]/40 to-transparent"></div>
                <div className="absolute inset-0 bg-[#000B1E]/20"></div>

                {/* Content Overlay */}
                <div className="absolute bottom-20 left-20 max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    <h3 className="text-5xl font-bold text-white mb-6 font-['Playfair_Display'] leading-tight">
                        Legacy. <br />
                        <span className="text-[#C8AA6E]">Defined.</span>
                    </h3>
                    <p className="text-lg text-slate-300 font-light leading-relaxed border-l-2 border-[#C8AA6E] pl-6">
                        Chase Prestige offers an uncompromised banking experience for the select few.
                        Global reach, timeless security.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
