import React, { useState } from 'react';
import axios from 'axios';
import { X, ArrowRightLeft, ShieldAlert, CheckCircle } from 'lucide-react';

const AdminTransferModal = ({ isOpen, onClose, onSuccess, API_BASE }) => {
    const [fromAccount, setFromAccount] = useState('');
    const [toAccount, setToAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [reference, setReference] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await axios.post(`${API_BASE}/api/staff/admin-transfer`, {
                fromAccount,
                toAccount,
                amount: parseFloat(amount),
                reference
            });
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
                setSuccess(false);
                setFromAccount('');
                setToAccount('');
                setAmount('');
                setReference('');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Transfer failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#000B1E]/90 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-12 shadow-2xl animate-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="mb-10 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
                        <ArrowRightLeft className="text-[#C8AA6E]" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-[#000B1E] mb-2 font-['Playfair_Display']">Institutional Transfer</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Administrative Liquidity Management</p>
                </div>

                {success ? (
                    <div className="py-12 text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                            <CheckCircle className="text-emerald-500" size={40} />
                        </div>
                        <h4 className="text-xl font-bold text-[#000B1E] mb-2">Settlement Finalized</h4>
                        <p className="text-slate-500 text-sm">Administrative ledger has been updated.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Source Account</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="ACC-XXX-XXX"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#C8AA6E]/20 focus:border-[#C8AA6E] outline-none transition-all placeholder:text-slate-300"
                                    value={fromAccount}
                                    onChange={(e) => setFromAccount(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Destination Account</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="ACC-YYY-YYY"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#C8AA6E]/20 focus:border-[#C8AA6E] outline-none transition-all placeholder:text-slate-300"
                                    value={toAccount}
                                    onChange={(e) => setToAccount(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Total Amount ($)</label>
                            <input
                                type="number"
                                required
                                min="0.01"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-2xl font-bold text-[#000B1E] focus:ring-2 focus:ring-[#C8AA6E]/20 focus:border-[#C8AA6E] outline-none transition-all placeholder:text-slate-200"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Audit Reference</label>
                            <input
                                type="text"
                                placeholder="Reason for administrative adjustment"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-[#C8AA6E]/20 focus:border-[#C8AA6E] outline-none transition-all placeholder:text-slate-300"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex gap-3 text-rose-600 animate-in slide-in-from-top-2">
                                <ShieldAlert size={18} />
                                <p className="text-[10px] font-bold uppercase tracking-widest leading-tight">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-[#000B1E] text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                        >
                            {isLoading ? 'Processing Settlement...' : 'Finalize Transfer'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminTransferModal;
