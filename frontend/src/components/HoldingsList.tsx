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
        <div>
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