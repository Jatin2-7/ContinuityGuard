import { useState, useEffect } from 'react';

interface LogEntry {
    id: number;
    date: string;
    decision: string;
    reason: string;
    user: string;
    type: 'MANUAL' | 'SYSTEM';
}

export default function DecisionMemory() {
    const [logs, setLogs] = useState<LogEntry[]>([
        { id: 1, date: new Date().toLocaleDateString(), decision: 'Risk Analysis Completed', reason: 'System auto-scan of latest script draft.', user: 'System (AI)', type: 'SYSTEM' },
    ]);

    const [newDesc, setNewDesc] = useState('');
    const [newReason, setNewReason] = useState('');

    const addLog = () => {
        if (!newDesc || !newReason) return;
        const newLog: LogEntry = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            decision: newDesc,
            reason: newReason,
            user: 'Producer (You)',
            type: 'MANUAL'
        };
        setLogs([newLog, ...logs]);
        setNewDesc('');
        setNewReason('');
    };

    return (
        <div className="h-full flex flex-col bg-zinc-950 text-white p-8 overflow-y-auto">
            <header className="mb-8 border-b border-zinc-800 pb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-serif font-bold text-amber-600 mb-1">Decision Memory</h2>
                    <p className="text-zinc-500 uppercase tracking-widest text-xs">Production Log • "Why we did this"</p>
                </div>
            </header>

            <div className="flex gap-8 h-full">
                {/* Input Column */}
                <div className="w-1/3 bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-fit">
                    <h3 className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-4">Log New Decision</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-zinc-400 block mb-1">Decision / Change</label>
                            <input
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm focus:border-amber-500 focus:outline-none"
                                placeholder="e.g. Cut Scene 4..."
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-400 block mb-1">Reasoning</label>
                            <textarea
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm h-32 focus:border-amber-500 focus:outline-none resize-none"
                                placeholder="e.g. Budget constraints..."
                                value={newReason}
                                onChange={(e) => setNewReason(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={addLog}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-2 rounded transition-colors uppercase tracking-wider text-xs"
                        >
                            + Log to Memory
                        </button>
                    </div>
                </div>

                {/* Logs Column */}
                <div className="w-2/3 bg-zinc-900 border border-zinc-800 rounded-xl p-6 overflow-y-auto">
                    <h3 className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-6">Recent Application Logs</h3>
                    <div className="space-y-4">
                        {logs.map(log => (
                            <div key={log.id} className="flex gap-4 p-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                                <div className="w-24 flex-shrink-0">
                                    <div className="text-xs font-mono text-zinc-500">{log.date}</div>
                                    <div className={`text-[10px] mt-1 font-bold ${log.type === 'SYSTEM' ? 'text-blue-500' : 'text-amber-500'}`}>
                                        {log.user}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-zinc-200 font-bold text-lg mb-1">{log.decision}</div>
                                    <div className="text-zinc-400 text-sm italic">"{log.reason}"</div>
                                </div>
                            </div>
                        ))}
                        {logs.length === 0 && <div className="text-zinc-500 italic text-sm">No decisions logged yet.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
