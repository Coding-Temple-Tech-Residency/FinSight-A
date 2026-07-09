//FinSight-A/frontend/src/components/TrendingStocks.tsx

export default function TrendingStocks() {
  return (
    <div className="rounded-xl border border-[#24354D] bg-[#101c31] p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-3xl front-semibold">🔥 Trending Stocks</h2>
      </div>

      <table className="w-full text-left">
        <thead className="text-gray-400">
          <tr>
            <th>#</th>
            <th>Stock</th>
            <th>Price</th>
            <th>Change</th>
            <th>Trend</th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-t border[#24354D]">
            <td>1</td>

            <td>
              <div className="flex items-center gap-3">
                Apple (get LOGO?) 🍎
              </div>

              <div>
                <div>AAPL</div>

                <div className="text-sm text-gray-400">Apple INC.</div>
              </div>
            </td>
            <td>📈</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
