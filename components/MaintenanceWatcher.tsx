'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const POLL_INTERVAL = 12000; // 12 seconds

/**
 * Silently polls /api/maintenance-status and redirects to /maintenance
 * if maintenance mode is enabled. Runs only on user dashboard pages.
 */
export function MaintenanceWatcher() {
    const router = useRouter();

    useEffect(() => {
        let stopped = false;

        const check = async () => {
            if (stopped) return;
            try {
                const res = await fetch('/api/maintenance-status', { cache: 'no-store' });
                if (res.ok) {
                    const { maintenanceMode } = await res.json();
                    if (maintenanceMode && !stopped) {
                        router.replace('/maintenance');
                    }
                }
            } catch {
                // Silently ignore network errors
            }
        };

        // Initial check on mount, then poll
        check();
        const interval = setInterval(check, POLL_INTERVAL);

        return () => {
            stopped = true;
            clearInterval(interval);
        };
    }, [router]);

    // Renders nothing — purely a background watcher
    return null;
}
