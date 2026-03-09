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
            maxOutputTokens: 1000,
        });

        return NextResponse.json({ recommendation: result.text.trim() });
    } catch (error) {
        console.error('Recommendation error:', error);
        return NextResponse.json({ error: 'Failed to generate recommendation.' }, { status: 500 });
    }
}
