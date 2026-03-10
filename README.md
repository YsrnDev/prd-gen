# PRDGen AI - Intelligent Product Requirements Document Generator

PRDGen AI is a powerful, AI-driven platform designed to streamline the creation of Product Requirements Documents (PRDs). Built with modern web technologies, it provides a comprehensive end-to-end workflow—from defining project scope in an interactive wizard, to generating detailed Markdown PRDs using advanced Large Language Models, all the way to editing and exporting the final documents.

## 🌟 Key Features

### User Experience
- **Interactive AI Wizard:** Answer a series of guided questions (Project Overview, Target Audience, Core Features, etc.) to compile the necessary context for the AI.
- **AI-Powered PRD Generation:** Harness the power of top-tier AI models to instantly draft professional, well-structured PRDs.
- **Rich Markdown Editor:** A distraction-free markdown editor loaded with syntax highlighting, live preview, auto-save capabilities, and the ability to download your PRD directly as a `.md` or `.pdf` file.
- **Chat Assistant Integration:** Context-aware AI chat attached directly to the editor to brainstorm, expand, or regenerate specific sections without leaving the document.

### Monetization & Subscription (New)
- **Tiered Pricing Plans:** Support for FREE, PLUS, and PRO subscription tiers with customizable feature limits (e.g., PRDs per month).
- **Payment Gateway Integration:** Seamless, secure checkout experience powered by **Midtrans** with automatic subscription upgrading via webhooks.
- **Usage Tracking:** Automatic tracking of user PRD generation quotas per billing cycle.

### Platform Setup & Configuration
- **Dynamic AI Configurations:** Administrators can securely configure multiple AI providers.
  - Native support for **OpenAI** and **Anthropic**.
  - **OpenAI-Compatible Custom Providers:** Seamlessly connect to platforms like OpenRouter, DeepSeek, or local LLMs using generic Base URLs.
  - **Dynamic Model Fetching:** Automatically fetch and populate available LLM models directly from the provider's API.
- **Email Delivery System:** Integrated with **Brevo (SMTP)** for reliable delivery of user authentication emails and subscription notifications.

### Admin Dashboard & Security
- **Admin Management:** Comprehensive reporting, user management, subscription pricing setup, and AI settings configuration.
  - View real-time platform statistics and export CSV reports.
- **Hardened Security:** Built-in defenses against common vulnerabilities.
  - Rate limiting, strict CORS policies, and comprehensive Helmet-style secure HTTP headers.
  - Strong input validation using Zod.
  - Failed-closed maintenance modes and encrypted storage for sensitive API Keys.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI & Animations:** [Lucide Icons](https://lucide.dev/), Custom CSS features.
- **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Database Engine:** PostgreSQL (Supabase / Neon)
- **Authentication:** [Better Auth](https://better-auth.com/) (Email/Password, Google OAuth)
- **AI Integration:** [Vercel AI SDK](https://sdk.vercel.ai/docs) (`@ai-sdk/openai`, `@ai-sdk/anthropic`)
- **Payment Gateway:** [Midtrans Node Client](https://midtrans.com/)
- **Email Service:** `nodemailer` via Brevo SMTP
- **Markdown Processing:** `react-markdown`, `@uiw/react-md-editor`, `jspdf`

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+ recommended) installed.

### 1. Clone & Install
```bash
git clone <repository-url>
cd prd-generator
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory and add your credentials. Refer to the `.env.example` file if provided, or construct it matching the following structure:

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@hostname:5432/dbname"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-super-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth Google (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Data Encryption Key (Must be EXACTLY 64 hex characters / 32 bytes)
ENCRYPTION_KEY="your-64-char-hex-string-encryption-key-here"

# App Public Information
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="PRDGen AI"

# Midtrans Payment Gateway
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="your-client-key"
MIDTRANS_SERVER_KEY="your-server-key"

# Brevo SMTP Configuration
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT=587
SMTP_USER="your-email@example.com"
SMTP_PASS="your-smtp-master-password"
SMTP_FROM="noreply@yourdomain.com"
```

### 3. Database Migration & Push
Initialize your database schema using Drizzle Kit:
```bash
# Push schema to the database
npm run db:push

# (Optional) Open Drizzle Studio to inspect DB
npm run db:studio
```

### 4. Run Development Server
Start the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🛡️ Authentication & Roles
The platform utilizes two distinct roles:
1.  **User:** Can access the generation wizard, upgrade their tier via Midtrans, manage docs, and chat.
2.  **Admin:** Gains access to the `/admin` portal to view global statistics, manage users, modify pricing plans, configure AI APIs, and review system logs. (The first user to register automatically becomes an Admin).

## 📄 License
This project is proprietary and confidential.

---
*Built with ❤️ using Next.js, Drizzle, and AI.*
