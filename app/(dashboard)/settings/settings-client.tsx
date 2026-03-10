'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsClient() {
    const { data: session } = useSession();
    const router = useRouter();
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [loadingMaintenance, setLoadingMaintenance] = useState(false);
    const [fetchingMaintenance, setFetchingMaintenance] = useState(true);

    const userRole = (session?.user as { role?: string })?.role;
    const isAdmin = userRole === 'admin';

    useEffect(() => {
        if (!isAdmin) { setFetchingMaintenance(false); return; }
        fetch('/api/admin/maintenance')
            .then((r) => r.json())
            .then((d) => setMaintenanceMode(d.maintenanceMode ?? false))
            .finally(() => setFetchingMaintenance(false));
    }, [isAdmin]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    const handleToggleMaintenance = async () => {
        setLoadingMaintenance(true);
        const next = !maintenanceMode;
        try {
            const res = await fetch('/api/admin/maintenance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ maintenanceMode: next }),
            });
            if (res.ok) setMaintenanceMode(next);
        } finally {
            setLoadingMaintenance(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">Settings</h1>
                <p className="text-sm md:text-base text-slate-400">Manage your account preferences</p>
            </div>

            {/* Profile section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden relative flex-shrink-0">
                        {session?.user?.image ? (
                            <Image src={session.user.image} alt={session.user.name || 'User'} fill className="object-cover" />
                        ) : (
                            session?.user?.name?.charAt(0)?.toUpperCase() || 'U'
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">{session?.user?.name || 'User'}</h2>
                        <p className="text-sm text-slate-400">{session?.user?.email || '—'}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {userRole === 'admin' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-500/15 text-red-400 border border-red-500/25">
                                    ADMIN
                                </span>
                            ) : (() => {
                                const tier = ((session?.user as any)?.tier || 'FREE').toUpperCase();
                                const styles: Record<string, string> = {
                                    FREE: 'bg-slate-700/60 text-slate-300 border border-slate-600/50',
                                    PLUS: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
                                    PRO: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
                                };
                                return (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${styles[tier] ?? styles.FREE}`}>
                                        {tier}
                                    </span>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-800">
                        <span className="material-symbols-outlined text-slate-400 text-[20px]">person</span>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Name</p>
                            <p className="text-sm font-semibold text-white">{session?.user?.name || '—'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-800">
                        <span className="material-symbols-outlined text-slate-400 text-[20px]">mail</span>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Email</p>
                            <p className="text-sm font-semibold text-white">{session?.user?.email || '—'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-800">
                        <span className="material-symbols-outlined text-slate-400 text-[20px]">shield</span>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Role</p>
                            <p className="text-sm font-semibold text-white">{userRole || 'user'}</p>
                        </div>
                    </div>
                </div>
            </div>


            {/* Maintenance Mode — admin only */}
            {isAdmin && !fetchingMaintenance && (
                <div className={cn(
                    'mb-6 rounded-xl border p-5 transition-all',
                    maintenanceMode
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-slate-900 border-slate-800'
                )}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className={cn(
                                'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                                maintenanceMode ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-800 text-slate-400'
                            )}>
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-white">Maintenance Mode</p>
                                    <span className={cn(
                                        'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border',
                                        maintenanceMode
                                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                            : 'bg-slate-800 text-slate-500 border-slate-700'
                                    )}>
                                        {maintenanceMode ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {maintenanceMode
                                        ? 'Users are redirected to maintenance page.'
                                        : 'When enabled, users see a maintenance notice.'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleToggleMaintenance}
                            disabled={loadingMaintenance}
                            className={cn(
                                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-shrink-0 disabled:opacity-60',
                                maintenanceMode
                                    ? 'bg-amber-500 hover:bg-amber-400 text-black'
                                    : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200'
                            )}
                        >
                            {loadingMaintenance ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : maintenanceMode ? (
                                <X className="w-4 h-4" />
                            ) : (
                                <AlertTriangle className="w-4 h-4" />
                            )}
                            {loadingMaintenance ? 'Updating...' : maintenanceMode ? 'Disable' : 'Enable'}
                        </button>
                    </div>
                </div>
            )}

            {/* Sign out */}
            <div className="mt-8">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-bold w-full justify-center"
                >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    Sign out
                </button>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-xs text-slate-500">
                <p>&copy; {new Date().getFullYear()} Lucky Brew. All rights reserved.</p>
                <p className="mt-1">Version 0.1.0</p>
            </div>
        </div>
    );
}
