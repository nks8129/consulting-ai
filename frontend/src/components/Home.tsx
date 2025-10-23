import { useState, useEffect } from "react";
import { OpportunitySelector } from "./OpportunitySelector";
import { OpportunityDrawer } from "./OpportunityDrawer";
import { ChatKitPanel } from "./ChatKitPanel";
import { CreateOpportunityModal, OpportunityFormData } from "./CreateOpportunityModal";
import { ThemeToggle } from "./ThemeToggle";
import { Toast } from "./Toast";
import { useOpportunity, useOpportunities } from "../hooks/useOpportunity";
import type { ColorScheme } from "../hooks/useColorScheme";

type HomeProps = {
  scheme: ColorScheme;
  onThemeChange: (scheme: ColorScheme) => void;
};

export default function Home({ scheme, onThemeChange }: HomeProps) {
  const { opportunity, phaseArtifacts, allArtifacts, loading, error, refresh } = useOpportunity();
  const { opportunities, loading: oppsLoading, refresh: refreshOpps } = useOpportunities();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showOpportunitySelector, setShowOpportunitySelector] = useState(true);
  const [chatKey, setChatKey] = useState(0); // Force ChatKit to remount on opportunity change
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Show selector if no opportunity is active
  useEffect(() => {
    if (!loading && !opportunity) {
      setShowOpportunitySelector(true);
    } else if (opportunity) {
      setShowOpportunitySelector(false);
    }
  }, [opportunity, loading]);

  const handleSelectOpportunity = async (oppId: string) => {
    try {
      const response = await fetch(`/opportunities/${oppId}/activate`, {
        method: "POST",
      });
      if (response.ok) {
        await refresh();
        await refreshOpps();
        // Force ChatKit to remount with new opportunity context
        setChatKey(prev => prev + 1);
        setShowOpportunitySelector(false);
      }
    } catch (err) {
      console.error("Error setting active opportunity:", err);
    }
  };

  const handleCreateOpportunity = async (data: OpportunityFormData) => {
    try {
      const response = await fetch("/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const result = await response.json();
        await handleSelectOpportunity(result.opportunity.id);
        setIsCreateModalOpen(false);
      }
    } catch (err) {
      console.error("Error creating opportunity:", err);
    }
  };

  const handleChangeOpportunity = () => {
    setShowOpportunitySelector(true);
  };

  const handleDeleteOpportunity = async (oppId: string) => {
    try {
      const response = await fetch(`/opportunities/${oppId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await refreshOpps();
        await refresh();
        setToast({ message: "Opportunity deleted successfully", type: "success" });
      } else {
        setToast({ message: "Failed to delete opportunity", type: "error" });
      }
    } catch (err) {
      console.error("Error deleting opportunity:", err);
      setToast({ message: "Failed to delete opportunity", type: "error" });
    }
  };

  const handlePhaseChange = async (phase: string) => {
    if (!opportunity) return;
    
    try {
      const response = await fetch(`/opportunities/${opportunity.id}/phase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase }),
      });

      if (response.ok) {
        console.log("Phase changed to:", phase);
        setToast({ message: `Moved to ${phase.replace("_", " ")} phase`, type: "success" });
        setIsDrawerOpen(false);
        await refresh();
        await refreshOpps();
      } else {
        setToast({ message: "Failed to change phase", type: "error" });
      }
    } catch (err) {
      console.error("Error changing phase:", err);
      setToast({ message: "Error changing phase", type: "error" });
    }
  };

  const handleArtifactAdd = async (artifact: any, phase: string) => {
    if (!opportunity) return;
    
    try {
      const response = await fetch(`/opportunities/${opportunity.id}/artifacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: artifact.type,
          title: artifact.title,
          content: artifact.content,
          phase: phase,
          tags: artifact.tags,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Artifact added:", data);
        
        // Show success message
        setToast({ message: `Artifact "${artifact.title}" added successfully`, type: "success" });
        
        // Refresh to show new artifact
        await refresh();
        await refreshOpps();
      } else {
        setToast({ message: "Failed to add artifact", type: "error" });
      }
    } catch (err) {
      console.error("Error adding artifact:", err);
      setToast({ message: "Error adding artifact", type: "error" });
    }
  };

  // Show opportunity selector screen
  if (showOpportunitySelector) {
    return (
      <>
        <OpportunitySelector
          opportunities={opportunities}
          onSelect={handleSelectOpportunity}
          onCreateNew={() => setIsCreateModalOpen(true)}
          onDelete={handleDeleteOpportunity}
        />
        <CreateOpportunityModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateOpportunity}
        />
      </>
    );
  }

  // Show main chat interface with selected opportunity
  if (!opportunity) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-500">Loading opportunity...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-slate-950">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            title="View opportunity details"
          >
            <span className="text-xl">📋</span>
            <div className="text-left">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {opportunity.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {opportunity.clientName}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
              {opportunity.currentPhase.replace("_", " ")}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              📎 {opportunity.artifactsCount}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleChangeOpportunity}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Switch Opportunity
          </button>
          <ThemeToggle value={scheme} onChange={onThemeChange} />
        </div>
      </div>

      {/* Main Chat Area - Full Screen */}
      <div className="flex-1 overflow-hidden">
        <ChatKitPanel
          key={chatKey}
          theme={scheme}
          onThemeRequest={onThemeChange}
          onResponseEnd={refresh}
        />
      </div>

      {/* Opportunity Drawer */}
      <OpportunityDrawer
        opportunity={opportunity}
        artifacts={allArtifacts}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onPhaseChange={handlePhaseChange}
        onArtifactAdd={handleArtifactAdd}
      />

      {/* Create Opportunity Modal */}
      <CreateOpportunityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateOpportunity}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
