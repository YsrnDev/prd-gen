import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAIConfig, createAIProvider } from '@/lib/ai/config';
import { getPRDPrompt } from '@/lib/ai/prompts';
import { streamText } from 'ai';
import { logEvent } from '@/lib/logger';

export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { answers, additionalInstructions } = body;

        const aiConfig = await getAIConfig();
        if (!aiConfig) {
            return NextResponse.json(
                { error: 'AI is not configured yet. Please ask your admin to set up the AI provider.' },
                { status: 503 }
            );
        }

        const provider = createAIProvider(aiConfig);
        const { systemPrompt, userPrompt } = getPRDPrompt(answers, additionalInstructions);


        // Use streaming to avoid gateway timeouts on long generations
        const result = streamText({
            model: provider(aiConfig.defaultModel),
            system: systemPrompt,
            prompt: userPrompt,
            maxOutputTokens: 16000,
        });

        // Collect full streamed text then return as JSON
        let fullText = '';
        const reader = result.textStream.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fullText += typeof value === 'string' ? value : decoder.decode(value);
        }

        // Log AI Generation
        await logEvent('AI_GENERATION', `User initiated a PRD Generation using ${aiConfig.provider}`, {
            userId: session.user.id,
            status: 'success'
        });

        return NextResponse.json({ content: fullText });
    } catch (error) {
        console.error('Error generating PRD:', error);
        const err = error as { message?: string; cause?: { message?: string } };
        const message = err.message || err.cause?.message || 'Failed to generate PRD';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
