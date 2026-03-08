'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function LandingAnimations() {
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        // Small delay to ensure DOM is fully painted
        const raf = requestAnimationFrame(() => {
            const ctx = gsap.context(() => {

                // ─── NAVBAR ───
                gsap.fromTo('[data-anim="navbar"]',
                    { opacity: 0, y: -20 },
                    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.1 }
                );

                // ─── HERO SECTION (timeline) ───
                const heroTl = gsap.timeline({ delay: 0.2 });

                heroTl
                    .fromTo('[data-anim="hero-badge"]',
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
                    )
                    .fromTo('[data-anim="hero-title"]',
                        { opacity: 0, y: 30 },
                        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
                        '-=0.3'
                    )
                    .fromTo('[data-anim="hero-desc"]',
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
                        '-=0.4'
                    )
                    .fromTo('[data-anim="hero-buttons"]',
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
                        '-=0.3'
                    )
                    .fromTo('[data-anim="hero-visual"]',
                        { opacity: 0, x: 60, scale: 0.95 },
                        { opacity: 1, x: 0, scale: 1, duration: 1, ease: 'power2.out' },
                        '-=0.6'
                    );

                // ─── WORKFLOW SECTION ───
                ScrollTrigger.batch('[data-anim="workflow-title"]', {
                    onEnter: (els) => {
                        gsap.fromTo(els, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
                    },
                    start: 'top 85%',
                    once: true,
                });

                ScrollTrigger.batch('[data-anim="workflow-card"]', {
                    onEnter: (els) => {
                        gsap.fromTo(els, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out' });
                    },
                    start: 'top 85%',
                    once: true,
                });

                // ─── FEATURES SECTION ───
                ScrollTrigger.batch('[data-anim="features-title"]', {
                    onEnter: (els) => {
                        gsap.fromTo(els, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' });
                    },
                    start: 'top 85%',
                    once: true,
                });

                ScrollTrigger.batch('[data-anim="feature-card"]', {
                    onEnter: (els) => {
                        gsap.fromTo(els, { opacity: 0, y: 60, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.15, ease: 'back.out(1.2)' });
                    },
                    start: 'top 85%',
                    once: true,
                });

                // ─── PRICING SECTION ───
                ScrollTrigger.batch('[data-anim="pricing-title"]', {
                    onEnter: (els) => {
                        gsap.fromTo(els, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
                    },
                    start: 'top 85%',
                    once: true,
                });

                ScrollTrigger.batch('[data-anim="pricing-card"]', {
                    onEnter: (els) => {
                        gsap.fromTo(els, { opacity: 0, y: 50, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.15, ease: 'back.out(1.2)' });
                    },
                    start: 'top 85%',
                    once: true,
                });

                // ─── ABOUT SECTION ───
                ScrollTrigger.batch('[data-anim="about-text"]', {
                    onEnter: (els) => {
                        gsap.fromTo(els, { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' });
                    },
                    start: 'top 85%',
                    once: true,
                });

                ScrollTrigger.batch('[data-anim="about-stats"]', {
                    onEnter: (els) => {
                        gsap.fromTo(els, { opacity: 0, x: 50, scale: 0.9 }, { opacity: 1, x: 0, scale: 1, duration: 0.9, ease: 'power3.out' });
                    },
                    start: 'top 85%',
                    once: true,
                });

                ScrollTrigger.batch('[data-anim="about-trust"]', {
                    onEnter: (els) => {
                        gsap.fromTo(els, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' });
                    },
                    start: 'top 90%',
                    once: true,
                });

                // ─── CTA SECTION ───
                ScrollTrigger.batch('[data-anim="cta-section"]', {
                    onEnter: (els) => {
                        gsap.fromTo(els, { opacity: 0, y: 60, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' });
                    },
                    start: 'top 80%',
                    once: true,
                });

                ScrollTrigger.batch('[data-anim="cta-content"]', {
                    onEnter: (els) => {
                        els.forEach(el => {
                            gsap.fromTo(el.children, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.2, ease: 'power3.out', delay: 0.2 });
                        });
                    },
                    start: 'top 75%',
                    once: true,
                });

                // ─── FOOTER ───
                ScrollTrigger.batch('[data-anim="footer"]', {
                    onEnter: (els) => {
                        gsap.fromTo(els, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
                    },
                    start: 'top 95%',
                    once: true,
                });

            });

            // Cleanup
            return () => ctx.revert();
        });

        return () => cancelAnimationFrame(raf);
    }, []);

    return null;
}
