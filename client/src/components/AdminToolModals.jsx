import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ShieldAlert, BarChart3, ClipboardCheck, Download, AlertTriangle } from 'lucide-react';

export const RiskAssessmentModal = ({ isOpen, onClose, API_BASE }) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            axios.get(`${API_BASE}/api/staff/risk-assessment`)
                .then(res => setData(res.data))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, API_BASE]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#000B1E]/90 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] p-12 shadow-2xl animate-in zoom-in-95 duration-300">
                <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900"><X size={24} /></button>

                <div className="mb-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100">
                        <BarChart3 className="text-rose-500" size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-[#000B1E] font-['Playfair_Display']">Institutional Risk Profile</h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Real-time Exposure Analysis</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-20 flex justify-center"><div className="w-8 h-8 border-2 border-[#C8AA6E] border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Liquidity Risk</p>
                            <p className="text-2xl font-bold text-[#000B1E]">{data?.lowLiquidityCount} <span className="text-xs text-slate-400 font-medium">Clients Below $1k</span></p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Concentration Risk</p>
                            <p className="text-2xl font-bold text-[#000B1E]">{data?.highExposureCount} <span className="text-xs text-slate-400 font-medium">High Exposure Holders</span></p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 col-span-2 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Platform Velocity</p>
                                <p className="text-2xl font-bold text-[#000B1E]">{data?.transactionVelocity} <span className="text-xs text-slate-400 font-medium">TX / Hour</span></p>
                            </div>
                            <span className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest ${data?.riskLevel === 'STABLE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {data?.riskLevel} OS-V2
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const ComplianceAuditModal = ({ isOpen, onClose, API_BASE }) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            axios.get(`${API_BASE}/api/staff/compliance-report`)
                .then(res => setData(res.data))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, API_BASE]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#000B1E]/90 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] p-12 shadow-2xl animate-in zoom-in-95 duration-300">
                <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900"><X size={24} /></button>

                <div className="mb-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                            <ClipboardCheck className="text-amber-500" size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-[#000B1E] font-['Playfair_Display']">Compliance Registry</h3>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">High-Value Settlement Monitoring</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#000B1E] text-white text-[10px] font-bold uppercase">
                        <Download size={14} /> Export Report
                    </button>
                </div>

                <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {data.length > 0 ? data.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-6">
                                <div className="p-3 bg-amber-100/50 rounded-full text-amber-600"><AlertTriangle size={20} /></div>
                                <div>
                                    <p className="text-sm font-bold text-[#000B1E]">{tx.sender_name || 'SYSTEM'} → {tx.receiver_name}</p>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{tx.reference || 'Manual Override'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-rose-600">${parseFloat(tx.amount).toLocaleString()}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{new Date(tx.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    )) : !isLoading && <p className="text-center py-10 text-slate-400 text-sm italic">No priority flags identified.</p>}
                </div>
            </div>
        </div>
    );
};
