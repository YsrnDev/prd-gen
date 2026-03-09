/**
 * In-memory rate limiter for API requests.
 * Tracks requests per user per minute window.
 * Suitable for single-instance deployments with 50-100 users.
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const userRequests = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of userRequests.entries()) {
        if (now > entry.resetAt) {
            userRequests.delete(key);
        }
    }
}, 5 * 60 * 1000);

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetInSeconds: number;
}

/**
 * Check if a user is within the rate limit.
 * @param userId - The user's ID
 * @param maxRpm - Maximum requests per minute allowed
 * @returns RateLimitResult with allowed status and remaining quota
 */
export function checkRateLimit(userId: string, maxRpm: number): RateLimitResult {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window

    const entry = userRequests.get(userId);

    if (!entry || now > entry.resetAt) {
        // New window: allow and set count to 1
        userRequests.set(userId, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: maxRpm - 1, resetInSeconds: 60 };
    }

    if (entry.count >= maxRpm) {
        // Over limit
        const resetInSeconds = Math.ceil((entry.resetAt - now) / 1000);
        return { allowed: false, remaining: 0, resetInSeconds };
    }

    // Within limit: increment
    entry.count++;
    const resetInSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: true, remaining: maxRpm - entry.count, resetInSeconds };
}
