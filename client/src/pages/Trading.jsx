import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    TrendingUp,
    TrendingDown,
    Activity,
    DollarSign,
    RefreshCw,
    Briefcase
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const Trading = () => {
    const { API_BASE, user, refreshUser } = useAuth();
    const [assets, setAssets] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [orderType, setOrderType] = useState('BUY'); // BUY or SELL
    const [quantity, setQuantity] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Mock Market Data (Simulated Real-time Feed)
    const marketData = {
        'BTC': { name: 'Bitcoin', price: 64230.50, change: '+2.4%', trend: 'up', data: generateChartData(64000) },
        'ETH': { name: 'Ethereum', price: 3450.75, change: '-0.8%', trend: 'down', data: generateChartData(3500) },
        'SPY': { name: 'S&P 500 ETF', price: 512.40, change: '+1.1%', trend: 'up', data: generateChartData(510) },
        'TSLA': { name: 'Tesla Inc.', price: 178.90, change: '+3.2%', trend: 'up', data: generateChartData(175) },
        'NVDA': { name: 'NVIDIA Corp.', price: 890.15, change: '+4.5%', trend: 'up', data: generateChartData(880) }
    };

    useEffect(() => {
        fetchPortfolio();
        setSelectedAsset('BTC'); // Default selection
    }, []);

    const fetchPortfolio = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/investments`);
            setAssets(res.data);
        } catch (err) {
            console.error("Failed to fetch portfolio");
        }
    };

    const handleTrade = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setIsLoading(true);

        const currentPrice = marketData[selectedAsset].price;

        try {
            await axios.post(`${API_BASE}/api/investments/trade`, {
                symbol: selectedAsset,
                name: marketData[selectedAsset].name,
                type: ['BTC', 'ETH'].includes(selectedAsset) ? 'CRYPTO' : selectedAsset === 'SPY' ? 'ETF' : 'STOCK',
                side: orderType,
                quantity: parseFloat(quantity),
                price: currentPrice
            });

            setSuccessMsg(`Successfully executed: ${orderType} ${quantity} ${selectedAsset}`);
            setQuantity('');
            fetchPortfolio();
            refreshUser(); // Update cash balance
        } catch (err) {
            setError(err.response?.data?.message || 'Trade failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to generate mock chart data
    function generateChartData(basePrice) {
        let data = [];
        let price = basePrice;
        for (let i = 0; i < 20; i++) {
            price = price * (1 + (Math.random() * 0.04 - 0.02));
            data.push({ time: `${9 + i}:00`, price: price });
        }
        return data;
    }

    const currentAssetData = selectedAsset ? marketData[selectedAsset] : null;

    // Calculate Portfolio Value (Mock calculation based on current mock prices)
    const portfolioValue = assets.reduce((acc, asset) => {
        const price = marketData[asset.symbol]?.price || asset.avg_buy_price;
        return acc + (parseFloat(asset.quantity) * price);
    }, 0);

    return (
        <div className="p-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-[#000B1E] tracking-tight font-['Playfair_Display']">Global Markets</h2>
                    <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-bold">Institutional Trading Terminal</p>
                </div>
                <div className="text-right">
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1">Portfolio Value</p>
                    <h3 className="text-2xl font-bold text-[#000B1E] font-mono">${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Market List (Assets) */}
                <div className="card-prestige !p-0 overflow-hidden col-span-1 border border-slate-100/50">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                        <h3 className="font-bold text-[#000B1E] text-sm uppercase tracking-widest">Market Watch</h3>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                        {Object.entries(marketData).map(([symbol, data]) => (
                            <button
                                key={symbol}
                                onClick={() => setSelectedAsset(symbol)}
                                className={`w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all ${selectedAsset === symbol ? 'bg-slate-50 border-l-4 border-[#C8AA6E]' : 'border-l-4 border-transparent'}`}
                            >
                                <div className="text-left">
                                    <h4 className="font-bold text-[#000B1E]">{symbol}</h4>
                                    <p className="text-xs text-slate-400 font-medium">{data.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-sm font-bold text-[#000B1E]">${data.price.toLocaleString()}</p>
                                    <p className={`text-[10px] font-bold ${data.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {data.change}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Trading Main Panel */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Chart Area */}
                    <div className="card-prestige relative overflow-hidden group">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>

                        <div className="relative z-10 mb-8 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-[#000B1E]">
                                        <Activity size={20} className="text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#000B1E]">{currentAssetData?.name}</h3>
                                </div>
                                <div className="flex items-baseline gap-4">
                                    <span className="text-4xl font-bold text-[#000B1E] font-['Playfair_Display']">
                                        ${currentAssetData?.price.toLocaleString()}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentAssetData?.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {currentAssetData?.change} Today
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={currentAssetData?.data}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={currentAssetData?.trend === 'up' ? '#10B981' : '#F43F5E'} stopOpacity={0.1} />
                                            <stop offset="95%" stopColor={currentAssetData?.trend === 'up' ? '#10B981' : '#F43F5E'} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="time" hide />
                                    <YAxis domain={['auto', 'auto']} hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000B1E', border: 'none', borderRadius: '12px', color: '#fff' }}
                                        itemStyle={{ color: '#C8AA6E' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="price"
                                        stroke={currentAssetData?.trend === 'up' ? '#10B981' : '#F43F5E'}
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorPrice)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Execution & Holdings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Execution Panel */}
                        <div className="card-prestige border-l-4 border-l-[#C8AA6E]">
                            <h3 className="text-lg font-bold text-[#000B1E] mb-6 font-['Playfair_Display']">Execute Order</h3>

                            <form onSubmit={handleTrade} className="space-y-6">
                                <div className="flex p-1 bg-slate-100 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setOrderType('BUY')}
                                        className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${orderType === 'BUY' ? 'bg-[#000B1E] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        Buy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOrderType('SELL')}
                                        className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${orderType === 'SELL' ? 'bg-[#000B1E] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        Sell
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Quantity ({selectedAsset})</label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        required
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="input-prestige font-mono text-lg"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="flex justify-between items-center py-4 border-t border-slate-100">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Est. Total</span>
                                    <span className="text-xl font-bold text-[#000B1E] font-mono">
                                        ${(parseFloat(quantity || 0) * currentAssetData?.price).toLocaleString()}
                                    </span>
                                </div>

                                {error && <div className="p-3 bg-rose-50 text-rose-500 text-xs font-bold rounded-xl text-center">{error}</div>}
                                {successMsg && <div className="p-3 bg-emerald-50 text-emerald-500 text-xs font-bold rounded-xl text-center">{successMsg}</div>}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-4 rounded-2xl font-bold text-sm text-white uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 ${orderType === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/20'}`}
                                >
                                    {isLoading ? 'Processing...' : `${orderType} ${selectedAsset}`}
                                </button>
                            </form>
                        </div>

                        {/* Holdings Panel */}
                        <div className="card-prestige bg-[#000B1E] text-white">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold font-['Playfair_Display']">Holdings</h3>
                                <button onClick={fetchPortfolio} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all">
                                    <RefreshCw size={14} className="text-[#C8AA6E]" />
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {assets.length === 0 ? (
                                    <div className="text-center py-10 opacity-50">
                                        <Briefcase size={32} className="mx-auto mb-2 text-slate-600" />
                                        <p className="text-xs font-bold uppercase tracking-widest">No Active Positions</p>
                                    </div>
                                ) : (
                                    assets.map((asset) => (
                                        <div key={asset.symbol} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-all">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-[#C8AA6E]">{asset.symbol}</span>
                                                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-300">{asset.type}</span>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-1">{parseFloat(asset.quantity).toFixed(4)} Units</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono font-bold text-sm">
                                                    ${(parseFloat(asset.quantity) * (marketData[asset.symbol]?.price || asset.avg_buy_price)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Market Val</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/10">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Liquid Cash</span>
                                    <span className="text-lg font-bold text-white font-mono">${parseFloat(user?.balance || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Trading;
