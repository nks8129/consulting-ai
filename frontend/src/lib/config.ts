import { StartScreenPrompt } from "@openai/chatkit";

export const THEME_STORAGE_KEY = "consulting-ai-theme";

export const CHATKIT_API_URL =
  import.meta.env.VITE_CHATKIT_API_URL ?? "/chatkit";

// Domain key for ChatKit - use production key for deployed app
export const CHATKIT_API_DOMAIN_KEY =
  import.meta.env.VITE_CHATKIT_API_DOMAIN_KEY ?? "domain_pk_68fa9a38db988190b9958ff5db9f099e06aacb166019d0ae";

export const TASKS_API_URL =
  import.meta.env.VITE_TASKS_API_URL ?? "/tasks";

export const GREETING = "I'm your intelligent consulting partner. I understand your opportunity context and can help you capture insights, prepare deliverables, and manage your engagement.";

export const PLACEHOLDER_INPUT = "Ask me anything about this engagement, or use the actions below...";

export const STARTER_PROMPTS: StartScreenPrompt[] = [
  {
    label: "🔍 Capture Discovery Insights",
    prompt: "I'd like to capture discovery insights. Help me document pain points, processes, or stakeholder notes for this engagement.",
    icon: "sparkle",
  },
  {
    label: "📅 Prepare for Meeting",
    prompt: "I have an upcoming meeting. Help me prepare an agenda, talking points, and a structured brief.",
    icon: "book-open",
  },
  {
    label: "📋 Document Requirements",
    prompt: "I need to document requirements. Guide me through capturing functional or technical requirements systematically.",
    icon: "lightbulb",
  },
  {
    label: "⚠️ Analyze Risks",
    prompt: "Help me identify and analyze risks, dependencies, and blockers for this engagement.",
    icon: "compass",
  },
  {
    label: "🎨 Design Solution",
    prompt: "I'm ready to design the solution. Help me with future-state architecture and recommendations.",
    icon: "sparkle",
  },
  {
    label: "📄 Create Deliverable",
    prompt: "I need to create a deliverable. Help me generate a BRD, technical spec, or implementation plan based on what we've captured.",
    icon: "book-open",
  },
  {
    label: "📊 Summarize Progress",
    prompt: "Generate a comprehensive progress summary with current status, insights, risks, and next steps.",
    icon: "lightbulb",
  },
];
