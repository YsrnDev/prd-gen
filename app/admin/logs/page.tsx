'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
interface SystemLog {
    id: string;
    timestamp: string;
    event_type: 'AUTH' | 'SYSTEM' | 'USER_ACTION' | 'AI_GENERATION' | 'ERROR';
    user?: string;
    description: string;
    status: 'success' | 'warning' | 'error' | 'info';
    ip?: string;
}

export default function SystemLogsPage() {
    const [filter, setFilter] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
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
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
        const matchesFilter = filter === 'ALL' || log.event_type === filter || log.status === filter;
        const searchTarget = `${log.description} ${log.user || ''}`.toLowerCase();
        const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    function getEventIcon(type: string) {
        switch (type) {
            case 'AUTH': return 'vpn_key';
            case 'SYSTEM': return 'dns';
            case 'USER_ACTION': return 'person';
            case 'AI_GENERATION': return 'auto_awesome';
            case 'ERROR': return 'warning';
            default: return 'info';
        }
    }

    function getStatusStyle(status: string) {
        switch (status) {
            case 'success': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'error': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'warning': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'info': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    }

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black tracking-tight mb-2">System Logs</h2>
                <p className="text-slate-400">
                    Monitor application activity, authentications, and system events.
                </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
                <div className="relative w-full sm:w-96">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" style={{ fontSize: '18px' }}>search</span>
                    <input
                        type="text"
                        placeholder="Search logs by description or user..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field w-full h-10 py-0"
                        style={{ paddingLeft: '38px' }}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                    {['ALL', 'AUTH', 'AI_GENERATION', 'SYSTEM', 'ERROR'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${filter === f
                                ? 'bg-[#135bec] text-white border-[#135bec]'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                }`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-800/50 border-b border-slate-800">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-16">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-48">Timestamp</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-32">Event</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Description</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-48">User / IP</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {filteredLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                <span className="material-symbols-outlined text-4xl mb-3 opacity-50 block">search_off</span>
                                                No logs found matching your criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLogs.map((log) => {
                                            const date = new Date(log.timestamp);
                                            return (
                                                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className={`size-8 rounded flex items-center justify-center border ${getStatusStyle(log.status)}`}>
                                                            <span className="material-symbols-outlined text-[18px]">
                                                                {log.status === 'success' ? 'check' : log.status === 'error' ? 'close' : log.status === 'warning' ? 'priority_high' : 'info'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-400 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-200 font-medium">
                                                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </span>
                                                            <span className="text-xs">
                                                                {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-[16px] text-slate-500">{getEventIcon(log.event_type)}</span>
                                                            <span className="text-xs font-bold text-slate-300 tracking-wider">
                                                                {log.event_type.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-medium text-slate-200">{log.description}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-300 truncate max-w-[150px]">{log.user || '-'}</span>
                                                            <span className="text-xs text-slate-500 font-mono">{log.ip || 'System'}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-slate-800 bg-slate-800/30 flex justify-between items-center text-sm text-slate-400">
                            <span>Showing {filteredLogs.length} entries</span>
                            <div className="flex gap-2">
                                <button disabled className="px-3 py-1 rounded border border-slate-700 bg-slate-800 opacity-50 cursor-not-allowed">Previous</button>
                                <button disabled className="px-3 py-1 rounded border border-slate-700 bg-slate-800 opacity-50 cursor-not-allowed">Next</button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
