import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { prdDocument } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Edit, ArrowLeft } from 'lucide-react';
// Remove custom formatDate import as it is missing in lib/utils
function formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    }).format(new Date(date));
}
import type { Metadata } from 'next';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { title: 'PRD' };
    const [doc] = await db.select({ title: prdDocument.title }).from(prdDocument)
        .where(and(eq(prdDocument.id, parseInt(id)), eq(prdDocument.userId, session.user.id)));
    return { title: doc?.title || 'PRD' };
}

export default async function PRDViewPage({ params }: Props) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect('/login');

    const { id } = await params;
    const [doc] = await db.select().from(prdDocument)
        .where(and(eq(prdDocument.id, parseInt(id)), eq(prdDocument.userId, session.user.id)));

    if (!doc) notFound();

    // Render markdown server-side simply (client editor handles full rendering)

    return (
        <div className="min-h-screen bg-[#0f172a]">
            {/* Top bar */}
            <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/prds" className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <h1 className="text-sm font-semibold text-white truncate">{doc.title}</h1>
                    <span className="text-xs text-slate-400">· {formatDate(doc.updatedAt)}</span>
                </div>
                <Link
                    href={`/prd/${doc.id}/edit`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg primary-gradient text-white text-xs font-semibold hover:opacity-90 transition-all"
                >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                </Link>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-8 py-10">
                <MarkdownRenderer content={doc.content} className="prose-prd" />
            </div>
        </div>
    );
}
