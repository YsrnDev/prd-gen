import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAIConfig, createAIProvider } from '@/lib/ai/config';
import { generateText } from 'ai';

function isAdmin(session: Awaited<ReturnType<typeof auth.api.getSession>>) {
    return session && (session.user as { role?: string }).role === 'admin';
}

// POST /api/admin/ai-config/test
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const config = await getAIConfig();
        if (!config) return NextResponse.json({ error: 'No AI config found' }, { status: 404 });

        const provider = createAIProvider(config);
        const { text } = await generateText({
            model: provider(config.defaultModel),
            prompt: 'Say "Connection successful" in exactly 3 words.',
            maxOutputTokens: 20,
        });

        return NextResponse.json({ success: true, message: text });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Connection failed';
        return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
}
