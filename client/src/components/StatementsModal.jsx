import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, FileText, Download, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

const StatementsModal = ({ isOpen, onClose, API_BASE }) => {
    const [statements, setStatements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            const fetchStatements = async () => {
                try {
                    const res = await axios.get(`${API_BASE}/api/transactions/statements`);
                    setStatements(res.data);
                } catch (err) {
                    console.error('Failed to fetch statements');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchStatements();
        }
    }, [isOpen, API_BASE]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#000B1E]/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white w-full max-w-4xl h-[80vh] rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500 flex flex-col">
                {/* Header */}
                <div className="bg-[#000B1E] p-10 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-[#C8AA6E]/20 rounded-2xl flex items-center justify-center border border-[#C8AA6E]/30">
                            <FileText size={28} className="text-[#C8AA6E]" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold font-['Playfair_Display'] tracking-tight">Institutional Statements</h3>
                            <p className="text-[#C8AA6E] text-xs font-bold uppercase tracking-[0.2em] mt-1">Audited Transaction Ledger (Last 30 Days)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                            <Download size={14} />
                            Export PDF
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                            <div className="w-10 h-10 border-4 border-[#C8AA6E] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compiling Records...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {statements.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                                            <th className="pb-6 px-4">Date / Identifier</th>
                                            <th className="pb-6 px-4">Entity / Reference</th>
                                            <th className="pb-6 px-4">Type</th>
                                            <th className="pb-6 px-4 text-right">Amount (USD)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {statements.map((st) => {
                                            const isDebit = st.flow === 'DEBIT';
                                            return (
                                                <tr key={st.id} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-6 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={clsx(
                                                                "w-2 h-2 rounded-full",
                                                                isDebit ? "bg-rose-400 shadow-sm shadow-rose-200" : "bg-emerald-400 shadow-sm shadow-emerald-200"
                                                            )}></div>
                                                            <div>
                                                                <p className="text-xs font-bold text-[#000B1E]">{new Date(st.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                                <p className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">ID: {st.id.split('-')[0]}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-4">
                                                        <p className="text-xs font-bold text-[#000B1E]">{st.counterparty_name || 'Chase Institutional'}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium italic">{st.reference}</p>
                                                    </td>
                                                    <td className="py-6 px-4">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{st.type}</span>
                                                    </td>
                                                    <td className={clsx(
                                                        "py-6 px-4 text-right font-mono font-bold text-sm",
                                                        isDebit ? "text-rose-500" : "text-emerald-500"
                                                    )}>
                                                        {isDebit ? '-' : '+'}{parseFloat(st.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center gap-4 text-slate-400">
                                    <Calendar size={48} className="opacity-20" />
                                    <p className="text-sm font-bold uppercase tracking-widest">No statements available for this period</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-50 bg-slate-50/30 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#C8AA6E]"></div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Bank Record • Chase Prestige Global</p>
                        </div>
                        <p className="text-[10px] font-bold text-slate-300">ISO-20022 Compliant Transmission</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatementsModal;
