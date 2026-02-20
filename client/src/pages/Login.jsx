import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';

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
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#F9FAFB]">
            <div className="max-w-md w-full animate-in fade-in duration-1000">
                {/* Branding Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-[#000B1E] rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/20 group">
                            <span className="text-[#C8AA6E] font-bold text-2xl group-hover:scale-110 transition-transform">C</span>
                        </div>
                        <h1 className="text-3xl font-bold text-[#000B1E] tracking-tight font-['Playfair_Display']">
                            CHASE <span className="text-[#C8AA6E]">PRESTIGE</span>
                        </h1>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                        <span className="h-px bg-slate-200 flex-1"></span>
                        <span>Global Banking</span>
                        <span className="h-px bg-slate-200 flex-1"></span>
                    </div>
                </div>

                {/* Role Switcher (Prestige Style) */}
                <div className="flex justify-center mb-10">
                    <div className="bg-white p-1.5 rounded-2xl flex gap-1 shadow-sm border border-slate-100">
                        <button
                            onClick={() => setRole('CLIENT')}
                            className={clsx(
                                "px-8 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all duration-500",
                                !isStaff ? "bg-[#000B1E] text-white shadow-xl shadow-indigo-900/20" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Client
                        </button>
                        <button
                            onClick={() => setRole('STAFF')}
                            className={clsx(
                                "px-8 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all duration-500",
                                isStaff ? "bg-[#C8AA6E] text-white shadow-xl shadow-amber-900/20" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Staff Portal
                        </button>
                    </div>
                </div>

                <div className="card-prestige !p-10 border border-slate-100/50 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-[#000B1E]"></div>
                    {isStaff && <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#000B1E] to-[#C8AA6E]"></div>}

                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-[#000B1E] mb-1 font-['Playfair_Display']">
                            {isStaff ? 'Personnel Verification' : 'Welcome Client'}
                        </h3>
                        <p className="text-slate-400 text-[11px] font-medium leading-relaxed">
                            {isStaff
                                ? 'Audit logs are active for this session. Use biometric-backed secondary ID if required.'
                                : 'Access your global portfolio with institutional-grade security.'
                            }
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                                {isStaff ? 'Clearance ID / Alias' : 'Client Identifier'}
                            </label>
                            <input
                                type="text"
                                required
                                className="input-prestige"
                                placeholder={isStaff ? "EMP-XXX" : "Email or Account ID"}
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                                Private Passkey
                            </label>
                            <input
                                type="password"
                                required
                                className="input-prestige"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold text-center animate-in shake duration-300">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={clsx(
                                "w-full py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl",
                                isStaff
                                    ? "bg-[#C8AA6E] text-white hover:bg-[#B6965E] shadow-amber-900/10"
                                    : "bg-[#000B1E] text-white hover:bg-slate-900 shadow-indigo-900/10"
                            )}
                        >
                            {isLoading ? 'Verifying Credentials...' : 'Sign In Securely'}
                        </button>
                    </form>

                    {/* Quick Access Section */}
                    <div className="mt-10">
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest text-center mb-4">Institutional Quick Access</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => { setIdentifier('john@bank.com'); setPassword('SecurePass123'); setRole('CLIENT'); }}
                                className="flex-1 py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#000B1E] hover:text-[#000B1E] text-slate-400 text-[9px] font-bold uppercase tracking-widest transition-all"
                            >
                                Client Pre-fill
                            </button>
                            <button
                                onClick={() => { setIdentifier('admin@bank.com'); setPassword('SecurePass123'); setRole('STAFF'); }}
                                className="flex-1 py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#C8AA6E] hover:text-[#C8AA6E] text-slate-400 text-[9px] font-bold uppercase tracking-widest transition-all"
                            >
                                Staff Pre-fill
                            </button>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        <button className="hover:text-[#C8AA6E] transition-colors">Inquire Access</button>
                        <button className="hover:text-[#C8AA6E] transition-colors font-mono">F-ID: 8824</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
