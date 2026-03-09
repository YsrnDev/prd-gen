import type { Metadata } from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: 'PRDGen AI - AI-Powered Product Requirements Documents',
    template: '%s | PRDGen AI',
  },
  description:
    'Generate comprehensive, enterprise-ready Product Requirements Documents in minutes using AI. Turn ideas into structured PRDs with our 6-step wizard.',
  keywords: ['PRD', 'product requirements', 'AI', 'product management', 'documentation'],
  authors: [{ name: 'PRDGen AI' }],
  openGraph: {
    type: 'website',
    title: 'PRDGen AI',
    description: 'AI-Powered Product Requirements Documents',
    siteName: 'PRDGen AI',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#f6f6f8] dark:bg-[#101622] font-sans text-slate-900 dark:text-slate-100 antialiased">{children}</body>
    </html>
  );
}
