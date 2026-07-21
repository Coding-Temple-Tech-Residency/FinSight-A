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
        <div className='w-full space-y-3'>
            {portfolios.map((portfolio) => (
                <div className="flex w-full items-center justify-center gap-5"
                key={portfolio.id}>
                    <button
                    className="border rounded-lg px-2 py-2 bg-cyan-500 text-slate-200 transition hover:bg-slate-500"
                    onClick={() => onSelect(portfolio)}>
                
                    {portfolio.name}
                    </button>

                    <button
                    className="border rounded-lg py-2 px-2 transition hover:bg-red-500"
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