import type { Metadata } from 'next';
import './globals.css';
import { Geist, Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

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
  icons: {
    icon: '/logo.webp',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable, inter.variable)} suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
      </head>
      <body className="bg-[#f6f6f8] dark:bg-[#101622] font-sans text-slate-900 dark:text-slate-100 antialiased">{children}</body>
    </html>
  );
}
