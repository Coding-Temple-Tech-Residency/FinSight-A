export interface AIInsight {
    health_score: number;
    summary: string;
    diversification: string;
    risk: string;
    strengths: string[];
    recommendations: string[];
    generated_at: string;
}

export interface InsightRequest {
    portfolioId: string;
}

export interface InsightState {
    insight: AIInsight | null;
    loading: boolean;
    error: string | null;
}