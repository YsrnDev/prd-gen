'use client';

import { useState, useEffect } from 'react';
import { Settings2, Save, Zap, Loader2, Check, X, ChevronDown, Eye, EyeOff, Lock, Sparkles, Gauge, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const PROVIDERS = [
    { value: 'openai', label: 'OpenAI', subtitle: 'GPT-4 & GPT-3.5', icon: Settings2, models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'] },
    { value: 'anthropic', label: 'Anthropic', subtitle: 'Claude 3.5 Sonnet', icon: Sparkles, models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'] },
    { value: 'custom', label: 'OpenAI-Compatible', subtitle: 'DeepSeek, Mistral, Local', icon: Gauge, models: ['deepseek-chat', 'deepseek-reasoner', 'llama3-8b', 'mistral-large'] },
];

export default function AIConfigPage() {
    const [provider, setProvider] = useState('openai');
    const [apiKey, setApiKey] = useState('');
    const [orgId, setOrgId] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [defaultModel, setDefaultModel] = useState('gpt-4o');
    const [temperature, setTemperature] = useState(0.5);
    const [showKey, setShowKey] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [saved, setSaved] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasExistingConfig, setHasExistingConfig] = useState(false);
    const [fetchedModels, setFetchedModels] = useState<string[]>([]);
    const [fetchingModels, setFetchingModels] = useState(false);
    const [fetchModelError, setFetchModelError] = useState('');

    useEffect(() => {
        const load = async () => {
            const res = await fetch('/api/admin/ai-config');
            if (res.ok) {
                const data = await res.json();
                if (data.config) {
                    setHasExistingConfig(true);
                    setProvider(data.config.provider || 'openai');
                    setDefaultModel(data.config.defaultModel || 'gpt-4o');
                    if (data.config.baseUrl) setBaseUrl(data.config.baseUrl);
                }
            }
            setLoading(false);
        };
        load();
    }, []);

    const currentProvider = PROVIDERS.find((p) => p.value === provider);

    const handleSave = async () => {
        if (!apiKey && !hasExistingConfig) return;
        setSaving(true);
        setSaved(false);
        setTestResult(null);

        const body: Record<string, string> = { provider, defaultModel };
        if (apiKey) body.apiKey = apiKey;
        if (provider === 'custom' && baseUrl) body.baseUrl = baseUrl;

        const res = await fetch('/api/admin/ai-config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            setSaved(true);
            setHasExistingConfig(true);
            setApiKey('');
            setTimeout(() => setSaved(false), 2000);
        }
        setSaving(false);
    };

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);
        const res = await fetch('/api/admin/ai-config/test', { method: 'POST' });
        const data = await res.json();
        setTestResult(data);
        setTesting(false);
    };

    const getTemperatureLabel = () => {
        if (temperature <= 0.3) return 'PRECISE';
        if (temperature <= 0.7) return 'BALANCED';
        return 'CREATIVE';
    };

    const handleFetchModels = async () => {
        setFetchingModels(true);
        setFetchModelError('');
        try {
            const res = await fetch('/api/admin/ai-config/models', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider, apiKey: apiKey || undefined, baseUrl: baseUrl || undefined }),
            });
            const data = await res.json();
            if (!res.ok) {
                setFetchModelError(data.error || 'Failed to fetch models');
            } else if (data.models && data.models.length > 0) {
                setFetchedModels(data.models);
                // Auto-select first model if current model is not in list
                if (!data.models.includes(defaultModel)) {
                    setDefaultModel(data.models[0]);
                }
            } else {
                setFetchModelError('No models found. Check your API key and base URL.');
            }
        } catch {
            setFetchModelError('Network error — cannot reach API.');
        } finally {
            setFetchingModels(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6">
                <Settings2 className="w-4 h-4 text-[var(--color-muted-fg)]" />
                <span className="text-xs font-bold text-[var(--color-muted-fg)] uppercase tracking-wider">AI Infrastructure</span>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--color-fg)]">AI Infrastructure Settings</h1>
                <p className="text-sm text-[var(--color-muted-fg)] mt-1">
                    Configure global AI providers, manage encrypted API keys, and define operational model parameters.
                </p>
            </div>

            {/* Active Provider */}
            <div className="glass-card p-6 mb-4">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <h2 className="text-sm font-bold text-[var(--color-fg)]">Active Provider</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PROVIDERS.map((p) => {
                        const Icon = p.icon;
                        return (
                            <button
                                key={p.value}
                                onClick={() => {
                                    setProvider(p.value);
                                    if (p.models[0]) setDefaultModel(p.models[0]);
                                    setFetchedModels([]);
                                    setFetchModelError('');
                                }}
                                className={cn(
                                    'flex flex-col gap-3 px-4 py-4 rounded-xl border text-left transition-all',
                                    provider === p.value
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-[var(--color-border)] hover:border-blue-500/30'
                                )}
                            >
                                <Icon className={cn('w-5 h-5', provider === p.value ? 'text-blue-400' : 'text-[var(--color-muted-fg)]')} />
                                <div>
                                    <p className="text-sm font-bold text-[var(--color-fg)]">{p.label}</p>
                                    <p className="text-xs text-[var(--color-muted-fg)]">{p.subtitle}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* API Authentication */}
            <div className="glass-card p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[var(--color-muted-fg)]" />
                        <h2 className="text-sm font-bold text-[var(--color-fg)]">API Authentication</h2>
                    </div>
                    {hasExistingConfig && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            <Lock className="w-3 h-3" />
                            Encrypted
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-[var(--color-muted-fg)] mb-1.5">
                            {provider === 'custom' ? 'API Key' : 'OpenAI API Key'}
                        </label>
                        <div className="relative">
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder={hasExistingConfig ? '••••••••••••••••••••••••••••••••' : 'sk-...'}
                                className="input-field pr-10 font-mono"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]"
                            >
                                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    {provider === 'custom' ? (
                        <div>
                            <label className="block text-xs font-semibold text-[var(--color-muted-fg)] mb-1.5">Custom Base URL</label>
                            <input
                                type="text"
                                value={baseUrl}
                                onChange={(e) => setBaseUrl(e.target.value)}
                                placeholder="https://api.deepseek.com/v1"
                                className="input-field"
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-xs font-semibold text-[var(--color-muted-fg)] mb-1.5">Organization ID (Optional)</label>
                            <input
                                type="text"
                                value={orgId}
                                onChange={(e) => setOrgId(e.target.value)}
                                placeholder="org-..."
                                className="input-field"
                            />
                        </div>
                    )}
                </div>

                {/* Test result */}
                {testResult && (
                    <div className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border text-sm mt-4',
                        testResult.success
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                    )}>
                        {testResult.success ? <Check className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <X className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                        <span>{testResult.success ? `✓ ${testResult.message}` : testResult.error}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving || (!apiKey && !hasExistingConfig)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg primary-gradient text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved ? 'Saved!' : 'Save Configuration'}
                    </button>
                    <button
                        onClick={handleTest}
                        disabled={testing || !hasExistingConfig}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-fg)] hover:bg-[var(--color-accent)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        Test Connection
                    </button>
                </div>
            </div>

            {/* Model Parameters + Rate Limiting */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Model Parameters */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Settings2 className="w-4 h-4 text-[var(--color-muted-fg)]" />
                        <h2 className="text-sm font-bold text-[var(--color-fg)]">Model Parameters</h2>
                    </div>

                    {currentProvider && (
                        <div className="mb-5">
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-semibold text-[var(--color-muted-fg)]">Default Model</label>
                                <button
                                    type="button"
                                    onClick={handleFetchModels}
                                    disabled={fetchingModels || (!apiKey && !hasExistingConfig)}
                                    className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    {fetchingModels ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                    {fetchingModels ? 'Fetching...' : 'Fetch Models from API'}
                                </button>
                            </div>
                            {fetchModelError && (
                                <p className="text-xs text-red-400 mb-2">{fetchModelError}</p>
                            )}
                            {fetchedModels.length > 0 ? (
                                <div className="relative">
                                    <select
                                        value={defaultModel}
                                        onChange={(e) => setDefaultModel(e.target.value)}
                                        className="w-full appearance-none px-4 py-2.5 pr-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-fg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                                    >
                                        {fetchedModels.map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-fg)] pointer-events-none" />
                                    <span className="block mt-1.5 text-[10px] text-emerald-400 font-semibold">
                                        {fetchedModels.length} models loaded from API
                                    </span>
                                </div>
                            ) : provider === 'custom' ? (
                                <input
                                    type="text"
                                    value={defaultModel}
                                    onChange={(e) => setDefaultModel(e.target.value)}
                                    placeholder="e.g. deepseek-chat (or use Fetch Models)"
                                    className="input-field"
                                />
                            ) : (
                                <div className="relative">
                                    <select
                                        value={defaultModel}
                                        onChange={(e) => setDefaultModel(e.target.value)}
                                        className="w-full appearance-none px-4 py-2.5 pr-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-fg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                                    >
                                        {currentProvider.models.map((m) => (
                                            <option key={m} value={m}>{m === 'gpt-4o' ? 'gpt-4o (Recommended)' : m}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-fg)] pointer-events-none" />
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-[var(--color-muted-fg)]">Temperature</label>
                            <span className="text-xs font-bold text-blue-400">{temperature.toFixed(1)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[var(--color-border)] accent-blue-500"
                        />
                        <div className="flex justify-between mt-1.5 text-[10px] uppercase tracking-wider text-[var(--color-muted-fg)] font-semibold">
                            <span>Precise</span>
                            <span>Balanced</span>
                            <span>Creative</span>
                        </div>
                    </div>
                </div>

                {/* Rate Limiting */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Gauge className="w-4 h-4 text-[var(--color-muted-fg)]" />
                        <h2 className="text-sm font-bold text-[var(--color-fg)]">Rate Limiting</h2>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-semibold text-[var(--color-muted-fg)]">Requests Per Minute (RPM)</label>
                                <span className="text-xs font-bold text-blue-400">6,000</span>
                            </div>
                            <input
                                type="range"
                                min="100"
                                max="10000"
                                step="100"
                                defaultValue={6000}
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[var(--color-border)] accent-blue-500"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-semibold text-[var(--color-muted-fg)]">Tokens Per Minute (TPM)</label>
                                <span className="text-xs font-bold text-emerald-400">84,000</span>
                            </div>
                            <input
                                type="range"
                                min="1000"
                                max="200000"
                                step="1000"
                                defaultValue={84000}
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[var(--color-border)] accent-emerald-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
