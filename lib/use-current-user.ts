'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from '@/lib/auth-client';

export type CurrentUser = {
    tier: string;
    subscriptionStatus: string;
    subscriptionUntil?: string | null;
};

const DEFAULT_POLL_INTERVAL_MS = 15000;

export function useCurrentUser(pollIntervalMs: number = DEFAULT_POLL_INTERVAL_MS) {
    const { data: session } = useSession();
    const [data, setData] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const fetchCurrentUser = useCallback(async () => {
        if (!session?.user) {
            setData(null);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/me', { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch user status');
            const payload = await res.json();
            setData(payload);
            setError(null);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch user status');
        } finally {
            setLoading(false);
        }
    }, [session?.user]);

    useEffect(() => {
        fetchCurrentUser();
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [fetchCurrentUser, session?.user?.id]);

    useEffect(() => {
        if (!session?.user) return;
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = setInterval(fetchCurrentUser, pollIntervalMs);
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [fetchCurrentUser, session?.user, session?.user?.id, pollIntervalMs]);

    useEffect(() => {
        if (!session?.user) return;
        const handleFocus = () => fetchCurrentUser();
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') fetchCurrentUser();
        };
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [fetchCurrentUser, session?.user, session?.user?.id]);

    return { data, loading, error, refresh: fetchCurrentUser };
}
