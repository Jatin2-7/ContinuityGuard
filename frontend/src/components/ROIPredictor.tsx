import { useState, useMemo } from 'react';

// Deterministic Logic
const calculateROI = (genre: string, stars: string, budget: number) => {
    let baseScore = 50;

    // 1. Genre Factor
    if (['Action', 'Comedy'].includes(genre)) baseScore += 20;
    if (['Drama', 'Arthouse'].includes(genre)) baseScore -= 10;
    if (['Thriller'].includes(genre)) baseScore += 10;

    // 2. Star Power
    if (stars === 'A+') baseScore += 30; // Superstar
    if (stars === 'A') baseScore += 20; // Star
    if (stars === 'B') baseScore += 5;

    // 3. Budget Risk (Higher budget = harder to recover, technically, but for hit probability we assume production value helps)
    // Actually, let's say sweet spot is 50-100Cr.
    if (budget > 100) baseScore -= 5; // Very high risk
    if (budget < 10) baseScore -= 10; // Low production value risk

    return Math.min(99, Math.max(10, baseScore));
};

export default function ROIPredictor() {
    // Input State
    const [genre, setGenre] = useState('Action');
    const [starTier, setStarTier] = useState('A'); // A+, A, B, C
    const [budget, setBudget] = useState(50); // Cr

    // Calculated State
    const hitProbability = useMemo(() => calculateROI(genre, starTier, budget), [genre, starTier, budget]);

    const getScoreColor = (score: number) => {
        if (score > 75) return 'text-green-500';
        if (score > 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="h-full flex flex-col bg-zinc-950 text-white p-8 overflow-y-auto">
            <header className="mb-8 border-b border-zinc-800 pb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-serif font-bold text-purple-500 mb-1">Audience & ROI Predictor</h2>
                    <p className="text-zinc-500 uppercase tracking-widest text-xs">Market Intelligence Engine</p>
                </div>
                <div className="text-right">
                    <div className={`text-6xl font-bold transition-all duration-500 ${getScoreColor(hitProbability)}`}>{hitProbability}%</div>
                    <div className="text-zinc-500 text-xs uppercase font-bold">Predicted Success</div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Control Panel */}
                <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 p-6 rounded-xl h-fit">
                    <h3 className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-6">Simulation Parameters</h3>

                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-zinc-400 block mb-2">Primary Genre</label>
                            <div className="flex flex-wrap gap-2">
                                {['Action', 'Comedy', 'Thriller', 'Drama'].map(g => (
                                    <button
                                        key={g}
                                        onClick={() => setGenre(g)}
                                        className={`px-3 py-1 rounded text-xs font-bold uppercase border transition-all ${genre === g ? 'bg-purple-600 border-purple-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-600'
                                            }`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-zinc-400 block mb-2">Lead Star Power</label>
                            <input
                                type="range" min="0" max="2" step="1"
                                value={starTier === 'A+' ? 2 : starTier === 'A' ? 1 : 0}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setStarTier(val === 2 ? 'A+' : val === 1 ? 'A' : 'B');
                                }}
                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                            <div className="flex justify-between text-xs font-mono text-zinc-500 mt-1">
                                <span>Newcomer (B)</span>
                                <span>Star (A)</span>
                                <span className="text-purple-400 font-bold">Superstar (A+)</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-zinc-400 block mb-2">Production Budget (₹ Cr)</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    value={budget}
                                    onChange={(e) => setBudget(Math.max(0, parseInt(e.target.value)))}
                                    className="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 w-24 font-mono text-white focus:outline-none focus:border-purple-500"
                                />
                                <span className="text-zinc-500 text-sm">Crores</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analysis Output */}
                <div className="lg:col-span-2 space-y-6">
                    {/* OTT Interest Card */}
                    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 p-8 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20 text-8xl">📺</div>
                        <h3 className="text-purple-300 font-bold uppercase text-xs tracking-widest mb-2">Predicted OTT Value</h3>
                        <div className="text-5xl font-bold text-white mb-2">
                            {hitProbability > 80 ? 'Premium' : hitProbability > 60 ? 'Standard' : 'Low Interest'}
                        </div>
                        <p className="text-zinc-400 text-sm italic">
                            {hitProbability > 80
                                ? "Aggressive bidding war expected between Netflix & Prime."
                                : "Likely to be picked up as part of a package deal."}
                        </p>
                    </div>

                    {/* Box Office Projection */}
                    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl">
                        <h3 className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-4">Projected Theatrical Range</h3>
                        <div className="flex items-baseline gap-4">
                            <span className="text-4xl font-serif text-white">
                                ₹ {Math.floor(budget * (hitProbability / 40))} - {Math.floor(budget * (hitProbability / 25))} Cr
                            </span>
                            <span className={`text-sm font-bold ${hitProbability > 50 ? 'text-green-500' : 'text-red-500'}`}>
                                {hitProbability > 60 ? 'PROFITABLE' : 'RISKY'}
                            </span>
                        </div>
                        <p className="text-zinc-500 text-xs mt-2">Based on {starTier} Tier star in a {budget}Cr {genre} film.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
