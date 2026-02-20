import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Wallet,
    Receipt,
    Clock,
    ShieldCheck,
    AlertCircle,
    ArrowRight,
    Search,
    Filter,
    Zap
} from 'lucide-react';
import { clsx } from 'clsx';

const Bills = () => {
    const { user, API_BASE } = useAuth();
    const [bills, setBills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaying, setIsPaying] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/bills`);
            setBills(res.data);

            // If no bills exist, seed some for simulation
            if (res.data.length === 0) {
                await seedInitialBills();
            }
        } catch (err) {
            console.error('Failed to fetch bills');
        } finally {
            setIsLoading(false);
        }
    };

    const seedInitialBills = async () => {
        const initialBills = [
            { billerName: 'Metropolitan Grid', amount: 450.25, dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), category: 'Utilities' },
            { billerName: 'Prime Telecom', amount: 120.00, dueDate: new Date(Date.now() + 86400000 * 12).toISOString(), category: 'Services' },
            { billerName: 'Heritage Insurance', amount: 1250.00, dueDate: new Date(Date.now() + 86400000 * 8).toISOString(), category: 'Insurance' }
        ];

        try {
            for (const bill of initialBills) {
                await axios.post(`${API_BASE}/api/bills`, bill);
            }
            const res = await axios.get(`${API_BASE}/api/bills`);
            setBills(res.data);
        } catch (err) {
            console.error('Seeding failed');
        }
    };

    const handlePayBill = async (billId) => {
        setIsPaying(billId);
        setError(null);
        try {
            await axios.post(`${API_BASE}/api/bills/${billId}/pay`);
            await fetchBills();
        } catch (err) {
            setError(err.response?.data?.message || 'Institutional payment failed');
        } finally {
            setIsPaying(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#C8AA6E] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const unpaidBills = bills.filter(b => b.status === 'UNPAID');
    const totalDue = unpaidBills.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#C8AA6E]"></span>
                    <h1 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                        Liability Portfolio
                    </h1>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-4xl font-bold text-[#000B1E] tracking-tight font-['Playfair_Display']">
                            Institutional Payments
                        </h2>
                        <p className="text-slate-400 mt-1 font-bold text-[10px] uppercase tracking-widest">
                            Consolidated Utility & Service obligations
                        </p>
                    </div>

                    <div className="bg-[#000B1E] px-8 py-5 rounded-[2rem] border border-white/5 shadow-2xl shadow-indigo-900/40 text-white flex items-center gap-6">
                        <div>
                            <p className="text-[10px] font-bold text-[#C8AA6E] uppercase tracking-widest mb-0.5">Aggregate Liquidity Required</p>
                            <p className="text-2xl font-bold tracking-tight">${totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                            <Wallet className="text-[#C8AA6E]" size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                {/* Left: Pending Obligations */}
                <div className="xl:col-span-8 space-y-8">
                    <div className="flex items-center justify-between mb-2 px-2">
                        <h3 className="text-sm font-bold text-[#000B1E] uppercase tracking-widest flex items-center gap-2">
                            <Clock size={16} className="text-[#C8AA6E]" />
                            Pending Settlements
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Filter size={14} /> Sort by Due Date
                        </div>
                    </div>

                    {unpaidBills.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-100 shadow-sm">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck size={32} className="text-emerald-500" />
                            </div>
                            <h4 className="text-lg font-bold text-[#000B1E] font-['Playfair_Display'] mb-2">Portfolio Optimized</h4>
                            <p className="text-slate-400 text-xs">All institutional obligations have been cleared.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {unpaidBills.map(bill => (
                                <div key={bill.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-[#C8AA6E]/10 transition-colors">
                                        <Zap className="text-[#C8AA6E]" size={24} />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-bold text-[#000B1E]">{bill.biller_name}</h4>
                                            <span className="px-2.5 py-1 bg-slate-50 text-slate-400 text-[8px] font-bold uppercase tracking-widest rounded-lg border border-slate-100">
                                                {bill.category}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                <AlertCircle size={12} className="text-[#C8AA6E]" />
                                                Due in {Math.ceil((new Date(bill.due_date) - new Date()) / 86400000)} days
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                Ref: {bill.id.slice(0, 8).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right flex flex-col items-end gap-3 min-w-[150px]">
                                        <p className="text-xl font-bold text-[#000B1E]">${parseFloat(bill.amount).toFixed(2)}</p>
                                        <button
                                            onClick={() => handlePayBill(bill.id)}
                                            disabled={isPaying === bill.id}
                                            className="w-full px-6 py-3 bg-[#000B1E] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isPaying === bill.id ? 'Processing...' : (
                                                <>Pay Now <ArrowRight size={14} /></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex items-center gap-4 animate-in shake duration-500">
                            <AlertCircle className="text-rose-500 shrink-0" size={24} />
                            <p className="text-rose-600 text-[10px] font-bold uppercase tracking-widest">{error}</p>
                        </div>
                    )}
                </div>

                {/* Right: History & Insights */}
                <div className="xl:col-span-4 space-y-10">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-xs font-bold text-[#000B1E] uppercase tracking-widest mb-6 px-2">Verification Registry</h3>
                        <div className="space-y-6">
                            {bills.filter(b => b.status === 'PAID').slice(0, 4).map(bill => (
                                <div key={bill.id} className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <div className="flex-1 border-b border-slate-50 pb-4">
                                        <p className="text-[10px] font-bold text-[#000B1E] mb-0.5">{bill.biller_name}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Settled on {new Date(bill.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-xs font-bold text-[#000B1E] tracking-tighter">${parseFloat(bill.amount).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-4 border border-slate-100 rounded-2xl text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-colors">
                            View Historical Archive
                        </button>
                    </div>

                    <div className="bg-[#C8AA6E]/5 rounded-[2.5rem] p-8 border border-[#C8AA6E]/20">
                        <h4 className="font-bold text-[#000B1E] mb-3 flex items-center gap-2">
                            <ShieldCheck size={18} className="text-[#C8AA6E]" />
                            Institutional Guarantee
                        </h4>
                        <p className="text-slate-500 text-[10px] leading-relaxed">
                            Payments are processed via the **Chase Prestige Secure Backbone**. Authorized through atomic state verification to ensure zero-latency settlement and liquidity protection.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Bills;
