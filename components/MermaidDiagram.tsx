'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidDiagramProps {
    chart: string;
}

function sanitizeMermaidChart(raw: string): string {
    // Fix pipe characters inside node labels: A[Some|Thing] -> A[Some Thing]
    // But preserve edge labels: -->|label|
    return raw.replace(/\[([^\]]*)\]/g, (match, inner) => {
        // Replace pipe chars inside square bracket labels
        const cleaned = inner.replace(/\|/g, ' ');
        return `[${cleaned}]`;
    });
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [rendered, setRendered] = useState(false);
    const idRef = useRef(`mmd-${Math.random().toString(36).slice(2)}`);

    useEffect(() => {
        let cancelled = false;

        const render = async () => {
            try {
                const sanitizedChart = sanitizeMermaidChart(chart);
                const mermaid = (await import('mermaid')).default;
                mermaid.initialize({
                    startOnLoad: false,
                    theme: 'dark',
                    themeVariables: {
                        primaryColor: '#135bec',
                        primaryTextColor: '#f8fafc',
                        primaryBorderColor: '#1e40af',
                        lineColor: '#475569',
                        secondaryColor: '#1e293b',
                        tertiaryColor: '#0f172a',
                        background: '#0f172a',
                        mainBkg: '#1e293b',
                        nodeBorder: '#334155',
                        clusterBkg: '#1e293b',
                        titleColor: '#f8fafc',
                        edgeLabelBackground: '#1e293b',
                        darkMode: true,
                    },
                    flowchart: {
                        htmlLabels: true,
                        curve: 'basis',
                    },
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 13,
                });

                const { svg } = await mermaid.render(idRef.current, sanitizedChart.trim());

                if (!cancelled && ref.current) {
                    ref.current.innerHTML = svg;
                    setRendered(true);
                    setError(null);
                }
            } catch (e: any) {
                if (!cancelled) {
                    console.error('Mermaid render error:', e);
                    setError(e && typeof e.message === 'string' ? e.message : 'Failed to render diagram');
                }
            }
        };

        render();
        return () => { cancelled = true; };
    }, [chart]);

    if (error) {
        return (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                <span className="font-semibold">⚠ Diagram Error:</span> {error}
                <pre className="mt-2 text-xs text-red-300/60 whitespace-pre-wrap">{chart}</pre>
            </div>
        );
    }

    return (
        <div className="relative my-6">
            {!rendered && (
                <div className="flex h-32 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/50">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Rendering diagram...
                    </div>
                </div>
            )}
            <div
                ref={ref}
                className="mermaid-diagram overflow-x-auto rounded-xl border border-slate-700/50 bg-[#0d1526] p-4"
                style={{ display: rendered ? 'block' : 'none' }}
            />
        </div>
    );
}
