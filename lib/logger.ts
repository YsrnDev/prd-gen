import { db } from '@/lib/db';
import { systemLog } from '@/lib/db/schema';
import { headers } from 'next/headers';
import crypto from 'crypto';

type EventType = 'AUTH' | 'SYSTEM' | 'USER_ACTION' | 'AI_GENERATION' | 'ERROR';
type EventStatus = 'success' | 'warning' | 'error' | 'info';

function hashIp(ip: string): string {
    if (ip === 'unknown') return 'unknown';
    return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

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
            const rawIp = reqHeaders.get('x-forwarded-for') || reqHeaders.get('x-real-ip') || 'unknown';
            ipAddress = hashIp(rawIp);
        } catch {
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
