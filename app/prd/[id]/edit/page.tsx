'use client';

import { useState, useEffect, useCallback, useDeferredValue, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Save, Eye, Edit3, Sparkles, Loader2, Check, X,
    Download, FileText, Copy, MessageCircle, Send, Code2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSession } from '@/lib/auth-client';

function wordCount(text: string): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function PRDEditPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { data: session } = useSession();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [originalContent, setOriginalContent] = useState('');
    const [view, setView] = useState<'split' | 'edit' | 'preview'>('edit');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [showRegenDialog, setShowRegenDialog] = useState(false);
    const [regenInstructions, setRegenInstructions] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatWidth, setChatWidth] = useState(380);
    const [isDragging, setIsDragging] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (chatOpen) scrollToBottom();
    }, [chatMessages, regenerating, chatOpen]);
    const handleSendChat = async (userMsg: string) => {
        if (!userMsg.trim() || regenerating) return;
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setRegenInstructions(userMsg);
        setRegenerating(true);
        setError('');

        try {
            const res = await fetch(`/api/prd/${id}/regenerate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ additionalInstructions: userMsg }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setChatMessages(prev => [...prev, { role: 'ai', text: `Error: ${data.error || 'Something went wrong. Please try again.'}` }]);
                return;
            }

            if (!res.body) throw new Error('No response body');

            setChatMessages(prev => [...prev, { role: 'ai', text: '' }]);

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let streamedText = '';
            const separator = '---UPDATE_PRD_BELOW---';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                streamedText += decoder.decode(value, { stream: true });

                // During streaming, only show the conversational part in chat
                if (streamedText.includes(separator)) {
                    const chatPart = streamedText.split(separator)[0];
                    setChatMessages(prev => {
                        const newArr = [...prev];
                        newArr[newArr.length - 1].text = chatPart;
                        return newArr;
                    });
                } else {
                    setChatMessages(prev => {
                        const newArr = [...prev];
                        newArr[newArr.length - 1].text = streamedText;
                        return newArr;
                    });
                }
            }

            // After streaming is COMPLETE, apply PRD content if present
            if (streamedText.includes(separator)) {
                const chatPart = streamedText.split(separator)[0].trim();
                const prdContent = streamedText.split(separator).slice(1).join(separator).trim();

                // Set final chat message — use AI's reply or a default confirmation
                const finalMessage = chatPart || 'Sudah saya perbarui PRD-nya sesuai permintaan kamu. Silakan cek editor untuk melihat perubahannya! ✅';
                setChatMessages(prev => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1].text = finalMessage;
                    return newArr;
                });

                if (prdContent) {
                    setContent(prdContent);
                }
            }
        } catch {
            setChatMessages(prev => [...prev, { role: 'ai', text: 'Something went wrong. Please try again.' }]);
        } finally {
            setRegenerating(false);
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const newWidth = window.innerWidth - e.clientX;
            // constraints for chat width (min 300px, max 800px or half window)
            setChatWidth(Math.min(Math.max(newWidth, 300), Math.min(800, window.innerWidth * 0.8)));
        };
        const handleMouseUp = () => {
            setIsDragging(false);
            document.body.style.cssText = '';
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cssText = 'cursor: col-resize; user-select: none;';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cssText = '';
        };
    }, [isDragging]);

    // Performance Optimization: Defer heavy markdown parsing to prevent typing lag
    const deferredContent = useDeferredValue(content);

    // Performance Optimization: Memoize word count calculation
    const currentWordCount = useMemo(() => wordCount(deferredContent), [deferredContent]);

    useEffect(() => {
        const loadDoc = async () => {
            const res = await fetch(`/api/prd/${id}`);
            if (res.ok) {
                const data = await res.json();
                setTitle(data.document.title);
                setContent(data.document.content);
                setOriginalContent(data.document.content);

                // Fetch chat history
                try {
                    const chatRes = await fetch(`/api/prd/${id}/chat`);
                    if (chatRes.ok) {
                        const chatData = await chatRes.json();
                        setChatMessages(chatData.messages);
                    }
                } catch (e) {
                    console.error('Failed to load chat history', e);
                }
            } else {
                router.push('/dashboard');
            }
            setLoading(false);
        };
        loadDoc();
    }, [id, router]);

    const handleSave = useCallback(async () => {
        setSaving(true);
        setSaved(false);
        setError('');
        try {
            const res = await fetch(`/api/prd/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
            });
            if (res.ok) {
                setOriginalContent(content);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch {
            setError('Failed to save');
        } finally {
            setSaving(false);
        }
    }, [id, title, content]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleSave]);

    const isModified = content !== originalContent;

    // Auto-save effect
    useEffect(() => {
        if (!isModified) return;

        const timer = setTimeout(() => {
            handleSave();
        }, 1500); // 1.5 seconds debounce

        return () => clearTimeout(timer);
    }, [title, content, isModified, handleSave]);

    const handleRegenerate = async () => {
        setRegenerating(true);
        setError('');
        try {
            const res = await fetch(`/api/prd/${id}/regenerate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ additionalInstructions: regenInstructions }),
            });
            const data = await res.json();
            if (res.ok) {
                if (data.content) {
                    setContent(data.content);
                }
                // Optional: surface the AI response as a toast or chat update if modal triggered it.
                // We'll leave the PRD content updated and close the dialog.
                setShowRegenDialog(false);
                setRegenInstructions('');
            } else {
                setError(data.error || 'Regeneration failed');
            }
        } catch {
            setError('Something went wrong');
        } finally {
            setRegenerating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this PRD?')) return;
        await fetch(`/api/prd/${id}`, { method: 'DELETE' });
        router.push('/dashboard/prds');
    };



    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
        );
    }



    return (
        <div className="flex flex-col h-screen bg-[#0f172a]">
            {/* Top navbar */}
            <div className="flex-shrink-0 bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center gap-3">
                <Link href="/dashboard/prds" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    <span className="font-bold text-sm">PRDGen AI</span>
                </Link>

                <div className="w-px h-5 bg-[var(--color-border)] mx-1" />

                <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-1 bg-transparent text-sm font-semibold text-white focus:outline-none px-1 min-w-0"
                />

                <div className="flex items-center gap-4 ml-auto flex-shrink-0">
                    <div className="flex items-center w-24 justify-end">
                        {saving && (
                            <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Saving
                            </span>
                        )}
                        {saved && !saving && !isModified && (
                            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                                <Check className="w-3.5 h-3.5" />
                                Saved
                            </span>
                        )}
                        {isModified && !saving && !saved && (
                            <span className="flex items-center gap-1.5 text-xs text-amber-400">
                                <Save className="w-3.5 h-3.5" />
                                Unsaved
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-slate-400">{currentWordCount} words</span>
                </div>
            </div>

            {error && (
                <div className="flex-shrink-0 px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-sm text-red-400 flex items-center gap-2">
                    <X className="w-4 h-4" /> {error}
                    <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300"><X className="w-3 h-3" /></button>
                </div>
            )}

            {/* Editor area */}
            <div className="flex-1 overflow-hidden flex">
                <div className={cn('flex-1 overflow-hidden flex', chatOpen ? '' : '')}>
                    {(view === 'edit' || view === 'split') && (
                        <div className={cn('flex flex-col', view === 'split' ? 'w-1/2 border-r border-slate-800' : 'w-full')}>
                            <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Editor</span>
                            </div>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="flex-1 p-6 bg-[#0f172a] text-white text-sm font-mono leading-relaxed resize-none focus:outline-none focus:ring-0 border-none placeholder:text-slate-400"
                                style={{ outline: 'none', boxShadow: 'none' }}
                                placeholder="Start writing your PRD in Markdown..."
                                spellCheck={false}
                            />
                        </div>
                    )}

                    {(view === 'preview' || view === 'split') && (
                        <div className={cn('flex flex-col overflow-hidden', view === 'split' ? 'w-1/2' : 'w-full')}>
                            <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Preview</span>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <MarkdownRenderer content={deferredContent} className="prose-prd px-8 py-6" />
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Chat Panel */}
                {chatOpen && (
                    <div
                        className="flex-shrink-0 border-l border-slate-800 flex flex-col bg-slate-900/80 relative transition-[width] duration-0"
                        style={{ width: `${chatWidth}px` }}
                    >
                        {/* Drag handle */}
                        <div
                            className={cn(
                                "absolute -left-1 top-0 bottom-0 w-2 cursor-col-resize z-10 transition-colors",
                                isDragging ? "bg-blue-500" : "hover:bg-blue-500/50"
                            )}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                        />

                        {/* Paywall Overlay */}
                        {(session?.user as any)?.tier === 'FREE' && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm rounded-l-2xl">
                                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl text-center space-y-4 max-w-[90%]">
                                    <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                                        <Sparkles className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg mb-1">AI Chat Locked</h3>
                                        <p className="text-sm text-slate-400">Upgrade to PLUS or PRO to unlock AI PRD revisions and interactive chat.</p>
                                    </div>
                                    <Link
                                        href="/dashboard/pricing"
                                        className="w-full block py-2.5 px-4 rounded-xl bg-amber-500 text-slate-900 font-semibold text-sm hover:bg-amber-400 transition-colors"
                                    >
                                        View Plans
                                    </Link>
                                    <button onClick={() => setChatOpen(false)} className="text-xs text-slate-500 hover:text-white transition-colors">
                                        Close Chat
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Assistant</span>
                            </div>
                            <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {chatMessages.map((msg, i) => (
                                <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                                    <div className={cn(
                                        'max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                                        msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-md whitespace-pre-wrap'
                                            : 'bg-slate-800 text-slate-200 rounded-bl-md prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-p:leading-relaxed'
                                    )}>
                                        {msg.role === 'user' ? (
                                            msg.text
                                        ) : (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.text}
                                            </ReactMarkdown>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {regenerating && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800 px-3.5 py-2.5 rounded-2xl rounded-bl-md flex items-center gap-2 text-sm text-slate-300">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Revising your PRD...
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-3 border-t border-slate-800">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSendChat(chatInput);
                                        }
                                    }}
                                    placeholder="Ask to revise, translate, or improve..."
                                    className="flex-1 bg-slate-800 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500"
                                    disabled={regenerating}
                                />
                                <button
                                    onClick={() => handleSendChat(chatInput)}
                                    disabled={regenerating || !chatInput.trim()}
                                    className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Bottom Toolbar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-2xl p-1.5 shadow-2xl shadow-black/40">
                <button
                    onClick={() => setView('preview')}
                    className={cn(
                        'w-11 h-11 rounded-xl flex items-center justify-center transition-all',
                        view === 'preview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    )}
                    title="Preview"
                >
                    <Eye className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setView('edit')}
                    className={cn(
                        'w-11 h-11 rounded-xl flex items-center justify-center transition-all',
                        view === 'edit' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    )}
                    title="Editor"
                >
                    <Code2 className="w-5 h-5" />
                </button>

                <div className="w-px h-6 bg-slate-700 mx-0.5" />

                <button
                    onClick={() => {
                        const printWindow = window.open('', '_blank');
                        if (!printWindow) return;
                        printWindow.document.write(`
                            <!DOCTYPE html>
                            <html><head>
                            <title>${title}</title>
                            <style>
                                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1e293b; line-height: 1.7; }
                                h1 { font-size: 28px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
                                h2 { font-size: 22px; margin-top: 32px; color: #0f172a; }
                                h3 { font-size: 18px; margin-top: 24px; }
                                table { width: 100%; border-collapse: collapse; margin: 16px 0; }
                                th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; font-size: 14px; }
                                th { background: #f1f5f9; font-weight: 600; }
                                pre { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 13px; }
                                code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
                                pre code { background: none; padding: 0; }
                                ul, ol { padding-left: 24px; }
                                blockquote { border-left: 4px solid #3b82f6; margin: 16px 0; padding: 8px 16px; background: #eff6ff; }
                                @media print { body { padding: 20px; } }
                            </style>
                            </head><body>
                            ${content.replace(/^# (.+)$/gm, '<h1>$1</h1>')
                                .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                                .replace(/^### (.+)$/gm, '<h3>$1</h3>')
                                .replace(/\n/g, '<br>')}
                            </body></html>
                        `);
                        printWindow.document.close();
                        setTimeout(() => { printWindow.print(); }, 500);
                    }}
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                    title="Download PDF"
                >
                    <Download className="w-5 h-5" />
                </button>
                <button
                    onClick={async () => {
                        await navigator.clipboard.writeText(content);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }}
                    className={cn(
                        'w-11 h-11 rounded-xl flex items-center justify-center transition-all',
                        copied ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    )}
                    title="Copy Markdown"
                >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>

                <div className="w-px h-6 bg-slate-700 mx-0.5" />

                <button
                    onClick={() => setChatOpen(!chatOpen)}
                    className={cn(
                        'w-11 h-11 rounded-xl flex items-center justify-center transition-all',
                        chatOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    )}
                    title="AI Chat"
                >
                    <MessageCircle className="w-5 h-5" />
                </button>
            </div>



            {/* Delete hidden in more menu - accessible via keyboard */}
            <button onClick={handleDelete} className="hidden" aria-label="Delete PRD" />
        </div>
    );
}
