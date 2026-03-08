import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user as userSchema, prdDocument, wizardSession } from '@/lib/db/schema';
import { count, desc, sql, gte } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Users, FileText, Activity } from 'lucide-react';
import { LiveDataButton, ExportReportButton } from './components/DashboardButtons';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as { role?: string }).role !== 'admin') redirect('/dashboard');

    // Last 7 days range
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Fetch real stats from Supabase Database
    const [totalUsers, totalPRDs, totalSessions, prdsByDay, sessionsByDay] = await Promise.all([
        db.select({ count: count() }).from(userSchema),
        db.select({ count: count() }).from(prdDocument),
        db.select({ count: count() }).from(wizardSession),
        // PRDs per day (last 7 days)
        db.select({
            day: sql<string>`to_char(${prdDocument.createdAt}, 'YYYY-MM-DD')`.as('day'),
            count: count(),
        })
            .from(prdDocument)
            .where(gte(prdDocument.createdAt, sevenDaysAgo))
            .groupBy(sql`to_char(${prdDocument.createdAt}, 'YYYY-MM-DD')`)
            .orderBy(sql`to_char(${prdDocument.createdAt}, 'YYYY-MM-DD')`),
        // AI sessions per day (last 7 days)
        db.select({
            day: sql<string>`to_char(${wizardSession.createdAt}, 'YYYY-MM-DD')`.as('day'),
            count: count(),
        })
            .from(wizardSession)
            .where(gte(wizardSession.createdAt, sevenDaysAgo))
            .groupBy(sql`to_char(${wizardSession.createdAt}, 'YYYY-MM-DD')`)
            .orderBy(sql`to_char(${wizardSession.createdAt}, 'YYYY-MM-DD')`),
    ]);

    // Fetch latest users for real recent activity
    const recentUsers = await db.select()
        .from(userSchema)
        .orderBy(desc(userSchema.createdAt))
        .limit(4);

    // Build 7-day chart data
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartData: { label: string; date: string; prds: number; sessions: number }[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const label = dayLabels[d.getDay()];
        const prds = prdsByDay.find(r => r.day === dateStr)?.count ?? 0;
        const sessions = sessionsByDay.find(r => r.day === dateStr)?.count ?? 0;
        chartData.push({ label, date: dateStr, prds, sessions });
    }
    const maxVal = Math.max(...chartData.map(d => Math.max(d.prds, d.sessions)), 1);

    const stats = [
        { label: 'Total Registered Users', value: totalUsers[0]?.count ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', change: 'Live', trend: 'up' as const },
        { label: 'Total PRDs Generated', value: totalPRDs[0]?.count ?? 0, icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10', change: 'Live', trend: 'up' as const },
        { label: 'Total AI Sessions', value: totalSessions[0]?.count ?? 0, icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10', change: 'Live', trend: 'up' as const },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-fg)]">Platform Overview</h1>
                    <p className="text-sm text-[var(--color-muted-fg)] mt-1">Real-time performance and system status monitoring.</p>
                </div>
                <div className="flex items-center gap-3">
                    <LiveDataButton />
                    <ExportReportButton />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="glass-card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <span className={`flex items-center gap-1 text-xs font-bold ${stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                                <span className="relative flex h-2 w-2 mr-1">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-xs text-[var(--color-muted-fg)] mb-1 uppercase tracking-wider font-semibold">{stat.label}</p>
                        <p className="text-3xl font-black text-[var(--color-fg)]">{stat.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Usage Trends + Recent Activity */}
            <div className="grid grid-cols-[1fr_320px] gap-4 mb-6">
                {/* Usage Trends Chart - Real Data */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-bold text-[var(--color-fg)]">Usage Trends</h2>
                            <p className="text-xs text-[var(--color-muted-fg)]">PRDs generated & AI sessions — last 7 days</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                                <span className="text-[var(--color-muted-fg)] font-medium">PRDs</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                                <span className="text-[var(--color-muted-fg)] font-medium">AI Sessions</span>
                            </div>
                        </div>
                    </div>
                    {/* Bar Chart */}
                    <div className="flex items-end gap-3 h-44">
                        {chartData.map((d) => (
                            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                                <div className="flex items-end gap-1 w-full h-36">
                                    {/* PRDs bar */}
                                    <div className="flex-1 flex flex-col items-center justify-end h-full">
                                        {d.prds > 0 && (
                                            <span className="text-[10px] text-blue-400 font-bold mb-1">{d.prds}</span>
                                        )}
                                        <div
                                            className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-500"
                                            style={{ height: `${Math.max((d.prds / maxVal) * 100, d.prds > 0 ? 8 : 2)}%`, minHeight: '2px' }}
                                        />
                                    </div>
                                    {/* Sessions bar */}
                                    <div className="flex-1 flex flex-col items-center justify-end h-full">
                                        {d.sessions > 0 && (
                                            <span className="text-[10px] text-emerald-400 font-bold mb-1">{d.sessions}</span>
                                        )}
                                        <div
                                            className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-500"
                                            style={{ height: `${Math.max((d.sessions / maxVal) * 100, d.sessions > 0 ? 8 : 2)}%`, minHeight: '2px' }}
                                        />
                                    </div>
                                </div>
                                <span className="text-[10px] text-[var(--color-muted-fg)] font-semibold uppercase mt-1">{d.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Real Recent Activity (Latest Registered Users) */}
                <div className="glass-card p-5">
                    <h3 className="text-sm font-bold text-[var(--color-fg)] mb-4">Recent Users</h3>
                    <div className="space-y-4">
                        {recentUsers.length === 0 ? (
                            <p className="text-xs text-[var(--color-muted-fg)]">No users registered yet.</p>
                        ) : (
                            recentUsers.map((u, i) => (
                                <div key={u.id} className="flex gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-blue-500'} mt-1.5 flex-shrink-0`} />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-[var(--color-fg)]">{u.name || 'Anonymous User'}</p>
                                        <p className="text-xs text-[var(--color-muted-fg)] mt-0.5 truncate">{u.email}</p>
                                        <p className="text-[10px] text-[var(--color-muted-fg)] uppercase tracking-wider mt-1 font-semibold">
                                            Role: {u.role || 'user'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom status bar */}
            <div className="glass-card px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-[var(--color-muted-fg)]">
                        Supabase Database Connection
                    </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">Connected & Live</span>
                </div>
            </div>
        </div>
    );
}
