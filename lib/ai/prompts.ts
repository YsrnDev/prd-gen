export interface WizardAnswers {
    projectName?: string;
    problemStatement?: string;
    targetAudience?: string;
    keyFeatures?: string;
    techStack?: string;
    successMetrics?: string;
    [key: string]: string | undefined;
}

export function getPRDPrompt(answers: WizardAnswers, additionalInstructions?: string) {
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const systemPrompt = `You are a senior Product Manager. Write a comprehensive PRD with this exact structure:

# [ProjectName] - Product Requirements Document

## 1. Executive Summary
### Problem Statement
[3-4 sentences with specific data/statistics]
### Proposed Solution
[2-3 sentences on what makes it unique]
### Success Criteria
| Metric | Target | Timeframe |
|--------|--------|-----------|

## 2. User Experience & Functionality
### User Personas
[2 detailed personas with Background, Goals, Pain Points]
### User Stories
| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
[5 user stories, US-01 to US-05]
### Core Features
| Feature | Description | Priority | Effort |
|---------|-------------|----------|--------|
[all features with P0/P1/P2 and L/M/H effort]
### Non-Goals
[what v1 will NOT do]

## 3. User Flows

### 3.1 Primary User Flow
[1 sentence description]

\`\`\`mermaid
flowchart TD
    [Create a detailed flowchart with 10-15 nodes specific to this product's main user journey]
\`\`\`

### 3.2 Onboarding Flow
[1 sentence description]

\`\`\`mermaid
flowchart TD
    [Create registration/onboarding flow specific to this product]
\`\`\`

### 3.3 Error & Edge Case Flow
[1 sentence description]

\`\`\`mermaid
flowchart TD
    [Create error handling flow specific to this product]
\`\`\`

## 4. Technical Specifications
### Architecture Overview
[2-3 sentences on system architecture]
### Tech Stack
| Layer | Technology | Rationale |
|-------|-----------|-----------|
### Integration Points
| System | Purpose | Protocol |
|--------|---------|----------|
### Security & Privacy
[auth, encryption, compliance]
### Performance Requirements
- Page Load: <Xms (p95), API: <Xms, Uptime: X%

## 5. Success Metrics & KPIs
[Acquisition, Engagement, Retention, Revenue sections with specific numbers]

## 6. Implementation Roadmap
### Phase 1 — MVP ([timeline])
[features + milestone]
### Phase 2 — Growth ([timeline])
[features]
### Phase 3 — Scale ([timeline])
[features]

## 7. Risks & Mitigations
| # | Risk | Impact | Likelihood | Mitigation |
|---|------|--------|------------|------------|
[3-5 risks]

---
**Document Version:** 1.0
**Last Updated:** ${currentDate}
**Owner:** Product Management Team
**Stakeholders:** Engineering, Customer Success, Finance, Operations

RULES:
- Section 3 Mermaid diagrams are MANDATORY. Tailor all 3 to this specific product.
- Mermaid SYNTAX RULES (CRITICAL — invalid syntax will crash the renderer):
  - Always use flowchart TD
  - Node IDs must be simple alphanumeric (e.g., A, B1, step1). NO spaces in IDs.
  - Node labels use square brackets: A[Label Text]
  - Rounded nodes: A([Label Text])
  - Diamond decisions: A{Decision?}
  - Edge labels use pipe syntax: A -->|Yes| B
  - NEVER put pipe | inside node labels like A[Some|Thing]. This WILL crash.
  - NEVER nest brackets like A[Text[inner]]. This WILL crash.
  - Keep labels short (max 5 words), simple alphanumeric text only.
  - Example valid diagram:
    flowchart TD
      A([Start]) --> B[Step One]
      B --> C{Decision?}
      C -->|Yes| D[Action]
      C -->|No| E[Other Action]
      D --> F([End])
- No vague terms, only specific measurable numbers.`;

    const answersText = Object.entries(answers)
        .filter(([, v]) => v)
        .map(([k, v]) => `**${k}**: ${v}`)
        .join('\n');

    let userPrompt = `Generate a comprehensive PRD for:\n\n${answersText}\n\nMandatory: Include Section 3 with 3 Mermaid flowchart diagrams tailored specifically to "${answers.projectName || 'this product'}".`;

    if (additionalInstructions) {
        userPrompt += `\n\n**Additional Instructions:**\n${additionalInstructions}`;
    }

    return { systemPrompt, userPrompt };
}

// 6-step wizard questions
export const WIZARD_STEPS = [
    {
        id: 'step1',
        title: 'Project Discovery',
        description: 'Define the core vision and problem space for your product.',
        icon: '🎯',
        questions: [
            {
                id: 'projectName',
                label: 'Project Name',
                placeholder: 'e.g., TaskFlow Pro, MedConnect, EduPath',
                hint: 'Give your project a clear, descriptive internal name.',
                type: 'text',
                required: true,
            },
            {
                id: 'problemStatement',
                label: 'Problem Statement',
                placeholder: 'Describe the problem you are solving and why it matters...',
                hint: "Explain the 'Why' behind this product. What gap does it fill?",
                type: 'textarea',
                required: true,
            },
        ],
    },
    {
        id: 'step2',
        title: 'Target Audience',
        description: 'Who are you building this for?',
        icon: '👥',
        questions: [
            {
                id: 'targetAudience',
                label: 'Target Audience',
                placeholder: 'e.g., Small business owners aged 30-50 who manage remote teams...',
                hint: 'Be specific about demographics, behaviors, and pain points.',
                type: 'textarea',
                required: true,
                aiRecommendable: true,
            },
        ],
    },
    {
        id: 'step3',
        title: 'Core Features',
        description: 'What will your product actually do?',
        icon: '⚡',
        questions: [
            {
                id: 'keyFeatures',
                label: 'Key Features',
                placeholder: 'List your top 5-10 core features, one per line...',
                hint: 'Focus on must-have features. Separate nice-to-haves later.',
                type: 'textarea',
                required: true,
                aiRecommendable: true,
            },
        ],
    },
    {
        id: 'step4',
        title: 'Technical Approach',
        description: 'How will you build this product?',
        icon: '🔧',
        questions: [
            {
                id: 'techStack',
                label: 'Tech Stack & Architecture',
                placeholder: 'e.g., Next.js frontend, Node.js backend, PostgreSQL database...',
                hint: 'Describe your planned technology stack, or choose from our recommendations below.',
                type: 'textarea',
                required: false,
                aiRecommendable: true,
                options: [
                    "I don't know, please recommend the best tech stack based on my features to AI.",
                    "Frontend: Next.js (React), Backend: Node.js, Database: PostgreSQL, Auth: Better Auth",
                    "Frontend: React Native, Backend: Node.js, Database: Firebase (Mobile App Focus)",
                    "Frontend: Vue.js / Nuxt, Backend: Laravel (PHP), Database: MySQL",
                    "Frontend: React, Backend: Python (Django/FastAPI), Database: PostgreSQL (AI/Data Focus)",
                    "Cross-Platform: Flutter, Backend: Firebase / Supabase",
                ]
            },
        ],
    },
    {
        id: 'step5',
        title: 'Success Metrics',
        description: 'How will you measure success?',
        icon: '📊',
        questions: [
            {
                id: 'successMetrics',
                label: 'Success Metrics & KPIs',
                placeholder: 'e.g., 1000 active users in month 1, <2s page load time, 85% retention...',
                hint: 'Define specific, measurable goals. Avoid vague metrics.',
                type: 'textarea',
                required: false,
                aiRecommendable: true,
            },
        ],
    },
    {
        id: 'step6',
        title: 'Additional Context',
        description: 'Any other important information?',
        icon: '📝',
        questions: [
            {
                id: 'additionalContext',
                label: 'Additional Context',
                placeholder: 'Competitive landscape, budget constraints, timeline, regulatory requirements...',
                hint: 'Share anything else that should influence the PRD.',
                type: 'textarea',
                required: false,
                aiRecommendable: true,
            },
        ],
    },
];

// AI recommendation prompts per question
const RECOMMENDATION_PROMPTS: Record<string, { system: string; buildUserPrompt: (answers: WizardAnswers) => string }> = {
    targetAudience: {
        system: `You are a senior Product Manager. Based on the project information provided, suggest a detailed target audience description. Include demographics, behaviors, pain points, and motivations. Write in plain text, 3-5 sentences. Be specific, not generic. Write in the same language as the project info provided.`,
        buildUserPrompt: (a) =>
            `Project Name: ${a.projectName || 'N/A'}\nProblem Statement: ${a.problemStatement || 'N/A'}\n\nSuggest the ideal target audience for this product.`,
    },
    keyFeatures: {
        system: `You are a senior Product Manager. Based on the project info and target audience, suggest 5-8 core features for an MVP. List one feature per line with a brief description. Prioritize must-have features. Write in the same language as the project info provided.`,
        buildUserPrompt: (a) =>
            `Project Name: ${a.projectName || 'N/A'}\nProblem Statement: ${a.problemStatement || 'N/A'}\nTarget Audience: ${a.targetAudience || 'N/A'}\n\nSuggest the core MVP features for this product.`,
    },
    techStack: {
        system: `You are a senior Software Architect. Based on the project requirements and features, recommend the best tech stack. Format as: Frontend, Backend, Database, Auth, Hosting — with brief rationale for each choice. Write in the same language as the project info provided.`,
        buildUserPrompt: (a) =>
            `Project Name: ${a.projectName || 'N/A'}\nProblem Statement: ${a.problemStatement || 'N/A'}\nTarget Audience: ${a.targetAudience || 'N/A'}\nKey Features: ${a.keyFeatures || 'N/A'}\n\nRecommend the best tech stack for this product.`,
    },
    successMetrics: {
        system: `You are a senior Product Manager with growth expertise. Based on the project details, suggest 4-6 specific, measurable success metrics/KPIs. Include targets and timeframes. Format as one metric per line. Write in the same language as the project info provided.`,
        buildUserPrompt: (a) =>
            `Project Name: ${a.projectName || 'N/A'}\nProblem Statement: ${a.problemStatement || 'N/A'}\nTarget Audience: ${a.targetAudience || 'N/A'}\nKey Features: ${a.keyFeatures || 'N/A'}\nTech Stack: ${a.techStack || 'N/A'}\n\nSuggest realistic success metrics and KPIs.`,
    },
    additionalContext: {
        system: `You are a senior Product Manager. Based on all available project details, suggest important additional context that should be included in the PRD. Cover competitive landscape, potential risks, timeline suggestions, and any regulatory considerations. Write in plain text, 3-5 sentences. Write in the same language as the project info provided.`,
        buildUserPrompt: (a) =>
            `Project Name: ${a.projectName || 'N/A'}\nProblem Statement: ${a.problemStatement || 'N/A'}\nTarget Audience: ${a.targetAudience || 'N/A'}\nKey Features: ${a.keyFeatures || 'N/A'}\nTech Stack: ${a.techStack || 'N/A'}\nSuccess Metrics: ${a.successMetrics || 'N/A'}\n\nSuggest important additional context for the PRD.`,
    },
};

export function getRecommendationPrompt(questionId: string, answers: WizardAnswers) {
    const config = RECOMMENDATION_PROMPTS[questionId];
    if (!config) return null;
    return {
        systemPrompt: config.system,
        userPrompt: config.buildUserPrompt(answers),
    };
}
