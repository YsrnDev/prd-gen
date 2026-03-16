import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

import { sendEmail } from '@/lib/email';

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
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            void sendEmail({
                to: user.email,
                subject: 'Verify your email address - PRD Generator',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>Welcome to PRD Generator!</h2>
                        <p>Hi ${user.name}, please verify your email address to unlock full features.</p>
                        <a href="${url}" style="display:inline-block; padding:10px 20px; background-color:#3b82f6; color:#ffffff; text-decoration:none; border-radius:5px;">Verify My Email</a>
                        <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
                    </div>
                `,
            });
        },
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    // Check if it's the first user: no users exist AND no admin role exists
                    const [userCount, adminCheck] = await Promise.all([
                        db.select({ count: sql<number>`count(*)` }).from(schema.user),
                        db.select({ count: sql<number>`count(*)` }).from(schema.user).where(sql`role = 'admin'`),
                    ]);
                    if (Number(userCount[0].count) === 0 && Number(adminCheck[0].count) === 0) {
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
            tier: {
                type: 'string',
                defaultValue: 'FREE',
                required: false,
                input: false,
            },
            subscriptionStatus: {
                type: 'string',
                defaultValue: 'NONE',
                required: false,
                input: false,
            },
        },
    },
    session: {
        expiresIn: 60 * 60 * 24, // 24 hours
        updateAge: 60 * 60, // Update every hour
    },
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
