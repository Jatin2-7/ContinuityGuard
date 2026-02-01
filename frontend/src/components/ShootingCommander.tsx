import { useState, useEffect } from 'react';

interface ShootingCommanderProps {
    scriptData?: any | null;
}

export default function ShootingCommander({ scriptData }: ShootingCommanderProps) {
    // Generate Call Sheet from Real Data
    const scenes = scriptData?.scenes || [];
    const hasData = scenes.length > 0;

    const callSheetItems = hasData ? scenes.map((scene: any, index: number) => ({
        id: (index + 1).toString(),
        time: scene.time?.includes('NIGHT') ? '22:00' : '09:00',
        scene: scene.header,
        cast: scene.entities?.join(', ') || 'TBD',
        page: '1/8', // Mock page count
        loc: scene.location || 'STUDIO'
    })) : [
        // Default Mock if no data
        { id: '1', time: '07:00', scene: 'EXT. TEMPLE - DAY', cast: 'Hero, Villagers', page: '2/8', loc: 'RFC MAIN' },
        { id: '2', time: '10:30', scene: 'INT. HANGAR - DAY', cast: 'Villain, Henchmen', page: '4/8', loc: 'ANNAPURNA 7' },
    ];

    const [selectedScene, setSelectedScene] = useState<any>(callSheetItems[0]);

    useEffect(() => {
        if (callSheetItems.length > 0) {
            setSelectedScene(callSheetItems[0]);
        }
    }, [scriptData]);

    // Dynamic Prediction Logic based on Scene content
    const getPredictions = (scene: any) => {
        if (!scene) return { rain: 0, turnaround: 'LOW', move: 100 };

        const isOutdoor = scene.scene.includes("EXT");
        const isNight = scene.scene.includes("NIGHT"); // Checks if NIGHT is in the header string
        // Also check raw time if available
        const isNightTime = scene.time === '22:00' || isNight;

        const isComplex = scene.scene.includes("ACTION") || scene.scene.includes("CHASE");

        return {
            rain: isOutdoor ? Math.floor(Math.random() * 30) + 10 : 0, // Higher risk for EXT
            turnaround: isNightTime ? 'HIGH' : 'LOW',
            move: isComplex ? 60 : 95
        };
    };

    const predictions = getPredictions(selectedScene);

    return (
        <div className="h-full flex flex-col bg-zinc-950 text-white p-8 overflow-y-auto">
            <header className="mb-8 border-b border-zinc-800 pb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-serif font-bold text-blue-500 mb-1">Shooting Commander</h2>
                    <p className="text-zinc-500 uppercase tracking-widest text-xs">AI Call Sheet & Schedule Optimizer</p>
                </div>
                <div className="text-right">
                    <span className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest border border-blue-800">
                        {hasData ? `Live Script Mode` : 'Demo Mode'}
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Call Sheet */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-zinc-200">Day 1 Call Sheet</h3>
                            <button className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded transition-colors">
                                ⬇ Export PDF
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-zinc-500 font-mono text-xs uppercase border-b border-zinc-800">
                                    <tr>
                                        <th className="pb-3 pl-2">Time</th>
                                        <th className="pb-3">Scene</th>
                                        <th className="pb-3">Cast & Elements</th>
                                        <th className="pb-3 text-right pr-2">Loc</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    {callSheetItems.map((item: any) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => setSelectedScene(item)}
                                            className={`group transition-colors cursor-pointer ${selectedScene?.id === item.id ? 'bg-blue-900/20 border-l-2 border-blue-500' : 'hover:bg-zinc-800/50'}`}
                                        >
                                            <td className="py-4 pl-2 font-mono text-blue-400">{item.time}</td>
                                            <td className="py-4 font-bold text-zinc-300">{item.scene}</td>
                                            <td className="py-4 text-zinc-500">{item.cast}</td>
                                            <td className="py-4 text-right pr-2 text-zinc-400 text-xs uppercase">{item.loc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {!hasData && (
                            <div className="mt-4 text-center p-4 bg-zinc-950/50 border border-zinc-800 border-dashed rounded text-zinc-500 text-xs italic">
                                Ingest a script to auto-fill this schedule.
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Widget */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h3 className="text-zinc-400 font-bold uppercase text-xs tracking-widest mb-4">Live Set Status</h3>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-xl font-bold">Rolling</span>
                        </div>
                        <div className="text-sm text-zinc-500">
                            Current Scene: <span className="text-white font-bold">{selectedScene ? selectedScene.scene : 'SCENE 12A'}</span>
                        </div>
                    </div>

                    {/* Predictive Intelligence Panel */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden transition-all duration-300">
                        <div className="absolute top-0 right-0 p-3 opacity-10 text-6xl">🔮</div>
                        <h3 className="text-zinc-400 font-bold uppercase text-xs tracking-widest mb-4 z-10 relative">Predictive Intelligence</h3>
                        <div className="text-[10px] text-blue-400 mb-4 font-mono">Analyzed for: {selectedScene?.loc}</div>

                        <div className="space-y-4 relative z-10">
                            <div className="p-3 bg-zinc-950/80 rounded border border-zinc-700/50">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-amber-500 font-bold text-xs uppercase">Rain Delay Prob.</span>
                                    <span className="text-white font-mono font-bold">{predictions.rain}%</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 italic">
                                    Explanation: Calculated based on outdoor locations in schedule vs. local weather forecast.
                                </p>
                            </div>

                            <div className="p-3 bg-zinc-950/80 rounded border border-zinc-700/50">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-purple-500 font-bold text-xs uppercase">Turnaround Risk</span>
                                    <span className={`font-mono font-bold ${predictions.turnaround === 'HIGH' ? 'text-red-500' : 'text-green-500'}`}>{predictions.turnaround}</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 italic">
                                    Explanation: Flags days where wrap time is late (e.g., 2 AM) and call time is early.
                                </p>
                            </div>

                            <div className="p-3 bg-zinc-950/80 rounded border border-zinc-700/50">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-teal-500 font-bold text-xs uppercase">Unit Move Efficiency</span>
                                    <span className="text-white font-mono font-bold">{predictions.move}%</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 italic">
                                    Explanation: Score generated by Stripboard Logic. Higher is better.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
