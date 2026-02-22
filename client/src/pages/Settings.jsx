import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    User,
    Shield,
    Bell,
    Smartphone,
    ChevronRight,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';
import { clsx } from 'clsx';

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profile Management', icon: User },
        { id: 'security', label: 'Security & Vault', icon: Shield },
        { id: 'notifications', label: 'Communication', icon: Bell },
        { id: 'preferences', label: 'Terminal Prefs', icon: Smartphone }
    ];

    return (
        <div className="animate-in fade-in duration-700">
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8AA6E]"></span>
                    <h1 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                        System Configuration
                    </h1>
                </div>
                <h2 className="text-3xl font-bold text-[#000B1E] tracking-tight font-['Playfair_Display']">
                    Elite Terminal Settings
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Tabs Sidebar */}
                <div className="space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                                activeTab === tab.id
                                    ? "bg-[#000B1E] text-white shadow-lg"
                                    : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100 shadow-sm"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <tab.icon size={18} className={activeTab === tab.id ? "text-[#C8AA6E]" : ""} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
                            </div>
                            <ChevronRight size={14} className={activeTab === tab.id ? "opacity-100" : "opacity-0"} />
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="card-prestige min-h-[500px] !p-10">
                        {activeTab === 'profile' && (
                            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                                <div>
                                    <h3 className="text-xl font-bold text-[#000B1E] mb-2 font-['Playfair_Display']">Portfolio Holder Identity</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage your institutional profile information</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-4">Full Legal Name</label>
                                        <input
                                            type="text"
                                            disabled
                                            className="input-prestige opacity-70 cursor-not-allowed"
                                            value={user?.fullName}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-4">Registered Email</label>
                                        <input
                                            type="email"
                                            disabled
                                            className="input-prestige opacity-70 cursor-not-allowed"
                                            value={user?.email}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-4">Portfolio Tier</label>
                                        <div className="input-prestige flex items-center justify-between">
                                            <span className="text-[#C8AA6E] font-bold">PRESTIGE ELITE</span>
                                            <Shield size={16} className="text-[#C8AA6E]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                                <div>
                                    <h3 className="text-xl font-bold text-[#000B1E] mb-2 font-['Playfair_Display']">Vault & Identity Protections</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage your 4-digit Transaction PIN and biometric access</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                                                <Lock size={18} className="text-[#C8AA6E]" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-[#000B1E]">Transaction PIN Rotation</p>
                                                <p className="text-[10px] text-slate-400 font-medium">Rotate your legacy authorization key regularly</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-[#000B1E] text-white text-[8px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all">Update PIN</button>
                                    </div>

                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                                                <Smartphone size={18} className="text-[#C8AA6E]" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-[#000B1E]">Multi-Factor Authentication</p>
                                                <p className="text-[10px] text-slate-400 font-medium">Standard institutional SMS / Auth App protection</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                                            <div className="w-10 h-5 bg-emerald-500/20 rounded-full p-1 relative">
                                                <div className="absolute right-1 top-1 w-3 h-3 bg-emerald-500 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab !== 'profile' && activeTab !== 'security' && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100">
                                    <Bell size={24} className="text-slate-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#000B1E]">Module Under Synchronization</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">This configuration module is being deployed to your regional cluster</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
