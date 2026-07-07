//FinSight-A/frontend/src/types/profile.ts

export interface Profile {
  id: number;
  email: string;

  firstName: string;
  lastInitial: string;

  avatarUrl?: string;

  theme: "light" | "dark" | "system";

  isDayTrader: boolean;

  aiRefreshInterval: number;

  createdAt: string;
  updatedAt: string;
}
