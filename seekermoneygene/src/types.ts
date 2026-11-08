export type AgentRole = "ceo" | "growth" | "automation" | "monetization" | "ethics";
export type Priority = "low" | "medium" | "high" | "critical";

export interface MemoryRecord {
  id: string;
  kind: string;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface AgentAction {
  id: string;
  role: AgentRole;
  intent: string;
  priority: Priority;
  requiresApproval: boolean;
  ethicsPassed: boolean;
  result?: string;
  createdAt: string;
}

export interface OmegaTickResult {
  tick: number;
  timestamp: string;
  actions: AgentAction[];
  memoryWrites: number;
  blockedByEthics: number;
  summary: string;
}

export interface EthicsVerdict {
  ok: boolean;
  reasons: string[];
}

export interface OfferDraft {
  name: string;
  priceUsd: number;
  marginTarget: number;
  recurring: boolean;
  valueProposition: string;
  claims: string[];
}
