import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAIConfig, saveAIConfig, createAIProvider } from '@/lib/ai/config';
import type { AIProvider } from '@/lib/ai/config';
import { generateText } from 'ai';
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
        // Return config without exposing the full API key
        return NextResponse.json({
            config: config ? {
                provider: config.provider,
                defaultModel: config.defaultModel,
                baseUrl: config.baseUrl,
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
        const { provider, apiKey, baseUrl, defaultModel } = body;

        if (!provider || !apiKey || !defaultModel) {
            return NextResponse.json({ error: 'provider, apiKey, and defaultModel are required' }, { status: 400 });
        }

        await saveAIConfig({
            provider: provider as AIProvider,
            apiKey,
            baseUrl,
            defaultModel,
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
