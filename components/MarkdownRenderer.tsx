'use client';

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MermaidDiagram } from './MermaidDiagram';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

const remarkPlugins = [remarkGfm];

const components: Components = {
    // Custom code block renderer — intercepts ```mermaid blocks
    code({ node, className: cls, children, ...props }) {
        const match = /language-(\w+)/.exec(cls || '');
        const lang = match?.[1];
        const code = String(children).replace(/\n$/, '');

        if (lang === 'mermaid') {
            return <MermaidDiagram chart={code} />;
        }

        // Regular code block
        return (
            <code
                className={`${cls || ''} rounded px-1.5 py-0.5 bg-slate-800 text-blue-300 text-sm font-mono`}
                {...props}
            >
                {children}
            </code>
        );
    },
    // Pre block — for non-mermaid code blocks with language
    pre({ children }) {
        return (
            <pre className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-300 my-4">
                {children}
            </pre>
        );
    },
};

export const MarkdownRenderer = memo(function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
        <div className={`prose-content ${className || ''}`}>
            <ReactMarkdown
                remarkPlugins={remarkPlugins}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
});
