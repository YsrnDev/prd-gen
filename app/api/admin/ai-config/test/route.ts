import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAIConfig, createAIProvider, getCustomApiMode, setCustomApiMode } from '@/lib/ai/config';
import { generateText } from 'ai';

function isAdmin(session: Awaited<ReturnType<typeof auth.api.getSession>>) {
    return session && (session.user as { role?: string }).role === 'admin';
}

function isResponsesUnsupported(error: unknown) {
    const raw = error as {
        statusCode?: number;
        url?: string;
        responseBody?: string;
        data?: { error?: { code?: string; message?: string } };
        message?: string;
        lastError?: unknown;
    };
    const err = (raw?.lastError ?? raw) as {
        statusCode?: number;
        url?: string;
        responseBody?: string;
        data?: { error?: { code?: string; message?: string } };
        message?: string;
    };
    const statusCode = err?.statusCode;
    const url = typeof err?.url === 'string' ? err.url : '';
    const responseBody = typeof err?.responseBody === 'string' ? err.responseBody : '';
    const code = err?.data?.error?.code;
    const message = `${err?.message || ''} ${err?.data?.error?.message || ''} ${responseBody}`.toLowerCase();
    return url.includes('/responses') && (
        statusCode === 404 ||
        code === 'convert_request_failed' ||
        message.includes('not implemented')
    );
}

function isModelOverloaded(error: unknown) {
    const raw = error as {
        statusCode?: number;
        responseBody?: string;
        data?: { error?: { message?: string } };
        message?: string;
        lastError?: unknown;
    };
    const err = (raw?.lastError ?? raw) as {
        statusCode?: number;
        responseBody?: string;
        data?: { error?: { message?: string } };
        message?: string;
    };
    const statusCode = err?.statusCode;
    const responseBody = typeof err?.responseBody === 'string' ? err.responseBody : '';
    const message = `${err?.message || ''} ${err?.data?.error?.message || ''} ${responseBody}`.toLowerCase();

    if (message.includes('available model group fallbacks') || message.includes('fallback')) return true;
    if (message.includes('overload') || message.includes('capacity') || message.includes('busy')) return true;
    return statusCode === 429 || statusCode === 500 && message.includes('rate limit');
}

// POST /api/admin/ai-config/test
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const config = await getAIConfig();
        if (!config) return NextResponse.json({ error: 'No AI config found' }, { status: 404 });

        const provider = createAIProvider(config);
        const isCustom = config.provider === 'custom';
        const initialMode = isCustom ? getCustomApiMode(config) : 'responses';
        const fallbackModel = config.fallbackModel && config.fallbackModel !== config.defaultModel ? config.fallbackModel : '';
        const getModel = (mode: 'responses' | 'chat', modelId: string) =>
            mode === 'chat' ? provider.chat(modelId) : provider(modelId);

        const runPrompt = async (mode: 'responses' | 'chat', modelId: string) => {
            const result = await generateText({
                model: getModel(mode, modelId),
                prompt: 'Say "Connection successful" in exactly 3 words.',
                maxOutputTokens: 20,
            });
            return result.text;
        };

        const runWithFallback = async (mode: 'responses' | 'chat'): Promise<string> => {
            try {
                return await runPrompt(mode, config.defaultModel);
            } catch (error) {
                if (isCustom && mode === 'responses' && isResponsesUnsupported(error)) {
                    setCustomApiMode(config, 'chat');
                    return runWithFallback('chat');
                }
                if (fallbackModel && isModelOverloaded(error)) {
                    return runPrompt(mode, fallbackModel);
                }
                throw error;
            }
        };

        const text = await runWithFallback(initialMode);

        return NextResponse.json({ success: true, message: text });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Connection failed';
        return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
}
