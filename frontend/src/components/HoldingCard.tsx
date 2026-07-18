import type { Holding } from "../types/portfolio";
import { useAppDispatch } from "../app/hooks";
import { updateHolding } from "../features/portfolio/portfolioSlice";
import { useState } from "react";
import UpdateHoldingForm from "./UpdateHoldingForm";

interface HoldingCardProps {
    holding: Holding;
    portfolioId: string;
    onDelete: (holding: Holding) => void;
}

export default function HoldingCard({
    holding,
    portfolioId,
    onDelete,
}: HoldingCardProps){

    const [editingHolding, setEditingHolding] = useState(false);

    return (
        <div>
            <h3>
                {holding.symbol}
            </h3>
            <p>
                Quantity: {holding.quantity}
            </p>
            <p>
                Average Cost: ${holding.avg_cost}
            </p>

            <button onClick={() => setEditingHolding(true)}>
                Edit
            </button>

            <button onClick={() => onDelete(holding)}>
                Delete
            </button>

            {editingHolding && (
                <UpdateHoldingForm
                portfolioId={portfolioId}
                holding={holding}
                onClose={() => setEditingHolding(false)}
            />
            )}
        </div>                    
    )

}