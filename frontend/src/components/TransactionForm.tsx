import { useAppDispatch } from "../app/hooks";
import { addTransaction } from "../features/portfolio/portfolioSlice";
import { useState } from "react";
import type { FormEvent } from 'react';

interface AddTransactionFormProps {
    portfolioId: string;
    onClose: () => void;
}

export default function AddTransactionForm({
    portfolioId, onClose
} : AddTransactionFormProps) {

    const dispatch = useAppDispatch();
    const [symbol, setSymbol] = useState('');
    const [type, setType] = useState<'buy' | 'sell'>('buy');
    const [quantity, setQuantity] = useState(0);
    const [price, setPrice] = useState(0);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if(!symbol || quantity <= 0 || price <= 0) {
            return;
        }
    
        dispatch(addTransaction({
            portfolioId,
            transaction: {
                symbol: symbol.toUpperCase(),
                type,
                quantity,
                price_at_trade: price
            }
            })
        );
        onClose();
    };
    return (
        <form onSubmit={handleSubmit}>
            <h3>Add Transaction</h3>
            <input
            type='text'
            placeholder="Symbol"
            value={symbol}
            onChange={(e) => {
                setSymbol(e.target.value.toUpperCase())
            }}
            />
            <select
            value={type}
            onChange={(e) => setType(e.target.value as 'buy' | 'sell')}
            >
                <option value='buy'>Buy</option>
                <option value='sell'>Sell</option>
            </select>

            <input
            type='number'
            placeholder='Quantity'
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            />
            <input
            type='number'
            placeholder="price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            />

            <button type='submit'>Add Transaction</button>
            <button type='button' onClick={onClose}>Cancel</button>
        </form>
    )
}