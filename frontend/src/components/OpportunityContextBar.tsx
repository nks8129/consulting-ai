import { Opportunity } from "../hooks/useOpportunity";

interface OpportunityContextBarProps {
  opportunity: Opportunity;
  onChangeOpportunity: () => void;
}

const PHASE_LABELS: Record<string, string> = {
  pre_assessment: "Pre-Assessment",
  discovery: "Discovery",
  solution_design: "Solution Design",
  implementation: "Implementation",
};

const PHASE_EMOJIS: Record<string, string> = {
  pre_assessment: "🎯",
  discovery: "🔍",
  solution_design: "🎨",
  implementation: "🚀",
};

export function OpportunityContextBar({
  opportunity,
  onChangeOpportunity,
}: OpportunityContextBarProps) {
  return (
    <div className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: Opportunity Info */}
        <div className="flex items-center gap-4">
          <button
            onClick={onChangeOpportunity}
            className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Change opportunity"
          >
            <span className="text-2xl">📋</span>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                  {opportunity.name}
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  • {opportunity.clientName}
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Right: Phase & Artifacts */}
        <div className="flex items-center gap-6">
          {/* Current Phase */}
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 dark:bg-blue-900/20">
            <span className="text-lg">
              {PHASE_EMOJIS[opportunity.currentPhase]}
            </span>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
              {PHASE_LABELS[opportunity.currentPhase]}
            </span>
          </div>

          {/* Artifacts Count */}
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span>📎</span>
            <span>{opportunity.artifactsCount} artifacts</span>
          </div>

          {/* Stakeholders Count */}
          {opportunity.stakeholders.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span>👥</span>
              <span>{opportunity.stakeholders.length} stakeholders</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
