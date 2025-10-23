import { useCallback, useEffect, useState } from "react";

export interface PhaseProgress {
  phase: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  keyActivities: string[];
  artifactsCount: number;
  completionPercentage: number;
}

export interface Opportunity {
  id: string;
  name: string;
  clientName: string;
  description: string;
  currentPhase: string;
  status: string;
  createdAt: string;
  phaseProgress: Record<string, PhaseProgress>;
  artifactsCount: number;
  stakeholders: string[];
  contextSummary: string;
  keyInsights: string[];
}

export interface Artifact {
  id: string;
  title: string;
  content: string;
  artifactType: string;
  phase: string;
  createdBy: string | null;
  createdAt: string;
  tags: string[];
}

export interface OpportunityData {
  opportunity: Opportunity | null;
  phaseArtifacts: Artifact[];
  allArtifacts: Artifact[];
}

export function useOpportunity() {
  const [data, setData] = useState<OpportunityData>({
    opportunity: null,
    phaseArtifacts: [],
    allArtifacts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/opportunities/active");
      if (!response.ok) {
        throw new Error("Failed to fetch opportunity");
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching opportunity:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...data, loading, error, refresh };
}

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/opportunities");
      if (!response.ok) {
        throw new Error("Failed to fetch opportunities");
      }
      
      const result = await response.json();
      setOpportunities(result.opportunities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching opportunities:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { opportunities, loading, error, refresh };
}
