import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
} from 'reactflow';
import type { Connection, Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';

interface ScheduleRisk {
    scene_id: string;
    risk_type: string;
    message: string;
    severity: string;
    // Add missing fields if any
}

// FULL SCENE INTERFACE
interface ExpenseCategory {
    category: string;
    cost: string;
    reason: string;
}

interface Scene {
    id: string;
    header: string;
    summary: string;
    location?: string;
    time?: string;
    // Budget Fields
    estimated_cost?: string;
    budget_code?: number;
    expense_breakdown?: ExpenseCategory[];
}

// Optimization Component
const Stripboard = ({ scenes, onGrouped }: { scenes: Scene[], onGrouped: (saved: number) => void }) => {
    // Basic grouping logic
    const grouped: Record<string, Scene[]> = {};
    scenes.forEach(s => {
        const key = s.location || "UNKNOWN";
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(s);
    });

    // Calculate savings
    const baseMoves = scenes.length; // Worst case: move every scene
    const optimizedMoves = Object.keys(grouped).length;
    const savings = (baseMoves - optimizedMoves) * 5; // 5 Lakhs per move

    // Notify parent once
    useEffect(() => {
        onGrouped(savings);
    }, [savings, onGrouped]);

    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 mt-4">
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-3">Shooting Stripboard (Logic Layer)</h3>
            <div className="space-y-2">
                {Object.entries(grouped).map(([loc, list]) => (
                    <div key={loc} className="flex items-center">
                        <div className="w-24 text-[10px] font-mono text-zinc-500 truncate text-right mr-2">{loc}</div>
                        <div className="flex-1 flex gap-1 bg-zinc-800 p-1 rounded overflow-x-auto">
                            {list.map(s => (
                                <div key={s.id} className={`h-6 px-2 text-[10px] font-bold flex items-center justify-center rounded ${s.time?.includes('NIGHT') ? 'bg-indigo-900 text-indigo-300' : 'bg-amber-600 text-black'}`}>
                                    {s.id}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 180-Degree Plotter Component based on simple rules
const BlockingMap = () => (
    <div className="absolute bottom-4 right-4 bg-zinc-900 border border-zinc-700 p-4 rounded-lg shadow-2xl w-64 z-10">
        <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">180° Top-Down Blocking</h3>
        <svg viewBox="0 0 200 150" className="w-full h-auto bg-zinc-950 rounded border border-zinc-800">
            {/* Axis of Action */}
            <line x1="20" y1="75" x2="180" y2="75" stroke="#4b5563" strokeWidth="2" strokeDasharray="5,5" />
            <text x="100" y="70" textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="monospace">AXIS OF ACTION</text>

            {/* Hero */}
            <circle cx="50" cy="75" r="8" fill="#f59e0b" />
            <text x="50" y="95" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">HERO</text>

            {/* Villain */}
            <circle cx="150" cy="75" r="8" fill="#ef4444" />
            <text x="150" y="95" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">VILLAIN</text>

            {/* Cameras */}
            <path d="M 80 120 L 100 100 L 120 120 Z" fill="#10b981" opacity="0.8" />
            <text x="100" y="135" textAnchor="middle" fill="#10b981" fontSize="8">CAM A</text>

            {/* Violation example */}
            <path d="M 80 30 L 100 50 L 120 30 Z" fill="#ef4444" opacity="0.3" />
            <text x="100" y="25" textAnchor="middle" fill="#ef4444" fontSize="8">CAM B (BAD)</text>
        </svg>
    </div>
);

interface ContinuityError {
    error_type: string;
    description: string;
    severity: string;
    estimated_cost: string;
    estimated_delay: string;
    suggested_fix: string;
    from_scene_id?: string;
    to_scene_id?: string;
}

// Removed duplicate Scene interface definition that was here

interface ComplianceRisk {
    category: string;
    trigger_text: string;
    legal_requirement: string;
    estimated_fine: string;
}

interface AnalysisResult {
    total_risk_score: number;
    potential_savings: string;
    scenes: Scene[];
    errors: ContinuityError[];
    compliance_risks: ComplianceRisk[];
    schedule_risks: ScheduleRisk[];
    overall_budget_breakdown?: ExpenseCategory[];
}

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// --- Helpers ---
const formatCurrency = (value: string) => {
    return value;
};

interface RiskDashboardProps {
    onAnalysisUpdate?: (analysis: AnalysisResult) => void;
    initialScript?: string | null;
}

export default function RiskDashboard({ onAnalysisUpdate, initialScript }: RiskDashboardProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [scriptText, setScriptText] = useState(initialScript || `EXT. OLD TEMPLE - DAY
HERO (Superstar) makes a grand entry on a WHITE HORSE. 
500 Junior Artists throw flowers. Hero lights a CIGARETTE.
He is wearing Ray-Ban Aviators and a RED SCARF.

EXT. TEMPLE STEPS - CONTINUOUS
Hero gets off the horse. The horse is gone.
The Villain approaches from the left.
Hero is now wearing a BLUE SCARF and NO GLASSES.

INT. DANCE BAR - NIGHT
Hero drinks a bottle of SCOTCH.
"I will destroy you," he screams.`);

    // FIX: Sync state with prop updates (Drag & Drop)
    useEffect(() => {
        if (initialScript) {
            setScriptText(initialScript);
            localStorage.setItem('cg_script_text', initialScript);
            // Auto-trigger analysis for better UX
            analyzeScript(initialScript);
        } else {
            // Load from storage if no prop provided
            const saved = localStorage.getItem('cg_script_text');
            if (saved) setScriptText(saved);
        }
    }, [initialScript]);

    // Save on manual change
    const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const txt = e.target.value;
        setScriptText(txt);
        localStorage.setItem('cg_script_text', txt);
    };

    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

    // Helper to update local and global state
    const updateAnalysis = (newAnalysis: AnalysisResult) => {
        setAnalysis(newAnalysis);
        if (onAnalysisUpdate) onAnalysisUpdate(newAnalysis);
    };

    const [loading, setLoading] = useState(false);
    const [budgetMode, setBudgetMode] = useState<"Low" | "Medium" | "High">("Medium");

    // God Mode State
    const [optimizationSavings, setOptimizationSavings] = useState(0);
    const [showBlockingMap, setShowBlockingMap] = useState(false);

    // Simple Browser TTS
    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            // Try to find a deeper voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.name.includes("Male") || v.name.includes("David")) || voices[0];
            if (preferredVoice) utterance.voice = preferredVoice;
            utterance.rate = 1.1;
            window.speechSynthesis.speak(utterance);
        }
    };

    const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const analyzeScript = async (textOverride?: string) => {
        setLoading(true);
        // CRITICAL: Clear previous analysis so UI updates to "Processing" state
        setAnalysis(null);

        const textToAnalyze = textOverride || scriptText;
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    script_text: textToAnalyze,
                    use_mock: false, // Backend now handles fallback automatically
                    budget_mode: budgetMode
                }),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Server Error: ${response.status} ${errText}`);
            }
            const data: AnalysisResult = await response.json();
            updateAnalysis(data);


            // Map Scenes to Nodes
            const newNodes: Node[] = data.scenes.map((scene, index) => ({
                id: scene.id,
                position: { x: 100 + index * 400, y: 100 },
                data: {
                    label: (
                        <div className="flex flex-col h-full">
                            <div className="bg-gradient-to-r from-zinc-800 to-zinc-900/50 p-3 border-b border-white/10 flex justify-between items-start">
                                <span className="font-bold text-amber-500 text-sm shadow-black drop-shadow-md">{scene.id} • {scene.header}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        speak(scene.summary);
                                    }}
                                    className="text-[10px] bg-white/10 hover:bg-amber-500 hover:text-black rounded-full px-2 py-1 transition-all backdrop-blur-sm"
                                    title="Play Audio Table Read"
                                >
                                    🔊
                                </button>
                            </div>
                            <div className="p-4 text-sm text-zinc-300 font-sans leading-relaxed opacity-90">
                                {scene.summary.length > 80 ? scene.summary.substring(0, 80) + '...' : scene.summary}
                            </div>
                        </div>
                    )
                },
                className: 'glass-card border-l-4 border-amber-500 text-white w-80 p-0 rounded-xl shadow-2xl font-serif tracking-wide animate-fade-in hover:scale-105 transition-transform duration-300',
                style: { boxShadow: '0 0 30px rgba(245, 158, 11, 0.1)' } // Subtle glow
            }));

            // Map Errors to Edges
            const newEdges: Edge[] = [];
            data.errors.forEach((error, index) => {
                if (error.from_scene_id && error.to_scene_id) {
                    newEdges.push({
                        id: `e-${index}`,
                        source: error.from_scene_id,
                        target: error.to_scene_id,
                        animated: true,
                        label: `${error.estimated_cost}`,
                        style: {
                            stroke: error.severity === 'High' || error.severity === 'Critical' ? '#dc2626' : '#d97706',
                            strokeWidth: 4
                        },
                        labelStyle: { fill: '#fbbf24', fontWeight: 800, fontSize: 14 },
                        labelBgStyle: { fill: '#1c1c1c', fillOpacity: 0.8 },
                    });

                    // Highlight High Risk Nodes
                    const nodeIndex = newNodes.findIndex(n => n.id === error.to_scene_id);
                    if (nodeIndex >= 0 && (error.severity === 'High' || error.severity === 'Critical')) {
                        newNodes[nodeIndex].className = 'bg-red-950 border-2 border-red-600 text-white w-72 p-4 rounded-lg shadow-2xl animate-pulse';
                    }
                }
            });

            setNodes(newNodes);
            setEdges(newEdges);

        } catch (error: any) {
            console.error("Analysis failed:", error);
            alert(`Analysis Failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full bg-black text-amber-50 overflow-hidden font-sans selection:bg-amber-500/50">
            {/* Sidebar */}
            <div className="w-1/3 bg-zinc-900 border-r border-zinc-800 p-8 flex flex-col h-full overflow-y-auto shadow-xl z-10">
                <div className="mb-8 border-b border-zinc-800 pb-4">
                    <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-600 tracking-tighter mb-1">
                        Continuity Guard
                    </h1>
                    <p className="text-zinc-500 text-xs uppercase tracking-[0.2em]">The Tollywood edition</p>
                </div>

                <div className="mb-8">
                    <label className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3 block">Budget Mode</label>
                    <div className="flex bg-zinc-950 rounded-lg p-1 border border-zinc-800 mb-4">
                        {(['Low', 'Medium', 'High'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setBudgetMode(mode)}
                                className={`flex-1 py-1 text-xs font-bold uppercase rounded transition-all ${budgetMode === mode
                                    ? 'bg-amber-600 text-black shadow-lg'
                                    : 'text-zinc-500 hover:text-amber-500'
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    <label className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3 block">Scene Input</label>
                    <textarea
                        className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-sm font-mono text-zinc-300 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner resize-none"
                        value={scriptText}
                        onChange={handleScriptChange}
                        placeholder="Paste script here..."
                    />
                    <button
                        onClick={() => analyzeScript()}
                        disabled={loading}
                        className="mt-4 w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-black uppercase tracking-widest py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center space-x-3"
                    >
                        {loading ? <span className="animate-spin text-xl">⚙️</span> : <span className="text-xl">🎬</span>}
                        <span>Analyze Risk</span>
                    </button>

                    {analysis && analysis.scenes.length > 0 && (
                        <div className="animate-fade-in">
                            <Stripboard scenes={analysis.scenes} onGrouped={setOptimizationSavings} />

                            {optimizationSavings > 0 && (
                                <div className="mt-4 bg-green-900/30 border border-green-700/50 p-3 rounded-lg flex items-center justify-between">
                                    <span className="text-green-400 text-xs font-bold uppercase tracking-widest">Efficiency Savings</span>
                                    <span className="text-green-300 font-mono font-bold text-lg">₹ {optimizationSavings} Lakhs</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {analysis && (
                    <div className="animate-fade-in space-y-6">
                        <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800">
                            <div className="flex items-center space-x-2 text-amber-500 mb-4">
                                <span>⚠️</span>
                                <span className="font-bold uppercase text-xs tracking-widest">Risk Assessment</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-zinc-500 text-xs uppercase">Est. Savings</p>
                                    <p className="text-2xl font-serif text-green-400 font-bold">{analysis.potential_savings}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-zinc-500 text-xs uppercase">Errors Found</p>
                                    <p className="text-2xl font-serif text-white">{analysis.errors.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* SCHEDULE RISK SECTION */}
                        {analysis.schedule_risks && analysis.schedule_risks.length > 0 && (
                            <div className="bg-orange-950/20 border border-orange-900/50 rounded-xl p-4 mb-4">
                                <h3 className="text-orange-500 font-bold uppercase text-xs tracking-widest mb-3 flex items-center">
                                    <span className="mr-2">☀️</span> Sunlight & Schedule
                                </h3>
                                <div className="space-y-3">
                                    {analysis.schedule_risks.map((risk, idx) => (
                                        <div key={idx} className="bg-orange-950/40 p-3 rounded border border-orange-800/50">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] font-black uppercase bg-orange-900 text-orange-200 px-2 py-1 rounded">
                                                    {risk.risk_type}
                                                </span>
                                                <span className="text-xs text-orange-400 font-mono">SCENE {risk.scene_id}</span>
                                            </div>
                                            <p className="text-sm text-orange-200 mt-2 font-serif italic whitespace-pre-wrap">{risk.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CENSOR GUARD SECTION */}
                        {analysis.compliance_risks && analysis.compliance_risks.length > 0 && (
                            <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-4 mb-4">
                                <h3 className="text-red-500 font-bold uppercase text-xs tracking-widest mb-3 flex items-center">
                                    <span className="mr-2">🛑</span> Censor & Compliance
                                </h3>
                                <div className="space-y-3">
                                    {analysis.compliance_risks.map((risk, idx) => (
                                        <div key={idx} className="bg-red-950/40 p-3 rounded border border-red-800/50">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] font-black uppercase bg-red-900 text-red-200 px-2 py-1 rounded">
                                                    {risk.category}
                                                </span>
                                                <span className="text-xs text-red-400 font-mono">{risk.estimated_fine}</span>
                                            </div>
                                            <p className="text-sm text-red-200 mt-2 font-serif italic whitespace-pre-wrap">"{risk.trigger_text}"</p>
                                            <div className="mt-2 text-xs text-red-300 border-t border-red-900 pt-2">
                                                <span className="font-bold uppercase">Requirement:</span> <span className="whitespace-pre-wrap">{risk.legal_requirement}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {analysis.errors.map((error, idx) => (
                                <div key={idx} className="group bg-zinc-800 p-5 rounded-lg border-l-4 hover:bg-zinc-700/50 transition-all border-zinc-600 hover:border-amber-500">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${error.severity === 'Critical' ? 'bg-red-950 text-red-500' :
                                            error.severity === 'High' ? 'bg-orange-950 text-orange-500' : 'bg-zinc-950 text-zinc-400'
                                            }`}>
                                            {error.error_type}
                                        </span>
                                        <span className="text-xs font-mono text-amber-400 font-bold bg-amber-950/30 px-2 py-1 rounded">
                                            {error.estimated_cost}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-300 mb-3 leading-relaxed whitespace-pre-wrap">{error.description}</p>
                                    <div className="text-xs text-zinc-500 bg-zinc-950 p-3 rounded border border-zinc-800/50">
                                        <span className="text-amber-700 font-bold uppercase text-[10px] block mb-1">Director's Fix</span>
                                        "{error.suggested_fix}"
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-zinc-950 relative">
                {/* Graph Background Pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(#ffd700 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}
                />

                {/* React Flow Graph */}
                <div className="flex-1 relative z-0">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        fitView
                        className="bg-transparent"
                    >
                        <Controls className="bg-zinc-900 border-zinc-700 fill-amber-500" />
                        <MiniMap className="bg-zinc-900 border-zinc-700" nodeColor={() => '#d97706'} maskColor="rgba(0,0,0, 0.7)" />
                        <Background gap={20} size={1} color="#333" />
                    </ReactFlow>

                    {/* GOD MODE: Blocking Map Overlay */}
                    {analysis && <BlockingMap />}

                    {!analysis && !loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-30">
                            <span className="text-6xl mb-4">🎥</span>
                            <p className="text-zinc-500 text-xl font-serif italic tracking-widest">Awaiting Script Analysis...</p>
                        </div>
                    )}

                    {/* Error Overlay */}
                    {!analysis && !loading && scriptText && scriptText.length > 5 && (
                        <div className="absolute bottom-10 left-10 p-4 bg-red-900/20 border border-red-500/50 rounded text-red-400 text-xs font-mono opacity-50 hover:opacity-100 transition-opacity">
                            Status: Ready to Analyze
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
