import { Opportunity, PhaseProgress, Artifact } from "../hooks/useOpportunity";

interface OpportunityPanelProps {
  opportunity: Opportunity | null;
  phaseArtifacts: Artifact[];
  loading: boolean;
  error: string | null;
}

const PHASE_LABELS: Record<string, string> = {
  pre_assessment: "Pre-Assessment",
  discovery: "Discovery",
  solution_design: "Solution Design",
  implementation: "Implementation",
};

const PHASE_ORDER = ["pre_assessment", "discovery", "solution_design", "implementation"];

export function OpportunityPanel({
  opportunity,
  phaseArtifacts,
  loading,
  error,
}: OpportunityPanelProps) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Loading opportunity...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-red-600 dark:text-red-400">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-4xl">🎯</div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            No Active Opportunity
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Create a new consulting opportunity to get started.
            <br />
            Try: "Create an opportunity for Acme Corp due-diligence"
          </p>
        </div>
      </div>
    );
  }

  const currentPhaseProgress = opportunity.phaseProgress[opportunity.currentPhase];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Opportunity Header */}
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {opportunity.name}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {opportunity.clientName}
              </p>
            </div>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {opportunity.status}
            </span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {opportunity.description}
          </p>
        </div>
      </div>

      {/* Phase Progress */}
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Project Phases
        </h3>
        <div className="space-y-2">
          {PHASE_ORDER.map((phase) => {
            const progress = opportunity.phaseProgress[phase];
            const isCurrent = phase === opportunity.currentPhase;
            const isCompleted = progress?.status === "completed";
            
            return (
              <div
                key={phase}
                className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                  isCurrent
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : isCompleted
                    ? "bg-green-50 dark:bg-green-900/20"
                    : "bg-slate-50 dark:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isCurrent
                        ? "bg-blue-500"
                        : isCompleted
                        ? "bg-green-500"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isCurrent
                        ? "text-blue-700 dark:text-blue-400"
                        : isCompleted
                        ? "text-green-700 dark:text-green-400"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {PHASE_LABELS[phase]}
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {progress?.artifactsCount || 0} artifacts
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Phase Artifacts */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {PHASE_LABELS[opportunity.currentPhase]} Artifacts ({phaseArtifacts.length})
          </h3>
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md';
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files) {
                  console.log('Files selected:', Array.from(files).map(f => f.name));
                  // TODO: Implement file upload
                  alert(`File upload coming soon! Selected: ${Array.from(files).map(f => f.name).join(', ')}`);
                }
              };
              input.click();
            }}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
          >
            📎 Upload Files
          </button>
        </div>
        
        {phaseArtifacts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No artifacts yet for this phase.
              <br />
              Start documenting insights, meeting notes, or pain points.
              <br />
              Or upload files using the button above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {phaseArtifacts.map((artifact) => (
              <div
                key={artifact.id}
                className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    {artifact.title}
                  </h4>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {artifact.artifactType.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {artifact.content.length > 150
                    ? `${artifact.content.substring(0, 150)}...`
                    : artifact.content}
                </p>
                {artifact.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {artifact.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Key Insights Footer */}
      {opportunity.keyInsights.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
          <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Key Insights
          </h3>
          <ul className="space-y-1">
            {opportunity.keyInsights.slice(0, 3).map((insight, idx) => (
              <li key={idx} className="text-sm text-slate-700 dark:text-slate-300">
                • {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
