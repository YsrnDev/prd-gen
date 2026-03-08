import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { prdDocument } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import type { Metadata } from 'next';
import { DeletePrdButton } from '@/components/DeletePrdButton';

export const metadata: Metadata = { title: 'My PRDs' };

export default async function PRDsPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect('/login');

    const prds = await db.query.prdDocument.findMany({
        where: (prd, { eq }) => eq(prd.userId, session.user.id),
        orderBy: (prd, { desc }) => [desc(prd.updatedAt)],
        columns: { content: false },
    });

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-1">My PRDs</h1>
                    <p className="text-sm text-slate-400">{prds.length} document{prds.length !== 1 ? 's' : ''}</p>
                </div>
                <Link
                    href="/wizard/new"
                    className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#135bec] text-white text-sm font-bold hover:bg-[#135bec]/90 transition-all shadow-lg shadow-[#135bec]/20"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    New PRD
                </Link>
            </div>

            {prds.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 text-center shadow-sm">
                    <span className="material-symbols-outlined text-slate-500 text-5xl mb-4 block opacity-40">description</span>
                    <h3 className="text-lg font-bold text-white mb-2">No PRDs yet</h3>
                    <p className="text-sm text-slate-400 mb-6">Start by creating your first PRD with our AI-powered wizard.</p>
                    <Link href="/wizard/new" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#135bec] text-white text-sm font-bold hover:bg-[#135bec]/90 transition-all shadow-lg shadow-[#135bec]/20">
                        <span className="material-symbols-outlined text-[20px]">add</span> Create First PRD
                    </Link>
                </div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-800/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Updated</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {prds.map((prd) => (
                                    <tr key={prd.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded bg-[#135bec]/10 flex items-center justify-center text-[#135bec]">
                                                    <span className="material-symbols-outlined text-[20px]">description</span>
                                                </div>
                                                <span className="font-medium text-white text-sm">{prd.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-400">{formatDate(prd.createdAt)}</td>
                                        <td className="px-6 py-5 text-sm text-slate-400">{formatDate(prd.updatedAt)}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/prd/${prd.id}`} className="text-slate-400 hover:text-[#135bec] transition-colors" title="View">
                                                    <span className="material-symbols-outlined">visibility</span>
                                                </Link>
                                                <Link href={`/prd/${prd.id}/edit`} className="text-slate-400 hover:text-[#135bec] transition-colors" title="Edit">
                                                    <span className="material-symbols-outlined">edit</span>
                                                </Link>
                                                <DeletePrdButton prdId={prd.id} prdTitle={prd.title} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
