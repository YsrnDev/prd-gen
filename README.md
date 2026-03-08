# PRDGen AI - Intelligent Product Requirements Document Generator

PRDGen AI is a powerful, AI-driven platform designed to streamline the creation of Product Requirements Documents (PRDs). Built with modern web technologies, it provides a comprehensive end-to-end workflow—from defining project scope in an interactive wizard, to generating detailed Markdown PRDs using advanced Large Language Models, all the way to editing and exporting the final documents.

## 🌟 Key Features

### User Experience
- **Interactive AI Wizard:** Answer a series of guided questions (Project Overview, Target Audience, Core Features, etc.) to compile the necessary context for the AI.
- **AI-Powered PRD Generation:** Harness the power of top-tier AI models to instantly draft professional, well-structured PRDs.
- **Rich Markdown Editor:** A distraction-free markdown editor loaded with syntax highlighting, live preview, auto-save capabilities, and the ability to download your PRD directly as a `.md` file.
- **Chat Assistant Integration:** Context-aware AI chat attached directly to the editor to brainstorm, expand, or regenerate specific sections without leaving the document.

### Platform Setup & Configuration
- **Dynamic AI Configurations:** Administrators can securely configure multiple AI providers.
  - Native support for **OpenAI** and **Anthropic**.
  - **OpenAI-Compatible Custom Providers:** Seamlessly connect to platforms like OpenRouter, DeepSeek, or local LLMs using generic Base URLs.
  - **Dynamic Model Fetching:** Automatically fetch and populate available LLM models directly from the provider's API.
- **Admin Dashboard:** Comprehensive reporting, user management, and AI settings configuration.
  - View real-time platform statistics.
  - Export CSV reports of usage trends and registered users.
  - Audit logging for all major system events.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI & Animations:** [Lucide Icons](https://lucide.dev/), Tailwind styling, Custom CSS features.
- **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Database Engine:** PostgreSQL (Supabase)
- **Authentication:** [Better Auth](https://better-auth.com/)
- **AI Integration:** [Vercel AI SDK](https://sdk.vercel.ai/docs) (`@ai-sdk/openai`, `@ai-sdk/anthropic`)
- **Markdown Processing:** `react-markdown`, `@uiw/react-md-editor`

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
Create a `.env.local` file in the root directory and add your credentials:

```bash
# Database (PostgreSQL / Supabase)
DATABASE_URL="postgresql://user:password@hostname:5432/dbname"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-super-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth Google (Optional - For Google Login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Data Encryption Key (For storing AI API Keys securely, min 32 chars)
ENCRYPTION_KEY="your-super-secret-encryption-key-min-32-chars"

# App Public Information
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="PRDGen AI"
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

## 📁 Project Structure
```text
├── app/                  # Next.js App Router (Pages, API routes, Layouts)
│   ├── (auth)/           # Login & Registration pages
│   ├── admin/            # Admin Dashboard (Stats, Config, Users, Logs)
│   ├── api/              # API endpoints (Auth, AI, Admin, Markdown Generation)
│   ├── dashboard/        # User user-facing dashboard
│   ├── wizard/           # Interactive PRD generation wizard
│   └── editor/           # Markdown Editor & Chat Panel
├── lib/                  
│   ├── auth/             # Better Auth configuration
│   ├── db/               # Drizzle ORM connection & Postgres config
│   └── ai/               # AI SDK configurations and utility wrappers
├── components/           # Reusable React components (UI elements)
└── drizzle/              # Drizzle migrations and metadata
```

## 🛡️ Authentication & Roles
The platform utilizes two distinct roles:
1.  **User:** Can access the generation wizard, manage their generated documents, and use the AI chat.
2.  **Admin:** Gains access to the `/admin` portal to view global statistics, manage users, configure global AI Provider API keys, and review audit logs.

## 🤖 Configuring AI Providers
1. Log in as an `admin`.
2. Navigate to the **AI Configuration** panel in the Dashboard.
3. Select an AI Provider (OpenAI, Anthropic, or Custom).
4. Enter the required **API Key**. For custom providers, enter the **Base URL**.
5. Click **Fetch Models** to dynamically load the list of available models from the platform.
6. Select your chosen model and set the desired Temperature/Max Tokens parameters.
7. Save. All future PRD generations will use this configuration.

## 📄 License
This project is proprietary and confidential.

---
*Built with ❤️ using Next.js, Drizzle, and AI.*
