import { useState } from "react";
import { useAppDispatch } from "../app/hooks";
import { addHolding } from "../features/portfolio/portfolioSlice";
import { FormEvent } from 'react';



interface AddHoldingFormProps{
    portfolioId: string;
    onClose: () => void;
}
export default function AddHoldingForm({
    
    portfolioId,
    onClose,
}: AddHoldingFormProps) {

    const [symbol, setSymbol] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [avgCost, setAvgCost] = useState(0);
    const dispatch = useAppDispatch();

    const handleSubmit = (
        e: FormEvent 
    ) => {
        e.preventDefault();

        if (!symbol || quantity <= 0 || avgCost <= 0) {
            return;
        }

        dispatch(addHolding({
            portfolioId,
            holding: {
                symbol,
                quantity,
                avg_cost:avgCost
            }
        }))

        onClose();
    };

    return (

        <form onSubmit={handleSubmit}>
            <input
            type='text'
            placeholder="Symbol"
            value={symbol}
            onChange={(e) => 
                setSymbol(
                    e.target.value.toUpperCase()
                )
            }
            />
            <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => 
                setQuantity(Number(e.target.value))
            }
            />
            <input
            type='number'
            placeholder="Average Cost"
            value={avgCost}
            onChange={(e) => 
                setAvgCost(Number(e.target.value))
            }
            />
            <button type='submit'>
                Add Holding
            </button>
        </form>

)}

