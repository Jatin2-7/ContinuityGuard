import { useState } from 'react';

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
                                        <tr key={item.id} className="group hover:bg-zinc-800/50 transition-colors">
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
                            Current Scene: <span className="text-white font-bold">{hasData ? scenes[0]?.header : 'SCENE 12A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
