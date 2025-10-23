interface SmartAction {
  id: string;
  icon: string;
  title: string;
  description: string;
  prompt: string;
  color: string;
}

const SMART_ACTIONS: SmartAction[] = [
  {
    id: "capture_discovery",
    icon: "🔍",
    title: "Capture Discovery Insights",
    description: "Document pain points, processes, and current-state findings",
    prompt: "I'd like to capture discovery insights. What type of insight would you like to document?\n\n1. Pain Point - A problem or bottleneck\n2. Process Map - Current or future state process\n3. Stakeholder Note - Key stakeholder information\n4. Technical Finding - System or technical discovery\n\nPlease specify the type and provide details.",
    color: "purple",
  },
  {
    id: "prepare_meeting",
    icon: "📅",
    title: "Prepare for Meeting",
    description: "Generate meeting agenda, talking points, and preparation brief",
    prompt: "I'll help you prepare for an upcoming meeting. Please provide:\n\n1. Meeting purpose (e.g., kickoff, discovery session, design review)\n2. Attendees and their roles\n3. Key topics to discuss\n4. Any specific objectives or outcomes needed\n\nI'll create a structured meeting brief with agenda and talking points.",
    color: "blue",
  },
  {
    id: "document_requirements",
    icon: "📋",
    title: "Document Requirements",
    description: "Capture business or technical requirements systematically",
    prompt: "Let's document requirements for this engagement. I'll guide you through:\n\n1. Requirement type (functional, non-functional, business, technical)\n2. Priority level (must-have, should-have, nice-to-have)\n3. Description and acceptance criteria\n4. Dependencies or constraints\n\nWhat requirement would you like to start with?",
    color: "green",
  },
  {
    id: "analyze_risks",
    icon: "⚠️",
    title: "Analyze Risks & Blockers",
    description: "Identify and track project risks, dependencies, and blockers",
    prompt: "I'll help you analyze and document risks. Please share:\n\n1. Risk description - What could go wrong?\n2. Impact level (high, medium, low)\n3. Likelihood (high, medium, low)\n4. Mitigation strategy - How can we address it?\n\nLet's identify the key risks for this engagement.",
    color: "red",
  },
  {
    id: "design_solution",
    icon: "🎨",
    title: "Design Solution",
    description: "Create future-state architecture and solution design",
    prompt: "Let's design the solution together. I'll help you with:\n\n1. Future-state process design\n2. System architecture recommendations\n3. Integration points and data flows\n4. Technology stack suggestions\n\nWhat aspect of the solution would you like to design first?",
    color: "indigo",
  },
  {
    id: "create_deliverable",
    icon: "📄",
    title: "Create Deliverable",
    description: "Generate BRDs, technical specs, or implementation plans",
    prompt: "I'll help you create a deliverable. What type do you need?\n\n1. Business Requirements Document (BRD)\n2. Technical Specification\n3. Implementation Plan\n4. User Guide / Documentation\n5. Executive Summary\n6. ROI Analysis\n\nSelect the type and I'll guide you through creating it based on all captured artifacts.",
    color: "orange",
  },
  {
    id: "summarize_progress",
    icon: "📊",
    title: "Summarize Progress",
    description: "Generate status report with insights and next steps",
    prompt: "I'll create a comprehensive progress summary including:\n\n1. Current phase status and completion\n2. Key artifacts and insights captured\n3. Risks and blockers identified\n4. Recommended next steps\n5. Stakeholder updates\n\nGenerating summary now based on all available data...",
    color: "teal",
  },
];

interface SmartActionsProps {
  onActionClick: (prompt: string) => void;
  currentPhase: string;
}

const PHASE_LABELS: Record<string, string> = {
  pre_assessment: "Pre-Assessment",
  discovery: "Discovery",
  solution_design: "Solution Design",
  implementation: "Implementation",
};

export function SmartActions({ onActionClick, currentPhase }: SmartActionsProps) {
  // Filter actions based on phase relevance
  const getRelevantActions = () => {
    switch (currentPhase) {
      case "pre_assessment":
        return SMART_ACTIONS.filter((a) =>
          ["prepare_meeting", "capture_discovery", "analyze_risks"].includes(a.id)
        );
      case "discovery":
        return SMART_ACTIONS.filter((a) =>
          ["capture_discovery", "document_requirements", "analyze_risks", "prepare_meeting"].includes(a.id)
        );
      case "solution_design":
        return SMART_ACTIONS.filter((a) =>
          ["design_solution", "document_requirements", "analyze_risks", "create_deliverable"].includes(a.id)
        );
      case "implementation":
        return SMART_ACTIONS.filter((a) =>
          ["create_deliverable", "summarize_progress", "analyze_risks"].includes(a.id)
        );
      default:
        return SMART_ACTIONS;
    }
  };

  const relevantActions = getRelevantActions();
  const otherActions = SMART_ACTIONS.filter((a) => !relevantActions.includes(a));

  return (
    <div className="border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Smart Actions for {PHASE_LABELS[currentPhase]}
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Click to start guided workflow
        </span>
      </div>

      {/* Relevant Actions for Current Phase */}
      <div className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {relevantActions.map((action) => (
          <ActionButton key={action.id} action={action} onClick={onActionClick} />
        ))}
      </div>

      {/* Other Actions (Collapsed) */}
      {otherActions.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
            + {otherActions.length} more actions
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {otherActions.map((action) => (
              <ActionButton key={action.id} action={action} onClick={onActionClick} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function ActionButton({
  action,
  onClick,
}: {
  action: SmartAction;
  onClick: (prompt: string) => void;
}) {
  const colorClasses: Record<string, string> = {
    purple: "bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-400",
    blue: "bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400",
    green: "bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-400",
    red: "bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400",
    indigo: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 dark:text-indigo-400",
    orange: "bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-400",
    teal: "bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:hover:bg-teal-900/30 dark:text-teal-400",
  };

  return (
    <button
      onClick={() => onClick(action.prompt)}
      className={`group relative rounded-lg p-3 text-left transition-all ${
        colorClasses[action.color]
      }`}
      title={action.description}
    >
      <div className="mb-1 text-2xl">{action.icon}</div>
      <div className="text-xs font-semibold">{action.title}</div>
      <div className="mt-1 text-[10px] opacity-75 line-clamp-2">
        {action.description}
      </div>
    </button>
  );
}
