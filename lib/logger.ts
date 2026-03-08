import { db } from '@/lib/db';
import { systemLog } from '@/lib/db/schema';
import { headers } from 'next/headers';

type EventType = 'AUTH' | 'SYSTEM' | 'USER_ACTION' | 'AI_GENERATION' | 'ERROR';
type EventStatus = 'success' | 'warning' | 'error' | 'info';

export async function logEvent(
    eventType: EventType,
    description: string,
    params?: {
        userId?: string;
        status?: EventStatus;
    }
) {
    try {
        let ipAddress = 'unknown';
        try {
            const reqHeaders = await headers();
            ipAddress = reqHeaders.get('x-forwarded-for') || reqHeaders.get('x-real-ip') || 'unknown';
        } catch (e) {
            // Ignore headers error in some contexts
        }

        await db.insert(systemLog).values({
            eventType,
            description,
            userId: params?.userId || null,
            status: params?.status || 'info',
            ipAddress
        });
    } catch (error) {
        console.error('Failed to write system log:', error);
    }
}
