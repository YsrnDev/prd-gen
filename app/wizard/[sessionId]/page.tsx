'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useCurrentUser } from '@/lib/use-current-user';
import { WIZARD_STEPS, type WizardAnswers } from '@/lib/ai/prompts';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/layout/Sidebar';
import { Sparkles, Loader2, AlertCircle, Save } from 'lucide-react';

export default function WizardPage() {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.sessionId as string;
    const { data: session } = useSession();
    const { data: currentUser } = useCurrentUser();

    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<WizardAnswers>({});
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [wizardSessionId, setWizardSessionId] = useState<number | null>(null);
    const [recommendingFor, setRecommendingFor] = useState<string | null>(null);
    const autosaveRef = useRef<NodeJS.Timeout | null>(null);
    const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;
    const step = WIZARD_STEPS[currentStep];

    const currentTier = currentUser?.tier || (session?.user as any)?.tier || 'FREE';
    const isFreeTier = currentTier === 'FREE';

    useEffect(() => {
        const initSession = async () => {
            const id = parseInt(sessionId);
            if (!isNaN(id)) {
                setWizardSessionId(id);
                const res = await fetch(`/api/sessions/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setAnswers(data.session.answers || {});
                } else {
                    router.replace('/dashboard');
                }
            } else {
                router.replace('/dashboard');
            }
        };
        initSession();
    }, [sessionId, router]);

    const saveAnswers = useCallback(async (answersToSave: WizardAnswers) => {
        if (!wizardSessionId) return;
        setSaving(true);
        try {
            await fetch(`/api/sessions/${wizardSessionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: answersToSave }),
            });
        } finally {
            setSaving(false);
        }
    }, [wizardSessionId]);

    useEffect(() => {
        if (autosaveRef.current) clearTimeout(autosaveRef.current);
        autosaveRef.current = setTimeout(() => saveAnswers(answers), 3000);
        return () => { if (autosaveRef.current) clearTimeout(autosaveRef.current); };
    }, [answers, saveAnswers]);

    const updateAnswer = (questionId: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const canProceed = () => {
        const requiredQuestions = step.questions.filter((q) => q.required);
        return requiredQuestions.every((q) => answers[q.id]?.trim());
    };

    const handleNext = async () => {
        await saveAnswers(answers);
        if (currentStep < WIZARD_STEPS.length - 1) {
            setCurrentStep((s) => s + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep((s) => s - 1);
    };

    const handleGenerate = async () => {
        if (!canProceed()) return;
        setGenerating(true);
        setError('');
        try {
            await saveAnswers(answers);
            const res = await fetch('/api/generate-prd', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers, sessionId: wizardSessionId }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to generate PRD');
                return;
            }
            const saveRes = await fetch('/api/prd', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: data.content, sessionId: wizardSessionId }),
            });
            const saveData = await saveRes.json();
            if (saveRes.ok) {
                router.push(`/prd/${saveData.document.id}/edit`);
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const handleRecommend = async (questionId: string) => {
        setRecommendingFor(questionId);
        setError('');
        try {
            const res = await fetch('/api/wizard/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers, questionId }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to get recommendation.');
                return;
            }
            updateAnswer(questionId, data.recommendation);
        } catch {
            setError('Failed to connect. Please try again.');
        } finally {
            setRecommendingFor(null);
        }
    };


    return (
        <div className="flex min-h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header purposely removed for a distraction-free Wizard UI */}

                <main className="flex-1 flex overflow-hidden">
                    {/* Center Form Area */}
                    <div className="flex-1 overflow-y-auto bg-slate-950 p-8 lg:p-12 relative pb-32">
                        <div className="max-w-3xl mx-auto space-y-10">
                            {/* Progress Section */}
                            <div className="animate-fade-in space-y-4" key={currentStep}>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tight">{step.title}</h2>
                                        <p className="text-slate-400 mt-2">{step.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[#135bec]">Step {currentStep + 1} of {WIZARD_STEPS.length}</span>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#135bec] rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 space-y-8 shadow-sm">
                                {step.questions.map((question) => (
                                    <div key={question.id} className="space-y-2">
                                        <label htmlFor={question.id} className="block text-sm font-semibold text-slate-300">
                                            {question.label} {question.required && <span className="text-red-500">*</span>}
                                        </label>
                                        {question.type === 'text' ? (
                                            <input
                                                id={question.id}
                                                type="text"
                                                value={answers[question.id] || ''}
                                                onChange={(e) => updateAnswer(question.id, e.target.value)}
                                                placeholder={question.placeholder}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 text-base focus:ring-2 focus:ring-[#135bec] focus:border-transparent text-white placeholder:text-slate-600"
                                            />
                                        ) : (
                                            <textarea
                                                id={question.id}
                                                value={answers[question.id] || ''}
                                                onChange={(e) => updateAnswer(question.id, e.target.value)}
                                                placeholder={question.placeholder}
                                                rows={6}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 text-base focus:ring-2 focus:ring-[#135bec] focus:border-transparent text-white placeholder:text-slate-600 resize-none"
                                            />
                                        )}
                                        {question.hint && (
                                            <p className="text-xs text-slate-400 italic">{question.hint}</p>
                                        )}
                                        {"aiRecommendable" in question && question.aiRecommendable && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (isFreeTier) {
                                                        router.push('/dashboard/pricing');
                                                    } else {
                                                        handleRecommend(question.id);
                                                    }
                                                }}
                                                disabled={recommendingFor === question.id}
                                                className={cn(
                                                    "flex items-center gap-2 mt-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                                                    isFreeTier
                                                        ? "bg-slate-800/50 border border-slate-700/50 text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                                                        : "bg-gradient-to-r from-[#135bec]/20 to-emerald-500/20 border border-[#135bec]/30 text-[#6ea8fe] hover:from-[#135bec]/30 hover:to-emerald-500/30 hover:text-white disabled:opacity-60 disabled:cursor-wait"
                                                )}
                                            >
                                                {recommendingFor === question.id ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating recommendation...</>
                                                ) : isFreeTier ? (
                                                    <><AlertCircle className="w-4 h-4" /> Upgrade to PLUS for AI Recommendations</>
                                                ) : (
                                                    <><Sparkles className="w-4 h-4" /> Recommend with AI</>
                                                )}
                                            </button>
                                        )}
                                        {"options" in question && Array.isArray(question.options) && (
                                            <div className="flex flex-wrap gap-2 mt-3 pt-2">
                                                {question.options.map((opt, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => updateAnswer(question.id, opt)}
                                                        className="text-xs px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-left"
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {error && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 mb-4">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between items-center pt-4">
                                <button onClick={() => saveAnswers(answers)} className="px-6 py-3 rounded-lg border border-slate-800 text-slate-400 font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Saving...' : 'Save Draft'}
                                </button>
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleBack}
                                        disabled={currentStep === 0}
                                        className="px-6 py-3 rounded-lg text-slate-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                                    >
                                        Previous
                                    </button>

                                    {currentStep < WIZARD_STEPS.length - 1 ? (
                                        <button
                                            onClick={handleNext}
                                            disabled={!canProceed()}
                                            className="px-8 py-3 rounded-lg bg-[#135bec] text-white font-bold hover:bg-[#135bec]/90 transition-colors shadow-lg shadow-[#135bec]/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next Step
                                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleGenerate}
                                            disabled={generating || !canProceed()}
                                            className="px-8 py-3 rounded-lg bg-[#135bec] text-white font-bold hover:bg-[#135bec]/90 transition-colors shadow-lg shadow-[#135bec]/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                            {generating ? 'Generating...' : 'Generate PRD'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>


                </main>
            </div>
        </div>
    );
}
