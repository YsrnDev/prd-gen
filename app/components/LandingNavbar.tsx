'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

export default function LandingNavbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header data-anim="navbar" className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-800/50 px-6 md:px-20 py-4 bg-[#0f172a]/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
                <Image src="/logo.webp" alt="PRDGen AI Logo" width={36} height={36} className="object-contain rounded-xl" />
                <h2 className="text-slate-100 text-xl font-extrabold leading-tight tracking-tight">PRDGen AI</h2>
            </div>

            {/* Centered Desktop Menu */}
            <nav className="hidden md:flex flex-1 justify-center items-center gap-8">
                <a href="#workflow" className="text-slate-300 hover:text-[#135bec] text-sm font-medium transition-colors cursor-pointer">Product</a>
                <a href="#features" className="text-slate-300 hover:text-[#135bec] text-sm font-medium transition-colors cursor-pointer">Features</a>
                <a href="#pricing" className="text-slate-300 hover:text-[#135bec] text-sm font-medium transition-colors cursor-pointer">Pricing</a>
                <a href="#about" className="text-slate-300 hover:text-[#135bec] text-sm font-medium transition-colors cursor-pointer">About</a>
            </nav>

            {/* Right Desktop Buttons */}
            <div className="hidden md:flex items-center gap-4 shrink-0">
                <Link href="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors px-4 py-2">
                    Sign In
                </Link>
                <Link href="/register" className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-5 bg-[#135bec] text-white text-sm font-bold transition-all hover:bg-[#135bec]/90">
                    Get Started
                </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
                className="md:hidden text-slate-100 shrink-0 p-2"
                onClick={toggleMenu}
                title={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Menu Overlay */}
            <div
                className={`absolute top-full left-0 right-0 h-[calc(100vh-73px)] border-t border-slate-800/50 bg-[#0f172a]/95 backdrop-blur-xl z-40 transition-all duration-300 md:hidden overflow-hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
            >
                <div className={`flex flex-col h-full px-6 py-8 transition-transform duration-300 delay-75 ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-8'}`}>
                    <nav className="flex flex-col gap-6 text-center w-full">
                        <a href="#workflow" onClick={toggleMenu} className="text-slate-300 hover:text-white text-xl font-semibold transition-colors py-2">Product</a>
                        <a href="#features" onClick={toggleMenu} className="text-slate-300 hover:text-white text-xl font-semibold transition-colors py-2">Features</a>
                        <a href="#pricing" onClick={toggleMenu} className="text-slate-300 hover:text-white text-xl font-semibold transition-colors py-2">Pricing</a>
                        <a href="#about" onClick={toggleMenu} className="text-slate-300 hover:text-white text-xl font-semibold transition-colors py-2">About</a>
                    </nav>
                    <div className="flex flex-col mt-auto pb-8 pt-8 gap-4 w-full">
                        <Link href="/login" onClick={toggleMenu} className="text-center text-slate-300 hover:text-white text-lg font-medium transition-colors py-3 w-full border border-slate-700/50 rounded-xl bg-slate-800/30">
                            Sign In
                        </Link>
                        <Link href="/register" onClick={toggleMenu} className="flex w-full items-center justify-center rounded-xl h-14 bg-[#135bec] text-white text-lg font-bold transition-all shadow-lg shadow-[#135bec]/25">
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
