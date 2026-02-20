const TransactionList = ({ transactions, currentUserEmail }) => {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="py-20 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Zero Historical Records Identified</p>
                <p className="text-slate-300 text-[9px] mt-1 font-medium">Global ledger is currently up to date.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {transactions.map((t) => {
                const isDebit = t.type === 'TRANSFER' && t.sender_id === transactions[0]?.sender_id; // Simple heuristic for now

                return (
                    <div key={t.id} className="flex items-center justify-between p-6 rounded-2xl bg-white border border-slate-50 hover:border-[#C8AA6E]/20 transition-all group hover:shadow-lg hover:shadow-slate-100 hover:-translate-y-0.5">
                        <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${t.type === 'TRANSFER' ? 'bg-[#000B1E]/5 text-[#000B1E]' : 'bg-emerald-50 text-emerald-600'}`}>
                                {t.type === 'TRANSFER' ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#000B1E] group-hover:text-[#C8AA6E] transition-colors">
                                    {t.type === 'TRANSFER' ? (t.receiver_name ? `Remittance to ${t.receiver_name}` : 'External Transfer') : 'Asset Liquidity Deposit'}
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                    {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • REF: {t.reference?.slice(0, 8) || 'PRESTIGE-001'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`text-sm font-bold ${isDebit ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {isDebit ? '-' : '+'}${parseFloat(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                            <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">{t.status}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TransactionList;
