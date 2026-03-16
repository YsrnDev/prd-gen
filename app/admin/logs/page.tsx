'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Cpu, UserCircle, Wand2, Info, Search, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface SystemLog {
    id: string;
    timestamp: string;
    event_type: 'AUTH' | 'SYSTEM' | 'USER_ACTION' | 'AI_GENERATION' | 'ERROR';
    user?: string;
    description: string;
    status: 'success' | 'warning' | 'error' | 'info';
    ip?: string;
}

function LogsSkeleton() {
    return (
        <div className="w-full max-w-7xl mx-auto animate-pulse">
            <div className="mb-4 space-y-2">
                <div className="h-6 w-40 bg-slate-800 rounded" />
                <div className="h-4 w-36 bg-slate-800 rounded" />
            </div>

            <div className="h-10 w-full bg-slate-800 rounded-lg mb-4" />

            <div className="flex gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 w-24 bg-slate-800 rounded-lg" />
                ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="h-12 bg-slate-800/60" />
                <div className="divide-y divide-slate-800">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="px-6 py-4 flex items-center gap-4">
                            <div className="w-8 h-8 rounded bg-slate-800" />
                            <div className="w-40 h-4 bg-slate-800 rounded" />
                            <div className="w-24 h-4 bg-slate-800 rounded" />
                            <div className="flex-1 h-4 bg-slate-800 rounded" />
                            <div className="w-32 h-4 bg-slate-800 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function SystemLogsPage() {
    const [filter, setFilter] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/logs');
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs || []);
            }
        } catch (err) {
            console.error("Failed to load logs", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    // Reset page to 1 on filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchQuery]);

    const filteredLogs = logs.filter(log => {
        const matchesFilter = filter === 'ALL' || log.event_type === filter || log.status === filter;
        const searchTarget = `${log.description} ${log.user || ''}`.toLowerCase();
        const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
    const currentLogs = filteredLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    function getEventIcon(type: string) {
        switch (type) {
            case 'AUTH': return <ShieldAlert className="w-3.5 h-3.5" />;
            case 'SYSTEM': return <Cpu className="w-3.5 h-3.5" />;
            case 'USER_ACTION': return <UserCircle className="w-3.5 h-3.5" />;
            case 'AI_GENERATION': return <Wand2 className="w-3.5 h-3.5" />;
            case 'ERROR': return <AlertTriangle className="w-3.5 h-3.5" />;
            default: return <Info className="w-3.5 h-3.5" />;
        }
    }

    function getStatusStyle(status: string) {
        switch (status) {
            case 'success': return 'bg-emerald-500/10 text-emerald-500';
            case 'error': return 'bg-rose-500/10 text-rose-500';
            case 'warning': return 'bg-amber-500/10 text-amber-500';
            case 'info': return 'bg-blue-500/10 text-blue-500';
            default: return 'bg-[var(--color-accent)] text-[var(--color-muted-fg)]';
        }
    }

    function getStatusIcon(status: string) {
        switch (status) {
            case 'success': return <CheckCircle2 className="w-4 h-4" />;
            case 'error': return <XCircle className="w-4 h-4" />;
            case 'warning': return <AlertTriangle className="w-4 h-4" />;
            case 'info': return <Info className="w-4 h-4" />;
            default: return <Info className="w-4 h-4" />;
        }
    }

    function getEventBadgeStyle(type: string) {
        switch (type) {
            case 'AUTH': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
            case 'ERROR': return 'bg-red-500/10 text-red-500 border border-red-500/20';
            case 'AI_GENERATION': return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
            case 'SYSTEM': return 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20';
            case 'USER_ACTION': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
            default: return 'bg-[var(--color-accent)] text-[var(--color-muted-fg)] border border-[var(--color-border)]';
        }
    }

    function formatIp(ip?: string) {
        if (!ip || ip === 'unknown') return 'System';
        if (/^[0-9a-f]{16}$/i.test(ip)) return 'IP masked';
        return ip;
    }

    return (
        <div className="w-full max-w-7xl mx-auto">
            {/* Header - outside the card, like User Management */}
            <div className="mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-[var(--color-fg)]">System Logs</h1>
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] hover:bg-[var(--color-accent)] transition-colors disabled:opacity-50"
                        title="Refresh Logs"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <p className="text-[var(--color-muted-fg)] mt-1">{filteredLogs.length} log entries</p>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-fg)]" />
                <input
                    type="text"
                    placeholder="Search logs by description or user..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-fg)] placeholder:text-[var(--color-muted-fg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 hide-scrollbar scroll-smooth snap-x">
                {['ALL', 'AUTH', 'AI_GENERATION', 'SYSTEM', 'ERROR'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border snap-start ${filter === f
                            ? 'bg-[#135bec] text-white border-[#135bec]'
                            : 'bg-[var(--color-card)] text-[var(--color-muted-fg)] border-[var(--color-border)] hover:bg-[var(--color-accent)] hover:text-[var(--color-fg)]'
                            }`}
                    >
                        {f.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <LogsSkeleton />
            ) : (
                <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#131b33] border-b border-[var(--color-border)]">
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)] w-16">Status</th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)] w-48">Timestamp</th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)] w-40">Event</th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)]">Description</th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)] w-48">User / IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {currentLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-muted-fg)]">
                                            <Search className="w-10 h-10 mx-auto mb-3 opacity-50 block" />
                                            No logs found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    currentLogs.map((log) => {
                                        const date = new Date(log.timestamp);
                                        return (
                                            <tr key={log.id} className="hover:bg-[#1a2038] transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className={`size-8 rounded flex items-center justify-center border ${getStatusStyle(log.status)} border-current/20`}>
                                                        {getStatusIcon(log.status)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-[var(--color-fg)] font-medium">
                                                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                        <span className="text-xs text-[var(--color-muted-fg)]">
                                                            {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-[var(--color-fg)]">
                                                        <span className="text-[var(--color-muted-fg)]">{getEventIcon(log.event_type)}</span>
                                                        <span className="text-xs font-bold tracking-wider">
                                                            {log.event_type.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-[var(--color-fg)]">{log.description}</p>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex flex-col">
                                                        <span className="text-[var(--color-fg)] truncate max-w-[150px]">{log.user || '-'}</span>
                                                        <span className="text-xs text-[var(--color-muted-fg)] font-mono">{formatIp(log.ip)}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View — mirrors User Management pattern exactly */}
                    <div className="md:hidden flex flex-col divide-y divide-[var(--color-border)]">
                        {currentLogs.length === 0 ? (
                            <div className="text-center py-12 text-[var(--color-muted-fg)]">
                                <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No logs found</p>
                            </div>
                        ) : (
                            currentLogs.map((log) => {
                                const date = new Date(log.timestamp);
                                return (
                                    <div key={log.id} className="p-3 hover:bg-[#1a2038] transition-colors flex items-center gap-3">
                                        {/* Status Icon */}
                                        <div className={`size-10 flex-shrink-0 rounded-full flex items-center justify-center ${getStatusStyle(log.status)}`}>
                                            {getStatusIcon(log.status)}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                            <span className={`self-start inline-flex flex-shrink-0 items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${getEventBadgeStyle(log.event_type)}`}>
                                                {log.event_type.replace('_', ' ')}
                                            </span>
                                            <p className="text-sm font-semibold text-[var(--color-fg)] leading-snug line-clamp-2">{log.description}</p>
                                            <p className="text-[11px] text-[var(--color-muted-fg)] truncate">
                                                {log.user || 'System'} • {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Pagination footer */}
                    {totalPages > 1 && (
                        <div className="p-3 sm:p-4 border-t border-[var(--color-border)] bg-[#131b33] flex flex-col sm:flex-row gap-3 justify-between items-center text-sm text-[var(--color-muted-fg)]">
                            <span className="font-medium text-xs sm:text-sm">
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} of {filteredLogs.length} entries
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] hover:bg-[var(--color-accent)] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-xs sm:text-sm"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] hover:bg-[var(--color-accent)] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-xs sm:text-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
