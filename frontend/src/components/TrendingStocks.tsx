// FinSight-A/frontend/src/components/TrendingStocks.tsx

export default function TrendingStocks() {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-[#24354D] bg-[#0F1B2D] px-2 py-2">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-3 font-semibold text-white">
          🔥 Trending Stocks
        </h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <table className="w-full table-fixed border-separate border-spacing-y-4 text-left">
          <thead className="sticky top-0 z-10 bg-[#0F1B2D] border-b border-[#24354D] text-[16px] font-semibold uppercase tracking-wide text-gray-400">
            <tr>
              <th className="w-1/10 pb-3">#</th>

              <th className="w-1/4 pb-3">Stock</th>

              <th className="w-1/6 pb-3">Price</th>

              <th className="w-1/6 pb-3">Change</th>

              <th className="w-1/5 px-3 pb-3">Trend</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t border-[#24354D] text-white">
              <td>1</td>
              <td>
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
              <td className="text-[13px]">$195.42</td>
              <td className="text-right text-[15px] text-green-400">+2.41%</td>
              <td className="px-6">📈</td>
            </tr>

            <tr className="border-t border-[#24354D] text-white">
              <td>2</td>
              <td>
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
              <td className="text-[13px]">$1,148.25</td>
              <td className="text-right text-[15px] text-green-400">+4.82%</td>
              <td className="px-6">📈</td>
            </tr>

            <tr className="border-t border-[#24354D] text-white">
              <td>3</td>
              <td>
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
              <td className="text-[13px]">$178.35</td>
              <td className="text-right text-[15px] text-green-400">+3.27%</td>
              <td className="px-6">📈</td>
            </tr>

            <tr className="border-t border-[#24354D] text-white">
              <td>4</td>
              <td>
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
              <td className="text-[13px]">$415.08</td>
              <td className="text-right text-[15px] text-green-400">+1.89%</td>
              <td className="px-6">📈</td>
            </tr>

            <tr className="border-t border-[#24354D] text-white">
              <td>5</td>
              <td>
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
              <td className="text-[13px]">$186.74</td>
              <td className="text-right text-[15px] text-green-400">+1.53%</td>
              <td className="px-6">📈</td>
            </tr>

            <tr className="border-t border-[#24354D] text-white">
              <td>6</td>
              <td>
                <div className="flex items-center gap-3">
                  <div className="text-sm">🔎</div>
                  <div className="flex flex-col">
                    <span className="text-[16px] font-semibold text-white">
                      GOOGL
                    </span>
                    <span className="text-[13px] text-gray-400">Alphabet</span>
                  </div>
                </div>
              </td>
              <td className="text-[13px]">$182.64</td>
              <td className="text-right text-[15px] text-green-400">+1.21%</td>
              <td className="px-6">📈</td>
            </tr>

            <tr className="border-t border-[#24354D] text-white">
              <td>7</td>
              <td>
                <div className="flex items-center gap-3">
                  <div className="text-sm">👥</div>
                  <div className="flex flex-col">
                    <span className="text-[16px] font-semibold text-white">
                      META
                    </span>
                    <span className="text-[13px] text-gray-400">Meta</span>
                  </div>
                </div>
              </td>
              <td className="text-[13px]">$711.25</td>
              <td className="text-right text-[15px] text-red-400">-2.08%</td>
              <td className="px-6">📉</td>
            </tr>

            <tr className="border-t border-[#24354D] text-white">
              <td>8</td>
              <td>
                <div className="flex items-center gap-3">
                  <div className="text-sm">🏦</div>
                  <div className="flex flex-col">
                    <span className="text-[16px] font-semibold text-white">
                      JPM
                    </span>
                    <span className="text-[13px] text-gray-400">JPMorgan</span>
                  </div>
                </div>
              </td>
              <td className="text-[13px]">$286.40</td>
              <td className="text-right text-[15px] text-green-400">+0.84%</td>
              <td className="px-6">📈</td>
            </tr>

            <tr className="border-t border-[#24354D] text-white">
              <td>9</td>
              <td>
                <div className="flex items-center gap-3">
                  <div className="text-sm">🎬</div>
                  <div className="flex flex-col">
                    <span className="text-[16px] font-semibold text-white">
                      NFLX
                    </span>
                    <span className="text-[13px] text-gray-400">Netflix</span>
                  </div>
                </div>
              </td>
              <td className="text-[13px]">$1,198.50</td>
              <td className="text-right text-[15px] text-red-400">-0.62%</td>
              <td className="px-6">📉</td>
            </tr>

            <tr className="border-t border-[#24354D] text-white">
              <td>10</td>
              <td>
                <div className="flex items-center gap-3">
                  <div className="text-sm">🧠</div>
                  <div className="flex flex-col">
                    <span className="text-[16px] font-semibold text-white">
                      AMD
                    </span>
                    <span className="text-[13px] text-gray-400">AMD</span>
                  </div>
                </div>
              </td>
              <td className="text-[13px]">$164.72</td>
              <td className="text-right text-[15px] text-green-400">+1.76%</td>
              <td className="px-6">📈</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-auto flex justify-end pt-4">
        <button className="rounded-lg bg-[#3DD6F5] px-4 py-2 text-[15px] font-medium text-black transition hover:opacity-90">
          View all trending stocks →
        </button>
      </div>
    </div>
  );
}
