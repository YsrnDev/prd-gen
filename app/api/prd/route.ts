import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { prdDocument, wizardSession } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/prd - List user's PRDs
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const docs = await db.query.prdDocument.findMany({
            where: (prd, { eq }) => eq(prd.userId, session.user.id),
            columns: {
                id: true,
                userId: true,
                sessionId: true,
                title: true,
                createdAt: true,
                updatedAt: true,
                content: true
            }
        });

        const activeSessions = await db.query.wizardSession.findMany({
            where: (ws, { eq, and }) => and(eq(ws.userId, session.user.id), eq(ws.status, 'in_progress')),
        });

        const formattedDocs = docs.map(d => ({
            ...d,
            type: 'prd',
            status: 'completed'
        }));

        const formattedDrafts = activeSessions.map(s => {
            const answers = s.answers as Record<string, string> || {};
            // Using logic: maybe "project_name" or "project-name" mapping to the title
            const prjName = answers['project_name'] || answers['project-name'] || answers['projectName'];
            const title = prjName ? `${prjName} (Draft)` : 'Untitled Draft';
            return {
                id: `wizard-${s.id}`,
                userId: s.userId,
                sessionId: s.id,
                title,
                createdAt: s.createdAt,
                updatedAt: s.updatedAt,
                content: '',
                type: 'wizard',
                status: 'draft'
            };
        });

        const allDocs = [...formattedDocs, ...formattedDrafts]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        return NextResponse.json({ documents: allDocs });
    } catch (error) {
        console.error('Error fetching PRDs:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/prd - Save a new PRD
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { title, content, sessionId } = body;

        if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

        const [doc] = await db
            .insert(prdDocument)
            .values({
                userId: session.user.id,
                title: title || extractTitle(content) || 'Untitled PRD',
                content,
                sessionId: sessionId ? parseInt(sessionId) : null,
            })
            .returning();

        // Mark the wizard session as completed so it no longer shows up as a draft
        if (sessionId) {
            await db
                .update(wizardSession)
                .set({ status: 'completed' })
                .where(
                    and(
                        eq(wizardSession.id, parseInt(sessionId)),
                        eq(wizardSession.userId, session.user.id)
                    )
                );
        }

        return NextResponse.json({ document: doc }, { status: 201 });
    } catch (error) {
        console.error('Error saving PRD:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

function extractTitle(content: string): string {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim().slice(0, 100) : 'Untitled PRD';
}
