import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { clsx } from 'clsx';
import OnboardCustomerModal from '../components/OnboardCustomerModal';
import FundInjectionModal from '../components/FundInjectionModal';
import AdminTransferModal from '../components/AdminTransferModal';
import { RiskAssessmentModal, ComplianceAuditModal } from '../components/AdminToolModals';
import {
    Users,
    ShieldCheck,
    Activity,
    FileText,
    Lock,
    BarChart3,
    Check,
    X,
    Clock,
    UserCircle,
    BadgeDollarSign
} from 'lucide-react';

const WorkerDashboard = ({ initialView = 'metrics' }) => {
    const { API_BASE } = useAuth();
    const [view, setView] = useState(initialView);
    const [customers, setCustomers] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [operationalLogs, setOperationalLogs] = useState([]);
    const [pendingLoans, setPendingLoans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showFundModal, setShowFundModal] = useState(false);
    const [showAdminTransferModal, setShowAdminTransferModal] = useState(false);
    const [showRiskModal, setShowRiskModal] = useState(false);
    const [showComplianceModal, setShowComplianceModal] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState('');

    useEffect(() => {
        setView(initialView);
    }, [initialView]);

    useEffect(() => {
        if (view === 'metrics') {
            fetchMetrics();
            fetchLogs();
        } else if (view === 'users') {
            fetchCustomers();
        }
    }, [view]);

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/api/staff/users`);
            setCustomers(res.data || []);
        } catch (err) {
            console.error('Failed to fetch customers');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMetrics = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/staff/metrics`);
            setMetrics(res.data);
        } catch (err) {
            console.error('Failed to fetch metrics');
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/staff/logs`);
            setOperationalLogs(res.data || []);
        } catch (err) {
            console.error('Failed to fetch logs');
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        const nextStatus = currentStatus === 'FROZEN' ? 'ACTIVE' : 'FROZEN';
        try {
            await axios.post(`${API_BASE}/api/staff/toggle-status/${userId}`, { status: nextStatus });
            fetchCustomers(); // Refresh list
        } catch (err) {
            console.error('Failed to toggle status');
        }
    };

    const fetchPendingLoans = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/staff/loans/queue`);
            setPendingLoans(res.data);
        } catch (err) {
            console.error('Failed to fetch credit queue');
        }
    };

    const handleLoanDecision = async (loanId, status) => {
        try {
            await axios.post(`${API_BASE}/api/staff/loans/${loanId}/decision`, { status });
            fetchPendingLoans();
            fetchMetrics();
        } catch (err) {
            console.error('Failed to process loan decision');
        }
    };

    useEffect(() => {
        if (view === 'credit') {
            fetchPendingLoans();
        }
    }, [view]);

    const stats = [
        { label: 'Total Clients', value: metrics?.totalClients?.toLocaleString() || '...', grow: '+12%' },
        { label: 'Security Audits', value: metrics?.securityAudits || 'None', grow: 'Secure' },
        { label: 'System Uptime', value: metrics?.uptime || '99.9%', grow: 'Optimal' },
        { label: 'Treasury Liquid', value: metrics?.totalLiquidity ? `$${metrics.totalLiquidity.toLocaleString()}` : '...', grow: '+2.4%' }
    ];

    return (
        <div className="animate-in fade-in duration-700">
            {view === 'metrics' ? (
                <>
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-[#000B1E] tracking-tight font-['Playfair_Display']">Executive Overview</h2>
                        <p className="text-slate-400 text-sm mt-1">Global performance metrics for Chase Prestige</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                        {stats.map((stat) => (
                            <div key={stat.label} className="card-prestige group hover:border-[#C8AA6E]/30 cursor-default">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">{stat.label}</p>
                                <div className="flex items-baseline justify-between">
                                    <h3 className="text-2xl font-bold text-[#000B1E]">{stat.value}</h3>
                                    <span className="text-[10px] font-bold text-[#C8AA6E] bg-[#C8AA6E]/10 px-2 py-0.5 rounded-full">{stat.grow}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 card-prestige">
                            <h3 className="text-lg font-bold text-[#000B1E] mb-8 font-['Playfair_Display']">Operational Activity</h3>
                            <div className="space-y-6">
                                {operationalLogs.length > 0 ? operationalLogs.slice(0, 5).map((log, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-[#C8AA6E]"></div>
                                            <div>
                                                <p className="text-sm font-bold text-[#000B1E]">
                                                    {log.type === 'TRANSFER' ? `${log.sender_name} → ${log.receiver_name}` : log.type}
                                                </p>
                                                <p className="text-xs text-slate-500 font-medium">
                                                    {log.reference || 'System Transaction'} • ${parseFloat(log.amount).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                )) : (
                                    <div className="p-10 text-center italic text-slate-400 text-sm">Synchronizing operational feed...</div>
                                )}
                            </div>
                        </div>

                        <div className="bg-[#000B1E] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-900/40 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8AA6E]/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-[#C8AA6E]/20"></div>
                            <h3 className="text-lg font-bold mb-8 font-['Playfair_Display'] relative z-10">Institutional Controls</h3>
                            <div className="space-y-4 relative z-10">
                                <button onClick={() => setShowRiskModal(true)} className="w-full text-left px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest transition-all">
                                    Risk Assessment
                                </button>
                                <button onClick={() => setShowComplianceModal(true)} className="w-full text-left px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest transition-all">
                                    Compliance Audit
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await axios.get(`${API_BASE}/api/staff/export-ledger`);
                                            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
                                            const downloadAnchorNode = document.createElement('a');
                                            downloadAnchorNode.setAttribute("href", dataStr);
                                            downloadAnchorNode.setAttribute("download", `chase_prestige_ledger_${new Date().toISOString()}.json`);
                                            document.body.appendChild(downloadAnchorNode);
                                            downloadAnchorNode.click();
                                            downloadAnchorNode.remove();
                                        } catch (err) {
                                            alert('Export failed');
                                        }
                                    }}
                                    className="w-full text-left px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest transition-all"
                                >
                                    Ledger Export
                                </button>
                                <button
                                    onClick={() => setShowAdminTransferModal(true)}
                                    className="w-full text-left px-6 py-4 rounded-2xl bg-[#C8AA6E]/20 hover:bg-[#C8AA6E]/30 border border-[#C8AA6E]/30 text-xs font-bold uppercase tracking-widest transition-all text-[#C8AA6E]"
                                >
                                    Inter-Client Transfer
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : view === 'users' ? (
                <div className="card-prestige !p-0 overflow-hidden shadow-2xl shadow-slate-200/60">
                    <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <div>
                            <h3 className="text-[#000B1E] font-bold text-2xl font-['Playfair_Display']">Client Directory</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.15em] mt-1">Institutional Liquidity Management</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-prestige">
                            + New Account
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
                                    <th className="px-10 py-6 tracking-[0.2em]">Client Name</th>
                                    <th className="px-10 py-6 tracking-[0.2em]">Security ID</th>
                                    <th className="px-10 py-6 tracking-[0.2em]">Portfolio</th>
                                    <th className="px-10 py-6 tracking-[0.2em]">Status</th>
                                    <th className="px-10 py-6 tracking-[0.2em]">Clearance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {customers.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50/40 transition-colors group border-b border-slate-50 last:border-0">
                                        <td className="px-10 py-8">
                                            <p className="text-sm font-bold text-[#000B1E]">{c.full_name}</p>
                                            <p className="text-xs text-slate-400 font-medium">{c.email}</p>
                                        </td>
                                        <td className="px-10 py-8 font-mono text-xs text-slate-500 font-bold uppercase tracking-wider">
                                            {c.account_number}
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-sm font-bold text-[#000B1E]">${parseFloat(c.balance).toLocaleString()}</p>
                                            <p className="text-[10px] text-emerald-500 font-bold uppercase">Settled</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2">
                                                <div className={clsx(
                                                    "w-1.5 h-1.5 rounded-full shadow-sm",
                                                    c.status === 'FROZEN' ? "bg-rose-500 shadow-rose-200" : "bg-emerald-500 shadow-emerald-200"
                                                )}></div>
                                                <span className="text-slate-900 text-[10px] font-bold uppercase tracking-widest">
                                                    {c.status || 'Active'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedAccount(c.account_number);
                                                    setShowFundModal(true);
                                                }}
                                                className="text-[#C8AA6E] hover:text-[#B6965E] text-[10px] font-bold uppercase tracking-widest bg-[#C8AA6E]/10 px-4 py-2 rounded-xl transition-all hover:bg-[#C8AA6E]/20 active:scale-95">
                                                Inject Funds
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(c.id, c.status || 'ACTIVE')}
                                                className={clsx(
                                                    "text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all active:scale-95",
                                                    c.status === 'FROZEN'
                                                        ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                                                        : "bg-rose-100 text-rose-600 hover:bg-rose-200"
                                                )}
                                            >
                                                {c.status === 'FROZEN' ? 'Unfreeze' : 'Freeze'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {customers.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-20 text-center">
                                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No Client Records Identified</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : view === 'compliance' ? (
                <div className="card-prestige !p-10">
                    <h3 className="text-2xl font-bold text-[#000B1E] mb-8 font-['Playfair_Display']">Institutional Compliance</h3>
                    <div className="space-y-4">
                        {[
                            { title: 'KYC Document Verification', status: 'Compliant', date: '2024-02-18' },
                            { title: 'AML Transaction Screening', status: 'Active', date: '2024-02-20' },
                            { title: 'Asset Liability Ratio', status: 'Within Range', date: '2024-02-15' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-100">
                                <div>
                                    <p className="text-sm font-bold text-[#000B1E]">{item.title}</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Last Audit: {item.date}</p>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">{item.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : view === 'credit' ? (
                <div className="space-y-12">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-[#000B1E] tracking-tight font-['Playfair_Display']">Institutional Credit Queue</h2>
                            <p className="text-slate-400 text-sm mt-1">Sovereign Authority & Facility Underwriting</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {pendingLoans.length > 0 ? pendingLoans.map(loan => (
                            <div key={loan.id} className="card-prestige !p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 group">
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-[#C8AA6E]/10 transition-colors">
                                        <BadgeDollarSign className="text-[#C8AA6E]" size={28} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="text-lg font-bold text-[#000B1E]">{loan.full_name}</h4>
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                                                ID: {loan.id.slice(0, 8)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium mb-3">{loan.email} • {loan.purpose}</p>
                                        <div className="flex items-center gap-6">
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Capital Facility</p>
                                                <p className="text-base font-bold text-[#000B1E]">${parseFloat(loan.amount).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Maturity</p>
                                                <p className="text-base font-bold text-slate-600">{loan.term_months} Months</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Application Status</p>
                                                <div className={clsx(
                                                    "text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                                                    loan.status === 'EXTENSION_REQUESTED' ? "text-indigo-500" : "text-amber-500"
                                                )}>
                                                    <Clock size={12} /> {loan.status}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleLoanDecision(loan.id, 'REJECTED')}
                                        className="h-14 px-8 rounded-2xl border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all flex items-center gap-3 group/btn"
                                    >
                                        <X size={18} className="group-hover/btn:scale-110 transition-transform" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Decline</span>
                                    </button>
                                    <button
                                        onClick={() => handleLoanDecision(loan.id, 'APPROVED')}
                                        className="h-14 px-8 rounded-2xl bg-[#000B1E] text-white hover:bg-slate-900 transition-all flex items-center gap-3 group/btn shadow-xl shadow-indigo-900/20"
                                    >
                                        <Check size={18} className="text-[#C8AA6E] group-hover/btn:scale-110 transition-transform" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Approve Capital</span>
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="card-prestige !py-32 flex flex-col items-center justify-center text-center">
                                <Activity className="text-slate-100 mb-6" size={64} />
                                <h3 className="text-lg font-bold text-slate-300 uppercase tracking-widest">No Pending Underwritings</h3>
                                <p className="text-slate-400 text-xs mt-2 uppercase tracking-tighter">The institutional credit queue is currently synchronized.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="card-prestige !p-0 overflow-hidden">
                    <div className="p-10 border-b border-slate-50 bg-[#000B1E] text-white">
                        <h3 className="text-2xl font-bold font-['Playfair_Display']">System Audit Logs</h3>
                        <p className="text-[#C8AA6E] text-[10px] font-bold uppercase tracking-widest mt-1">Institutional Kernel Stream</p>
                    </div>
                    <div className="p-10 space-y-4 font-mono text-[10px]">
                        {operationalLogs.length > 0 ? operationalLogs.map((log, i) => (
                            <div key={i} className="text-slate-500 border-l-2 border-slate-200 pl-4 py-1">
                                <span className="text-slate-400">[{new Date(log.created_at).toISOString()}]</span> {log.type}: {log.reference || 'Institutional Operation'}
                                <span className="text-[#C8AA6E] ml-2 font-bold">${parseFloat(log.amount).toLocaleString()}</span>
                            </div>
                        )) : (
                            <div className="text-slate-400 italic">No historical logs identified.</div>
                        )}
                    </div>
                </div>
            )}

            <OnboardCustomerModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchCustomers}
                API_BASE={API_BASE}
            />

            <FundInjectionModal
                isOpen={showFundModal}
                onClose={() => setShowFundModal(false)}
                onSuccess={fetchCustomers}
                API_BASE={API_BASE}
                initialAccountNumber={selectedAccount}
            />

            <AdminTransferModal
                isOpen={showAdminTransferModal}
                onClose={() => setShowAdminTransferModal(false)}
                onSuccess={() => {
                    fetchMetrics();
                    fetchLogs();
                    if (view === 'users') fetchCustomers();
                }}
                API_BASE={API_BASE}
            />

            <RiskAssessmentModal
                isOpen={showRiskModal}
                onClose={() => setShowRiskModal(false)}
                API_BASE={API_BASE}
            />

            <ComplianceAuditModal
                isOpen={showComplianceModal}
                onClose={() => setShowComplianceModal(false)}
                API_BASE={API_BASE}
            />
        </div>
    );
};

export default WorkerDashboard;
