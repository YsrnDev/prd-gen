import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { prdDocument, wizardSession, user } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const createPrdSchema = z.object({
    title: z.string().max(200).optional(),
    content: z.string().min(1, 'Content is required').max(500000),
    sessionId: z.union([z.string(), z.number()]).optional(),
});

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

        const [userData] = await db.select({ emailVerified: user.emailVerified })
            .from(user)
            .where(eq(user.id, session.user.id))
            .limit(1);
        if (!userData?.emailVerified) {
            return NextResponse.json(
                { error: 'Please verify your email to create PRDs.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const parsed = createPrdSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }

        const { title, content, sessionId } = parsed.data;
        const parsedSessionId = sessionId ? parseInt(String(sessionId)) : null;
        if (sessionId && (parsedSessionId === null || isNaN(parsedSessionId))) {
            return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
        }

        const [doc] = await db
            .insert(prdDocument)
            .values({
                userId: session.user.id,
                title: title || extractTitle(content) || 'Untitled PRD',
                content,
                sessionId: parsedSessionId,
            })
            .returning();

        if (parsedSessionId) {
            await db
                .update(wizardSession)
                .set({ status: 'completed' })
                .where(
                    and(
                        eq(wizardSession.id, parsedSessionId),
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
