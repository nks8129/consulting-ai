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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Initial load: show splash screen, then route based on active opportunity
  useEffect(() => {
    if (!loading && !oppsLoading) {
      // Small delay for smooth experience
      setTimeout(() => {
        setIsInitialLoad(false);
        if (opportunity) {
          // Active opportunity exists - go to chat
          setShowOpportunitySelector(false);
        } else {
          // No active opportunity - show selector
          setShowOpportunitySelector(true);
        }
      }, 800); // 800ms splash screen
    }
  }, [opportunity, loading, oppsLoading]);

  const handleSelectOpportunity = async (oppId: string) => {
    try {
      setIsTransitioning(true);
      setIsCreating(false); // Reset creating state
      const response = await fetch(`/opportunities/${oppId}/activate`, {
        method: "POST",
      });
      if (response.ok) {
        await refresh();
        await refreshOpps();
        // Force ChatKit to remount with new opportunity context
        setChatKey(prev => prev + 1);
        // Small delay for smooth transition
        await new Promise(resolve => setTimeout(resolve, 300));
        setShowOpportunitySelector(false);
      }
    } catch (err) {
      console.error("Error setting active opportunity:", err);
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleCreateOpportunity = async (data: OpportunityFormData) => {
    try {
      // Close modal immediately and show overlay
      setIsCreateModalOpen(false);
      setIsCreating(true);
      
      // Step 1: Create the opportunity (shows "Creating opportunity..." overlay)
      const response = await fetch("/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Step 2: Switch to "Loading opportunity..."
        setIsCreating(false);
        setIsTransitioning(true);
        
        // Step 3: Activate the opportunity
        const activateResponse = await fetch(`/opportunities/${result.opportunity.id}/activate`, {
          method: "POST",
        });
        
        if (activateResponse.ok) {
          await refresh();
          await refreshOpps();
          setChatKey(prev => prev + 1);
          await new Promise(resolve => setTimeout(resolve, 300));
          setShowOpportunitySelector(false);
        }
        setIsTransitioning(false);
      }
    } catch (err) {
      console.error("Error creating opportunity:", err);
      setToast({ message: "Failed to create opportunity", type: "error" });
      setIsCreating(false);
      setIsTransitioning(false);
    }
  };

  const handleChangeOpportunity = () => {
    setIsCreating(false); // Reset creating state
    setIsTransitioning(false); // Reset transitioning state
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

  // Show splash screen on initial load
  if (isInitialLoad) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          {/* Logo/Icon */}
          <div className="relative">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/50 dark:shadow-blue-400/30">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 opacity-20 blur-xl animate-pulse"></div>
          </div>
          
          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Consulting AI Assistant
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Preparing your workspace...
            </p>
          </div>
          
          {/* Loading Spinner */}
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show opportunity selector screen
  if (showOpportunitySelector) {
    return (
      <>
        <OpportunitySelector
          opportunities={opportunities}
          onSelect={handleSelectOpportunity}
          onCreateNew={() => setIsCreateModalOpen(true)}
          onDelete={handleDeleteOpportunity}
          isLoading={oppsLoading}
        />
        
        {/* Blurred overlay when transitioning - modern SaaS style */}
        {(isTransitioning || isCreating) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl dark:bg-slate-800">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-slate-600 dark:border-t-blue-400"></div>
              <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                {isCreating ? "Creating opportunity..." : "Loading opportunity..."}
              </p>
            </div>
          </div>
        )}
        
        <CreateOpportunityModal
          isOpen={isCreateModalOpen}
          onClose={() => !isCreating && setIsCreateModalOpen(false)}
          onSubmit={handleCreateOpportunity}
          isSubmitting={isCreating}
        />
        
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </>
    );
  }

  // Show main chat interface with selected opportunity
  if (!opportunity) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400"></div>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">Loading opportunity...</p>
        </div>
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
