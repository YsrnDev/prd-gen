import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAIConfig, saveAIConfig } from '@/lib/ai/config';
import type { AIProvider } from '@/lib/ai/config';
import { logEvent } from '@/lib/logger';

function isAdmin(session: Awaited<ReturnType<typeof auth.api.getSession>>) {
    return session && (session.user as { role?: string }).role === 'admin';
}

// GET /api/admin/ai-config
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const config = await getAIConfig();
        return NextResponse.json({
            config: config ? {
                provider: config.provider,
                defaultModel: config.defaultModel,
                fallbackModel: config.fallbackModel ?? null,
                baseUrl: config.baseUrl,
                temperature: config.temperature,
                rateLimitRpm: config.rateLimitRpm,
                rateLimitTpm: config.rateLimitTpm,
                hasApiKey: true,
            } : null,
        });
    } catch (error) {
        console.error('Error fetching AI config:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/admin/ai-config
export async function PUT(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { provider, apiKey, baseUrl, defaultModel, fallbackModel, temperature, rateLimitRpm, rateLimitTpm } = body;

        const existingConfig = await getAIConfig();

        if (!provider || !defaultModel) {
            return NextResponse.json({ error: 'provider and defaultModel are required' }, { status: 400 });
        }

        if (!apiKey && !existingConfig?.apiKey) {
            return NextResponse.json({ error: 'apiKey is required for initial configuration' }, { status: 400 });
        }

        await saveAIConfig({
            provider: provider as AIProvider,
            apiKey: apiKey || existingConfig!.apiKey,
            baseUrl,
            defaultModel,
            fallbackModel: typeof fallbackModel === 'string' && fallbackModel.length > 0 ? fallbackModel : null,
            temperature: temperature !== undefined ? parseFloat(temperature) : 0.5,
            rateLimitRpm: rateLimitRpm !== undefined ? parseInt(rateLimitRpm) : 10,
            rateLimitTpm: rateLimitTpm !== undefined ? parseInt(rateLimitTpm) : 100000,
            updatedBy: session!.user.id,
        });

        await logEvent('SYSTEM', `AI Configuration Provider ${provider} updated successfully`, {
            userId: session!.user.id,
            status: 'success'
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving AI config:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
