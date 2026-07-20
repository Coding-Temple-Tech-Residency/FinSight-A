import { useAppSelector } from "../app/hooks";

export default function TransactionList() {
    const { transactions, transactionStatus } = useAppSelector(
        (state) => state.portfolio
    );

    if (transactionStatus === 'loading') {
        return (
            <div className='rounded-xl border border-[#24354D] bg-[#101C31] p-4'>
                <p className="text-gray-400">
                    Loading transactions...
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-[#24354D] bg-[#101C31] p-4">
            <h2 className="mb-4 text-xl font-semibold text-white">
                Transaction History
            </h2>

            {transactions.length === 0 ? (
                <p className="text-gray-400">
                    No transactions yet.
                </p>
            ) : (
                <div className="space-y-3">
                    {transactions.map((transaction) => (
                        <div
                        key={transaction.id}
                        className="flex items-center justify-between rounded-lg border border-[#24354D] bg-[#162337] p-3"
                        >
                            <div>
                            <p className="font-semibold text-white">{transaction.symbol}</p>
                            <p className="text-sm text-gray-400">
                                {new Date(transaction.traded_at).toLocaleDateString()}
                            </p>
                            </div>
                            <div className="text-center">
                            <p className={transaction.type === 'buy' ? 'text-green-400' : 'text-red-400'}>
                                {transaction.type.toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-300">
                                {transaction.quantity} shares
                            </p>
                            </div>
                            <div className="text-right">
                                <p className='text-white'>
                                    {transaction.price_at_trade ? `$${transaction.price_at_trade}` : 'N/A'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}