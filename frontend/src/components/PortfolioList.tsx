import type { Portfolio } from "../types/portfolio";


interface PortfolioListProps {
    portfolios: Portfolio[];
    onSelect: (portfolio: Portfolio) => void;
    onDelete: (portfolio: string) => void;
}

export default function PortfolioList({
    portfolios,
    onSelect,
    onDelete

}: PortfolioListProps) {
    return (
        <div>
            {portfolios.map((portfolio) => (
                <div key={portfolio.id}>
                    <div
                    onClick={() => onSelect(portfolio)}>
                
                    {portfolio.name}
                    </div>

                    <button
                        onClick={() => {
                            if (
                                window.confirm(
                                    'Delete this portfolio?'
                                )
                            ) {
                        
                            onDelete(portfolio.id)
                            }
                        }}
                        >
                            Delete Portfolio
                    </button>
                </div>
            ))}
        </div>
    )
}