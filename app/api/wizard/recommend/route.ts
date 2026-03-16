import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAIConfig, createAIProvider, getCustomApiMode, setCustomApiMode } from '@/lib/ai/config';
import { getRecommendationPrompt } from '@/lib/ai/prompts';
import { generateText } from 'ai';
import { checkRateLimit } from '@/lib/rate-limiter';

export const maxDuration = 60;

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

        const userData = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
        if (userData.length > 0 && !userData[0].emailVerified) {
            return NextResponse.json({ error: 'Please verify your email to use AI recommendations.' }, { status: 403 });
        }
        if (userData.length > 0 && (!userData[0].tier || userData[0].tier === 'FREE')) {
            return NextResponse.json({ error: 'Upgrade to PLUS for AI Recommendations' }, { status: 403 });
        }

        const { answers, questionId } = await request.json();

        if (!questionId) {
            return NextResponse.json({ error: 'Missing questionId' }, { status: 400 });
        }

        const aiConfig = await getAIConfig();
        if (!aiConfig) {
            return NextResponse.json(
                { error: 'AI is not configured. Please ask your admin to set up the AI provider.' },
                { status: 503 }
            );
        }

        const rateLimitResult = checkRateLimit(session.user.id, aiConfig.rateLimitRpm);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: `Rate limit exceeded. Try again in ${rateLimitResult.resetInSeconds}s.` },
                { status: 429 }
            );
        }

        const prompt = getRecommendationPrompt(questionId, answers);
        if (!prompt) {
            return NextResponse.json({ error: 'No recommendation available for this field.' }, { status: 400 });
        }

        const provider = createAIProvider(aiConfig);
        const isCustom = aiConfig.provider === 'custom';
        const initialMode = isCustom ? getCustomApiMode(aiConfig) : 'responses';
        const fallbackModel = aiConfig.fallbackModel && aiConfig.fallbackModel !== aiConfig.defaultModel ? aiConfig.fallbackModel : '';
        const getModel = (mode: 'responses' | 'chat', modelId: string) =>
            mode === 'chat' ? provider.chat(modelId) : provider(modelId);

        const runPrompt = async (mode: 'responses' | 'chat', modelId: string) => generateText({
            model: getModel(mode, modelId),
            system: prompt.systemPrompt,
            prompt: prompt.userPrompt,
            temperature: aiConfig.temperature,
            maxOutputTokens: 4000,
        });

        const runWithFallback = async (mode: 'responses' | 'chat') => {
            try {
                return await runPrompt(mode, aiConfig.defaultModel);
            } catch (error) {
                if (isCustom && mode === 'responses' && isResponsesUnsupported(error)) {
                    setCustomApiMode(aiConfig, 'chat');
                    return runWithFallback('chat');
                }
                if (fallbackModel && isModelOverloaded(error)) {
                    return await runPrompt(mode, fallbackModel);
                }
                throw error;
            }
        };

        const result = await runWithFallback(initialMode);

        return NextResponse.json({ recommendation: result.text.trim() });
    } catch (error: unknown) {
        console.error('Recommendation error:', error);

        const err = error as { message?: string; cause?: { message?: string }; status?: number; statusCode?: number };
        const message = err.message || err.cause?.message || 'Failed to generate recommendation.';
        const statusCode = err.status || err.statusCode || 500;

        // Surface rate limit errors from upstream AI providers
        if (statusCode === 429 || message.toLowerCase().includes('rate limit')) {
            return NextResponse.json(
                { error: 'AI provider rate limit reached. Please wait a moment and try again.' },
                { status: 429 }
            );
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
