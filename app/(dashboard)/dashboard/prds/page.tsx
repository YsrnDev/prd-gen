import { auth } from '@/lib/auth';
import { db } from '@/lib/db';


import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PrdTableClient } from '@/components/PrdTableClient';
import { unstable_cache } from 'next/cache';

export const metadata: Metadata = { title: 'My PRDs' };

const getUserPrdsData = (userId: string) => unstable_cache(async () => {
    const docs = await db.query.prdDocument.findMany({
        where: (prd, { eq }) => eq(prd.userId, userId),
        columns: { content: false },
    });

    const activeSessions = await db.query.wizardSession.findMany({
        where: (ws, { eq, and }) => and(eq(ws.userId, userId), eq(ws.status, 'in_progress')),
    });

    const formattedDocs = docs.map(d => ({ ...d, type: 'prd' }));
    const formattedDrafts = activeSessions.map(s => {
        const answers = s.answers as Record<string, string> || {};
        const prjName = answers['project_name'] || answers['project-name'] || answers['projectName'];
        const title = prjName ? `${prjName} (Draft)` : 'Untitled Draft';
        return {
            id: `wizard-${s.id}`,
            userId: s.userId,
            sessionId: s.id,
            title,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
            type: 'wizard',
        };
    });

    const prds = [...formattedDocs, ...formattedDrafts]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const serializedPrds = prds.map(p => ({
        ...p,
        createdAt: new Date(p.createdAt).toISOString(),
        updatedAt: new Date(p.updatedAt).toISOString()
    }));

    return { serializedPrds, totalCount: prds.length };
}, ['user-prds', userId], { revalidate: 5 })();

export default async function PRDsPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect('/login');

    const { serializedPrds, totalCount } = await getUserPrdsData(session.user.id);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-1">My PRDs</h1>
                    <p className="text-sm text-slate-400">{totalCount} document{totalCount !== 1 ? 's' : ''}</p>
                </div>
                <Link
                    href="/wizard/new"
                    className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#135bec] text-white text-sm font-bold hover:bg-[#135bec]/90 transition-all shadow-lg shadow-[#135bec]/20"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    New PRD
                </Link>
            </div>

            <PrdTableClient initialPrds={serializedPrds} />
        </div>
    );
}
