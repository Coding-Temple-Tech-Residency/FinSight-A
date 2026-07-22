import { useAppSelector } from "../app/hooks";

export default function AIInsightCard() {
    const { insight, status, error} = useAppSelector(
        (state) => state.insights
    );

    if (status === 'loading') {
        return (
            <div className='rounded-2xl border border-[#2354D] bg-[#111827] p-6'>
                <h2 className='text-xl font-semibold text-white mb-4'>
                    AI Portfolio Insights
                </h2>
                <p className="text-slate-400">
                    Analyzing your portfolio
                </p>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="rounded-2xl border border-red-500/40 bg-[#111827] p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                    AI Portfolio Insights
                </h2>
                <p className="text-red-400">
                    {error}
                </p>
            </div>
        )
    }

    if (!insight) {
        return (
            <div className="rounded-2xl border border-[#24354D] bg-[#111827] p-6">
                <h2 className="text-xl font-semibold text-white">
                    AI Insights
                </h2>
                <p className="text-slate-400">
                    Select a portfolio to generate insights.
                </p>
            </div>
        );
    }

    return(
        <div className="rounded-2xl border border-[#24354D] bg-[#111827] p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">
                    AI Portfolio Insights
                </h2>
                <div className="rounded-full bg-cyan-500/10 px-4 py-2">
                    <span className="text-cyan-400 font-bold">
                        {insight.health_score}
                    </span>

                    <span className="text-slate-400 ml-1">
                        /100
                    </span>
                </div>
            </div>

            <section>
                <h3 className="text-sm uppercase text-slate-400">
                    Summary
                </h3>
                <p className="text-white">
                    {insight.summary}
                </p>
            </section>
            <section>
                <h3 className="text-sm uppercase text-slate-400">
                    Risk
                </h3>
                <p className="text-white mt-2">
                    {insight.risk}
                </p>
            </section>
            <section>
                <h3 className="text-sm uppercase text-slate-400">
                    Diversification
                </h3>
                <p className="text-white mt-2">
                    {insight.diversification}
                </p>
            </section>
            <section>
                <h3 className="text-sm uppercase text-slate-400">
                    Strengths
                </h3>
                <ul className="list-disc list-inside text-white mt-2 space-y-1">
                    {insight.strengths.map((item, index) => 
                    <li key={index}>
                        {item}
                    </li>)}
                </ul>
            </section>
            <section>
                <h3 className="text-sm uppercase text-slate-400">
                    Recommendations
                </h3>
                <ul className="list-disc list-inside text-white mt-2 space-y-1">
                    {insight.recommendations.map((item, index) => (
                        <li key={index}>
                            {item}
                        </li>
                    ))}
                </ul>
            </section>
            <p className="text-xs text-slate-500">
                Generated:
                {" "}
                {new Date(insight.generated_at).toLocaleString()}
            </p>
        </div>
    )
}
