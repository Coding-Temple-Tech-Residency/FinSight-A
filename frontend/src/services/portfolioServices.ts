import apiFetch from "./api";
import type { Holding, Portfolio, PortfolioListResponse, HoldingListResponse, PortfolioCreate, Transaction, TransactionCreate } from "../types/portfolio";

export async function getPortfolios(): Promise<PortfolioListResponse> {
    const response = await apiFetch('/portfolios');

    return response.json();
}

export async function getHoldings(portfolioId:string): Promise<HoldingListResponse> {
    const response = await apiFetch(`/portfolios/${portfolioId}/holdings`);

    return response.json();
}

export async function createHolding(
    portfolioId: string,
    holding: Omit<Holding, 'id'>
): Promise<Holding> {
    const response = await apiFetch(`/portfolios/${portfolioId}/holdings`, {
        method: 'POST',
        body: JSON.stringify(holding),
    });

    return response.json() as Promise<Holding>;
}

export async function editHolding(
    portfolioId: string,
    holding: Holding
): Promise<Holding> {
    const response = await apiFetch(
        `/portfolios/${portfolioId}/holdings/${holding.id}`,
        {
            method: 'PATCH',
            body: JSON.stringify(holding),
        }
    );
    return response.json() as Promise<Holding>;
}

export async function deleteHolding(
    portfolioId: string,
    holdingId: string
    ): Promise<string> {
    await apiFetch(`/portfolios/${portfolioId}/holdings/${holdingId}`, {
        method: 'DELETE',
    });

    return holdingId
}

export async function createPortfolio(
    portfolio: PortfolioCreate
): Promise<Portfolio> {
    const response = await apiFetch(
        '/portfolios',
        {
            method: 'POST',
            body: JSON.stringify(portfolio),
        }
    );

    return response.json();
}

export async function deletePortfolio(
    id: string 
) : Promise<string> {
    await apiFetch(`/portfolios/${id}`, {
        method: 'DELETE',
    });
    
    return id;

}

export async function getTransactions(
    portfolioId: string
): Promise<Transaction[]> {
    const response = await apiFetch(
        `/portfolios/${portfolioId}/transactions`
    );

    const data = await response.json();

    return data.transactions;
}

export async function createTransaction(
    portfolioId: string,
    transaction: TransactionCreate
): Promise<Transaction> {
    const response = await apiFetch(
        `/portfolios/${portfolioId}/transactions`,
        {
            method: 'POST',
            body: JSON.stringify(transaction),
        }
    );

    return response.json();
}