import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { prdDocument } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/prd - List user's PRDs
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const docs = await db.query.prdDocument.findMany({
            where: (prd, { eq }) => eq(prd.userId, session.user.id),
            orderBy: (prd, { desc }) => [desc(prd.updatedAt)],
            columns: {
                id: true,
                userId: true,
                sessionId: true,
                title: true,
                createdAt: true,
                updatedAt: true,
                content: true // dashboard uses this to calculate total word count.
            }
        });

        return NextResponse.json({ documents: docs });
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
