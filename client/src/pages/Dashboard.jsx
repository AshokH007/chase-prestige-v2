import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import TransactionList from '../components/TransactionList';
import TransferModal from '../components/TransferModal';
import StatementsModal from '../components/StatementsModal';
import {
    Shield,
    Eye,
    EyeOff,
    Lock,
    ChevronRight,
    Send,
    AlertCircle,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import { clsx } from 'clsx';

const Dashboard = ({ initialView = 'overview' }) => {
    const { user, sessionPin, API_BASE } = useAuth();
    const [accountData, setAccountData] = useState(null);
    const [accountBalance, setAccountBalance] = useState(undefined);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBalanceVisible, setIsBalanceVisible] = useState(false);
    const [isVerifyingPin, setIsVerifyingPin] = useState(false);
    const [pinEntry, setPinEntry] = useState('');
    const [balanceToken, setBalanceToken] = useState(null);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showStatementsModal, setShowStatementsModal] = useState(false);
    const [pinError, setPinError] = useState('');
    const isFrozen = user?.status === 'FROZEN';

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Independent promises for non-blocking hydration
            const historyPromise = axios.get(`${API_BASE}/api/transactions/history`)
                .then(res => setTransactions(res.data))
                .catch(err => console.error('History fetch failed', err));

            const profilePromise = axios.get(`${API_BASE}/api/account/profile`)
                .then(res => setAccountData(res.data))
                .catch(err => console.error('Profile fetch failed', err));

            const balancePromise = balanceToken
                ? axios.get(`${API_BASE}/api/account/balance`, { headers: { 'x-balance-token': balanceToken } })
                    .then(res => setAccountBalance(res.data.balance))
                    .catch(err => console.error('Balance fetch failed', err))
                : null;

            // Optional: wait for critical data if needed, but here we prefer reactive updates
            await Promise.allSettled([historyPromise, profilePromise, balancePromise].filter(Boolean));
        } catch (err) {
            console.error('Core hydration failure', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [API_BASE, balanceToken]);

    // Auto-lock flow
    useEffect(() => {
        let timer;
        if (balanceToken && isBalanceVisible) {
            // Set a timer to clear the token and hide the balance after 5 minutes
            timer = setTimeout(() => {
                setBalanceToken(null);
                setIsBalanceVisible(false);
                // Optionally notify user
            }, 5 * 60 * 1000);
        }
        return () => clearTimeout(timer);
    }, [balanceToken, isBalanceVisible]);

    const handlePinVerify = async (e) => {
        e.preventDefault();
        setPinError('');
        try {
            // 1. Secure verification to obtain the temporary balance token
            const res = await axios.post(`${API_BASE}/api/account/verify-pin`, { pin: pinEntry });
            const newToken = res.data.balanceToken;

            setBalanceToken(newToken);
            setIsBalanceVisible(true);
            setIsVerifyingPin(false);
            setPinEntry('');

            // 2. IMMEDIATE FETCH - Don't wait for the useEffect cycle
            const balanceRes = await axios.get(`${API_BASE}/api/account/balance`, {
                headers: { 'x-balance-token': newToken }
            });
            setAccountBalance(balanceRes.data.balance);
        } catch (err) {
            setPinError('Invalid Transaction PIN');
        }
    };

    if (isLoading && !accountData) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#C8AA6E] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-700">
            {/* Institutional Hold Alert */}
            {isFrozen && (
                <div className="mb-8 p-6 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-rose-900 uppercase tracking-tight">Institutional Account Restriction</h3>
                            <p className="text-xs text-rose-600 font-medium">Your account is currently under administrative hold. Please visit your local Chase Prestige branch for a compliance review.</p>
                        </div>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-widest">
                        Status: Frozen
                    </div>
                </div>
            )}
            {/* Account Header */}
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#C8AA6E]"></span>
                    <h1 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                        Private Banking Portfolio
                    </h1>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-4xl font-bold text-[#000B1E] tracking-tight font-['Playfair_Display']">
                            {user?.fullName}
                        </h2>
                        <p className="text-slate-400 mt-1 font-bold text-[10px] uppercase tracking-widest">
                            Portfolio ID: <span className="text-[#000B1E]">{user?.customerId}</span>
                        </p>
                    </div>
                    <div className="bg-white px-8 py-5 rounded-2xl border border-slate-100 shadow-sm self-start md:self-auto flex items-center gap-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-0.5">
                                Account Number
                            </p>
                            <p className="text-sm font-mono font-bold text-[#000B1E] tracking-widest">
                                {isBalanceVisible ? accountData?.account_number || "ACC-••••-••••" : "ACC-••••-••••"}
                            </p>
                        </div>
                        <div
                            onClick={() => !isBalanceVisible && setIsVerifyingPin(true)}
                            className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 hover:text-[#C8AA6E] transition-colors cursor-pointer border border-slate-100"
                        >
                            {isBalanceVisible ? <Shield size={16} /> : <Eye size={16} />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard or Transactions View */}
            {initialView === 'transactions' ? (
                <div className="space-y-12">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-4xl font-bold text-[#000B1E] tracking-tight font-['Playfair_Display']">Transaction Ledger</h2>
                            <p className="text-slate-400 mt-1 font-bold text-[10px] uppercase tracking-widest px-1">Audited Institutional History</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setShowTransferModal(true)} className="btn-prestige-gold h-12 flex items-center gap-2">
                                <Send size={14} /> Initiate Settlement
                            </button>
                            <button onClick={() => setShowStatementsModal(true)} className="px-6 py-3 rounded-xl border border-slate-100 bg-white text-[10px] font-bold uppercase tracking-widest text-[#C8AA6E] hover:bg-slate-50 transition-all">
                                Generate Statements
                            </button>
                        </div>
                    </div>

                    <div className="card-prestige !p-10 shadow-2xl shadow-slate-200/40 border border-slate-100/50">
                        <TransactionList transactions={transactions} currentUserEmail={user?.email} />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        {/* Prestige Balance Card */}
                        <div className="bg-[#000B1E] rounded-[3rem] p-12 text-white shadow-2xl shadow-indigo-900/40 relative overflow-hidden group border border-white/5">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8AA6E]/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-[#C8AA6E]/10 duration-1000"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-12">
                                    <div>
                                        <p className="text-[#C8AA6E] font-bold uppercase tracking-[0.25em] text-[10px] mb-2 flex items-center gap-2">
                                            <Shield size={12} />
                                            Total Liquidity
                                        </p>
                                        <div className="flex items-baseline gap-3 group/balance relative">
                                            <span className="text-3xl text-[#C8AA6E] font-light font-['Playfair_Display']">$</span>
                                            <span className="text-7xl font-bold tracking-tighter font-['Playfair_Display'] block min-w-[300px]">
                                                {isBalanceVisible ? (
                                                    accountBalance !== undefined ? (
                                                        parseFloat(accountBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })
                                                    ) : (
                                                        <span className="flex items-center gap-2">
                                                            <div className="w-8 h-8 border-2 border-[#C8AA6E] border-t-transparent rounded-full animate-spin"></div>
                                                            <span className="text-3xl opacity-50 uppercase tracking-widest">Hydrating...</span>
                                                        </span>
                                                    )
                                                ) : (
                                                    "••••••"
                                                )}
                                            </span>

                                            {!isBalanceVisible && (
                                                <button
                                                    onClick={() => setIsVerifyingPin(true)}
                                                    className="absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 group-hover:bg-white/10 transition-all overflow-hidden"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Eye size={20} className="text-[#C8AA6E]" />
                                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8AA6E]">Reveal Wealth</span>
                                                    </div>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                                        <svg className="w-8 h-8 text-[#C8AA6E]" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.82v-1.91c-1.54-.13-3.03-.66-4.32-1.58l1.32-2.11c1.07.72 2.3 1.14 3.51 1.21.94.05 1.7-.19 2.06-.55.33-.33.39-.77.21-1.22-.3-.72-1.12-1.2-3.15-2.06-2.26-.96-3.76-2.03-4.14-3.87-.21-1.01-.06-2 .5-2.85.69-1.04 1.83-1.68 3.09-1.89V3h2.82v1.89c1.23.1 2.36.42 3.33.94l-1.14 2.1c-.81-.4-1.63-.61-2.45-.63-.94-.03-1.64.21-2.02.6-.28.29-.38.64-.28 1.07.13.51.59.95 2.1 1.6 2.37.99 3.86 2.01 4.3 3.93.18.79.16 1.74-.1 2.51-.57 1.61-1.92 2.72-3.88 2.98z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="flex gap-6 items-center">
                                    <button onClick={() => setShowTransferModal(true)} className="btn-prestige-gold">
                                        Initiate Transfer
                                    </button>
                                    <button onClick={() => setShowStatementsModal(true)} className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest transition-all backdrop-blur-md">
                                        Statements
                                    </button>
                                    <div className="ml-auto flex items-center gap-2">
                                        <div className={clsx("w-2 h-2 rounded-full", isBalanceVisible ? "bg-emerald-500" : "bg-amber-500 animate-pulse")}></div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#C8AA6E]/80">
                                            {isBalanceVisible ? "Audited Visibility" : "Shielded Account"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Transactions Snippet */}
                        <div className="card-prestige !p-0 overflow-hidden shadow-2xl shadow-slate-200/50">
                            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                                <h3 className="text-[#000B1E] font-bold text-xl tracking-tight font-['Playfair_Display']">Recent Settlement Records</h3>
                            </div>
                            <div className="px-10 pb-10">
                                <TransactionList transactions={Array.isArray(transactions) ? transactions.slice(0, 5) : []} currentUserEmail={user?.email} />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Metrics */}
                    <div className="space-y-8">
                        <div className="card-prestige group">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#C8AA6E] group-hover:bg-[#C8AA6E] group-hover:text-white transition-all duration-300">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <h3 className="text-[#000B1E] font-bold text-lg tracking-tight font-['Playfair_Display']">Security Matrix</h3>
                            </div>
                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-slate-500 font-semibold">Balance Privacy</p>
                                    <span className={clsx("text-[10px] font-bold uppercase tracking-widest", isBalanceVisible ? "text-[#C8AA6E]" : "text-emerald-500")}>
                                        {isBalanceVisible ? "Visible" : "Shielded"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-slate-500 font-semibold">Session Token</p>
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{balanceToken ? "Active" : "Standard"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-slate-500 font-semibold">Institutional ID</p>
                                    <span className="text-[10px] font-bold text-[#C8AA6E] uppercase tracking-widest">Verified</span>
                                </div>
                            </div>
                            <button className="w-full mt-10 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                                Audit Security Log <ChevronRight size={12} />
                            </button>
                        </div>

                        <div className="bg-[#C8AA6E] rounded-[2.5rem] p-10 text-white shadow-xl shadow-amber-900/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <h3 className="text-lg font-bold mb-6 font-['Playfair_Display']">Prestige Advantage</h3>
                            <p className="text-xs text-white/80 font-medium leading-relaxed mb-8">
                                Experience exclusive benefits with Chase Prestige. Our AI-driven insights are analyzing your portfolio for optimization.
                            </p>
                            <button className="w-full py-4 rounded-2xl bg-[#000B1E] text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-black/20 hover:scale-[1.02] transition-all">Explore Benefits</button>
                        </div>
                    </div>
                </div>
            )}

            {/* PIN Verification Modal */}
            {isVerifyingPin && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#000B1E]/90 backdrop-blur-md" onClick={() => setIsVerifyingPin(false)}></div>
                    <div className="relative bg-white w-full max-w-sm rounded-[2rem] p-10 text-center shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-slate-100">
                            <Lock className="text-[#C8AA6E]" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-[#000B1E] mb-2 font-['Playfair_Display']">Secure Disclosure</h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6">Enter your 4-digit Transaction PIN</p>

                        {/* Just-in-Time Session Key Disclosure */}
                        {sessionPin && (
                            <div className="mb-6 p-4 bg-slate-900 rounded-2xl border border-[#C8AA6E]/20 text-left relative overflow-hidden">
                                <p className="text-[8px] font-bold text-[#C8AA6E] uppercase tracking-[0.2em] mb-1 relative z-10">Strategic Authorization Key</p>
                                <p className="text-sm font-bold text-white relative z-10">
                                    Your session key is: <span className="font-mono text-[#C8AA6E] text-lg bg-white/10 px-2 py-0.5 rounded ml-1">{sessionPin}</span>
                                </p>
                                <div className="absolute top-0 right-0 w-16 h-full bg-[#C8AA6E]/5 skew-x-[-20deg] translate-x-8"></div>
                            </div>
                        )}

                        <form onSubmit={handlePinVerify} className="space-y-6">
                            <input
                                type="password"
                                maxLength={4}
                                required
                                autoFocus
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 text-center text-3xl font-bold tracking-[1em] focus:ring-2 focus:ring-[#C8AA6E]/20 focus:border-[#C8AA6E] outline-none transition-all"
                                value={pinEntry}
                                onChange={(e) => setPinEntry(e.target.value)}
                            />
                            {pinError && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest">{pinError}</p>}
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setIsVerifyingPin(false)} className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Cancel</button>
                                <button type="submit" className="flex-[2] py-4 bg-[#000B1E] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-900/20">Verify Identity</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <TransferModal
                isOpen={showTransferModal}
                onClose={() => setShowTransferModal(false)}
                onSuccess={fetchData}
                API_BASE={API_BASE}
            />

            <StatementsModal
                isOpen={showStatementsModal}
                onClose={() => setShowStatementsModal(false)}
                API_BASE={API_BASE}
            />
        </div>
    );
};

export default Dashboard;
