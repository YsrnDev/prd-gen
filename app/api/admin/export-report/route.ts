import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user as userSchema, prdDocument, wizardSession } from '@/lib/db/schema';
import { count, desc, sql, gte } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

// Prevent CSV injection: escape formula-trigger characters and wrap in quotes
function sanitizeCsvCell(value: string): string {
    // Remove commas and double-quotes for safety
    let safe = value.replace(/"/g, '""');
    // If starts with formula-trigger chars, prefix with single-quote
    if (/^[=+\-@\t\r]/.test(safe)) {
        safe = `'${safe}`;
    }
    return `"${safe}"`;
}

export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as { role?: string }).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [totalUsers, totalPRDs, totalSessions, recentUsers, prdsByDay] = await Promise.all([
            db.select({ count: count() }).from(userSchema),
            db.select({ count: count() }).from(prdDocument),
            db.select({ count: count() }).from(wizardSession),
            db.select({
                name: userSchema.name,
                email: userSchema.email,
                role: userSchema.role,
                createdAt: userSchema.createdAt,
            }).from(userSchema).orderBy(desc(userSchema.createdAt)).limit(50),
            db.select({
                day: sql<string>`to_char(${prdDocument.createdAt}, 'YYYY-MM-DD')`.as('day'),
                count: count(),
            })
                .from(prdDocument)
                .where(gte(prdDocument.createdAt, thirtyDaysAgo))
                .groupBy(sql`to_char(${prdDocument.createdAt}, 'YYYY-MM-DD')`)
                .orderBy(sql`to_char(${prdDocument.createdAt}, 'YYYY-MM-DD')`),
        ]);

        const now = new Date().toISOString().split('T')[0];

        // Build CSV
        let csv = `PRDGen AI - Platform Report\n`;
        csv += `Generated: ${now}\n\n`;

        // Summary
        csv += `=== SUMMARY ===\n`;
        csv += `Total Registered Users,${totalUsers[0]?.count ?? 0}\n`;
        csv += `Total PRDs Generated,${totalPRDs[0]?.count ?? 0}\n`;
        csv += `Total AI Sessions,${totalSessions[0]?.count ?? 0}\n\n`;

        // PRDs by Day
        csv += `=== PRDs GENERATED PER DAY (Last 30 Days) ===\n`;
        csv += `Date,Count\n`;
        for (const row of prdsByDay) {
            csv += `${row.day},${row.count}\n`;
        }
        csv += `\n`;

        // Users
        csv += `=== REGISTERED USERS (Latest 50) ===\n`;
        csv += `Name,Email,Role,Registered At\n`;
        for (const u of recentUsers) {
            const name = sanitizeCsvCell(u.name || 'N/A');
            const email = sanitizeCsvCell(u.email);
            const role = sanitizeCsvCell(u.role || 'user');
            const dateStr = u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : 'N/A';
            csv += `${name},${email},${role},${dateStr}\n`;
        }

        return new Response(csv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="prdgen-report-${now}.csv"`,
            },
        });
    } catch (error) {
        console.error('Export report error:', error);
        return NextResponse.json({ error: 'Failed to export report' }, { status: 500 });
    }
}
