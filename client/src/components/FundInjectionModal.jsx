import React, { useState } from 'react';
import axios from 'axios';

const FundInjectionModal = ({ isOpen, onClose, onSuccess, API_BASE, initialAccountNumber = '' }) => {
    const [formData, setFormData] = useState({ accountNumber: initialAccountNumber, amount: '', reference: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Sync initial account number if it changes (e.g. when clicking a specific user)
    React.useEffect(() => {
        if (initialAccountNumber) {
            setFormData(prev => ({ ...prev, accountNumber: initialAccountNumber }));
        }
    }, [initialAccountNumber]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await axios.post(`${API_BASE}/api/staff/deposit`, {
                accountNumber: formData.accountNumber,
                amount: parseFloat(formData.amount),
                reference: formData.reference || 'Manual Staff Injection'
            });
            setSuccess(true);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to inject funds');
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
                    {!success ? (
                        <>
                            <div className="mb-10">
                                <h3 className="text-2xl font-bold text-[#000B1E] font-['Playfair_Display']">Liquidity Management</h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Manual Portfolio Adjustment</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Portfolio Identifier</label>
                                    <input
                                        type="text" required
                                        value={formData.accountNumber}
                                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                        className="input-prestige font-mono uppercase"
                                        placeholder="ACC-XXX-XXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Liquidity Amount ($)</label>
                                    <input
                                        type="number" required step="0.01" min="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="input-prestige font-mono"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Institutional Reference</label>
                                    <input
                                        type="text"
                                        value={formData.reference}
                                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                        className="input-prestige"
                                        placeholder="e.g. Treasury Rebalance"
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
                                        className="flex-[2] px-8 py-5 rounded-2xl bg-[#C8AA6E] text-white font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-900/10 hover:bg-[#B6965E] transition-all disabled:opacity-50">
                                        {isLoading ? 'Injecting...' : 'Confirm Injection'}
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
                            <h3 className="text-2xl font-bold text-[#000B1E] mb-2 font-['Playfair_Display']">Adjustment Finalized</h3>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-10">Liquidity synchronized for <span className="text-[#C8AA6E]">{formData.accountNumber}</span></p>

                            <button
                                onClick={onClose}
                                className="w-full px-8 py-5 rounded-3xl bg-[#000B1E] text-white font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-slate-900 shadow-2xl shadow-indigo-900/20 transition-all active:scale-95">
                                Return to Console
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FundInjectionModal;
