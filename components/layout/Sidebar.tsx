'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from '@/lib/auth-client';

const SidebarContext = createContext({ collapsed: false });

function NavItem({ href, icon, label, active, onClick }: { href: string; icon: string; label: string; active: boolean; onClick?: () => void }) {
    const { collapsed } = useContext(SidebarContext);

    return (
        <Link
            href={href}
            onClick={onClick}
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
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-white whitespace-nowrap opacity-0 group-hover/nav:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-xl hidden md:block">
                    {label}
                </span>
            )}
        </Link>
    );
}

function useMobileDetect() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    return isMobile;
}

function SidebarShell({
    navItems,
    brandIcon,
    brandSubtext,
    avatarBg,
    fallbackInitial,
    hideMobileLogout,
}: {
    navItems: { href: string; icon: string; label: string }[];
    brandIcon: string;
    brandSubtext: string;
    avatarBg: string;
    fallbackInitial: string;
    hideMobileLogout?: boolean;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isMobile = useMobileDetect();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const basePath = navItems[0]?.href?.includes('/admin') ? '/admin' : '/dashboard';

    const sidebarContent = (
        <div className={`flex flex-col h-full ${collapsed && !isMobile ? 'px-2 py-4' : 'p-5'} transition-[padding] duration-300`}>
            {/* Brand */}
            <div className={`flex items-center mb-6 ${collapsed && !isMobile ? 'justify-center' : 'gap-3'}`}>
                <div className="group/logo relative flex-shrink-0">
                    <div className="flex items-center justify-center size-10 rounded-lg overflow-hidden bg-white/5">
                        <Image src="/logo.webp" alt="PRDGen AI" width={36} height={36} className="object-contain rounded-xl" />
                    </div>
                    {collapsed && !isMobile && (
                        <button
                            onClick={() => setCollapsed(false)}
                            className="absolute inset-0 flex items-center justify-center size-10 rounded-lg bg-[#135bec] text-white opacity-0 group-hover/logo:opacity-100 transition-opacity duration-200 z-10"
                            title="Expand sidebar"
                        >
                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                        </button>
                    )}
                </div>

                {(!collapsed || isMobile) && (
                    <>
                        <div className="flex flex-col min-w-0 flex-1">
                            <h1 className="text-base font-bold leading-tight text-slate-100 whitespace-nowrap">PRDGen AI</h1>
                            <p className="text-xs text-slate-400 whitespace-nowrap">{brandSubtext}</p>
                        </div>
                        {/* Desktop: collapse toggle | Mobile: close button */}
                        {isMobile ? (
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="size-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors flex-shrink-0"
                                title="Close sidebar"
                            >
                                <span className="material-symbols-outlined text-[20px] leading-none">close</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => setCollapsed(true)}
                                className="size-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors flex-shrink-0"
                                title="Collapse sidebar"
                            >
                                <span className="material-symbols-outlined text-[20px] leading-none">menu_open</span>
                            </button>
                        )}
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
                        active={pathname === item.href || (item.href !== basePath && pathname.startsWith(item.href))}
                        onClick={isMobile ? () => setMobileOpen(false) : undefined}
                    />
                ))}
            </nav>

            {/* Bottom profile */}
            <div className="mt-auto">
                <div className="h-px bg-slate-800 mb-3" />
                <div className={`flex items-center ${collapsed && !isMobile ? 'justify-center' : 'gap-3'}`}>
                    <div className="group/avatar relative flex-shrink-0">
                        <div className={`size-10 rounded-full border-2 border-slate-700 ${avatarBg} overflow-hidden flex items-center justify-center text-white text-sm font-bold relative`}>
                            {session?.user?.image ? (
                                <Image src={session.user.image} alt={session.user.name || 'User'} fill className="object-cover" />
                            ) : (
                                session?.user?.name?.[0]?.toUpperCase() || fallbackInitial
                            )}
                        </div>
                        {collapsed && !isMobile && (
                            <button
                                onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/login'; } } })}
                                className="absolute inset-0 flex items-center justify-center size-10 rounded-full bg-red-600 text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 z-10"
                                title="Sign out"
                            >
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                            </button>
                        )}
                    </div>

                    {(!collapsed || isMobile) && (
                        <>
                            <div className="flex flex-col flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-100 truncate">{session?.user?.name || 'User'}</p>
                                <p className="text-xs text-slate-400 capitalize truncate">{(session?.user as any)?.role || 'User'}</p>
                            </div>
                            <button
                                onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/login'; } } })}
                                className="size-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                                title="Sign out"
                            >
                                <span className="material-symbols-outlined text-[18px] leading-none">logout</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <SidebarContext.Provider value={{ collapsed: collapsed && !isMobile }}>
            {/* Mobile Top Bar */}
            {isMobile && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center size-8 rounded-lg bg-[#135bec] text-white">
                            <span className="material-symbols-outlined text-[18px]">{brandIcon}</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-100">PRDGen AI</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`relative size-8 rounded-full border border-slate-700 ${avatarBg} overflow-hidden flex items-center justify-center text-white text-xs font-bold`}>
                            {session?.user?.image ? (
                                <Image src={session.user.image} alt={session.user.name || 'User'} fill className="object-cover" />
                            ) : (
                                session?.user?.name?.[0]?.toUpperCase() || fallbackInitial
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Bottom Navigation */}
            {isMobile && (
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
                    {navItems.map((item) => {
                        const active = pathname === item.href || (item.href !== basePath && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl flex-1 min-w-0 transition-colors
                                    ${active ? 'text-[#135bec]' : 'text-slate-400 hover:text-slate-200'}
                                `}
                            >
                                <span className={`material-symbols-outlined text-[24px] ${active ? 'fill-current' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className="text-[10px] font-medium mt-1 truncate w-full text-center">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                    {!hideMobileLogout && (
                        <button
                            onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/login'; } } })}
                            className="flex flex-col items-center justify-center p-2 rounded-xl flex-1 min-w-0 transition-colors text-slate-400 hover:text-red-400"
                            title="Sign out"
                        >
                            <span className="material-symbols-outlined text-[24px]">logout</span>
                            <span className="text-[10px] font-medium mt-1 truncate w-full text-center">Logout</span>
                        </button>
                    )}
                </div>
            )}

            {/* Desktop Sidebar */}
            {!isMobile && (
                <aside
                    className="h-screen flex flex-col bg-slate-900/50 border-r border-slate-800 flex-shrink-0 sticky top-0 z-40 transition-[width] duration-300 ease-in-out"
                    style={{ width: collapsed ? '68px' : '272px' }}
                >
                    {sidebarContent}
                </aside>
            )}
        </SidebarContext.Provider>
    );
}

export function Sidebar() {
    return (
        <SidebarShell
            navItems={[
                { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
                { href: '/dashboard/prds', icon: 'description', label: 'My PRDs' },
                { href: '/dashboard/pricing', icon: 'credit_card', label: 'Pricing' },
                { href: '/settings', icon: 'settings', label: 'Settings' },
            ]}
            brandIcon="auto_awesome"
            brandSubtext="AI-Powered PRDs"
            avatarBg="bg-gradient-to-br from-blue-500 to-indigo-600"
            fallbackInitial="U"
        />
    );
}

export function AdminSidebar() {
    return (
        <SidebarShell
            navItems={[
                { href: '/admin', icon: 'admin_panel_settings', label: 'Admin' },
                { href: '/admin/users', icon: 'group', label: 'Users' },
                { href: '/admin/pricing', icon: 'payments', label: 'Pricing' },
                { href: '/admin/ai-config', icon: 'memory', label: 'AI Config' },
                { href: '/admin/logs', icon: 'list_alt', label: 'Logs' },
                { href: '/settings', icon: 'settings', label: 'Settings' },
            ]}
            brandIcon="admin_panel_settings"
            brandSubtext="Admin Panel"
            avatarBg="bg-emerald-500"
            fallbackInitial="A"
            hideMobileLogout={true}
        />
    );
}
