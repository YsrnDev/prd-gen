'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { DeletePrdButton } from '@/components/DeletePrdButton';

interface PRD {
    id: number;
    title: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    content?: string;
}

function formatDate(dateStr: string) {
    try {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        }).format(new Date(dateStr));
    } catch {
        return dateStr;
    }
}

function getWordCount(content?: string) {
    if (!content) return 0;
    return content.trim().split(/\s+/).filter(Boolean).length;
}

function getStatusBadge(status: string) {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
        completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Completed' },
        review: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'In Review' },
        draft: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Draft' },
    };
    const s = styles[status] || styles.draft;
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
            {s.label}
        </span>
    );
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const [prds, setPrds] = useState<PRD[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPrds = useCallback(() => {
        setLoading(true);
        fetch('/api/prd')
            .then(res => res.json())
            .then(data => setPrds(data.documents || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchPrds(); }, [fetchPrds]);

    // Listen for delete events to refresh
    useEffect(() => {
        const handler = () => fetchPrds();
        window.addEventListener('prd-deleted', handler);
        return () => window.removeEventListener('prd-deleted', handler);
    }, [fetchPrds]);

    const { totalPrds, drafts, completed, totalWords, recentPrds, stats } = useMemo(() => {
        const totalPrds = prds.length;
        const drafts = prds.filter(p => !p.status || p.status === 'draft').length;
        const completed = prds.filter(p => p.status === 'completed').length;
        const totalWords = prds.reduce((acc, p) => acc + getWordCount(p.content), 0);
        const recentPrds = prds.slice(0, 5);

        const stats = [
            {
                label: 'Total PRDs',
                value: totalPrds,
                sub: totalPrds === 0 ? 'No documents yet' : `${totalWords.toLocaleString()} total words`,
                icon: 'description',
                iconColor: 'text-[#135bec]',
                iconBg: 'bg-[#135bec]/10',
            },
            {
                label: 'Drafts',
                value: drafts,
                sub: drafts === 0 ? 'All caught up' : `${drafts} pending completion`,
                icon: 'edit_note',
                iconColor: 'text-amber-400',
                iconBg: 'bg-amber-500/10',
            },
            {
                label: 'Completed',
                value: completed,
                sub: totalPrds > 0 ? `${Math.round((completed / totalPrds) * 100)}% completion rate` : 'No documents yet',
                icon: 'check_circle',
                iconColor: 'text-emerald-400',
                iconBg: 'bg-emerald-500/10',
            },
        ];

        return { totalPrds, drafts, completed, totalWords, recentPrds, stats };
    }, [prds]);

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <header className="mb-6 md:mb-10">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Dashboard</h2>
                <p className="text-sm md:text-base text-slate-400">
                    Welcome back, {session?.user?.name || 'User'}. Here&apos;s your PRD overview.
                </p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-1 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-400">{stat.label}</span>
                            <div className={`size-9 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                                <span className={`material-symbols-outlined text-[20px] ${stat.iconColor}`}>{stat.icon}</span>
                            </div>
                        </div>
                        {loading ? (
                            <div className="h-9 w-16 bg-slate-800 rounded animate-pulse" />
                        ) : (
                            <p className="text-3xl font-bold">{stat.value}</p>
                        )}
                        <p className="text-sm text-slate-500 mt-1">{loading ? '' : stat.sub}</p>
                    </div>
                ))}
            </div>



            {/* Recent PRDs Table */}
            <section className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Recent PRDs</h3>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard/prds"
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                        >
                            <span className="material-symbols-outlined text-[18px]">folder_open</span>
                            Browse All PRDs
                        </Link>
                        <Link
                            href="/wizard/new"
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-white bg-[#135bec] hover:bg-blue-600 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Create New PRD
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="p-6 space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="size-8 rounded bg-slate-800 animate-pulse" />
                                <div className="flex-1 h-4 bg-slate-800 rounded animate-pulse" />
                                <div className="w-24 h-4 bg-slate-800 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : recentPrds.length === 0 ? (
                    <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-slate-600 text-5xl block mb-3">description</span>
                        <h4 className="text-white font-bold mb-1">No PRDs yet</h4>
                        <p className="text-slate-500 text-sm mb-5">Create your first AI-powered PRD to get started.</p>
                        <Link
                            href="/wizard/new"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#135bec] text-white text-sm font-bold hover:bg-[#135bec]/90 transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Create PRD
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-800/50">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Title</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Created</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Words</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {recentPrds.map((prd) => (
                                    <tr key={prd.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-5">
                                            <Link href={`/prd/${prd.id}/edit`} className="flex items-center gap-3 group">
                                                <div className="size-8 rounded bg-[#135bec]/10 flex items-center justify-center text-[#135bec]">
                                                    <span className="material-symbols-outlined text-[20px]">description</span>
                                                </div>
                                                <span className="font-medium text-white group-hover:text-[#135bec] transition-colors">{prd.title}</span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-400">
                                            {formatDate(prd.createdAt)}
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-400">
                                            {getWordCount(prd.content).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5">
                                            {getStatusBadge(prd.status)}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/prd/${prd.id}`} className="text-slate-400 hover:text-[#135bec] transition-colors" title="View">
                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                </Link>
                                                <Link href={`/prd/${prd.id}/edit`} className="text-slate-400 hover:text-[#135bec] transition-colors" title="Edit">
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </Link>
                                                <DeletePrdButton prdId={prd.id} prdTitle={prd.title} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
