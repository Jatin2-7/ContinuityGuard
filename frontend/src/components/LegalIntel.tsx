import { useState } from 'react';

interface ComplianceRisk {
    category: string;
    trigger_text: string;
    legal_requirement: string;
    estimated_fine: string;
}

interface ProductionAsset {
    asset_type: string;
    name: string;
    status: 'Cleared' | 'Pending Sign-off' | 'Not Started';
}

interface AnalysisResult {
    compliance_risks: ComplianceRisk[];
    total_risk_score: number;
    assets?: ProductionAsset[];
}

interface LegalIntelProps {
    analysisData?: AnalysisResult | null;
}

export default function LegalIntel({ analysisData }: LegalIntelProps) {
    const [certStatus] = useState(analysisData && analysisData.compliance_risks.length > 0 ? 'A (Risk)' : 'U/A Expected');

    return (
        <div className="h-full flex flex-col bg-zinc-950 text-white p-8 overflow-y-auto">
            <header className="mb-8 border-b border-zinc-800 pb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-serif font-bold text-red-600 mb-1">Legal & Compliance</h2>
                    <p className="text-zinc-500 uppercase tracking-widest text-xs">Censor Guardian • Contracts</p>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-bold text-amber-500">{certStatus}</div>
                    <div className="text-zinc-500 text-xs uppercase font-bold">Certification Target</div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Active Alerts */}
                <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-xl">
                    <h3 className="text-red-500 font-bold uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
                        <span>🛑</span> Blocking Release
                    </h3>
                    <div className="space-y-4">
                        {analysisData?.compliance_risks && analysisData.compliance_risks.length > 0 ? (
                            analysisData.compliance_risks.map((risk, idx) => (
                                <div key={idx} className="bg-red-950/40 p-4 rounded border border-red-800/50 flex gap-4">
                                    <div className="text-2xl">⚠️</div>
                                    <div>
                                        <h4 className="font-bold text-red-200 text-sm uppercase">{risk.category}</h4>
                                        <p className="text-red-300 text-xs mt-1 italic">"{risk.trigger_text}"</p>
                                        <div className="mt-2 text-[10px] text-zinc-400 bg-red-950/50 p-2 rounded">
                                            REQ: {risk.legal_requirement}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-zinc-500 italic text-sm">No active censor risks detected in current script analysis.</div>
                        )}
                    </div>
                </div>

                {/* Asset Clearance */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                    <h3 className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-6">Asset Clearance Status</h3>

                    <div className="space-y-4 mb-8">
                        {analysisData?.assets && analysisData.assets.length > 0 ? (
                            analysisData.assets.map((asset, idx) => (
                                <div key={idx} className={`flex justify-between items-center p-3 bg-zinc-950 rounded border ${asset.status === 'Pending Sign-off' ? 'border-amber-500/50' : 'border-zinc-800'
                                    }`}>
                                    <div>
                                        <span className="text-zinc-300 text-sm font-bold block">{asset.name}</span>
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{asset.asset_type}</span>
                                    </div>
                                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${asset.status === 'Cleared' ? 'bg-green-950/50 text-green-500' :
                                        asset.status === 'Pending Sign-off' ? 'bg-amber-950/50 text-amber-500' :
                                            'bg-zinc-800 text-zinc-500'
                                        }`}>
                                        {asset.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-zinc-500 italic text-sm">No assets extracted from script.</div>
                        )}
                    </div>

                    {/* Interactive Compliance Checker */}
                    <div className="border-t border-zinc-800 pt-6">
                        <h3 className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-3">Interactive Legal Scan</h3>
                        <textarea
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-zinc-300 focus:border-red-500 focus:outline-none mb-3 h-24 resize-none placeholder:text-zinc-700 font-mono"
                            placeholder="Paste dialogue or scene description to check against Indian Laws..."
                            id="legal-input"
                        />
                        <button
                            onClick={async () => {
                                const input = (document.getElementById('legal-input') as HTMLTextAreaElement).value;
                                if (!input) return;
                                const btn = document.getElementById('scan-btn')!;
                                btn.innerText = "Scanning...";
                                try {
                                    const res = await fetch('/api/analyze', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ script_text: input, budget_mode: 'Medium' })
                                    });
                                    const data = await res.json();
                                    if (data.compliance_risks && data.compliance_risks.length > 0) {
                                        alert(`⚠️ RISKS FOUND:\n\n${data.compliance_risks.map((r: any) => `• ${r.category}: ${r.trigger_text}\nREQ: ${r.legal_requirement}`).join('\n\n')}`);
                                    } else {
                                        alert("✅ No Compliance Risks Detected.");
                                    }
                                } catch (e) {
                                    alert("Error scanning.");
                                } finally {
                                    btn.innerText = "Scan for Censor Issues";
                                }
                            }}
                            id="scan-btn"
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase py-2 rounded transition-colors"
                        >
                            Scan for Censor Issues
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
