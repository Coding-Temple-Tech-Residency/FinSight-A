//FinSight-A/frontend/src/components/TrendingStocks.tsx

export default function TrendingStocks() {
  return (
    <div className="h-full max-h-[600px] rounded-2xl border border-[#24354D] bg-[#0F1B2D] px-2 py-2">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-3 font-semibold text-white">
          🔥 Trending Stocks
        </h2>
      </div>

      <table className="mt-4 w-full table-fixed border-separate border-spacing-y-4 text-left">
        <thead className="border-b border-[#24354D] text-[16px] font-semibold uppercase tracking-wide text-gray-400">
          <th className="w-1/10 pb-3">#</th>
          <th className="w-1/4 pb-3">Stock</th>
          <th className="w-1/6 pb-3">Price</th>
          <th className="w-1/6 pb-3">Change</th>
          <th className="w-1/5 pb-3 px-3">Trend</th>
        </thead>

        <tbody>
          <tr className="border-t border-[#24354D] text-white">
            <td className="w-1/10">1</td>
            <td className="w-1/5">
              <div className="flex items-center gap-3">
                <div className="text-sm">🍎</div>

                <div className="flex flex-col">
                  <span className="text-[16px] font-semibold text-white">
                    AAPL
                  </span>

                  <span className="text-[13px] text-gray-400">Apple</span>
                </div>
              </div>
            </td>
            <td className="w-1/5 text-[13px]">$195.42</td>
            <td className="w-1/6 text-[15px] text-green-400 text-right">
              +2.41%
            </td>
            <td className="w-1/5 px-6">📈</td>
          </tr>

          <tr className="border-t border-[#24354D] text-white">
            <td className="w-1/10">2</td>

            <td className="w-1/5">
              <div className="flex items-center gap-3">
                <div className="text-sm">🤖</div>

                <div className="flex flex-col">
                  <span className="text-[16px] font-semibold text-white">
                    NVDA
                  </span>

                  <span className="text-[13px] text-gray-400">NVIDIA</span>
                </div>
              </div>
            </td>

            <td className="w-1/5 text-[13px]">$1,148.25</td>
            <td className="w-1/6 text-[15px] text-right text-green-400">
              +4.82%
            </td>
            <td className="w-1/5 px-6">📈</td>
          </tr>

          <tr className="border-t border-[#24354D] text-white">
            <td className="w-1/10">3</td>

            <td className="w-1/5">
              <div className="flex items-center gap-3">
                <div className="text-sm">⚡</div>

                <div className="flex flex-col">
                  <span className="text-[16px] font-semibold text-white">
                    TSLA
                  </span>

                  <span className="text-[13px] text-gray-400">Tesla</span>
                </div>
              </div>
            </td>

            <td className="w-1/5 text-[13px]">$178.35</td>
            <td className="w-1/6 text-[15px] text-right text-green-400">
              +3.27%
            </td>
            <td className="w-1/5 px-6">📈</td>
          </tr>

          <tr className="border-t border-[#24354D] text-white">
            <td className="w-1/10">4</td>

            <td className="w-1/5">
              <div className="flex items-center gap-3">
                <div className="text-sm">🪟</div>

                <div className="flex flex-col">
                  <span className="text-[16px] font-semibold text-white">
                    MSFT
                  </span>

                  <span className="text-[13px] text-gray-400">Microsoft</span>
                </div>
              </div>
            </td>

            <td className="w-1/5 text-[13px]">$415.08</td>
            <td className="w-1/6 text-[15px] text-right text-green-400">
              +1.89%
            </td>
            <td className="w-1/5 px-6">📈</td>
          </tr>

          <tr className="border-t border-[#24354D] text-white">
            <td className="w-1/10">5</td>

            <td className="w-1/5">
              <div className="flex items-center gap-3">
                <div className="text-sm">📦</div>

                <div className="flex flex-col">
                  <span className="text-[16px] font-semibold text-white">
                    AMZN
                  </span>

                  <span className="text-[13px] text-gray-400">Amazon</span>
                </div>
              </div>
            </td>

            <td className="w-1/5 text-[13px]">$186.74</td>
            <td className="w-1/6 text-[15px] text-right text-green-400">
              +1.53%
            </td>
            <td className="w-1/5 px-6">📈</td>
          </tr>
        </tbody>
      </table>
      <div className="mt-6 text-center">
        <button className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300">
          View all trending stocks →
        </button>
      </div>
    </div>
  );
}
