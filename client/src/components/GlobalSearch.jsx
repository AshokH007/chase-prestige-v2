import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, X, TrendingUp, FileText, Sparkles, Navigation, User } from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = ({ API_BASE }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced Search
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const handler = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`${API_BASE}/api/search?q=${query}`);
                setResults(res.data.results);
                setIsOpen(true);
            } catch (err) {
                console.error('Search failed');
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [query, API_BASE]);

    const handleResultClick = (result) => {
        setQuery('');
        setIsOpen(false);
        if (result.type === 'NAV') {
            navigate(result.path);
        } else if (result.type === 'TX' && !result.action) {
            navigate('/dashboard');
        } else if (result.type === 'CLIENT') {
            navigate('/staff/users');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'TX': return <FileText size={14} className="text-slate-400" />;
            case 'ASSET': return <TrendingUp size={14} className="text-emerald-500" />;
            case 'NAV': return <Navigation size={14} className="text-[#C8AA6E]" />;
            case 'CLIENT': return <User size={14} className="text-indigo-500" />;
            default: return <Search size={14} />;
        }
    };

    return (
        <div className="relative w-96" ref={searchRef}>
            <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 group focus-within:ring-2 focus-within:ring-[#C8AA6E]/20 transition-all">
                <Search size={18} className={clsx("transition-colors", query ? "text-[#C8AA6E]" : "text-slate-400")} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search transactions, assets..."
                    className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder:text-slate-400"
                />
                {query && (
                    <button onClick={() => setQuery('')}>
                        <X size={14} className="text-slate-300 hover:text-slate-500" />
                    </button>
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200">
                    <div className="max-h-80 overflow-y-auto">
                        {results.length > 0 ? (
                            results.map((res, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleResultClick(res)}
                                    className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 text-left transition-colors border-b border-slate-50 last:border-0 group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors">
                                        {getIcon(res.type)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-[#000B1E]">{res.label}</p>
                                        {res.sublabel && <p className="text-[10px] text-slate-400 mt-0.5">{res.sublabel}</p>}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <Search size={24} className="mx-auto text-slate-200 mb-2" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No matching records found</p>
                            </div>
                        )}
                    </div>
                    {isLoading && (
                        <div className="p-2 bg-slate-50/50 flex items-center justify-center">
                            <div className="w-3 h-3 border-2 border-[#C8AA6E] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
