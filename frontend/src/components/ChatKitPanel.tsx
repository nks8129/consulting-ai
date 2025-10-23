import { ChatKit, useChatKit } from "@openai/chatkit-react";
import type { ColorScheme } from "../hooks/useColorScheme";
import {
  CHATKIT_API_DOMAIN_KEY,
  CHATKIT_API_URL,
  GREETING,
  STARTER_PROMPTS,
  PLACEHOLDER_INPUT,
} from "../lib/config";

type ChatKitPanelProps = {
  theme: ColorScheme;
  onThemeRequest: (scheme: ColorScheme) => void;
  onResponseEnd: () => void;
};

export function ChatKitPanel({
  theme,
  onThemeRequest,
  onResponseEnd,
}: ChatKitPanelProps) {

  const chatkit = useChatKit({
    api: {
      url: CHATKIT_API_URL,
      ...(CHATKIT_API_DOMAIN_KEY && { domainKey: CHATKIT_API_DOMAIN_KEY }),
    },
    theme: {
      colorScheme: theme,
      color: {
        grayscale: {
          hue: 220,
          tint: 6,
          shade: theme === "dark" ? -1 : -4,
        },
        accent: {
          primary: theme === "dark" ? "#f8fafc" : "#0f172a",
          level: 1,
        },
      },
      radius: "round",
    },
    startScreen: {
      greeting: GREETING,
      prompts: STARTER_PROMPTS,
    },
    composer: {
      placeholder: PLACEHOLDER_INPUT,
    },
    threadItemActions: {
      feedback: false,
    },
    onClientTool: async (invocation) => {
      if (invocation.name === "switch_theme") {
        const requested = invocation.params.theme;
        if (requested === "light" || requested === "dark") {
          onThemeRequest(requested);
          return { success: true };
        }
        return { success: false };
      }
      if (invocation.name === "task_created" || invocation.name === "task_updated") {
        // Trigger refresh of task list
        onResponseEnd();
        return { success: true };
      }
      return { success: false };
    },
    onResponseEnd: () => {
      onResponseEnd();
    },
    onError: ({ error }) => {
      console.error("ChatKit error", error);
    },
  });

  return (
    <div className="relative h-full w-full overflow-hidden bg-white dark:bg-slate-900">
      <style>{`
        /* Hide ChatKit's built-in header since we have our own */
        [data-chatkit-header] {
          display: none !important;
        }
        
        /* Make chat messages more spacious and readable */
        [data-chatkit-thread] {
          max-width: 100% !important;
          padding: 2rem 1rem !important;
        }
        
        /* Wider message containers */
        [data-chatkit-message] {
          max-width: 900px !important;
          margin-left: auto !important;
          margin-right: auto !important;
          padding: 1.5rem !important;
          font-size: 15px !important;
          line-height: 1.7 !important;
        }
        
        /* Better spacing between messages */
        [data-chatkit-message] + [data-chatkit-message] {
          margin-top: 1.5rem !important;
        }
        
        /* Larger input area */
        [data-chatkit-input] {
          max-width: 900px !important;
          margin-left: auto !important;
          margin-right: auto !important;
          padding: 1rem !important;
          font-size: 15px !important;
        }
        
        /* Better code blocks */
        [data-chatkit-message] pre {
          padding: 1rem !important;
          border-radius: 8px !important;
          font-size: 14px !important;
          overflow-x: auto !important;
        }
        
        /* Better lists */
        [data-chatkit-message] ul,
        [data-chatkit-message] ol {
          padding-left: 1.5rem !important;
          margin: 1rem 0 !important;
        }
        
        [data-chatkit-message] li {
          margin: 0.5rem 0 !important;
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          [data-chatkit-message],
          [data-chatkit-input] {
            max-width: 100% !important;
            padding: 1rem !important;
          }
          
          [data-chatkit-thread] {
            padding: 1rem 0.5rem !important;
          }
        }
      `}</style>
      <ChatKit control={chatkit.control} className="block h-full w-full" />
    </div>
  );
}
