timport React, { useState } from 'react';
import axios from 'axios';
import { X, Send, User, Hash, Info } from 'lucide-react';
import { clsx } from 'clsx';

const TransferModal = ({ isOpen, onClose, onSuccess, API_BASE }) => {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [reference, setReference] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await axios.post(`${API_BASE}/api/transactions/transfer`, {
                receiverIdentifier: recipient,
                amount: parseFloat(amount),
                reference: reference || 'Institutional Transfer'
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Transfer failed. Verify recipient details.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#000B1E]/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-[#000B1E] p-8 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold font-['Playfair_Display']">Initiate Transfer</h3>
                        <p className="text-[#C8AA6E] text-[10px] font-bold uppercase tracking-widest mt-1">Global Settlement Engine</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
                            <Info size={16} />
                            <p className="text-[10px] font-bold uppercase tracking-wider">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Recipient Identity</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    type="text"
                                    required
                                    placeholder="Account #, Email, or Customer ID"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:ring-2 focus:ring-[#C8AA6E]/20 focus:border-[#C8AA6E] outline-none transition-all placeholder:text-slate-300"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Amount (USD)</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 font-['Playfair_Display'] text-[#C8AA6E] font-bold">$</div>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="0.00"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-10 pr-6 text-xl font-bold focus:ring-2 focus:ring-[#C8AA6E]/20 focus:border-[#C8AA6E] outline-none transition-all placeholder:text-slate-200"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Reference (Optional)</label>
                            <input
                                type="text"
                                placeholder="Purpose of transaction"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-medium focus:ring-2 focus:ring-[#C8AA6E]/20 focus:border-[#C8AA6E] outline-none transition-all placeholder:text-slate-300"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 px-6 rounded-2xl bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-[2] py-4 px-6 rounded-2xl bg-[#000B1E] text-white text-xs font-bold uppercase tracking-widest shadow-xl shadow-indigo-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:scale-100"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Execute Transfer</span>
                                    <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransferModal;
