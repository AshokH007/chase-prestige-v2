import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Landmark,
    Calculator,
    TrendingUp,
    ShieldCheck,
    ArrowRight,
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    FileEdit,
    AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';

const Loans = () => {
    const { API_BASE } = useAuth();
    const [loans, setLoans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);

    // Simulator State
    const [simAmount, setSimAmount] = useState(50000);
    const [simTerm, setSimTerm] = useState(24);

    const [purpose, setPurpose] = useState('');

    useEffect(() => {
        fetchLoans();
    }, []);

    const handleRequestExtension = async (loanId) => {
        const reason = prompt('Institutional Extension Request - Please state your reason:');
        if (!reason) return;
        try {
            await axios.post(`${API_BASE}/api/loans/${loanId}/extend`, { reason });
            await fetchLoans();
            alert('Extension request transmitted to credit committee.');
        } catch (err) {
            console.error('Extension request failed');
        }
    };

    const fetchLoans = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/loans`);
            setLoans(res.data);
        } catch (err) {
            console.error('Failed to fetch loans');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = async () => {
        setIsApplying(true);
        try {
            await axios.post(`${API_BASE}/api/loans/apply`, {
                amount: simAmount,
                termMonths: simTerm,
                purpose
            });
            await fetchLoans();
            setPurpose('');
        } catch (err) {
            console.error('Failed to apply for loan');
        } finally {
            setIsApplying(false);
        }
    };

    // Calculation Logic
    const apr = simAmount > 100000 ? 3.50 : 5.75;
    const monthlyRate = apr / 100 / 12;
    const monthlyPayment = (simAmount * monthlyRate * Math.pow(1 + monthlyRate, simTerm)) / (Math.pow(1 + monthlyRate, simTerm) - 1);
    const totalRepayment = monthlyPayment * simTerm;

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#C8AA6E] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#C8AA6E]"></span>
                    <h1 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                        Capital Markets
                    </h1>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-4xl font-bold text-[#000B1E] tracking-tight font-['Playfair_Display']">
                            Prestige Loan Center
                        </h2>
                        <p className="text-slate-400 mt-1 font-bold text-[10px] uppercase tracking-widest">
                            Institutional credit facilities & capital expansion
                        </p>
                    </div>

                    <div className="bg-white px-8 py-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Borrowing Power</p>
                            <p className="text-2xl font-bold tracking-tight text-[#000B1E]">$500,000.00</p>
                        </div>
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                            <TrendingUp className="text-[#C8AA6E]" size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Simulator Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 mb-12">
                {/* Left: Interactive Simulator */}
                <div className="xl:col-span-7 bg-[#000B1E] rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-900/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8AA6E]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                    <div className="relative z-10">
                        <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-10 text-[#C8AA6E]">
                            <Calculator size={18} />
                            Credit Simulator
                        </h3>

                        <div className="space-y-10">
                            {/* Amount Slider */}
                            <div>
                                <div className="flex justify-between items-end mb-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Capital Requirement</p>
                                    <p className="text-3xl font-bold font-['Playfair_Display']">${simAmount.toLocaleString()}</p>
                                </div>
                                <input
                                    type="range"
                                    min="10000"
                                    max="500000"
                                    step="5000"
                                    value={simAmount}
                                    onChange={(e) => setSimAmount(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#C8AA6E]"
                                />
                                <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                                    <span>$10k</span>
                                    <span>$500k</span>
                                </div>
                            </div>

                            {/* Term Selection */}
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Maturity Period (Months)</p>
                                <div className="grid grid-cols-4 gap-4">
                                    {[12, 24, 36, 48].map(term => (
                                        <button
                                            key={term}
                                            onClick={() => setSimTerm(term)}
                                            className={clsx(
                                                "py-3 rounded-xl text-xs font-bold transition-all border",
                                                simTerm === term
                                                    ? "bg-[#C8AA6E] border-[#C8AA6E] text-white shadow-lg"
                                                    : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                                            )}
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Application Footer */}
                            <div className="pt-10 border-t border-white/10">
                                <div className="flex items-center gap-4 mb-6">
                                    <input
                                        type="text"
                                        placeholder="Purpose of Funding (e.g., Venture Expansion)"
                                        value={purpose}
                                        onChange={(e) => setPurpose(e.target.value)}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-[#C8AA6E] outline-none transition-all"
                                    />
                                    <button
                                        onClick={handleApply}
                                        disabled={isApplying}
                                        className="bg-[#C8AA6E] text-[#000B1E] px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#D4C094] transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 disabled:opacity-50"
                                    >
                                        Apply Now <ArrowRight size={14} />
                                    </button>
                                </div>
                                <p className="text-[9px] text-slate-500 leading-relaxed italic">
                                    Applications are subject to institutional review. Initial APR set at {apr}% for simulated liquidity tiers.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Real-time Projection */}
                <div className="xl:col-span-5 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-[#000B1E] uppercase tracking-widest mb-10 flex items-center gap-2">
                            <TrendingUp size={16} className="text-[#C8AA6E]" />
                            Financial Projection
                        </h3>

                        <div className="space-y-8">
                            <div className="flex justify-between items-center pb-6 border-b border-slate-50">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Settlement</p>
                                    <p className="text-2xl font-bold text-[#000B1E]">${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Locked APR</p>
                                    <p className="text-xl font-bold text-[#C8AA6E]">{apr}%</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Repayment</span>
                                    <span className="text-sm font-bold text-[#000B1E]">${totalRepayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interest Accumulation</span>
                                    <span className="text-sm font-bold text-rose-500">${(totalRepayment - simAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="text-[#C8AA6E]" size={20} />
                            <h4 className="text-[10px] font-bold text-[#000B1E] uppercase tracking-widest">Institutional Assurance</h4>
                        </div>
                        <p className="text-[9px] text-slate-400 leading-relaxed uppercase tracking-tight">
                            Fixed rate guaranteed for the duration of the term. No hidden settlement fees. High-tier capital priority status granted.
                        </p>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-bold text-[#000B1E] uppercase tracking-widest flex items-center gap-2">
                        <Landmark size={18} className="text-[#C8AA6E]" />
                        Loan Portfolio
                    </h3>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Pending</div>
                        <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active</div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identifier</th>
                                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capital</th>
                                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Maturity</th>
                                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">EMI</th>
                                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Purpose</th>
                                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loans.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                                        No active facilities discovered.
                                    </td>
                                </tr>
                            ) : (
                                loans.map(loan => (
                                    <tr key={loan.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-5 font-mono text-[10px] font-bold text-[#000B1E]">{loan.id.slice(0, 8).toUpperCase()}</td>
                                        <td className="py-5 text-sm font-bold text-[#000B1E]">${parseFloat(loan.amount).toLocaleString()}</td>
                                        <td className="py-5 text-[10px] font-bold text-slate-500 uppercase">{loan.term_months} Mo</td>
                                        <td className="py-5 text-sm font-bold text-[#000B1E]">
                                            ${parseFloat(loan.monthly_emi || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-5 text-[10px] font-bold text-slate-500 uppercase max-w-[150px] truncate">{loan.purpose}</td>
                                        <td className="py-5">
                                            <div className={clsx(
                                                "px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5",
                                                loan.status === 'PENDING' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                    loan.status === 'APPROVED' || loan.status === 'REPAYMENT' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                        loan.status === 'EXTENSION_REQUESTED' ? "bg-indigo-50 text-indigo-600 border border-indigo-100" :
                                                            "bg-slate-50 text-slate-400 border border-slate-100"
                                            )}>
                                                {loan.status === 'PENDING' ? <Clock size={10} /> :
                                                    loan.status === 'EXTENSION_REQUESTED' ? <AlertCircle size={10} /> :
                                                        <CheckCircle2 size={10} />}
                                                {loan.status}
                                            </div>
                                        </td>
                                        <td className="py-5 text-right">
                                            {loan.status === 'APPROVED' || loan.status === 'REPAYMENT' ? (
                                                <button
                                                    onClick={() => handleRequestExtension(loan.id)}
                                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                                                    title="Request Extension"
                                                >
                                                    <FileEdit size={16} />
                                                </button>
                                            ) : (
                                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter italic">No Actions</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Loans;
