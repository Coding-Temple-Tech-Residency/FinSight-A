import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAppDispatch } from '../app/hooks';
import { updateHolding } from '../features/portfolio/portfolioSlice';
import type { Holding } from '../types/portfolio';

interface UpdateHoldingProps {
    portfolioId: string;
    holding: Holding;
    onClose: () => void;
}

export default function UpdateHoldingForm({
    portfolioId,
    holding,
    onClose,
} : UpdateHoldingProps) {
    const dispatch = useAppDispatch();

    const [quantity, setQuantity] = useState(holding.quantity);
    const [avgCost, setAvgCost] = useState(holding.avg_cost)
    
    const handleSubmit = (
        e: FormEvent
    ) => {
        e.preventDefault();

        if (quantity <= 0 || avgCost <= 0) {return;}

        dispatch(
            updateHolding({
                portfolioId, 
                holding: {
                ...holding,

                quantity,
                avg_cost: avgCost
            }
            })
        );
        onClose();
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Edit</h3>
            <input
            type='number'
            value={quantity}
            placeholder='Quantity'
            onChange={(e) => setQuantity(Number(e.target.value))}
            />
            <input
            type='number'
            value={avgCost}
            placeholder='Average Cost'
            onChange={(e) => setAvgCost(Number(e.target.value))}
            />
            
            <button
            type='submit'
            >
            Save Changes
            </button>

            <button 
            type='button'
            onClick={onClose}
            >
                Cancel
            </button>
        </form>
    )}