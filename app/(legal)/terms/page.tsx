import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Terms of Service | PRDGen AI',
    description: 'Read the Terms of Service for PRDGen AI. Understand your rights and responsibilities when using our platform.',
};

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-300">
            {/* Header */}
            <header className="border-b border-slate-800/50 py-5 bg-[#0f172a]/90 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-[860px] mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="text-slate-100 font-bold text-lg hover:text-white transition-colors">
                        ← PRDGen AI
                    </Link>
                    <span className="text-slate-500 text-sm">Last updated: March 2025</span>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-[860px] mx-auto px-6 py-16">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-white mb-4">Terms of Service</h1>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Please read these Terms of Service carefully before using PRDGen AI. By accessing or using our platform, you agree to be bound by these terms.
                    </p>
                </div>

                <div className="space-y-10 text-[15px] leading-8">
                    <Section title="1. Acceptance of Terms">
                        <p>By accessing and using PRDGen AI (&quot;Service&quot;, &quot;Platform&quot;, or &quot;we&quot;), you accept and agree to be bound by
                            these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use the Service.</p>
                        <p>We reserve the right to update these Terms at any time. Continued use of the Service after changes are posted constitutes
                            your acceptance of the updated Terms.</p>
                    </Section>

                    <Section title="2. Description of Service">
                        <p>PRDGen AI is an AI-powered platform that helps product managers, developers, and teams generate
                            Product Requirements Documents (PRDs) quickly and efficiently. The Service includes:</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li>AI-assisted PRD generation from natural language inputs</li>
                            <li>Document management and organization tools</li>
                            <li>Collaboration features for teams</li>
                            <li>Subscription-based access tiers (Free, Plus, Pro)</li>
                            <li>Export capabilities in multiple formats</li>
                        </ul>
                    </Section>

                    <Section title="3. Account Registration">
                        <p>To use certain features of the Service, you must create an account. You agree to:</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li>Provide accurate and complete registration information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Notify us immediately of any unauthorized use of your account</li>
                            <li>Be responsible for all activities occurring under your account</li>
                        </ul>
                        <p>You must be at least 13 years old to create an account. If you are under 18, you represent that a parent or guardian has reviewed and agreed to these Terms.</p>
                    </Section>

                    <Section title="4. Subscription Plans and Payments">
                        <p>PRDGen AI offers the following subscription tiers:</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li><strong className="text-slate-300">Free:</strong> Limited access with basic features at no cost</li>
                            <li><strong className="text-slate-300">Plus:</strong> Enhanced features with increased usage limits</li>
                            <li><strong className="text-slate-300">Pro:</strong> Full platform access with unlimited generation</li>
                        </ul>
                        <p>All paid subscriptions are billed monthly or annually, as selected at checkout. Payments are processed securely
                            through our payment provider. Subscription fees are non-refundable except as required by applicable law or as explicitly stated in our Refund Policy.</p>
                        <p>We reserve the right to change pricing with 30 days prior notice. Continued use after the effective date constitutes acceptance of the new pricing.</p>
                    </Section>

                    <Section title="5. Acceptable Use">
                        <p>You agree not to use the Service to:</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li>Violate any applicable laws or regulations</li>
                            <li>Generate content that is harmful, offensive, or infringes third-party rights</li>
                            <li>Attempt to reverse-engineer, decompile, or access source code of the platform</li>
                            <li>Use automated tools to scrape or abuse the API beyond fair use</li>
                            <li>Resell or sublicense access to the Service without written permission</li>
                            <li>Upload malicious code or attempt to compromise system security</li>
                        </ul>
                        <p>Violation of these terms may result in immediate account termination without refund.</p>
                    </Section>

                    <Section title="6. Intellectual Property">
                        <p><strong className="text-slate-300">Your Content:</strong> You retain ownership of all documents and content you create using PRDGen AI. By using the Service, you grant us a limited, non-exclusive license to process your input to provide the Service.</p>
                        <p><strong className="text-slate-300">Our Platform:</strong> PRDGen AI, its design, algorithms, and underlying technology are protected by intellectual property laws. We grant you a limited, revocable license to use the platform solely for its intended purpose.</p>
                        <p><strong className="text-slate-300">AI-Generated Content:</strong> Documents generated by our AI are provided to you for your use. We make no claim of ownership over these outputs, but we are not responsible for ensuring they are free from third-party IP conflicts.</p>
                    </Section>

                    <Section title="7. Privacy and Data">
                        <p>Your use of the Service is also governed by our <Link href="/privacy" className="text-[#135bec] hover:underline">Privacy Policy</Link>, which is incorporated into these Terms by reference.
                            We collect, process, and store your data as described in the Privacy Policy. By using the Service, you consent to such processing.</p>
                    </Section>

                    <Section title="8. Disclaimer of Warranties">
                        <p>The Service is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind, either express or implied. We do not warrant that:</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li>The Service will be uninterrupted, timely, or error-free</li>
                            <li>AI-generated content will be accurate, complete, or suitable for any purpose</li>
                            <li>The Service will meet your specific requirements</li>
                        </ul>
                        <p>AI outputs should be reviewed by qualified professionals before use in any critical business context.</p>
                    </Section>

                    <Section title="9. Limitation of Liability">
                        <p>To the maximum extent permitted by law, PRDGen AI shall not be liable for any indirect, incidental, special,
                            consequential, or punitive damages, including loss of profits, data, or business opportunities arising from your use of the Service.
                            Our total liability to you shall not exceed the amount you paid in the 12 months preceding the claim.</p>
                    </Section>

                    <Section title="10. Termination">
                        <p>Either party may terminate this agreement at any time. Upon termination:</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li>Your access to the Service will cease immediately</li>
                            <li>We may retain your data for up to 90 days before deletion</li>
                            <li>Outstanding payment obligations remain in effect</li>
                        </ul>
                        <p>We may suspend or terminate your account without notice if you violate these Terms.</p>
                    </Section>

                    <Section title="11. Governing Law">
                        <p>These Terms shall be governed by and construed in accordance with the laws of the Republic of Indonesia,
                            without regard to conflict of law provisions. Any disputes arising shall be resolved through binding arbitration
                            or in the courts of Indonesia.</p>
                    </Section>

                    <Section title="12. Contact Us">
                        <p>For questions about these Terms of Service, please contact us at:</p>
                        <div className="bg-slate-800/50 rounded-xl p-5 mt-4 border border-slate-700/50">
                            <p className="text-slate-300"><strong>PRDGen AI</strong></p>
                            <p className="text-slate-400">Email: legal@prdgen.ai</p>
                            <p className="text-slate-400">Website: <Link href="/" className="text-[#135bec] hover:underline">prdgen.ai</Link></p>
                        </div>
                    </Section>
                </div>

                {/* Footer nav */}
                <div className="mt-16 pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-slate-600 text-sm">© 2025 PRDGen AI. All rights reserved.</p>
                    <div className="flex gap-6 text-sm">
                        <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/" className="text-slate-400 hover:text-white transition-colors">Back to Home</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-slate-800/60">{title}</h2>
            <div className="space-y-4 text-slate-400">{children}</div>
        </section>
    );
}
