import Link from 'next/link';
import type { Metadata } from 'next';
import LandingAnimations from './components/LandingAnimations';
import LandingNavbar from './components/LandingNavbar';

export const metadata: Metadata = {
  title: 'PRDGen AI - Turn Ideas into PRDs in Minutes',
  description: 'Generate enterprise-ready Product Requirements Documents in minutes using AI. Our 6-step interview wizard produces comprehensive, stakeholder-ready PRDs instantly.',
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-blue-600/30">
      {/* Client component for GSAP animations */}
      <LandingAnimations />

      {/* Fixed Header */}
      <LandingNavbar />

      {/* Content */}
      <div className="overflow-x-hidden">
        <main className="flex-1 pt-16">
          {/* Hero Section */}
          <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-24">
            <div className="flex flex-col gap-10 md:flex-row items-center">
              <div className="flex flex-col gap-8 flex-1">
                <div className="flex flex-col gap-4">
                  <span data-anim="hero-badge" className="text-[#135bec] font-bold tracking-widest text-xs uppercase bg-[#135bec]/10 w-fit px-3 py-1 rounded-full border border-[#135bec]/20">
                    AI-Powered Efficiency
                  </span>
                  <h1 data-anim="hero-title" className="text-slate-100 text-5xl md:text-6xl font-black leading-tight tracking-tight">
                    Turn Ideas into PRDs in <span className="text-[#135bec]">Minutes</span>
                  </h1>
                  <p data-anim="hero-desc" className="text-slate-400 text-lg md:text-xl font-normal leading-relaxed max-w-xl">
                    PRDGen AI automates your product management workflow. Generate comprehensive, enterprise-ready requirements documents using our advanced AI engine.
                  </p>
                </div>
                <div data-anim="hero-buttons" className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register" className="flex min-w-[200px] cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-[#135bec] text-white text-lg font-bold shadow-lg shadow-[#135bec]/20 transition-all hover:scale-[1.02]">
                    Get Started for Free
                  </Link>
                  <Link href="/login" className="flex min-w-[200px] cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-slate-800 text-slate-100 text-lg font-bold border border-slate-700 transition-all hover:bg-slate-700">
                    View Demo
                  </Link>
                </div>
              </div>
              <div data-anim="hero-visual" className="flex-1 w-full max-w-lg">
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl shadow-[#135bec]/10">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#135bec]/20 to-transparent z-0"></div>
                  <div className="relative z-10 w-full bg-slate-900 aspect-[4/3] flex items-center justify-center">
                    <div className="w-4/5 h-4/5 rounded-lg bg-slate-800 border border-slate-700 p-6 flex flex-col gap-4 shadow-xl">
                      <div className="h-4 w-2/3 bg-slate-700 rounded animate-pulse"></div>
                      <div className="h-4 w-full bg-slate-700 rounded opacity-50"></div>
                      <div className="h-4 w-3/4 bg-slate-700 rounded opacity-50"></div>
                      <div className="mt-4 flex gap-2">
                        <div className="h-20 flex-1 bg-[#135bec]/20 rounded border border-[#135bec]/30 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#135bec]/50">shield</span>
                        </div>
                        <div className="h-20 flex-1 bg-slate-700 rounded opacity-30"></div>
                      </div>
                      <div className="mt-4 h-4 w-1/2 bg-[#135bec] rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 6-Step Workflow */}
          <section id="workflow" className="bg-slate-900/50 py-20 border-y border-slate-800/50">
            <div className="max-w-[1200px] mx-auto px-6">
              <div data-anim="workflow-title" className="text-center mb-16">
                <h2 className="text-slate-100 text-3xl md:text-4xl font-bold mb-4">Our 6-Step Workflow</h2>
                <p className="text-slate-400">From initial spark to deployment-ready documentation</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
                {[
                  { icon: 'lightbulb', title: '1. Input Idea', desc: 'Share your raw vision, scribbles, or bullet points with our AI interface.' },
                  { icon: 'query_stats', title: '2. AI Analysis', desc: 'Contextual understanding of your problem space and user requirements.' },
                  { icon: 'public', title: '3. Market Research', desc: 'Automated competitive edge analysis and market validation data.' },
                  { icon: 'list_alt', title: '4. Drafting Features', desc: 'Generation of detailed user stories and acceptance criteria.' },
                  { icon: 'account_tree', title: '5. Technical Specs', desc: 'Architecture mapping and data flow diagrams for engineers.' },
                  { icon: 'check_circle', title: '6. Final PRD', desc: 'Ready to export to Jira, Notion, or Slack in your preferred format.' }
                ].map((step, i) => (
                  <div key={i} data-anim="workflow-card" className="flex flex-col gap-4 p-8 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-[#135bec]/50 transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-[#135bec]/10 flex items-center justify-center text-[#135bec] group-hover:bg-[#135bec] group-hover:text-white transition-all">
                      <span className="material-symbols-outlined">{step.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-slate-100 text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section id="features" className="py-24 max-w-[1200px] mx-auto px-6">
            <div className="flex flex-col gap-16">
              <div data-anim="features-title" className="max-w-2xl">
                <h2 className="text-slate-100 text-3xl md:text-4xl font-black mb-6">Powerful Features for Modern Teams</h2>
                <p className="text-slate-400 text-lg">
                  Designed for speed, built for security. PRDGen AI provides the tools you need to scale your product discovery process globally.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div data-anim="feature-card" className="flex flex-col gap-6 p-8 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 transition-all group">
                  <span className="material-symbols-outlined text-[#135bec] text-4xl group-hover:scale-110 transition-transform">shield</span>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-slate-100 text-xl font-bold">Enterprise-Grade Security</h3>
                    <p className="text-slate-400 leading-relaxed">SOC2 Type II compliant with end-to-end encryption for all your strategic roadmap documents.</p>
                  </div>
                </div>
                <div data-anim="feature-card" className="flex flex-col gap-6 p-8 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 transition-all group">
                  <span className="material-symbols-outlined text-[#135bec] text-4xl group-hover:scale-110 transition-transform">dashboard_customize</span>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-slate-100 text-xl font-bold">Custom Templates</h3>
                    <p className="text-slate-400 leading-relaxed">Build your own framework or use our library of industry-standard PRD and BRD templates.</p>
                  </div>
                </div>
                <div data-anim="feature-card" className="flex flex-col gap-6 p-8 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 transition-all group">
                  <span className="material-symbols-outlined text-[#135bec] text-4xl group-hover:scale-110 transition-transform">api</span>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-slate-100 text-xl font-bold">Full API Access</h3>
                    <p className="text-slate-400 leading-relaxed">Integrate PRDGen AI directly into your existing CI/CD or PM toolchain via our robust REST API.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="bg-slate-900/50 py-24 border-y border-slate-800/50">
            <div className="max-w-[1200px] mx-auto px-6">
              <div data-anim="pricing-title" className="text-center mb-16">
                <span className="text-[#135bec] font-bold tracking-widest text-xs uppercase bg-[#135bec]/10 px-3 py-1 rounded-full border border-[#135bec]/20">
                  Pricing
                </span>
                <h2 className="text-slate-100 text-3xl md:text-4xl font-bold mt-4 mb-4">Simple, Transparent Pricing</h2>
                <p className="text-slate-400 max-w-xl mx-auto">Start free, scale as you grow. No hidden fees, no surprise charges.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Free */}
                <div data-anim="pricing-card" className="flex flex-col p-8 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-colors">
                  <div className="mb-6">
                    <h3 className="text-slate-100 text-xl font-bold mb-1">Starter</h3>
                    <p className="text-slate-400 text-sm">For individuals exploring AI-powered PRDs</p>
                  </div>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-slate-100 text-5xl font-black">$0</span>
                    <span className="text-slate-500 text-sm">/month</span>
                  </div>
                  <ul className="flex flex-col gap-3 mb-8 text-sm text-slate-400">
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-400 text-base" style={{ fontSize: '18px', width: '18px' }}>check_circle</span> 3 PRDs per month</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-400 text-base" style={{ fontSize: '18px', width: '18px' }}>check_circle</span> Basic AI analysis</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-400 text-base" style={{ fontSize: '18px', width: '18px' }}>check_circle</span> PDF export</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-slate-600 text-base" style={{ fontSize: '18px', width: '18px' }}>cancel</span> Market research</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-slate-600 text-base" style={{ fontSize: '18px', width: '18px' }}>cancel</span> API access</li>
                  </ul>
                  <Link href="/register" className="flex items-center justify-center rounded-xl h-12 px-6 bg-slate-700 text-white text-sm font-bold transition-all hover:bg-slate-600 mt-auto">
                    Get Started Free
                  </Link>
                </div>
                {/* Pro - highlighted */}
                <div data-anim="pricing-card" className="flex flex-col p-8 rounded-2xl bg-[#135bec]/10 border-2 border-[#135bec] relative hover:border-[#135bec] transition-colors shadow-lg shadow-[#135bec]/10">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#135bec] text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>
                  <div className="mb-6">
                    <h3 className="text-slate-100 text-xl font-bold mb-1">Pro</h3>
                    <p className="text-slate-400 text-sm">For teams shipping products at scale</p>
                  </div>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-slate-100 text-5xl font-black">$29</span>
                    <span className="text-slate-500 text-sm">/month</span>
                  </div>
                  <ul className="flex flex-col gap-3 mb-8 text-sm text-slate-400">
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-400 text-base" style={{ fontSize: '18px', width: '18px' }}>check_circle</span> Unlimited PRDs</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-400 text-base" style={{ fontSize: '18px', width: '18px' }}>check_circle</span> Advanced AI analysis</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-400 text-base" style={{ fontSize: '18px', width: '18px' }}>check_circle</span> All export formats</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-400 text-base" style={{ fontSize: '18px', width: '18px' }}>check_circle</span> Market research</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-400 text-base" style={{ fontSize: '18px', width: '18px' }}>check_circle</span> Priority support</li>
                  </ul>
                  <Link href="/register" className="flex items-center justify-center rounded-xl h-12 px-6 bg-[#135bec] text-white text-sm font-bold transition-all hover:bg-[#135bec]/90 shadow-lg shadow-[#135bec]/20 mt-auto">
                    Start Pro Trial
                  </Link>
                </div>
                {/* Enterprise */}
                <div data-anim="pricing-card" className="flex flex-col p-8 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-colors">
                  <div className="mb-6">
                    <h3 className="text-slate-100 text-xl font-bold mb-1">Enterprise</h3>
                    <p className="text-slate-400 text-sm">For organizations with advanced needs</p>
                  </div>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-slate-100 text-5xl font-black">$99</span>
                    <span className="text-slate-500 text-sm">/month</span>
                  </div>
                  <ul className="flex flex-col gap-3 mb-8 text-sm text-slate-400">
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-400 text-base" style={{ fontSize: '18px', width: '18px' }}>check_circle</span> Everything in Pro</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-400 text-base" style={{ fontSize: '18px', width: '18px' }}>check_circle</span> Full API access</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-400 text-base" style={{ fontSize: '18px', width: '18px' }}>check_circle</span> SSO & SAML</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-400 text-base" style={{ fontSize: '18px', width: '18px' }}>check_circle</span> Custom integrations</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-400 text-base" style={{ fontSize: '18px', width: '18px' }}>check_circle</span> Dedicated support</li>
                  </ul>
                  <Link href="/register" className="flex items-center justify-center rounded-xl h-12 px-6 bg-slate-700 text-white text-sm font-bold transition-all hover:bg-slate-600 mt-auto">
                    Contact Sales
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* About */}
          <section id="about" className="py-24 max-w-[1200px] mx-auto px-6">
            <div className="flex flex-col gap-16">
              <div className="flex flex-col md:flex-row gap-16 items-center">
                <div data-anim="about-text" className="flex-1 flex flex-col gap-6">
                  <span className="text-[#135bec] font-bold tracking-widest text-xs uppercase bg-[#135bec]/10 w-fit px-3 py-1 rounded-full border border-[#135bec]/20">
                    About Us
                  </span>
                  <h2 className="text-slate-100 text-3xl md:text-4xl font-black leading-tight">Built by Product People,<br />for Product People</h2>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    PRDGen AI was born from the frustration of spending weeks crafting PRDs that should take hours. Our team of ex-PMs from Google, Meta, and Stripe built an AI engine that understands product thinking — not just text generation.
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    We believe great products start with great documentation. Our mission is to eliminate the gap between ideation and execution by giving every product team the tools to articulate their vision clearly, comprehensively, and fast.
                  </p>
                </div>
                <div data-anim="about-stats" className="flex-1 w-full">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2 p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-center">
                      <span className="text-[#135bec] text-3xl md:text-4xl font-black">50K+</span>
                      <span className="text-slate-400 text-sm">Product Managers</span>
                    </div>
                    <div className="flex flex-col gap-2 p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-center">
                      <span className="text-[#135bec] text-3xl md:text-4xl font-black">1M+</span>
                      <span className="text-slate-400 text-sm">PRDs Generated</span>
                    </div>
                    <div className="flex flex-col gap-2 p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-center">
                      <span className="text-[#135bec] text-3xl md:text-4xl font-black">85%</span>
                      <span className="text-slate-400 text-sm">Time Saved</span>
                    </div>
                    <div className="flex flex-col gap-2 p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-center">
                      <span className="text-[#135bec] text-3xl md:text-4xl font-black">4.9★</span>
                      <span className="text-slate-400 text-sm">User Rating</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Trust logos */}
              <div data-anim="about-trust" className="text-center">
                <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-8">Trusted by teams at</p>
                <div className="flex flex-wrap justify-center items-center gap-10 text-slate-600">
                  {['Google', 'Meta', 'Stripe', 'Shopify', 'Vercel', 'GitHub'].map((company) => (
                    <span key={company} className="text-lg font-bold tracking-tight hover:text-slate-400 transition-colors">{company}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="max-w-[1200px] mx-auto px-6 py-20">
            <div data-anim="cta-section" className="relative rounded-3xl overflow-hidden bg-[#135bec] p-12 md:p-20 text-center shadow-2xl shadow-[#135bec]/20">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '32px 32px' }}></div>
              <div data-anim="cta-content" className="relative z-10 flex flex-col items-center gap-8">
                <h2 className="text-white text-4xl md:text-5xl font-black leading-tight">Ready to ship better products faster?</h2>
                <p className="text-white/80 text-xl max-w-2xl">Join 50,000+ product managers using PRDGen AI to streamline their documentation.</p>
                <Link href="/register" className="flex min-w-[240px] cursor-pointer items-center justify-center rounded-xl h-16 px-10 bg-white text-[#135bec] text-xl font-black shadow-xl transition-all hover:scale-105 active:scale-95">
                  Get Started for Free
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer data-anim="footer" className="border-t border-slate-800/50 py-6 px-6 md:px-20 bg-[#0f172a]">
          <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-[#135bec] rounded-lg p-1">
                <span className="material-symbols-outlined text-white text-lg">controller_gen</span>
              </div>
              <span className="text-slate-400 text-sm font-semibold">PRDGen AI</span>
            </div>
            <p className="text-slate-600 text-xs">© 2024 PRDGen AI. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
