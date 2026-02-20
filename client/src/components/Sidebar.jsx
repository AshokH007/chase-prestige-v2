import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import {
    LayoutDashboard,
    Users,
    ArrowLeftRight,
    ShieldCheck,
    LogOut,
    Settings,
    CreditCard,
    PieChart,
    Building2,
    Wallet,
    Landmark,
    TrendingUp,
    Hexagon,
    Sparkles
} from 'lucide-react';

const Sidebar = ({ role = 'CLIENT', onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const clientLinks = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Transactions', icon: ArrowLeftRight, path: '/transactions' },
        { name: 'Cards', icon: CreditCard, path: '/cards' },
        { name: 'Bill Pay', icon: Wallet, path: '/bills' },
        { name: 'Analytics', icon: PieChart, path: '/analytics' },
        { name: 'Loans', icon: Landmark, path: '/loans' },
        { name: 'Global Markets', icon: TrendingUp, path: '/investments' },
        { name: 'Crypto Vault', icon: Hexagon, path: '/crypto' },
        { name: 'Prestige GPT', icon: Sparkles, path: '/concierge' },
    ];

    const staffLinks = [
        { name: 'Institutional Oracle', icon: Sparkles, path: '/staff/oracle' },
        { name: 'Executive Overview', icon: LayoutDashboard, path: '/staff/dashboard' },
        { name: 'Client Directory', icon: Users, path: '/staff/directory' },
        { name: 'Compliance', icon: ShieldCheck, path: '/staff/compliance' },
        { name: 'Audit Logs', icon: Building2, path: '/staff/logs' },
        { name: 'Credit Queue', icon: Landmark, path: '/staff/credit' },
    ];

    const links = role === 'STAFF' ? staffLinks : clientLinks;

    return (
        <aside className="w-72 bg-[#000B1E] h-screen fixed left-0 top-0 flex flex-col p-8 z-40 border-r border-white/5 shadow-2xl">
            {/* Branding */}
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 bg-[#C8AA6E] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">C</span>
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-tight font-['Playfair_Display']">
                        CHASE <span className="text-[#C8AA6E]">PRESTIGE</span>
                    </h1>
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold ml-11">
                    Global Banking
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-4 px-6">
                    Menu
                </p>
                {links.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <button
                            key={link.name}
                            onClick={() => navigate(link.path)}
                            className={clsx(
                                "sidebar-item w-full",
                                isActive && "sidebar-item-active"
                            )}
                        >
                            <link.icon size={20} />
                            <span className="text-sm">{link.name}</span>
                        </button>
                    );
                })}
                {/* Visual Logout for Client if preferred */}
                {role === 'CLIENT' && (
                    <button
                        onClick={onLogout}
                        className="sidebar-item w-full text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-400 mt-8 border border-rose-500/10"
                    >
                        <LogOut size={20} />
                        <span className="text-sm">Secure Terminal Logout</span>
                    </button>
                )}
            </nav>

            {/* Bottom Section */}
            <div className="pt-8 border-t border-white/5 space-y-2">
                <button className="sidebar-item w-full">
                    <Settings size={20} />
                    <span className="text-sm">Settings</span>
                </button>
                <button
                    onClick={onLogout}
                    className="sidebar-item w-full text-rose-400 hover:bg-rose-500/10 hover:text-rose-400"
                >
                    <LogOut size={20} />
                    <span className="text-sm">Secure Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
