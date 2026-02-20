import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import GlobalSearch from '../components/GlobalSearch';
import { Bell, Search, User, LogOut, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { clsx } from 'clsx';
import { useEffect } from 'react';

const Layout = ({ children }) => {
    const { user, logout, API_BASE } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const fetchNotifications = async () => {
        if (!user || user.role !== 'CLIENT') return;
        try {
            const res = await axios.get(`${API_BASE}/api/loans/notifications`);
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications');
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isLoginPage = location.pathname === '/login';

    if (isLoginPage) {
        return <div className="min-h-screen bg-slate-50 font-sans">{children}</div>;
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex font-sans text-slate-900">
            {user && (
                <Sidebar
                    role={user.role}
                    onLogout={handleLogout}
                />
            )}

            <div className={`flex-1 flex flex-col ${user ? 'pl-72' : ''}`}>
                {user && (
                    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 px-10 flex items-center justify-between">
                        <GlobalSearch API_BASE={API_BASE} />

                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className={clsx(
                                        "relative p-2 transition-colors",
                                        showNotifications ? "text-[#C8AA6E]" : "text-slate-400 hover:text-indigo-600"
                                    )}
                                >
                                    <Bell size={22} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute top-full right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                                        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                            <h4 className="text-[10px] font-bold text-[#000B1E] uppercase tracking-widest">Institutional Alerts</h4>
                                            {unreadCount > 0 && <span className="bg-[#C8AA6E]/20 text-[#C8AA6E] px-2 py-0.5 rounded-full text-[8px] font-bold">{unreadCount} New</span>}
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto">
                                            {notifications.length > 0 ? notifications.map((n, i) => (
                                                <div key={n.id} className="p-5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                                    <div className="flex gap-4">
                                                        <div className={clsx(
                                                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                                            n.title.toLowerCase().includes('approved') ? "bg-emerald-50 text-emerald-500" : "bg-indigo-50 text-indigo-500"
                                                        )}>
                                                            {n.title.toLowerCase().includes('approved') ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-[#000B1E] mb-1">{n.title}</p>
                                                            <p className="text-[10px] text-slate-500 leading-relaxed">{n.message}</p>
                                                            <p className="text-[8px] font-bold text-slate-300 uppercase mt-2 tracking-tighter">
                                                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Institutional Feed
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="py-12 px-6 text-center">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">The feed is synchronized</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="h-8 w-px bg-slate-100"></div>

                            <div className="flex items-center gap-3 pl-2 relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                                >
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-bold text-slate-900">{user.fullName}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-[#000B1E] rounded-xl flex items-center justify-center text-white font-bold border border-white/10">
                                        {user.fullName?.[0]}
                                    </div>
                                </button>

                                {showProfileMenu && (
                                    <div className="absolute top-full right-0 mt-4 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-3"
                                        >
                                            <LogOut size={14} /> Secure Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>
                )}

                <main className={`p-10 ${!user ? 'flex items-center justify-center min-vh-100' : ''}`}>
                    {children}
                </main>

                {user && (
                    <footer className="mt-auto py-8 px-10 border-t border-slate-100 bg-white/50">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <p>© {new Date().getFullYear()} Chase Prestige Global. Member FDIC.</p>
                            <div className="flex gap-6">
                                <button className="hover:text-slate-900 transition-colors">Privacy</button>
                                <button className="hover:text-slate-900 transition-colors">Security</button>
                                <button className="hover:text-slate-900 transition-colors">Terms</button>
                            </div>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default Layout;
