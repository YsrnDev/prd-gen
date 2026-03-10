import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Learn how Lucky Brew collects, uses, and protects your personal data. Your privacy is our priority.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-300">
            {/* Header */}
            <header className="border-b border-slate-800/50 py-5 bg-[#0f172a]/90 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-[860px] mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="text-slate-100 font-bold text-lg hover:text-white transition-colors">
                        ← Lucky Brew
                    </Link>
                    <span className="text-slate-500 text-sm">Last updated: March 2026</span>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-[860px] mx-auto px-6 py-16">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-white mb-4">Privacy Policy</h1>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        At Lucky Brew, we take your privacy seriously. This policy explains what information we collect,
                        how we use it, and what rights you have regarding your personal data.
                    </p>
                </div>

                <div className="space-y-10 text-[15px] leading-8">
                    <Section title="1. Information We Collect">
                        <p>We collect information to provide and improve our Service. This includes:</p>
                        <p><strong className="text-slate-300">Account Information:</strong></p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li>Name and email address when you register</li>
                            <li>Profile photo if you sign in via Google OAuth</li>
                            <li>Password (stored as a bcrypt hash — never in plain text)</li>
                        </ul>
                        <p><strong className="text-slate-300">Usage Data:</strong></p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li>Documents and prompts you submit for AI generation</li>
                            <li>Feature usage patterns and session activity</li>
                            <li>IP address, browser type, and device information</li>
                            <li>Log data including pages visited and timestamps</li>
                        </ul>
                        <p><strong className="text-slate-300">Payment Data:</strong></p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li>Transaction IDs and subscription status</li>
                            <li>Card information is handled solely by our payment provider (Midtrans) and is never stored on our servers</li>
                        </ul>
                    </Section>

                    <Section title="2. How We Use Your Information">
                        <p>We use the information we collect to:</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li>Provide, operate, and improve the Lucky Brew Service</li>
                            <li>Process your requests and generate AI-powered documents</li>
                            <li>Manage your account and subscription</li>
                            <li>Send transactional emails (account verification, invoices, password resets)</li>
                            <li>Communicate product updates or promotional offers (you can opt out anytime)</li>
                            <li>Detect and prevent fraud, abuse, and security incidents</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                        <p>We do not sell your personal data to third parties. Period.</p>
                    </Section>

                    <Section title="3. AI Processing and Your Content">
                        <p>When you submit prompts or content to generate PRDs, that input is:</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li>Transmitted to our AI provider (Google Gemini) for processing</li>
                            <li>Not used to train AI models without your explicit consent</li>
                            <li>Stored in our database to display your generation history</li>
                            <li>Accessible only by you and authorized system administrators</li>
                        </ul>
                        <p>Please avoid submitting highly sensitive or confidential proprietary information in your PRD prompts.</p>
                    </Section>

                    <Section title="4. Cookies and Tracking">
                        <p>We use cookies and similar technologies to:</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li><strong className="text-slate-300">Essential cookies:</strong> Required for authentication and session management</li>
                            <li><strong className="text-slate-300">Analytics cookies:</strong> Help us understand how users interact with our platform (anonymized)</li>
                            <li><strong className="text-slate-300">Preference cookies:</strong> Remember your settings and theme preferences</li>
                        </ul>
                        <p>You can manage cookie preferences through your browser settings. Disabling essential cookies may affect Service functionality.</p>
                    </Section>

                    <Section title="5. Data Sharing and Disclosure">
                        <p>We share your data only in these circumstances:</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li><strong className="text-slate-300">Service Providers:</strong> Trusted third parties who assist in operating the Service (hosting, email delivery, analytics). They are bound by confidentiality agreements.</li>
                            <li><strong className="text-slate-300">Legal Requirements:</strong> When required by law, court order, or governmental authority.</li>
                            <li><strong className="text-slate-300">Business Transfers:</strong> In the event of a merger or acquisition, your data may be transferred with prior notice.</li>
                            <li><strong className="text-slate-300">Safety:</strong> To protect the rights, safety, or property of Lucky Brew, our users, or the public.</li>
                        </ul>
                    </Section>

                    <Section title="6. Third-Party Services">
                        <p>Our Service integrates with third-party providers:</p>
                        <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/40 space-y-3">
                            <div><strong className="text-slate-300">Google OAuth</strong> — For &quot;Sign in with Google&quot; functionality. Subject to Google&apos;s Privacy Policy.</div>
                            <div><strong className="text-slate-300">Google Gemini AI</strong> — Powers document generation. Inputs are processed per Google&apos;s API terms.</div>
                            <div><strong className="text-slate-300">Midtrans</strong> — Payment processing. Lucky Brew does not store card details.</div>
                            <div><strong className="text-slate-300">Vercel / Neon DB</strong> — Hosting and database infrastructure with enterprise-grade security.</div>
                        </div>
                    </Section>

                    <Section title="7. Data Retention">
                        <p>We retain your personal data for as long as your account is active or as needed to provide Services.</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li>Account data: Retained while your account exists, deleted within 90 days of account closure</li>
                            <li>Generated documents: Deleted upon account deletion or upon explicit user request</li>
                            <li>Payment records: Retained for 7 years for tax and legal compliance</li>
                            <li>Log data: Retained for up to 12 months</li>
                        </ul>
                    </Section>

                    <Section title="8. Your Rights">
                        <p>Depending on your location, you may have the following rights regarding your personal data:</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li><strong className="text-slate-300">Access:</strong> Request a copy of the data we hold about you</li>
                            <li><strong className="text-slate-300">Correction:</strong> Update or correct inaccurate personal information</li>
                            <li><strong className="text-slate-300">Deletion:</strong> Request deletion of your account and associated data</li>
                            <li><strong className="text-slate-300">Portability:</strong> Receive your data in a machine-readable format</li>
                            <li><strong className="text-slate-300">Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                        </ul>
                        <p>To exercise these rights, contact us at <a href="mailto:privacy@luckybrew.com" className="text-[#135bec] hover:underline">privacy@luckybrew.com</a>.</p>
                    </Section>

                    <Section title="9. Security">
                        <p>We implement industry-standard security measures to protect your data:</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li>All data in transit is encrypted using TLS 1.3</li>
                            <li>Passwords are hashed using bcrypt with appropriate salt rounds</li>
                            <li>Database access is restricted to authorized personnel only</li>
                            <li>Regular security audits and vulnerability assessments</li>
                            <li>Session tokens are short-lived and rotated regularly</li>
                        </ul>
                        <p>No system is 100% secure. In the event of a data breach, we will notify affected users within 72 hours as required by applicable law.</p>
                    </Section>

                    <Section title="10. Children's Privacy">
                        <p>Lucky Brew is not intended for children under 13 years of age. We do not knowingly collect personal information
                            from children under 13. If you believe we have inadvertently collected such information, please contact us immediately
                            and we will delete it promptly.</p>
                    </Section>

                    <Section title="11. Changes to This Policy">
                        <p>We may update this Privacy Policy periodically. When we make significant changes, we will:</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li>Update the &quot;Last updated&quot; date at the top of this page</li>
                            <li>Notify you via email if changes are material</li>
                            <li>Show an in-app notification for the first login after changes</li>
                        </ul>
                        <p>Your continued use of the Service after changes take effect constitutes acceptance of the updated policy.</p>
                    </Section>

                    <Section title="12. Contact Us">
                        <p>If you have questions or concerns about this Privacy Policy or how we handle your data:</p>
                        <div className="bg-slate-800/50 rounded-xl p-5 mt-4 border border-slate-700/50 space-y-1">
                            <p className="text-slate-300"><strong>Lucky Brew — Privacy Team</strong></p>
                            <p className="text-slate-400">Email: <a href="mailto:privacy@luckybrew.com" className="text-[#135bec] hover:underline">privacy@luckybrew.com</a></p>
                            <p className="text-slate-400">Website: <Link href="/" className="text-[#135bec] hover:underline">luckybrew.com</Link></p>
                        </div>
                    </Section>
                </div>

                {/* Footer nav */}
                <div className="mt-16 pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-slate-600 text-sm">© 2026 Lucky Brew. All rights reserved.</p>
                    <div className="flex gap-6 text-sm">
                        <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
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
