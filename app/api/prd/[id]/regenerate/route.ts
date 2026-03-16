import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { prdDocument, wizardSession, prdChatLog, user } from '@/lib/db/schema';
import { getAIConfig, createAIProvider, getCustomApiMode, setCustomApiMode } from '@/lib/ai/config';
import { getPRDPrompt } from '@/lib/ai/prompts';
import { streamText } from 'ai';
import { eq, and } from 'drizzle-orm';

import { checkRateLimit } from '@/lib/rate-limiter';

export const maxDuration = 300; // 5 minutes

type Params = { params: Promise<{ id: string }> };

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

// POST /api/prd/[id]/regenerate
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userData = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
        if (userData.length > 0 && !userData[0].emailVerified) {
            return NextResponse.json({ error: 'Please verify your email to use AI chat revisions.' }, { status: 403 });
        }
        if (userData.length > 0 && (!userData[0].tier || userData[0].tier === 'FREE')) {
            return NextResponse.json({ error: 'Upgrade to PLUS for AI Chat Revisions' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { additionalInstructions } = body;

        // Get the PRD and its session
        const [doc] = await db
            .select()
            .from(prdDocument)
            .where(and(eq(prdDocument.id, parseInt(id)), eq(prdDocument.userId, session.user.id)));

        if (!doc) return NextResponse.json({ error: 'PRD not found' }, { status: 404 });

        // Get wizard answers if exists
        let answers: Record<string, string> = {};
        if (doc.sessionId) {
            const [ws] = await db.select().from(wizardSession).where(eq(wizardSession.id, doc.sessionId));
            if (ws?.answers) answers = ws.answers as Record<string, string>;
        }

        const aiConfig = await getAIConfig();
        if (!aiConfig) {
            return NextResponse.json({ error: 'AI is not configured' }, { status: 503 });
        }

        const provider = createAIProvider(aiConfig);
        const { systemPrompt, userPrompt } = getPRDPrompt(answers, additionalInstructions);

        // Rate limiting check
        const rateLimitResult = checkRateLimit(session.user.id, aiConfig.rateLimitRpm);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: `Rate limit exceeded. Try again in ${rateLimitResult.resetInSeconds} seconds.` },
                { status: 429, headers: { 'Retry-After': String(rateLimitResult.resetInSeconds) } }
            );
        }


        const isCustom = aiConfig.provider === 'custom';
        const initialMode = isCustom ? getCustomApiMode(aiConfig) : 'responses';
        const fallbackModel = aiConfig.fallbackModel && aiConfig.fallbackModel !== aiConfig.defaultModel ? aiConfig.fallbackModel : '';
        const getModel = (mode: 'responses' | 'chat', modelId: string) =>
            mode === 'chat' ? provider.chat(modelId) : provider(modelId);

        // Use streaming to avoid gateway timeouts on long generations
        const createStreamResult = (mode: 'responses' | 'chat', modelId: string) => streamText({
            model: getModel(mode, modelId),
            system: systemPrompt + `\n\nCRITICAL COMMUNICATION RULE:
You are acting as a conversational AI PM assistant. The user will chat with you via a panel.
You must reply depending on the user's intent:

1. CONVERSATION MODE (user asks a question, asks for ideas, discusses):
   Simply provide a helpful conversational reply. DO NOT output the separator or any PRD content.

2. TARGETED EDIT MODE (user asks to change, update, add, or remove something specific):
   - Provide a brief conversational reply acknowledging the updates.
   - Append the exact separator "---UPDATE_PRD_BELOW---" on a new line.
   - Then output the COMPLETE, FULL PRD document with the requested changes applied.
   - CRITICAL: You MUST preserve ALL existing content. Copy every section, table, diagram, and detail exactly as-is. Only modify the specific parts the user asked about.
   - Do NOT skip or summarize any section. The output after the separator REPLACES the entire document, so if you leave something out, it will be DELETED.
   - If the user says "change payment gateway to Midtrans", you change ONLY the payment gateway references. Everything else (user stories, metrics, diagrams, roadmap, etc.) stays IDENTICAL.

3. FULL REWRITE MODE (user explicitly says "tulis ulang semua", "rewrite everything", "regenerate"):
   Same as mode 2, but you may restructure the entire document.

Do not output the PRD or the separator unless you are actively updating the document based on the user's request.

MERMAID SYNTAX (when generating or editing diagrams):
- Node IDs must be simple alphanumeric (A, B1, step1). NO spaces in IDs.
- NEVER put pipe | inside node labels. A[Some|Thing] WILL CRASH. Use A[Some Thing] instead.
- NEVER nest brackets like A[Text[inner]].
- Edge labels: A -->|Yes| B. Keep labels short.
- Valid node types: A[text], A([text]), A{text?}`,
            prompt: `Currently existing PRD output (you MUST preserve ALL of this content unless the user specifically asks to change a part):\n${doc.content}\n\nUser request: ${additionalInstructions}`,
            temperature: aiConfig.temperature,
            maxOutputTokens: 16000,
        });

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    let mode: 'responses' | 'chat' = initialMode;
                    let attemptedFallback = false;
                    let attemptedModelFallback = false;

                    while (true) {
                        let fullText = '';
                        let hasOutput = false;
                        const modelId = attemptedModelFallback && fallbackModel ? fallbackModel : aiConfig.defaultModel;
                        const result = createStreamResult(mode, modelId);

                        try {
                            for await (const chunk of result.textStream) {
                                fullText += chunk;
                                hasOutput = true;
                                controller.enqueue(encoder.encode(chunk));
                            }
                        } catch (err) {
                            if (isCustom && mode === 'responses' && !attemptedFallback && !hasOutput && isResponsesUnsupported(err)) {
                                attemptedFallback = true;
                                mode = 'chat';
                                setCustomApiMode(aiConfig, 'chat');
                                continue;
                            }
                            if (fallbackModel && !attemptedModelFallback && !hasOutput && isModelOverloaded(err)) {
                                attemptedModelFallback = true;
                                continue;
                            }
                            throw err;
                        }

                    // Done streaming. Parse response to just log what AI actually said avoiding the raw PRD
                    let replyText = fullText.trim();
                    const separator = '---UPDATE_PRD_BELOW---';

                    if (fullText.includes(separator)) {
                        const parts = fullText.split(separator);
                        replyText = parts[0].trim();
                    }

                    // Save conversation history to the DB
                    try {
                        await db.insert(prdChatLog).values([
                            {
                                prdId: parseInt(id),
                                role: 'user',
                                message: additionalInstructions,
                            },
                            {
                                prdId: parseInt(id),
                                role: 'ai',
                                message: replyText,
                            }
                        ]);
                    } catch (dbError) {
                        console.error('Failed to save chat logs:', dbError);
                    }

                    controller.close();
                    break;
                    }
                } catch (err) {
                    console.error('Streaming error:', err);
                    controller.error(err);
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error) {
        console.error('Error regenerating PRD:', error);

        // Try recording the user message so they don't lose it
        try {
            const { id } = await params;
            const body = await request.json().catch(() => ({}));
            if (body.additionalInstructions) {
                await db.insert(prdChatLog).values({
                    prdId: parseInt(id),
                    role: 'user',
                    message: body.additionalInstructions,
                });
                await db.insert(prdChatLog).values({
                    prdId: parseInt(id),
                    role: 'ai',
                    message: `Error: Failed to process request`,
                });
            }
        } catch (dbErr) {
            console.error('Also failed to save error log', dbErr);
        }

        const err = error as { message?: string; cause?: { message?: string } };
        const message = err.message || err.cause?.message || 'Failed to regenerate PRD';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
