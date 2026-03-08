import { auth } from '@/lib/auth';
import { getAIConfig } from '@/lib/ai/config';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as { role?: string }).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { baseUrl, apiKey, provider } = await req.json();

        // Use provided API key or fallback to saved config
        let resolvedApiKey = apiKey;
        let resolvedBaseUrl = baseUrl;
        if (!resolvedApiKey) {
            const savedConfig = await getAIConfig();
            if (savedConfig) {
                resolvedApiKey = savedConfig.apiKey;
                if (!resolvedBaseUrl && savedConfig.baseUrl) resolvedBaseUrl = savedConfig.baseUrl;
            }
        }

        if (!resolvedApiKey) {
            return NextResponse.json({ error: 'API key is required — enter a key or save configuration first.' }, { status: 400 });
        }

        // Determine the models endpoint URL
        let modelsUrl: string;
        if (provider === 'custom' && resolvedBaseUrl) {
            // Remove trailing slash and append /models
            const base = resolvedBaseUrl.replace(/\/+$/, '');
            modelsUrl = `${base}/models`;
        } else if (provider === 'openai') {
            modelsUrl = 'https://api.openai.com/v1/models';
        } else if (provider === 'anthropic') {
            modelsUrl = 'https://api.anthropic.com/v1/models';
        } else {
            return NextResponse.json({ error: 'Cannot fetch models for this provider' }, { status: 400 });
        }

        // Special handling for Anthropic (different auth header)
        const fetchHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (provider === 'anthropic') {
            fetchHeaders['x-api-key'] = resolvedApiKey;
            fetchHeaders['anthropic-version'] = '2023-06-01';
        } else {
            fetchHeaders['Authorization'] = `Bearer ${resolvedApiKey}`;
        }

        const res = await fetch(modelsUrl, {
            method: 'GET',
            headers: fetchHeaders,
        });

        if (!res.ok) {
            const errText = await res.text().catch(() => '');
            return NextResponse.json(
                { error: `Failed to fetch models (${res.status}): ${errText.slice(0, 200)}` },
                { status: res.status }
            );
        }

        const data = await res.json();

        // OpenAI-compatible format: { data: [{ id: "model-name", ... }] }
        let models: string[] = [];
        if (data.data && Array.isArray(data.data)) {
            models = data.data
                .map((m: { id: string }) => m.id)
                .filter((id: string) => {
                    // Filter out embedding/whisper/tts models for cleaner list
                    const lower = id.toLowerCase();
                    return !lower.includes('embed') &&
                        !lower.includes('whisper') &&
                        !lower.includes('tts') &&
                        !lower.includes('dall-e') &&
                        !lower.includes('moderation');
                })
                .sort();
        }

        return NextResponse.json({ models });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch models' },
            { status: 500 }
        );
    }
}
