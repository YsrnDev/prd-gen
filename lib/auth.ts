import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import { logEvent } from '@/lib/logger';

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        },
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    // Check if it's the first user ever registered
                    const result = await db.select({ count: sql<number>`count(*)` }).from(schema.user);
                    if (Number(result[0].count) === 0) {
                        return {
                            data: {
                                ...user,
                                role: 'admin'
                            }
                        };
                    }
                    return { data: user };
                },
                after: async (user) => {
                    // Log the registration event, catching errors silently so auth flow isn't disrupted
                    import('@/lib/logger').then(({ logEvent }) => {
                        logEvent('AUTH', `New user registered: ${user.email} (${user.role})`, {
                            userId: user.id,
                            status: 'success'
                        }).catch(console.error);
                    }).catch(console.error);
                }
            }
        }
    },
    socialProviders: {
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            }
        } : {}),
    },
    user: {
        additionalFields: {
            role: {
                type: 'string',
                defaultValue: 'user',
                required: false,
                input: false,
            },
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // Update every day
    },
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
