import { pgTable, text, integer, boolean, timestamp, serial, jsonb, real } from "drizzle-orm/pg-core";

// Better-Auth compatible users table
export const user = pgTable('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull().default(false),
    image: text('image'),
    role: text('role').notNull().default('user'), // 'admin' | 'user'

    // Billing & Tier
    tier: text('tier').notNull().default('FREE'), // 'FREE' | 'PLUS' | 'PRO'
    subscriptionStatus: text('subscription_status').notNull().default('NONE'), // 'NONE' | 'ACTIVE' | 'EXPIRED'
    subscriptionUntil: timestamp('subscription_until'),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Pricing Plans table (Managed by Admin)
export const subscriptionPlan = pgTable('subscription_plan', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(), // 'PLUS' | 'PRO'
    price: integer('price').notNull(), // Amount in IDR
    features: jsonb('features').$type<string[]>().default([]),
    isPopular: boolean('is_popular').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Better-Auth sessions table
export const session = pgTable('session', {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
});

// Better-Auth account table (OAuth)
export const account = pgTable('account', {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Better-Auth verification table
export const verification = pgTable('verification', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// PRD wizard sessions - stores user answers during interview
export const wizardSession = pgTable('wizard_session', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    answers: jsonb('answers').$type<Record<string, string>>().default({}),
    status: text('status').notNull().default('in_progress'), // 'in_progress' | 'completed'
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// PRD documents
export const prdDocument = pgTable('prd_document', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    sessionId: integer('session_id').references(() => wizardSession.id, { onDelete: 'set null' }),
    title: text('title').notNull().default('Untitled PRD'),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// AI global configuration (singleton - admin manages)
export const aiConfig = pgTable('ai_config', {
    id: serial('id').primaryKey(),
    provider: text('provider').notNull().default('openai'), // 'openai' | 'anthropic' | 'google' | 'custom'
    apiKeyEncrypted: text('api_key_encrypted'),
    baseUrl: text('base_url'),
    defaultModel: text('default_model').notNull().default('gpt-4o'),
    temperature: real('temperature').notNull().default(0.5),
    rateLimitRpm: integer('rate_limit_rpm').notNull().default(10), // requests per minute per user
    rateLimitTpm: integer('rate_limit_tpm').notNull().default(100000), // tokens per minute global
    maintenanceMode: boolean('maintenance_mode').notNull().default(false), // platform-wide maintenance
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    updatedBy: text('updated_by').references(() => user.id),
});

// System Logs
export const systemLog = pgTable('system_log', {
    id: serial('id').primaryKey(),
    eventType: text('event_type').notNull(), // 'AUTH' | 'SYSTEM' | 'USER_ACTION' | 'AI_GENERATION' | 'ERROR'
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
    description: text('description').notNull(),
    status: text('status').notNull().default('info'), // 'success' | 'warning' | 'error' | 'info'
    ipAddress: text('ip_address'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// PRD Chat Logs
export const prdChatLog = pgTable('prd_chat_log', {
    id: serial('id').primaryKey(),
    prdId: integer('prd_id').notNull().references(() => prdDocument.id, { onDelete: 'cascade' }),
    role: text('role').notNull(), // 'user' | 'ai'
    message: text('message').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
