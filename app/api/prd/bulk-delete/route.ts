import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { prdDocument, wizardSession } from '@/lib/db/schema';
import { inArray, and, eq } from 'drizzle-orm';

// POST /api/prd/bulk-delete
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { ids } = body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Invalid or empty IDs array' }, { status: 400 });
        }

        const prdIds: number[] = [];
        const wizardIds: number[] = [];

        // Distinguish between wizard sessions and actual PRDs
        for (const idStr of ids) {
            const str = String(idStr);
            if (str.startsWith('wizard-')) {
                wizardIds.push(Number(str.replace('wizard-', '')));
            } else {
                prdIds.push(Number(str));
            }
        }

        // Run deletions within transactions or simple awaits
        const promises = [];

        if (prdIds.length > 0) {
            promises.push(
                db.delete(prdDocument)
                    .where(
                        and(
                            inArray(prdDocument.id, prdIds),
                            eq(prdDocument.userId, session.user.id)
                        )
                    )
            );
        }

        if (wizardIds.length > 0) {
            promises.push(
                db.delete(wizardSession)
                    .where(
                        and(
                            inArray(wizardSession.id, wizardIds),
                            eq(wizardSession.userId, session.user.id)
                        )
                    )
            );
        }

        await Promise.all(promises);

        return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        console.error('Error during bulk deletion:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
