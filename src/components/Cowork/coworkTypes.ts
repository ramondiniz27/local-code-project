/**
 * Shared type definitions for the Cowork feature area.
 * These were previously co-located in mockCoworkData.ts but are real data types,
 * not mock data. Separated to allow the mock file to be deleted.
 */

export interface CoworkAgent {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  avatarInitials: string;
  status: "active" | "idle" | "verifying" | "paused";
  model: string;
  currentTask: string;
  tasksCompleted: number;
  cpuUsage: string;
}

export interface CoworkSession {
  id: string;
  title: string;
  description: string;
  status: "in_progress" | "completed" | "queued";
  progress: number;
  agents: string[];
  startedAt: string;
  logsCount: number;
  recentLogs: string[];
}

export interface ActivityLogItem {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  detail: string;
  timestamp: string;
  type: "success" | "info" | "warning" | "error";
}
