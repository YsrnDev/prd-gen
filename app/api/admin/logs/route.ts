import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { systemLog, user as userSchema } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        const userRole = (session?.user as { role?: string })?.role;

        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const logs = await db.select({
            id: systemLog.id,
            timestamp: systemLog.createdAt,
            event_type: systemLog.eventType,
            description: systemLog.description,
            status: systemLog.status,
            ip: systemLog.ipAddress,
            user_id: systemLog.userId,
            user_name: userSchema.name,
            user_email: userSchema.email
        }).from(systemLog)
            .leftJoin(userSchema, eq(systemLog.userId, userSchema.id))
            .orderBy(desc(systemLog.createdAt))
            .limit(100);

        const formattedLogs = logs.map((log) => ({
            id: `log_${log.id}`,
            timestamp: log.timestamp.toISOString(),
            event_type: log.event_type,
            user: log.user_name ? `${log.user_name} (${log.user_email})` : 'Unknown User',
            description: log.description,
            status: log.status,
            ip: log.ip
        }));

        return NextResponse.json({ logs: formattedLogs });
    } catch (error: any) {
        console.error('Error fetching logs:', error);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}
