import React, { useEffect, useState } from 'react';
const BUILD_VERSION = "2.5.5"; // SYNC STATE HARDENING
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
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
            const historyPromise = api.get('/transactions/history')
                .then(res => setTransactions(res.data))
                .catch(err => console.error('History fetch failed', err));

            const profilePromise = api.get('/account/profile')
                .then(res => setAccountData(res.data))
                .catch(err => console.error('Profile fetch failed', err));

            const balancePromise = (balanceToken && accountBalance === undefined)
                ? api.get('/account/balance', { headers: { 'x-balance-token': balanceToken } })
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
        if (!pinEntry || pinEntry.length < 4) return;

        setPinError('');
        setIsLoading(true);
        try {
            // SINGLE-PHASE SECURE LINK: Balance returned in verify response
            const res = await api.post('/account/verify-pin', { pin: pinEntry });

            // Vault data injection
            setAccountBalance(res.data.balance);
            setBalanceToken(res.data.balanceToken);
            setIsBalanceVisible(true);
            setIsVerifyingPin(false);
            setPinEntry('');
        } catch (err) {
            console.error('Vault Link Error:', err);
            const serverMessage = err.response?.data?.message;
            const context = `[Network Status: ${err.message}]`;
            setPinError(serverMessage || `Vault Link Severed: Security layer blocking request. ${context}`);
        } finally {
            setIsLoading(false);
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
            {/* Dashboard Header - Densified */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C8AA6E]"></span>
                            <h1 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                                Global Wealth Portfolio
                            </h1>
                        </div>
                        <h2 className="text-3xl font-bold text-[#000B1E] tracking-tight font-['Playfair_Display']">
                            {user?.fullName}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-white px-5 py-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div>
                                <p className="text-[8px] font-bold uppercase tracking-wider text-slate-300 mb-0.5">Account Identification</p>
                                <p className="text-xs font-mono font-bold text-[#000B1E] tracking-widest leading-none">
                                    {isBalanceVisible ? accountData?.account_number || "ACC-••••-••••" : "ACC-••••-••••"}
                                </p>
                            </div>
                            <div
                                onClick={() => !isBalanceVisible && setIsVerifyingPin(true)}
                                className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 hover:text-[#C8AA6E] transition-colors cursor-pointer border border-slate-100"
                            >
                                {isBalanceVisible ? <Shield size={14} /> : <Eye size={14} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Metrics Grid - NEW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="metric-card">
                    <p className="metric-label">Credit Stratum</p>
                    <p className="metric-value">842 <span className="text-[8px] text-emerald-500 ml-1">+4 pts</span></p>
                </div>
                <div className="metric-card">
                    <p className="metric-label">Prestige Rewards</p>
                    <p className="metric-value">1.4M <span className="text-[8px] text-[#C8AA6E] ml-1">Pts</span></p>
                </div>
                <div className="metric-card">
                    <p className="metric-label">Portfolio Yield</p>
                    <p className="metric-value">12.4% <span className="text-[8px] text-emerald-500 ml-1">YTD</span></p>
                </div>
                <div className="metric-card">
                    <p className="metric-label">Market Index</p>
                    <p className="metric-value">$5,842.10 <span className="text-[8px] text-rose-500 ml-1">-0.1%</span></p>
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
                        {/* Prestige Balance Card - Densified */}
                        <div className="bg-[#000B1E] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-900/40 relative overflow-hidden group border border-white/5">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8AA6E]/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-[#C8AA6E]/10 duration-1000"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <p className="text-[#C8AA6E] font-bold uppercase tracking-[0.25em] text-[8px] mb-2 flex items-center gap-2">
                                            <Shield size={10} />
                                            Liquidity Reserve
                                        </p>
                                        <div className="flex items-baseline gap-2 group/balance relative">
                                            <span className="text-2xl text-[#C8AA6E] font-light font-['Playfair_Display']">$</span>
                                            <span className="text-5xl font-bold tracking-tighter font-['Playfair_Display'] block">
                                                {isBalanceVisible ? (
                                                    accountBalance !== undefined ? (
                                                        parseFloat(accountBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })
                                                    ) : (
                                                        <span className="animate-pulse opacity-50">SYNC...</span>
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
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8AA6E]">Reveal Assets</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                                        <TrendingUp className="w-6 h-6 text-[#C8AA6E]" />
                                    </div>
                                </div>

                                <div className="flex gap-4 items-center">
                                    <button onClick={() => setShowTransferModal(true)} className="px-6 py-3 rounded-xl bg-[#C8AA6E] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#B6965E] transition-all">
                                        Swift Transfer
                                    </button>
                                    <button onClick={() => setShowStatementsModal(true)} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest transition-all">
                                        Ledger
                                    </button>
                                    <div className="ml-auto flex items-center gap-2">
                                        <div className={clsx("w-1.5 h-1.5 rounded-full", isBalanceVisible ? "bg-emerald-500" : "bg-amber-500 animate-pulse")}></div>
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-[#C8AA6E]/80">
                                            {isBalanceVisible ? "Active Session" : "Vault Shielded"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Transactions Snippet - Densified */}
                        <div className="card-prestige !p-0 overflow-hidden shadow-2xl shadow-slate-200/50">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                                <h3 className="text-[#000B1E] font-bold text-lg tracking-tight font-['Playfair_Display']">Settlement Ledger</h3>
                                <button onClick={() => navigate('/transactions')} className="text-[10px] font-bold uppercase tracking-widest text-[#C8AA6E] hover:underline">View All</button>
                            </div>
                            <div className="px-8 pb-8">
                                <TransactionList transactions={Array.isArray(transactions) ? transactions.slice(0, 4) : []} currentUserEmail={user?.email} compact={true} />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Metrics & NEW Market Watch */}
                    <div className="space-y-6">
                        {/* Market Watch Widget */}
                        <div className="card-prestige !p-6">
                            <h3 className="text-[#000B1E] font-bold text-sm tracking-tight font-['Playfair_Display'] mb-4 flex items-center justify-between">
                                Market Watch
                                <span className="text-[8px] text-emerald-500 font-bold uppercase">Live</span>
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { symbol: "S&P 500", price: "5,842.10", change: "-0.12%", color: "text-rose-500" },
                                    { symbol: "NASDAQ", price: "18,674.30", change: "+0.45%", color: "text-emerald-500" },
                                    { symbol: "BTC/USD", price: "98,241.00", change: "+2.10%", color: "text-emerald-500" },
                                    { symbol: "GOLD", price: "2,741.50", change: "-0.05%", color: "text-rose-500" }
                                ].map((stock) => (
                                    <div key={stock.symbol} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="text-[10px] font-bold text-[#000B1E]">{stock.symbol}</span>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold leading-none mb-1">{stock.price}</p>
                                            <p className={`text-[8px] font-bold ${stock.color}`}>{stock.change}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card-prestige !p-6 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-[#C8AA6E] group-hover:bg-[#C8AA6E] group-hover:text-white transition-all duration-300">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <h3 className="text-[#000B1E] font-bold text-sm tracking-tight font-['Playfair_Display']">Security</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-slate-500 font-bold">Privacy</p>
                                    <span className={clsx("text-[8px] font-bold uppercase tracking-widest", isBalanceVisible ? "text-[#C8AA6E]" : "text-emerald-500")}>
                                        {isBalanceVisible ? "Active" : "Shielded"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-slate-500 font-bold">Session</p>
                                    <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">{balanceToken ? "Authenticated" : "Standard"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#C8AA6E] rounded-[2rem] p-8 text-white shadow-xl shadow-amber-900/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <h3 className="text-sm font-bold mb-4 font-['Playfair_Display']">Prestige AI</h3>
                            <p className="text-[10px] text-white/80 font-medium leading-relaxed mb-6 italic">
                                "Market conditions are optimal for institutional portfolio rebalancing."
                            </p>
                            <button onClick={() => navigate('/concierge')} className="w-full py-3 rounded-xl bg-[#000B1E] text-white text-[8px] font-bold uppercase tracking-widest shadow-lg shadow-black/20 hover:scale-[1.02] transition-all">Consult Oracle</button>
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
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-[2] py-4 bg-[#000B1E] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Authorizing...
                                        </>
                                    ) : 'Verify Identity'}
                                </button>
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
