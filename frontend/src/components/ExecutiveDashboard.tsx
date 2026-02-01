import { useState, useMemo } from 'react';

// Improved Interface matching new Schema
interface ExpenseCategory {
    category: string;
    cost: string;
    reason: string;
}

interface Scene {
    id: string;
    header: string;
    estimated_cost: string; // "₹ 2.5 Lakhs"
    budget_code: number; // Raw number
    expense_breakdown?: ExpenseCategory[];
}

interface AnalysisResult {
    scenes: Scene[];
    overall_budget_breakdown?: ExpenseCategory[];
}

interface ExecutiveDashboardProps {
    analysisData?: AnalysisResult | null;
}

export default function ExecutiveDashboard({ analysisData }: ExecutiveDashboardProps) {
    // User Inputs (The "Real Data")
    const [totalBudget, setTotalBudget] = useState(50); // Cr
    const [spentBudget, setSpentBudget] = useState(12); // Cr

    const [totalDays, setTotalDays] = useState(45);
    const [daysDone, setDaysDone] = useState(12);

    // Auto-calculate from script if available
    const scriptCost = useMemo(() => {
        if (!analysisData) return 0;

        // Priority 1: Use the robust server-side aggregated breakdown if available
        if (analysisData.overall_budget_breakdown) {
            const totalRaw = analysisData.overall_budget_breakdown.reduce((acc, item) => {
                let val = 0;
                const c_str = item.cost;
                if (c_str.includes("Cr")) val = parseFloat(c_str.replace(/[^\d.]/g, '')) * 10000000;
                else if (c_str.includes("Lakhs")) val = parseFloat(c_str.replace(/[^\d.]/g, '')) * 100000;
                else if (c_str.includes("k")) val = parseFloat(c_str.replace(/[^\d.]/g, '')) * 1000;
                return acc + val;
            }, 0);
            return totalRaw / 10000000; // Return in Crores
        }

        // Priority 2: Sum up scene budget codes directly
        if (analysisData.scenes) {
            return analysisData.scenes.reduce((acc, scene) => acc + (scene.budget_code || 0), 0) / 10000000;
        }

        return 0;
    }, [analysisData]);

    // Deterministic Health Calculation
    const healthScore = useMemo(() => {
        const burnRate = (spentBudget / totalBudget);
        const shootRate = (daysDone / totalDays);
        const delta = shootRate - burnRate; // Positive is good (more shot than spent), Negative is bad

        let score = 80 + (delta * 50);
        return Math.min(99, Math.max(10, Math.floor(score)));
    }, [totalBudget, spentBudget, totalDays, daysDone]);

    // Track which scene's details are open
    const [expandedSceneId, setExpandedSceneId] = useState<string | null>(null);

    const toggleScene = (id: string) => {
        if (expandedSceneId === id) setExpandedSceneId(null);
        else setExpandedSceneId(id);
    };

    const [showReport, setShowReport] = useState(false);

    // Dynamic Report Generation
    const intelligenceReport = useMemo(() => {
        const burnRate = (spentBudget / totalBudget);
        const shootRate = (daysDone / totalDays);
        const delta = shootRate - burnRate;
        const projectedFinalCost = (spentBudget / daysDone) * totalDays;

        let status = "Balanced";
        let color = "text-amber-500";
        let advice = "Maintain current momentum.";

        if (delta < -0.1) {
            status = "Critical Overspending";
            color = "text-red-500";
            advice = `IMMEDIATE ACTION: You are burning cash ${(Math.abs(delta) * 100).toFixed(1)}% faster than you are completing days. 
            At this rate, you will exceed budget by ₹ ${(projectedFinalCost - totalBudget).toFixed(2)} Cr.
            SUGGESTION: Cut daily spend by ~15% or consolidate 2 location moves into one day.`;
        } else if (delta > 0.1) {
            status = "Under Budget (Efficiency)";
            color = "text-green-500";
            advice = `EXCELLENT: You are shooting ${(delta * 100).toFixed(1)}% faster than your burn rate. 
            You are projected to finish ₹ ${(totalBudget - projectedFinalCost).toFixed(2)} Cr under budget.
            SUGGESTION: Invest savings into Post-Production or a better composer.`;
        }

        return { status, color, advice, delta };
    }, [spentBudget, totalBudget, daysDone, totalDays]);

    // Manual Calculator State
    const [manualSceneDesc, setManualSceneDesc] = useState('');
    const [manualCost, setManualCost] = useState<{ cost: string, label: string, color: string, breakdown: ExpenseCategory[] } | null>(null);

    const calculateManualCost = () => {
        if (!manualSceneDesc) return;

        // Validation: Reject nonsense/too short inputs
        const trimmed = manualSceneDesc.trim();
        if (trimmed.length < 10 || trimmed.split(/\s+/).length < 3) {
            setManualSceneDesc("⚠️ Please describe the scene in more detail (at least 3 words).");
            return;
        }

        const text = manualSceneDesc.toUpperCase();
        let label = "Standard Scene";
        let color = "text-zinc-400";

        const high = ["CHASE", "BLAST", "EXPLOSION", "CROWD", "VFX", "SONG", "FIGHT", "STUNT", "FIRE", "CRASH", "HELICOPTER"];
        const med = ["EXT.", "NIGHT", "RAIN", "PARTY", "WEDDING", "CLUB", "BAR", "FOREST"];

        let breakdown: ExpenseCategory[] = [];
        let totalVal = 0;

        if (high.some(x => text.includes(x))) {
            label = "HIGH BUDGET (Action/VFX)";
            color = "text-red-500";

            breakdown = [
                { category: "Action & Stunts", cost: "₹ 12 Lakhs", reason: "Stunt Team + Rigs" },
                { category: "Crowd & Artists", cost: "₹ 5 Lakhs", reason: "Junior Artists (300)" },
                { category: "Vehicles & Logistics", cost: "₹ 4 Lakhs", reason: "Special Vehicles" },
                { category: "Location & Permits", cost: "₹ 3 Lakhs", reason: "High Risk Permit" },
                { category: "Unit Food", cost: "₹ 1 Lakh", reason: "Heavy Batch" }
            ];
            totalVal = 2500000;

        } else if (med.some(x => text.includes(x))) {
            label = "Medium Budget (Logistics)";
            color = "text-amber-500";

            breakdown = [
                { category: "Location & Permits", cost: "₹ 2.5 Lakhs", reason: "Night Shift/Premium Loc" },
                { category: "Crowd & Artists", cost: "₹ 2 Lakhs", reason: "Background Atmosphere" },
                { category: "Vehicles & Logistics", cost: "₹ 2 Lakhs", reason: "Lights & Grips" },
                { category: "Unit Food", cost: "₹ 1.5 Lakhs", reason: "Night Dinner" },
                { category: "Hidden Costs", cost: "₹ 0.5 Lakhs", reason: "Overtime" }
            ];
            totalVal = 800000;

        } else {
            label = "Standard Dialogue/Interior";
            color = "text-green-400";

            breakdown = [
                { category: "Location & Permits", cost: "₹ 50k", reason: "Day Rent" },
                { category: "Crowd & Artists", cost: "₹ 1 Lakh", reason: "Main Talent Only" },
                { category: "Vehicles & Logistics", cost: "₹ 20k", reason: "Transport" },
                { category: "Unit Food", cost: "₹ 30k", reason: "Standard Lunch" }
            ];
            totalVal = 200000;
        }

        setManualCost({
            cost: `₹ ${(totalVal / 100000).toFixed(1)} Lakhs`,
            label,
            color,
            breakdown
        });
    };

    return (
        <div className="h-full flex flex-col bg-zinc-950 text-white p-8 overflow-y-auto relative">
            {/* Intelligence Report Modal */}
            {showReport && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-8 animate-fade-in">
                    <div className="bg-zinc-900 border border-zinc-700 w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-purple-500 to-blue-500" />

                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-3xl font-serif font-bold text-white mb-1">Chief of Staff Report</h2>
                                    <p className="text-zinc-400 text-xs uppercase tracking-widest">AI Financial & Schedule Audit</p>
                                </div>
                                <button onClick={() => setShowReport(false)} className="text-zinc-500 hover:text-white transition-colors">✕ ESC</button>
                            </div>

                            <div className="space-y-6">
                                {/* Methodology Section */}
                                <div className="bg-zinc-950/50 p-4 rounded border border-zinc-800">
                                    <h3 className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-2">Evaluation Methodology</h3>
                                    <p className="text-zinc-300 text-sm leading-relaxed">
                                        We compare your <span className="text-red-400 font-bold">Budget Burn Rate</span> (Money Spent ÷ Total Budget) against your <span className="text-blue-400 font-bold">Schedule Completion Rate</span> (Days Done ÷ Total Days).
                                    </p>
                                    <ul className="mt-2 space-y-1 text-xs text-zinc-400 font-mono">
                                        <li>• Burn Rate: {((spentBudget / totalBudget) * 100).toFixed(1)}%</li>
                                        <li>• Schedule Rate: {((daysDone / totalDays) * 100).toFixed(1)}%</li>
                                        <li>• Efficiency Delta: {(intelligenceReport.delta * 100).toFixed(1)}%</li>
                                    </ul>
                                </div>

                                {/* Diagnosis Section */}
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-zinc-950 p-4 rounded border border-zinc-800">
                                        <h3 className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-1">Current Status</h3>
                                        <div className={`text-xl font-bold ${intelligenceReport.color}`}>{intelligenceReport.status}</div>
                                    </div>
                                    <div className="flex-1 bg-zinc-950 p-4 rounded border border-zinc-800">
                                        <h3 className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-1">Projected Outcome</h3>
                                        <div className="text-xl font-bold text-white">
                                            ₹ {((spentBudget / daysDone) * totalDays).toFixed(1)} Cr
                                            <span className="text-xs text-zinc-500 ml-2 font-normal">(Est. Final Cost)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Advisory Section */}
                                <div className={`p-5 rounded-lg border-l-4 ${intelligenceReport.delta < -0.1 ? 'bg-red-950/30 border-red-600' : 'bg-green-950/30 border-green-600'}`}>
                                    <h3 className={`font-bold uppercase text-xs tracking-widest mb-2 flex items-center gap-2 ${intelligenceReport.color}`}>
                                        <span>{intelligenceReport.delta < -0.1 ? '⚠️ Warning' : '✅ Recommendation'}</span>
                                    </h3>
                                    <p className="text-sm text-white font-medium whitespace-pre-wrap leading-relaxed">
                                        "{intelligenceReport.advice}"
                                    </p>
                                </div>
                            </div>

                            <button onClick={() => setShowReport(false)} className="mt-8 w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-lg transition-colors text-sm uppercase tracking-wider">
                                Acknowledge Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="mb-8 border-b border-zinc-800 pb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-serif font-bold text-amber-500 mb-1">Executive Intelligence</h2>
                    <p className="text-zinc-500 uppercase tracking-widest text-xs">Prod. Control Tower • Live Tracker</p>
                </div>
                <div className="text-right">
                    <div className={`text-6xl font-bold transition-all duration-500 ${healthScore > 80 ? 'text-green-500' : healthScore > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                        {healthScore}%
                    </div>
                    <div className="text-zinc-500 text-xs uppercase font-bold mb-2">Overall Health</div>
                    <button
                        onClick={() => setShowReport(true)}
                        className="text-[10px] font-bold uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-500 px-3 py-1.5 rounded transition-all flex items-center gap-2 ml-auto"
                    >
                        <span>📊 View Analysis</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* LEFT COLUMN: Controls & Calculator */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Input Panel */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                        <h3 className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-6">Production Inputs</h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-400 block">Financials (₹ Cr)</label>
                                <div className="flex justify-between items-center bg-zinc-950 p-2 rounded border border-zinc-800">
                                    <span className="text-xs text-zinc-500">Total</span>
                                    <input type="number" value={totalBudget} onChange={e => setTotalBudget(Number(e.target.value))} className="w-16 bg-transparent text-right font-mono focus:outline-none" />
                                </div>
                                <div className="flex justify-between items-center bg-zinc-950 p-2 rounded border border-zinc-800">
                                    <span className="text-xs text-zinc-500">Spent</span>
                                    <input type="number" value={spentBudget} onChange={e => setSpentBudget(Number(e.target.value))} className="w-16 bg-transparent text-right font-mono focus:outline-none text-amber-500" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-400 block">Schedule (Days)</label>
                                <div className="flex justify-between items-center bg-zinc-950 p-2 rounded border border-zinc-800">
                                    <span className="text-xs text-zinc-500">Total</span>
                                    <input type="number" value={totalDays} onChange={e => setTotalDays(Number(e.target.value))} className="w-16 bg-transparent text-right font-mono focus:outline-none" />
                                </div>
                                <div className="flex justify-between items-center bg-zinc-950 p-2 rounded border border-zinc-800">
                                    <span className="text-xs text-zinc-500">Done</span>
                                    <input type="number" value={daysDone} onChange={e => setDaysDone(Number(e.target.value))} className="w-16 bg-transparent text-right font-mono focus:outline-none text-blue-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Manual Scene Calculator */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                        <h3 className="text-amber-500 font-bold uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                            <span>🧮</span> Scene Cost Calculator
                        </h3>
                        <textarea
                            className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded p-3 text-xs text-zinc-300 focus:border-amber-500 focus:outline-none mb-3 resize-none"
                            placeholder="Describe a scene to get a quick quote (e.g. 'Hero jumps from helicopter in rain')"
                            value={manualSceneDesc}
                            onChange={(e) => setManualSceneDesc(e.target.value)}
                        />
                        <button
                            onClick={calculateManualCost}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase py-2 rounded transition-colors mb-4"
                        >
                            Calculate Quote
                        </button>

                        {manualCost && (
                            <div className="bg-zinc-950 p-3 rounded border border-zinc-800 animate-fade-in border-l-4 border-l-amber-500">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-zinc-500 text-[10px] uppercase">Estimated Cost</span>
                                    <span className={`text-xl font-mono font-bold ${manualCost.color}`}>{manualCost.cost}</span>
                                </div>
                                <div className="text-[10px] text-zinc-400 uppercase tracking-wider bg-zinc-900 p-1 rounded text-center mb-3">{manualCost.label}</div>

                                {/* Manual Breakdown Table */}
                                <div className="space-y-1 pt-2 border-t border-zinc-800">
                                    {manualCost.breakdown.map((item, i) => (
                                        <div key={i} className="flex justify-between text-[10px] text-zinc-400 hover:bg-zinc-900/50 p-1 rounded">
                                            <span>{item.category}</span>
                                            <span className="font-mono text-zinc-300">{item.cost}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Metrics & Comparison */}
                <div className="lg:col-span-3 space-y-6">

                    {/* BUDGET COMPARISON HEADER */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden flex flex-col justify-center">
                            <h3 className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest mb-1">Total Allocated Budget</h3>
                            <div className="text-3xl font-bold text-zinc-200">₹ {totalBudget} Cr</div>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">Predicted Script Cost</h3>
                                <span className="text-[10px] text-zinc-600 bg-zinc-950 px-2 py-0.5 rounded">AI Estimate</span>
                            </div>
                            <div className={`text-3xl font-bold ${scriptCost > 0 ? (scriptCost > totalBudget ? 'text-red-500' : 'text-amber-500') : 'text-zinc-600'}`}>
                                {scriptCost > 0 ? `₹ ${scriptCost.toFixed(2)} Cr` : <span className="text-sm text-zinc-500">No Data (Run Analysis)</span>}
                            </div>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden flex flex-col justify-center">
                            <h3 className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest mb-1">Variance</h3>
                            <div className={`text-3xl font-bold ${scriptCost > 0 ? (scriptCost > totalBudget ? 'text-red-500' : 'text-green-500') : 'text-zinc-600'}`}>
                                {scriptCost > 0 ? (
                                    <>
                                        {scriptCost > totalBudget ? '+' : ''}{(scriptCost - totalBudget).toFixed(2)} Cr
                                        <span className="text-xs text-zinc-500 ml-2 font-normal align-middle">
                                            {scriptCost > totalBudget ? '(DEFICIT)' : '(SURPLUS)'}
                                        </span>
                                    </>
                                ) : <span className="text-sm text-zinc-500">Waiting for Script...</span>}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Budget Card */}
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">💸</div>
                            <h3 className="text-zinc-500 uppercase text-xs font-bold tracking-widest mb-4">Budget Burn Rate</h3>

                            <div className="flex items-end gap-2 mb-2">
                                <span className={`text-3xl font-bold ${spentBudget > totalBudget ? 'text-red-500' : 'text-white'}`}>₹ {spentBudget} Cr</span>
                                <span className="text-zinc-500 text-sm mb-1">/ {totalBudget} Cr</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-zinc-800 rounded-full mb-4 overflow-hidden">
                                <div
                                    className={`h-full ${spentBudget > totalBudget ? 'bg-red-600' : 'bg-gradient-to-r from-green-500 to-amber-500'}`}
                                    style={{ width: `${Math.min(100, (spentBudget / totalBudget) * 100)}%` }}
                                />
                            </div>

                            <div className="flex justify-between items-center text-xs">
                                <span className="text-zinc-400">Burn Status:</span>
                                <span className={`${(spentBudget / totalBudget) > (daysDone / totalDays) ? 'text-red-400' : 'text-green-400'} font-bold`}>
                                    {(spentBudget / totalBudget) > (daysDone / totalDays) ? 'OVERSPENDING' : 'ON TRACK'}
                                </span>
                            </div>
                        </div>

                        {/* Schedule Card */}
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">📅</div>
                            <h3 className="text-zinc-500 uppercase text-xs font-bold tracking-widest mb-4">Schedule Tracker</h3>

                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-3xl font-bold text-white">Day {daysDone}</span>
                                <span className="text-zinc-500 text-sm mb-1">/ {totalDays}</span>
                            </div>

                            <div className="w-full h-2 bg-zinc-800 rounded-full mb-4 overflow-hidden">
                                <div
                                    className="h-full bg-blue-500"
                                    style={{ width: `${Math.min(100, (daysDone / totalDays) * 100)}%` }}
                                />
                            </div>

                            <div className="text-xs text-zinc-400">
                                {totalDays - daysDone} Days Remaining
                            </div>
                        </div>
                    </div>

                    {/* Script Budget Breakdown */}
                    {analysisData && analysisData.scenes && analysisData.scenes.length > 0 && (
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                            <div className="flex justify-between items-end mb-4">
                                <h3 className="text-zinc-500 uppercase text-xs font-bold tracking-widest">Script Cost Analysis</h3>
                                <p className="text-xs text-zinc-500">{analysisData.scenes.length} Scenes Extracted</p>
                            </div>

                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                {analysisData.scenes.map((scene) => (
                                    <div key={scene.id} className="bg-zinc-950 rounded border border-zinc-800 overflow-hidden transition-all duration-300">
                                        <div
                                            className="flex items-center justify-between p-3 cursor-pointer hover:bg-zinc-900"
                                            onClick={() => toggleScene(scene.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-8 rounded-sm ${scene.budget_code > 2000000 ? 'bg-red-500' :
                                                    scene.budget_code > 500000 ? 'bg-amber-500' : 'bg-green-600'
                                                    }`} />
                                                <div>
                                                    <div className="text-xs font-bold text-zinc-300">{scene.id} • {scene.header}</div>
                                                    <div className="text-[10px] text-zinc-600">
                                                        {scene.budget_code > 2000000 ? 'HIGH BUDGET (Type A)' : 'Standard (Type B)'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex items-center gap-3">
                                                <div className="text-sm font-mono text-zinc-200">{scene.estimated_cost}</div>
                                                <div className={`transform transition-transform ${expandedSceneId === scene.id ? 'rotate-180' : ''} text-zinc-500`}>
                                                    ▼
                                                </div>
                                            </div>
                                        </div>

                                        {/* EXPANDED DETAILS */}
                                        {expandedSceneId === scene.id && scene.expense_breakdown && (
                                            <div className="border-t border-zinc-800 bg-black/50 p-4 animate-fade-in">
                                                <h4 className="text-[10px] uppercase font-bold text-zinc-500 mb-3 tracking-widest">Expense Breakdown</h4>
                                                <div className="space-y-2">
                                                    {scene.expense_breakdown.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-start text-xs border-b border-zinc-800/50 last:border-0 pb-2 last:pb-0">
                                                            <div className="w-1/3">
                                                                <span className="text-zinc-400 font-bold block">{item.category}</span>
                                                            </div>
                                                            <div className="w-1/3 px-2">
                                                                <span className="text-zinc-500 italic block">{item.reason}</span>
                                                            </div>
                                                            <div className="w-1/3 text-right">
                                                                <span className="text-zinc-300 font-mono">{item.cost}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center">
                                                    <div className="text-[10px] uppercase text-zinc-500">
                                                        <span className="text-amber-500 mr-2">⚠️ Hidden Costs Included:</span>
                                                        Batta, Diesel, Overtime
                                                    </div>
                                                    <div className="text-xs font-bold text-zinc-300">Total: {scene.estimated_cost}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
