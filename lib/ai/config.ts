import { db } from '@/lib/db';
import { aiConfig } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { decrypt, encrypt } from '@/lib/crypto';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

export type AIProvider = 'openai' | 'anthropic' | 'custom';

export interface AIConfigData {
    provider: AIProvider;
    apiKey: string;
    baseUrl?: string;
    defaultModel: string;
    temperature: number;
    rateLimitRpm: number;
    rateLimitTpm: number;
}

export async function getAIConfig(): Promise<AIConfigData | null> {
    const configs = await db.select().from(aiConfig).limit(1);
    if (!configs[0] || !configs[0].apiKeyEncrypted) return null;

    try {
        const apiKey = decrypt(configs[0].apiKeyEncrypted);
        return {
            provider: configs[0].provider as AIProvider,
            apiKey,
            baseUrl: configs[0].baseUrl ?? undefined,
            defaultModel: configs[0].defaultModel,
            temperature: configs[0].temperature ?? 0.5,
            rateLimitRpm: configs[0].rateLimitRpm ?? 10,
            rateLimitTpm: configs[0].rateLimitTpm ?? 100000,
        };
    } catch {
        return null;
    }
}

export async function saveAIConfig(data: {
    provider: AIProvider;
    apiKey: string;
    baseUrl?: string;
    defaultModel: string;
    temperature?: number;
    rateLimitRpm?: number;
    rateLimitTpm?: number;
    updatedBy: string;
}) {
    const encryptedKey = encrypt(data.apiKey);
    const existing = await db.select().from(aiConfig).limit(1);

    if (existing[0]) {
        await db
            .update(aiConfig)
            .set({
                provider: data.provider,
                apiKeyEncrypted: encryptedKey,
                baseUrl: data.baseUrl ?? null,
                defaultModel: data.defaultModel,
                temperature: data.temperature ?? 0.5,
                rateLimitRpm: data.rateLimitRpm ?? 10,
                rateLimitTpm: data.rateLimitTpm ?? 100000,
                updatedBy: data.updatedBy,
                updatedAt: new Date(),
            })
            .where(eq(aiConfig.id, existing[0].id));
    } else {
        await db.insert(aiConfig).values({
            provider: data.provider,
            apiKeyEncrypted: encryptedKey,
            baseUrl: data.baseUrl ?? null,
            defaultModel: data.defaultModel,
            temperature: data.temperature ?? 0.5,
            rateLimitRpm: data.rateLimitRpm ?? 10,
            rateLimitTpm: data.rateLimitTpm ?? 100000,
            updatedBy: data.updatedBy,
        });
    }
}

export function createAIProvider(config: AIConfigData) {
    switch (config.provider) {
        case 'openai':
            return createOpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl });
        case 'anthropic':
            return createAnthropic({ apiKey: config.apiKey });
        case 'custom':
            return createOpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl });
        default:
            throw new Error(`Unknown provider: ${config.provider}`);
    }
}
