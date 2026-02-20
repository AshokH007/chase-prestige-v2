import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    Shield,
    Lock,
    Hexagon,
    Copy,
    ExternalLink,
    QrCode,
    History
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const CryptoVault = () => {
    const { API_BASE } = useAuth();
    const [assets, setAssets] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/investments`);
            // Filter only Crypto assets
            const cryptoAssets = res.data.filter(a => a.type === 'CRYPTO');
            setAssets(cryptoAssets);
            if (cryptoAssets.length > 0) setSelectedAsset(cryptoAssets[0]);
        } catch (err) {
            console.error("Failed to fetch vault assets");
        }
    };

    // Calculate Total Vault Value
    const vaultValue = assets.reduce((acc, asset) => {
        // Mock prices for valuation (should ideally come from an API or the same mock source)
        const mockPrices = { 'BTC': 64230.50, 'ETH': 3450.75, 'SOL': 145.20, 'XRP': 0.62 };
        const price = mockPrices[asset.symbol] || asset.avg_buy_price;
        return acc + (parseFloat(asset.quantity) * price);
    }, 0);

    const chartData = assets.map(a => ({
        name: a.symbol,
        value: parseFloat(a.quantity) * (a.avg_buy_price || 0) // Simplified valuation
    }));

    const COLORS = ['#C8AA6E', '#000B1E', '#4B5563', '#9CA3AF'];

    return (
        <div className="p-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="mb-12 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#000B1E] rounded-lg">
                            <Shield size={24} className="text-[#C8AA6E]" />
                        </div>
                        <h2 className="text-3xl font-bold text-[#000B1E] tracking-tight font-['Playfair_Display']">Crypto Vault</h2>
                    </div>
                    <p className="text-slate-400 text-sm uppercase tracking-widest font-bold ml-12"> institutional Cold Storage Custody</p>
                </div>
                <div className="text-right">
                    <div className="flex items-center justify-end gap-2 mb-1">
                        <Lock size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Encrypted & Secured</span>
                    </div>
                    <h3 className="text-3xl font-bold text-[#000B1E] font-mono">${vaultValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Asset Navigation & Composition */}
                <div className="space-y-8">
                    {/* Composition Chart */}
                    <div className="card-prestige relative overflow-hidden">
                        <h3 className="text-sm font-bold text-[#000B1E] uppercase tracking-widest mb-6">Allocation</h3>
                        <div className="h-[200px] w-full relative z-10">
                            {assets.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#000B1E', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-300 text-xs font-bold uppercase">Empty Vault</div>
                            )}
                        </div>
                    </div>

                    {/* Asset List */}
                    <div className="card-prestige !p-0 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                            <h3 className="text-sm font-bold text-[#000B1E] uppercase tracking-widest">Digital Assets</h3>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {assets.map(asset => (
                                <button
                                    key={asset.symbol}
                                    onClick={() => setSelectedAsset(asset)}
                                    className={`w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-all ${selectedAsset?.symbol === asset.symbol ? 'bg-slate-50 border-l-4 border-[#C8AA6E]' : 'border-l-4 border-transparent'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#000B1E] flex items-center justify-center text-[#C8AA6E] font-bold text-xs">
                                            {asset.symbol[0]}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-[#000B1E] text-sm">{asset.name}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">{parseFloat(asset.quantity).toFixed(6)} {asset.symbol}</p>
                                        </div>
                                    </div>
                                    <Hexagon size={16} className="text-slate-300" />
                                </button>
                            ))}
                            {assets.length === 0 && (
                                <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase">No crypto assets found</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Main Vault Interface */}
                <div className="lg:col-span-2">
                    {selectedAsset ? (
                        <div className="card-prestige h-full relative overflow-hidden group">
                            {/* Background */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-[#000B1E]/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-12">
                                    <div>
                                        <h3 className="text-3xl font-bold text-[#000B1E] font-['Playfair_Display']">{selectedAsset.name}</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-4xl font-mono font-bold text-[#000B1E]">
                                                {parseFloat(selectedAsset.quantity).toLocaleString(undefined, { minimumFractionDigits: 4 })}
                                            </span>
                                            <span className="text-lg font-bold text-[#C8AA6E]">{selectedAsset.symbol}</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#000B1E] text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl shadow-indigo-900/20">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Custody Active</span>
                                    </div>
                                </div>

                                {/* Deposit Address / Key Management */}
                                <div className="bg-[#000B1E] rounded-3xl p-8 text-white mb-8 shadow-2xl shadow-slate-900/10">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Institutional Deposit Address</h4>
                                        <button className="text-[#C8AA6E] hover:text-white transition-colors">
                                            <QrCode size={20} />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 mb-6 group-hover:border-[#C8AA6E]/50 transition-colors">
                                        <code className="flex-1 font-mono text-xs text-slate-300 break-all">
                                            0x71C7656EC7ab88b098defB751B7401B5f6d8976F
                                        </code>
                                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                                            <Copy size={16} />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/5 rounded-full">
                                            <Lock size={16} className="text-[#C8AA6E]" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold">Multi-Sig Protection</p>
                                            <p className="text-[10px] text-slate-500">Assets required 3-of-5 key approval for withdrawal.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Transaction History Stub */}
                                <div>
                                    <h4 className="text-sm font-bold text-[#000B1E] uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <History size={16} />
                                        Recent Activity
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-100/50 rounded-lg text-emerald-600">
                                                    <ExternalLink size={14} className="rotate-180" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-[#000B1E]">Inbound Transfer</p>
                                                    <p className="text-[10px] text-slate-400">Oct 24, 2025 • 09:41 AM</p>
                                                </div>
                                            </div>
                                            <span className="font-mono text-xs font-bold text-emerald-600">+{parseFloat(selectedAsset.quantity * 0.1).toFixed(4)} {selectedAsset.symbol}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ) : (
                        <div className="card-prestige h-full flex flex-col items-center justify-center text-center opacity-50">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <Hexagon size={40} className="text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-[#000B1E] mb-2">Select an Asset</h3>
                            <p className="text-sm text-slate-400 max-w-xs">Choose a cryptocurrency from your portfolio to view custody details and vault security.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CryptoVault;
