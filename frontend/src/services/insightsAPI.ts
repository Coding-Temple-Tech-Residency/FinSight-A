import { apiFetch } from './api';
import type { AIInsight } from '../types/AIInsight';

export async function getPortfolioInsights(
    portfolioId: string
): Promise<AIInsight> {
    const response = await apiFetch(
    `/portfolios/${portfolioId}/insights`
    );

    if(!response.ok) {
        throw new Error('Failed to fetch portfolio insights');
    }

    return response.json();
}