import type { Holding } from "../types/portfolio";
import HoldingCard from "./HoldingCard";

interface HoldingListProps {
    holdings: Holding[];
    portfolioId: string;
    onDelete: (holding: Holding) => void;
}

export default function HoldingList({
    holdings,
    portfolioId,
    onDelete
}: HoldingListProps) {
    if (holdings.length === 0) {
        return (
            <p>
                No holdings yet.
            </p>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {holdings.map((holding) => (
                <HoldingCard
                key={holding.id}
                holding={holding}
                portfolioId={portfolioId}
                onDelete={onDelete}
                />
            ))}
        </div>
    )
}