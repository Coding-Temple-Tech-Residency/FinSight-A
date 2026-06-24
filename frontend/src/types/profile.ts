//FinSight-A/frontend/src/types/profile.ts

export interface Profile {
  id: string;
  email: string;

  avatarUrl?: string;

  theme: "light" | "dark" | "system";

  isDayTrader: boolean;

  createdAt: string;
  updatedAt: string;
}