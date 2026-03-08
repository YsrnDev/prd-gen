'use client';

import { useState, createContext, useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from '@/lib/auth-client';

const SidebarContext = createContext({ collapsed: false });

function NavItem({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) {
    const { collapsed } = useContext(SidebarContext);

    return (
        <Link
            href={href}
            title={collapsed ? label : undefined}
            className={`relative flex items-center gap-3 rounded-lg transition-all duration-200 group/nav
                ${collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}
                ${active
                    ? 'bg-[#135bec]/20 text-[#135bec]'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
        >
            <span className="material-symbols-outlined text-[22px] flex-shrink-0">{icon}</span>
            {!collapsed && <span className="text-sm font-semibold whitespace-nowrap">{label}</span>}

            {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-white whitespace-nowrap opacity-0 group-hover/nav:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-xl">
                    {label}
                </span>
            )}
        </Link>
    );
}

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [collapsed, setCollapsed] = useState(false);

    const navItems = [
        { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { href: '/dashboard/prds', icon: 'description', label: 'My PRDs' },
        { href: '/settings', icon: 'settings', label: 'Settings' },
    ];

    return (
        <SidebarContext.Provider value={{ collapsed }}>
            <aside
                className="h-screen flex flex-col bg-slate-900/50 border-r border-slate-800 flex-shrink-0 sticky top-0 z-40 transition-[width] duration-300 ease-in-out"
                style={{ width: collapsed ? '68px' : '272px' }}
            >
                <div className={`flex flex-col h-full ${collapsed ? 'px-2 py-4' : 'p-5'} transition-[padding] duration-300`}>

                    {/* Brand */}
                    <div className={`flex items-center mb-6 ${collapsed ? 'justify-center' : 'gap-3'}`}>
                        {/* Logo — collapsed: hover shows expand button overlay */}
                        <div className="group/logo relative flex-shrink-0">
                            <div className="flex items-center justify-center size-10 rounded-lg bg-[#135bec] text-white">
                                <span className="material-symbols-outlined">auto_awesome</span>
                            </div>
                            {/* Overlay expand button — only when collapsed */}
                            {collapsed && (
                                <button
                                    onClick={() => setCollapsed(false)}
                                    className="absolute inset-0 flex items-center justify-center size-10 rounded-lg bg-[#135bec] text-white opacity-0 group-hover/logo:opacity-100 transition-opacity duration-200 z-10"
                                    title="Expand sidebar"
                                >
                                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                </button>
                            )}
                        </div>

                        {/* Brand text + collapse button — only when expanded */}
                        {!collapsed && (
                            <>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <h1 className="text-base font-bold leading-tight text-slate-100 whitespace-nowrap">PRDGen AI</h1>
                                    <p className="text-xs text-slate-400 whitespace-nowrap">AI-Powered PRDs</p>
                                </div>
                                <button
                                    onClick={() => setCollapsed(true)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                                    title="Collapse sidebar"
                                >
                                    <span className="material-symbols-outlined text-[20px]">menu_open</span>
                                </button>
                            </>
                        )}
                    </div>

                    <div className="h-px bg-slate-800 mb-4" />

                    {/* Navigation */}
                    <nav className="flex flex-1 flex-col gap-1">
                        {navItems.map((item) => (
                            <NavItem
                                key={item.href}
                                href={item.href}
                                icon={item.icon}
                                label={item.label}
                                active={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                            />
                        ))}
                    </nav>

                    {/* Bottom profile */}
                    <div className="mt-auto">
                        <div className="h-px bg-slate-800 mb-3" />
                        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                            {/* Avatar — collapsed: hover shows logout overlay */}
                            <div className="group/avatar relative flex-shrink-0">
                                <div className="size-10 rounded-full border-2 border-slate-700 bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden flex items-center justify-center text-white text-sm font-bold relative">
                                    {session?.user?.image ? (
                                        <Image src={session.user.image} alt={session.user.name || 'User'} fill className="object-cover" />
                                    ) : (
                                        session?.user?.name?.[0]?.toUpperCase() || 'U'
                                    )}
                                </div>
                                {/* Overlay logout — only when collapsed */}
                                {collapsed && (
                                    <button
                                        onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/login'; } } })}
                                        className="absolute inset-0 flex items-center justify-center size-10 rounded-full bg-red-600 text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 z-10"
                                        title="Sign out"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">logout</span>
                                    </button>
                                )}
                            </div>

                            {/* User info + logout — only when expanded */}
                            {!collapsed && (
                                <>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-100 truncate">{session?.user?.name || 'User'}</p>
                                        <p className="text-xs text-slate-400 capitalize truncate">{(session?.user as any)?.role || 'User'}</p>
                                    </div>
                                    <button
                                        onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/login'; } } })}
                                        className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                        title="Sign out"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">logout</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </aside>
        </SidebarContext.Provider>
    );
}

export function AdminSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [collapsed, setCollapsed] = useState(false);

    const navItems = [
        { href: '/admin', icon: 'admin_panel_settings', label: 'Admin Dashboard' },
        { href: '/admin/users', icon: 'group', label: 'User Management' },
        { href: '/admin/ai-config', icon: 'memory', label: 'AI Configuration' },
        { href: '/admin/logs', icon: 'list_alt', label: 'System Logs' },
        { href: '/settings', icon: 'settings', label: 'Settings' },
    ];

    return (
        <SidebarContext.Provider value={{ collapsed }}>
            <aside
                className="h-screen flex flex-col bg-slate-900/50 border-r border-slate-800 flex-shrink-0 sticky top-0 z-40 transition-[width] duration-300 ease-in-out"
                style={{ width: collapsed ? '68px' : '272px' }}
            >
                <div className={`flex flex-col h-full ${collapsed ? 'px-2 py-4' : 'p-5'} transition-[padding] duration-300`}>

                    {/* Brand */}
                    <div className={`flex items-center mb-6 ${collapsed ? 'justify-center' : 'gap-3'}`}>
                        <div className="group/logo relative flex-shrink-0">
                            <div className="flex items-center justify-center size-10 rounded-lg bg-[#135bec] text-white">
                                <span className="material-symbols-outlined">admin_panel_settings</span>
                            </div>
                            {collapsed && (
                                <button
                                    onClick={() => setCollapsed(false)}
                                    className="absolute inset-0 flex items-center justify-center size-10 rounded-lg bg-[#135bec] text-white opacity-0 group-hover/logo:opacity-100 transition-opacity duration-200 z-10"
                                    title="Expand sidebar"
                                >
                                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                </button>
                            )}
                        </div>
                        {!collapsed && (
                            <>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <h1 className="text-base font-bold leading-tight text-slate-100 whitespace-nowrap">PRDGen AI</h1>
                                    <p className="text-xs text-slate-400 whitespace-nowrap">Admin Panel</p>
                                </div>
                                <button
                                    onClick={() => setCollapsed(true)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                                    title="Collapse sidebar"
                                >
                                    <span className="material-symbols-outlined text-[20px]">menu_open</span>
                                </button>
                            </>
                        )}
                    </div>

                    <div className="h-px bg-slate-800 mb-4" />

                    <nav className="flex flex-1 flex-col gap-1">
                        {navItems.map((item) => (
                            <NavItem
                                key={item.href}
                                href={item.href}
                                icon={item.icon}
                                label={item.label}
                                active={pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))}
                            />
                        ))}
                    </nav>

                    {/* Bottom profile */}
                    <div className="mt-auto">
                        <div className="h-px bg-slate-800 mb-3" />
                        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                            <div className="group/avatar relative flex-shrink-0">
                                <div className="size-10 rounded-full border-2 border-slate-700 bg-emerald-500 overflow-hidden flex items-center justify-center text-white text-sm font-bold relative">
                                    {session?.user?.image ? (
                                        <Image src={session.user.image} alt={session.user.name || 'User'} fill className="object-cover" />
                                    ) : (
                                        session?.user?.name?.[0]?.toUpperCase() || 'A'
                                    )}
                                </div>
                                {collapsed && (
                                    <button
                                        onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/login'; } } })}
                                        className="absolute inset-0 flex items-center justify-center size-10 rounded-full bg-red-600 text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 z-10"
                                        title="Sign out"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">logout</span>
                                    </button>
                                )}
                            </div>
                            {!collapsed && (
                                <>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-100 truncate">{session?.user?.name || 'Admin'}</p>
                                        <p className="text-xs text-slate-400 truncate">System Admin</p>
                                    </div>
                                    <button
                                        onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/login'; } } })}
                                        className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                        title="Sign out"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">logout</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </aside>
        </SidebarContext.Provider>
    );
}
