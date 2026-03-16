import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAIConfig, createAIProvider, getCustomApiMode, setCustomApiMode } from '@/lib/ai/config';
import { getPRDPrompt } from '@/lib/ai/prompts';
import { streamText } from 'ai';
import { logEvent } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limiter';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const maxDuration = 300; // 5 minutes

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

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const [userData] = await db.select({ emailVerified: user.emailVerified })
            .from(user)
            .where(eq(user.id, session.user.id))
            .limit(1);
        if (!userData?.emailVerified) {
            return NextResponse.json(
                { error: 'Please verify your email to generate PRDs.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { answers, additionalInstructions } = body;

        const aiConfig = await getAIConfig();
        if (!aiConfig) {
            return NextResponse.json(
                { error: 'AI is not configured yet. Please ask your admin to set up the AI provider.' },
                { status: 503 }
            );
        }

        // Rate limiting check
        const rateLimitResult = checkRateLimit(session.user.id, aiConfig.rateLimitRpm);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    error: `Rate limit exceeded. You can make ${aiConfig.rateLimitRpm} requests per minute. Try again in ${rateLimitResult.resetInSeconds} seconds.`,
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(rateLimitResult.resetInSeconds),
                        'X-RateLimit-Limit': String(aiConfig.rateLimitRpm),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': String(rateLimitResult.resetInSeconds),
                    },
                }
            );
        }

        const provider = createAIProvider(aiConfig);
        const { systemPrompt, userPrompt } = getPRDPrompt(answers, additionalInstructions);

        const isCustom = aiConfig.provider === 'custom';
        const initialMode = isCustom ? getCustomApiMode(aiConfig) : 'responses';
        const fallbackModel = aiConfig.fallbackModel && aiConfig.fallbackModel !== aiConfig.defaultModel ? aiConfig.fallbackModel : '';
        const getModel = (mode: 'responses' | 'chat', modelId: string) =>
            mode === 'chat' ? provider.chat(modelId) : provider(modelId);

        const readStreamToText = async (mode: 'responses' | 'chat', modelId: string) => {
            const result = streamText({
                model: getModel(mode, modelId),
                system: systemPrompt,
                prompt: userPrompt,
                temperature: aiConfig.temperature,
                maxOutputTokens: 16000,
            });

            let fullText = '';
            const reader = result.textStream.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                fullText += typeof value === 'string' ? value : decoder.decode(value);
            }
            return fullText;
        };

        const runWithFallback = async (mode: 'responses' | 'chat'): Promise<string> => {
            try {
                return await readStreamToText(mode, aiConfig.defaultModel);
            } catch (error) {
                if (isCustom && mode === 'responses' && isResponsesUnsupported(error)) {
                    setCustomApiMode(aiConfig, 'chat');
                    return runWithFallback('chat');
                }
                if (fallbackModel && isModelOverloaded(error)) {
                    return readStreamToText(mode, fallbackModel);
                }
                throw error;
            }
        };

        const fullText = await runWithFallback(initialMode);

        // Log AI Generation
        await logEvent('AI_GENERATION', `User initiated a PRD Generation using ${aiConfig.provider}`, {
            userId: session.user.id,
            status: 'success'
        });

        return NextResponse.json(
            { content: fullText },
            {
                headers: {
                    'X-RateLimit-Limit': String(aiConfig.rateLimitRpm),
                    'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                },
            }
        );
    } catch (error) {
        console.error('Error generating PRD:', error);
        return NextResponse.json({ error: 'Failed to generate PRD. Please try again later.' }, { status: 500 });
    }
}
