import React, { useState } from 'react';
import axios from 'axios';

const OnboardCustomerModal = ({ isOpen, onClose, onSuccess, API_BASE }) => {
    const [formData, setFormData] = useState({ fullName: '', email: '', initialDeposit: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_BASE}/api/staff/create-customer`, {
                ...formData,
                initialDeposit: parseFloat(formData.initialDeposit) || 0
            });
            setResult(res.data);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to onboard customer');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000B1E]/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl shadow-indigo-900/40 relative overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100">
                {/* Prestige Header Decoration */}
                <div className="h-2 bg-[#000B1E]"></div>
                <div className="absolute top-2 left-0 w-full h-[1px] bg-[#C8AA6E]/30"></div>

                <div className="p-10">
                    {!result ? (
                        <>
                            <div className="mb-10">
                                <h3 className="text-2xl font-bold text-[#000B1E] font-['Playfair_Display']">Client Onboarding</h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Initiating New Global Identity</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Principal Name</label>
                                    <input
                                        type="text" required
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="input-prestige"
                                        placeholder="Full Legal Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Secure Correspondence</label>
                                    <input
                                        type="email" required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="input-prestige"
                                        placeholder="email@prestige-global.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Initial Asset Allocation ($)</label>
                                    <input
                                        type="number"
                                        value={formData.initialDeposit}
                                        onChange={(e) => setFormData({ ...formData, initialDeposit: e.target.value })}
                                        className="input-prestige font-mono"
                                        placeholder="0.00"
                                    />
                                </div>

                                {error && <p className="text-rose-500 text-[10px] font-bold text-center bg-rose-50 py-3 rounded-xl border border-rose-100">{error}</p>}

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button" onClick={onClose}
                                        className="flex-1 px-8 py-5 rounded-2xl border border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors">
                                        Abort
                                    </button>
                                    <button
                                        type="submit" disabled={isLoading}
                                        className="flex-[2] px-8 py-5 rounded-2xl bg-[#000B1E] text-white font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/20 hover:bg-slate-900 transition-all disabled:opacity-50">
                                        {isLoading ? 'Processing...' : 'Verify & Onboard'}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-6 animate-in slide-in-from-bottom-4">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-[#000B1E] mb-2 font-['Playfair_Display']">Authentication Successful</h3>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-10">Principal ID <span className="text-[#C8AA6E]">{result.user.customer_id}</span> Active</p>

                            <div className="bg-slate-50/50 rounded-3xl p-8 text-left space-y-4 border border-slate-100 mb-10">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] uppercase font-bold text-slate-300 tracking-widest">Global Account</span>
                                    <span className="text-xs font-mono font-bold text-[#000B1E] tracking-widest">{result.user.account_number}</span>
                                </div>
                                <div className="h-[1px] bg-slate-100 w-full"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] uppercase font-bold text-slate-300 tracking-widest">Access Key</span>
                                    <span className="text-xs font-bold text-[#C8AA6E]">{result.defaultPassword}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] uppercase font-bold text-slate-300 tracking-widest">Auth PIN</span>
                                    <span className="text-xs font-bold text-[#C8AA6E]">{result.defaultPin || '1234'}</span>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full px-8 py-5 rounded-3xl bg-[#000B1E] text-white font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-slate-900 shadow-2xl shadow-indigo-900/20 transition-all active:scale-95">
                                Finalize & Sync
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardCustomerModal;
