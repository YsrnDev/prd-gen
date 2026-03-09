import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user as userSchema, prdDocument, wizardSession } from '@/lib/db/schema';
import { sql, count, desc, gte, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ExportReportButton, MaintenanceToggleButton } from './components/DashboardButtons';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin Dashboard' };

function formatTimeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'yr ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm ago';
    return 'Just now';
}

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

    // Fetch latest activities from 3 sources
    const [recentUsersRaw, recentPRDsRaw, recentSessionsRaw] = await Promise.all([
        db.select().from(userSchema).orderBy(desc(userSchema.createdAt)).limit(5),
        db.select({ id: prdDocument.id, title: prdDocument.title, createdAt: prdDocument.createdAt, userName: userSchema.name })
            .from(prdDocument)
            .leftJoin(userSchema, eq(prdDocument.userId, userSchema.id))
            .orderBy(desc(prdDocument.createdAt)).limit(5),
        db.select({ id: wizardSession.id, status: wizardSession.status, createdAt: wizardSession.createdAt, userName: userSchema.name })
            .from(wizardSession)
            .leftJoin(userSchema, eq(wizardSession.userId, userSchema.id))
            .orderBy(desc(wizardSession.createdAt)).limit(5),
    ]);

    // Combine and sort activities
    const combinedActivities = [
        ...recentUsersRaw.map(u => ({
            id: `user-${u.id}`,
            title: `New user: ${u.name || 'Anonymous User'}`,
            subtitle: `${u.email} • Role: ${u.role}`,
            timestamp: new Date(u.createdAt),
            icon: 'person_add',
            bgColor: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
        })),
        ...recentPRDsRaw.map(p => ({
            id: `prd-${p.id}`,
            title: `Generated PRD: ${p.title || 'Untitled'}`,
            subtitle: `By ${p.userName || 'Anonymous'}`,
            timestamp: new Date(p.createdAt),
            icon: 'description',
            bgColor: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
        })),
        ...recentSessionsRaw.map(s => ({
            id: `session-${s.id}`,
            title: 'Started AI Session',
            subtitle: `By ${s.userName || 'Anonymous'} • ${s.status === 'completed' ? 'Done' : 'Draft'}`,
            timestamp: new Date(s.createdAt),
            icon: 'memory',
            bgColor: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
        }))
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);

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
        {
            label: 'Total Registered Users',
            value: totalUsers[0]?.count ?? 0,
            sub: 'Active platform accounts',
            icon: 'group',
            iconColor: 'text-[#135bec]',
            iconBg: 'bg-[#135bec]/10'
        },
        {
            label: 'Total PRDs Generated',
            value: totalPRDs[0]?.count ?? 0,
            sub: 'Documents created by users',
            icon: 'description',
            iconColor: 'text-amber-400',
            iconBg: 'bg-amber-500/10'
        },
        {
            label: 'Total AI Sessions',
            value: totalSessions[0]?.count ?? 0,
            sub: 'Total wizard interactions',
            icon: 'memory',
            iconColor: 'text-emerald-400',
            iconBg: 'bg-emerald-500/10'
        },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-fg)]">Platform Overview</h1>
                    <p className="text-xs sm:text-sm text-[var(--color-muted-fg)] mt-1">Real-time performance and system status monitoring.</p>
                </div>
                <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                    <MaintenanceToggleButton />
                    <ExportReportButton />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-1 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-400">{stat.label}</span>
                            <div className={`size-9 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                                <span className={`material-symbols-outlined text-[20px] ${stat.iconColor}`}>{stat.icon}</span>
                            </div>
                        </div>
                        <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
                        <p className="text-sm text-slate-500 mt-1">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Usage Trends + Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Usage Trends Chart - Real Data */}
                <div className="glass-card p-6 md:col-span-2">
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
                    <h3 className="text-sm font-bold text-[var(--color-fg)] mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {combinedActivities.length === 0 ? (
                            <p className="text-xs text-[var(--color-muted-fg)]">No activities yet.</p>
                        ) : (
                            combinedActivities.map((act) => (
                                <div key={act.id} className="flex gap-3">
                                    <div className={`w-7 h-7 rounded-lg ${act.bgColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                        <span className="material-symbols-outlined text-[16px] text-white/90">{act.icon}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-[var(--color-fg)] truncate">{act.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-xs text-[var(--color-muted-fg)] truncate">{act.subtitle}</p>
                                            <span className="text-[10px] text-slate-500 font-medium shrink-0">
                                                {formatTimeAgo(act.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
