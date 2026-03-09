import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAIConfig, createAIProvider } from '@/lib/ai/config';
import { getRecommendationPrompt } from '@/lib/ai/prompts';
import { generateText } from 'ai';
import { checkRateLimit } from '@/lib/rate-limiter';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userData = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
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

        const result = await generateText({
            model: provider(aiConfig.defaultModel),
            system: prompt.systemPrompt,
            prompt: prompt.userPrompt,
            temperature: aiConfig.temperature,
            maxOutputTokens: 4000,
        });

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
