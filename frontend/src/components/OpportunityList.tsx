import { useState } from "react";
import { Opportunity } from "../hooks/useOpportunity";

interface OpportunityListProps {
  opportunities: Opportunity[];
  activeOpportunityId: string | null;
  onSelectOpportunity: (id: string) => void;
  onCreateNew: () => void;
  loading: boolean;
}

const PHASE_LABELS: Record<string, string> = {
  pre_assessment: "Pre-Assessment",
  discovery: "Discovery",
  solution_design: "Solution Design",
  implementation: "Implementation",
};

export function OpportunityList({
  opportunities,
  activeOpportunityId,
  onSelectOpportunity,
  onCreateNew,
  loading,
}: OpportunityListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOpportunities = opportunities.filter((opp) =>
    opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeOpportunities = filteredOpportunities.filter(
    (opp) => opp.status === "active"
  );
  const pastOpportunities = filteredOpportunities.filter(
    (opp) => opp.status !== "active"
  );

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Opportunities
          </h2>
          <button
            onClick={onCreateNew}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            + New
          </button>
        </div>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search opportunities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
        />
      </div>

      {/* Opportunity Lists */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Loading opportunities...
            </div>
          </div>
        ) : (
          <>
            {/* Active Opportunities */}
            {activeOpportunities.length > 0 && (
              <div className="border-b border-slate-200 dark:border-slate-800">
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Active ({activeOpportunities.length})
                  </h3>
                </div>
                <div className="space-y-1 px-2 pb-3">
                  {activeOpportunities.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      isActive={opp.id === activeOpportunityId}
                      onClick={() => onSelectOpportunity(opp.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Opportunities */}
            {pastOpportunities.length > 0 && (
              <div>
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Past ({pastOpportunities.length})
                  </h3>
                </div>
                <div className="space-y-1 px-2 pb-3">
                  {pastOpportunities.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      isActive={opp.id === activeOpportunityId}
                      onClick={() => onSelectOpportunity(opp.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredOpportunities.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-3 text-4xl">📋</div>
                <p className="mb-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  No opportunities found
                </p>
                <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
                  {searchQuery
                    ? "Try a different search term"
                    : "Create your first opportunity to get started"}
                </p>
                {!searchQuery && (
                  <button
                    onClick={onCreateNew}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Create Opportunity
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  isActive: boolean;
  onClick: () => void;
}

function OpportunityCard({ opportunity, isActive, onClick }: OpportunityCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg p-3 text-left transition-colors ${
        isActive
          ? "bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/30 dark:ring-blue-400"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
      }`}
    >
      <div className="mb-1 flex items-start justify-between">
        <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm line-clamp-1">
          {opportunity.name}
        </h4>
        <span
          className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            opportunity.status === "active"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : opportunity.status === "completed"
              ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
          }`}
        >
          {opportunity.status}
        </span>
      </div>
      
      <p className="mb-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
        {opportunity.clientName}
      </p>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-500">
          {PHASE_LABELS[opportunity.currentPhase]}
        </span>
        <span className="text-slate-400 dark:text-slate-600">
          {opportunity.artifactsCount} artifacts
        </span>
      </div>
    </button>
  );
}
