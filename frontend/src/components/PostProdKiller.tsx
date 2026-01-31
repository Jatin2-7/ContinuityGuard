export default function PostProdKiller() {
    return (
        <div className="h-full flex flex-col bg-zinc-950 text-white p-8 overflow-y-auto">
            <header className="mb-8 border-b border-zinc-800 pb-6">
                <h2 className="text-4xl font-serif font-bold text-pink-600 mb-1">Post-Production Installer</h2>
                <p className="text-zinc-500 uppercase tracking-widest text-xs">Auto-Edit • Versioning System</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Auto Rough Cut */}
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl flex flex-col items-center justify-center text-center group hover:border-pink-500/50 transition-all cursor-pointer">
                    <div className="text-6xl mb-6 bg-zinc-950 rounded-full p-6 group-hover:scale-110 transition-transform">✂️</div>
                    <h3 className="text-xl font-bold text-white mb-2">Generate Smart Rough Cut</h3>
                    <p className="text-zinc-500 text-sm mb-6 max-w-xs">AI will assemble the latest usable takes based on script continuity and audio quality.</p>
                    <button className="bg-pink-600 hover:bg-pink-500 text-white font-bold px-8 py-3 rounded-full shadow-lg shadow-pink-900/20">
                        Start Processing (Est. 24m)
                    </button>
                </div>

                {/* Version Manager */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                    <h3 className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-6">Active Versions</h3>
                    <div className="space-y-3">
                        <div className="p-4 bg-zinc-950 rounded border border-zinc-800 flex justify-between items-center">
                            <div>
                                <div className="font-bold text-teal-400">Theatrical Cut (Director's)</div>
                                <div className="text-xs text-zinc-500">Last updated: 2h ago</div>
                            </div>
                            <span className="text-xs bg-zinc-800 px-2 py-1 rounded">v2.4</span>
                        </div>
                        <div className="p-4 bg-zinc-950 rounded border border-zinc-800 flex justify-between items-center opacity-75">
                            <div>
                                <div className="font-bold text-purple-400">OTT / Streaming Cut</div>
                                <div className="text-xs text-zinc-500">Unrated (Extended)</div>
                            </div>
                            <span className="text-xs bg-zinc-800 px-2 py-1 rounded">v1.1</span>
                        </div>
                        <div className="p-4 bg-zinc-950 rounded border border-zinc-800 flex justify-between items-center opacity-75">
                            <div>
                                <div className="font-bold text-red-400">Censor Submission Cut</div>
                                <div className="text-xs text-zinc-500">Smoking blurred, violence trimmed</div>
                            </div>
                            <span className="text-xs bg-zinc-800 px-2 py-1 rounded">v0.9</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
