import { Opportunity } from "../hooks/useOpportunity";

interface OpportunitySelectorProps {
  opportunities: Opportunity[];
  onSelect: (id: string) => void;
  onCreateNew: () => void;
}

export function OpportunitySelector({
  opportunities,
  onSelect,
  onCreateNew,
}: OpportunitySelectorProps) {
  const activeOpportunities = opportunities.filter((opp) => opp.status === "active");
  const pastOpportunities = opportunities.filter((opp) => opp.status !== "active");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 p-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-slate-900 dark:text-slate-100">
            Consulting AI Assistant
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Select an opportunity to continue, or create a new one
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Create New Card */}
          <button
            onClick={onCreateNew}
            className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 transition-all hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500 dark:hover:bg-slate-800"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl transition-colors group-hover:bg-blue-200 dark:bg-blue-900/30 dark:group-hover:bg-blue-900/50">
              ➕
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Create New Opportunity
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Start a new consulting engagement
            </p>
          </button>

          {/* Active Opportunities */}
          {activeOpportunities.map((opp) => (
            <button
              key={opp.id}
              onClick={() => onSelect(opp.id)}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all hover:border-blue-500 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {opp.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {opp.clientName}
                  </p>
                </div>
                <span className="ml-2 shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Active
                </span>
              </div>
              <p className="mb-4 line-clamp-2 text-sm text-slate-700 dark:text-slate-300">
                {opp.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                <span>📊 {opp.currentPhase.replace("_", " ")}</span>
                <span>📎 {opp.artifactsCount} artifacts</span>
              </div>
            </button>
          ))}

          {/* Past Opportunities */}
          {pastOpportunities.length > 0 && (
            <>
              <div className="col-span-2 mt-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Past Opportunities
                </h2>
              </div>
              {pastOpportunities.map((opp) => (
                <button
                  key={opp.id}
                  onClick={() => onSelect(opp.id)}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-6 text-left opacity-75 transition-all hover:border-slate-400 hover:opacity-100 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-600"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {opp.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {opp.clientName}
                      </p>
                    </div>
                    <span className="ml-2 shrink-0 rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                      {opp.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                    <span>📊 {opp.currentPhase.replace("_", " ")}</span>
                    <span>📎 {opp.artifactsCount} artifacts</span>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>

        {opportunities.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              No opportunities yet. Create your first one to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
