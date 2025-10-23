import { useState } from "react";
import { Opportunity, Artifact } from "../hooks/useOpportunity";
import { AddArtifactModal, ArtifactFormData } from "./AddArtifactModal";

interface OpportunityDrawerProps {
  opportunity: Opportunity;
  artifacts: Artifact[];
  isOpen: boolean;
  onClose: () => void;
  onPhaseChange: (phase: string) => void;
  onArtifactAdd: (artifact: ArtifactFormData, phase: string) => void;
}

const PHASES = [
  { id: "pre_assessment", label: "Pre-Assessment", emoji: "🎯", color: "blue" },
  { id: "discovery", label: "Discovery", emoji: "🔍", color: "purple" },
  { id: "solution_design", label: "Solution Design", emoji: "🎨", color: "green" },
  { id: "implementation", label: "Implementation", emoji: "🚀", color: "orange" },
];

export function OpportunityDrawer({
  opportunity,
  artifacts,
  isOpen,
  onClose,
  onPhaseChange,
  onArtifactAdd,
}: OpportunityDrawerProps) {
  const [selectedPhase, setSelectedPhase] = useState(opportunity.currentPhase);
  const [isAddArtifactModalOpen, setIsAddArtifactModalOpen] = useState(false);

  const handlePhaseClick = (phaseId: string) => {
    setSelectedPhase(phaseId);
  };

  const handleMoveToPhase = () => {
    if (selectedPhase !== opportunity.currentPhase) {
      onPhaseChange(selectedPhase);
    }
  };

  const handleAddArtifact = (artifact: ArtifactFormData) => {
    onArtifactAdd(artifact, selectedPhase);
    setIsAddArtifactModalOpen(false);
  };

  const currentPhaseIndex = PHASES.findIndex((p) => p.id === opportunity.currentPhase);
  const phaseProgress = opportunity.phaseProgress || {};

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform overflow-y-auto bg-white shadow-2xl transition-transform duration-300 dark:bg-slate-900 sm:max-w-lg ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="border-b border-slate-200 p-6 dark:border-slate-800">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {opportunity.name}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {opportunity.clientName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {opportunity.description}
          </p>

          {opportunity.stakeholders.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Stakeholders
              </h3>
              <div className="flex flex-wrap gap-2">
                {opportunity.stakeholders.map((stakeholder, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    👤 {stakeholder}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Phase Navigation */}
        <div className="border-b border-slate-200 p-6 dark:border-slate-800">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Project Phases
          </h3>

          <div className="space-y-3">
            {PHASES.map((phase, index) => {
              const progress = phaseProgress[phase.id];
              const isActive = phase.id === opportunity.currentPhase;
              const isSelected = phase.id === selectedPhase;
              const isCompleted = progress?.status === "completed";
              const isPast = index < currentPhaseIndex;

              return (
                <div key={phase.id}>
                  <button
                    onClick={() => handlePhaseClick(phase.id)}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : isActive
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{phase.emoji}</span>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                            {phase.label}
                          </h4>
                          {isActive && (
                            <span className="text-xs font-medium text-green-600 dark:text-green-400">
                              Current Phase
                            </span>
                          )}
                        </div>
                      </div>
                      {isCompleted && (
                        <span className="text-green-600 dark:text-green-400">✓</span>
                      )}
                    </div>

                    {progress && (
                      <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                        <span>📎 {progress.artifactsCount || 0} artifacts</span>
                        {progress.completionPercentage !== undefined && (
                          <span>{progress.completionPercentage}% complete</span>
                        )}
                      </div>
                    )}
                  </button>

                  {/* File Upload for Selected Phase */}
                  {isSelected && (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => setIsAddArtifactModalOpen(true)}
                        className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                      >
                        ➕ Add Artifact
                      </button>
                      {!isActive && (
                        <button
                          onClick={handleMoveToPhase}
                          className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                          Move to This Phase
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Artifacts for Selected Phase */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {PHASES.find((p) => p.id === selectedPhase)?.label} Artifacts
          </h3>

          {artifacts.filter((a) => a.phase === selectedPhase).length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No artifacts yet for this phase
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {artifacts
                .filter((a) => a.phase === selectedPhase)
                .map((artifact) => (
                  <div
                    key={artifact.id}
                    className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {artifact.title}
                      </h4>
                      <span className="ml-2 shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {artifact.artifactType}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {artifact.content}
                    </p>
                    {artifact.tags && artifact.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {artifact.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-400"
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
      </div>
      {/* Add Artifact Modal */}
      <AddArtifactModal
        isOpen={isAddArtifactModalOpen}
        onClose={() => setIsAddArtifactModalOpen(false)}
        onSubmit={handleAddArtifact}
        phase={PHASES.find(p => p.id === selectedPhase)?.label || selectedPhase}
      />
    </>
  );
}
