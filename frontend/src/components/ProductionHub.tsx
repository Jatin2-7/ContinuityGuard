import { useState } from 'react';
import RiskDashboard from './RiskDashboard';
import ExecutiveDashboard from './ExecutiveDashboard';
import ShootingCommander from './ShootingCommander';
import ROIPredictor from './ROIPredictor';
import LegalIntel from './LegalIntel';
import DecisionMemory from './DecisionMemory';

// Modules are now imported
type ModuleType = 'RISK' | 'EXEC' | 'SHOOT' | 'ROI' | 'LEGAL' | 'MEM';

export default function ProductionHub() {
    // Ingest State
    const [isDragging, setIsDragging] = useState(false);
    const [processingFile, setProcessingFile] = useState<string | null>(null);
    const [ingestedScript, setIngestedScript] = useState<string | null>(null);

    // Module State
    const [activeModule, setActiveModule] = useState<ModuleType | null>(null);
    const [sharedAnalysis, setSharedAnalysis] = useState<any | null>(() => {
        // Load from local storage on initial render
        const saved = localStorage.getItem('cg_shared_analysis');
        return saved ? JSON.parse(saved) : null;
    });

    // Wrapper to persist changes
    const updateSharedAnalysis = (data: any) => {
        setSharedAnalysis(data);
        localStorage.setItem('cg_shared_analysis', JSON.stringify(data));
    };

    const modules = [
        { id: 'EXEC', title: 'Executive Intelligence', color: 'from-amber-600 to-yellow-600', icon: '📊', desc: 'Health Scores & Live Alerts' },
        { id: 'RISK', title: 'Continuity & Risk Engine', color: 'from-orange-600 to-red-600', icon: '🎬', desc: 'The Core Script Analyzer' },
        { id: 'SHOOT', title: 'Shooting Commander', color: 'from-blue-600 to-cyan-600', icon: '🎥', desc: 'Call Sheets & Live Schedule' },
        { id: 'ROI', title: 'Audience & ROI', color: 'from-purple-600 to-violet-600', icon: '📈', desc: 'Hit Probability & Predictions' },
        { id: 'LEGAL', title: 'Legal & Compliance', color: 'from-red-700 to-rose-700', icon: '⚖️', desc: 'Censor Board & Contracts' },
        { id: 'MEM', title: 'Decision Memory', color: 'from-zinc-600 to-gray-600', icon: '🧠', desc: 'Production Log & Recall' },
    ];

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const processFile = (file: File) => {
        // Reset previous script to ensure change detection
        setIngestedScript(null);

        const reader = new FileReader();

        reader.onload = (event) => {
            const text = event.target?.result as string;

            // 1. PDF Gate
            if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
                if (text.substring(0, 10).includes("PDF")) {
                    setIngestedScript(`[PDF DETECTED: ${file.name}]\n\n⚠️ PARTIAL DATA WARNING ⚠️\n\nBrowsers cannot natively read PDF text perfectly. We have extracted what we can, but formatting may be lost.\n\nFOR BEST RESULTS:\nSave your script as .TXT or .FOUNTAIN and upload again.`);
                } else {
                    setIngestedScript(text); // Try as text anyway
                }
            }
            // 2. Word Doc Gate (CRITICAL FIX)
            else if (file.name.toLowerCase().endsWith(".docx") || file.name.toLowerCase().endsWith(".doc")) {
                setIngestedScript(`[WORD DOCUMENT DETECTED: ${file.name}]\n\n❌ UNREADABLE FORMAT ❌\n\nMicrosoft Word files (.docx) are binary encrypted files. This system reads RAW TEXT.\n\nPLEASE ACTION:\n1. Open ${file.name} in Word.\n2. Click 'File' > 'Save As'.\n3. Select 'Plain Text (*.txt)'.\n4. Upload the new .txt file here.\n\n(Alternatively: Copy/Paste the text directly)`);
            }
            // 3. Binary Garbage Gate (Fallback)
            else if (text.startsWith("PK") || text.includes("\0")) {
                setIngestedScript(`[BINARY FILE DETECTED: ${file.name}]\n\nThis file appears to be a binary image or archive.\nPlease upload a TEXT based script (.txt, .md, .fountain).`);
            }
            // 4. Success
            else {
                setIngestedScript(text);
            }

            simulateIngest(file.name);
        };

        reader.onerror = () => {
            setIngestedScript(`[ERROR READING FILE: ${file.name}]\nBrowser permission denied or file corrupted.`);
            simulateIngest(file.name);
        };

        reader.readAsText(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const simulateIngest = (fileName: string) => {
        setProcessingFile(fileName);
        setTimeout(() => {
            setProcessingFile(null);
            setActiveModule('RISK');
        }, 1500);
    };

    return (
        <div className="min-h-screen text-white font-sans selection:bg-amber-500 selection:text-black relative overflow-hidden"
            style={{
                background: 'radial-gradient(at 0% 0%, rgba(245, 158, 11, 0.4) 0px, transparent 50%), radial-gradient(at 98% 1%, rgba(16, 185, 129, 0.4) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(239, 68, 68, 0.4) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.4) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(253, 16%, 15%, 1) 0, transparent 50%), #000'
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Ambient Background Elements */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay z-0" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[100px] animate-float z-0" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] animate-float z-0" style={{ animationDelay: '2s' }} />

            {/* Drag Overlay */}
            {isDragging && (
                <div className="absolute inset-0 z-50 bg-amber-500/90 flex flex-col items-center justify-center animate-fade-in backdrop-blur-sm">
                    <div className="text-8xl mb-6 animate-bounce">📂</div>
                    <h2 className="text-4xl font-black text-black uppercase tracking-widest">Drop to Ingest</h2>
                    <p className="text-black font-bold mt-4">Supporting: PDF Scripts, MP4 Dailies, JPG Storyboards</p>
                </div>
            )}

            {/* Processing Overlay */}
            {processingFile && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
                    <div className="w-24 h-24 border-4 border-zinc-800 border-t-amber-500 rounded-full animate-spin mb-8" />
                    <h2 className="text-2xl font-serif text-white mb-2">Analyzing <span className="text-amber-500">{processingFile}</span>...</h2>
                    <div className="flex flex-col gap-2 text-zinc-500 text-xs font-mono uppercase tracking-widest text-center">
                        <span className="animate-pulse">Extracting Scene Metadata...</span>
                        <span className="animate-pulse delay-75">Checking Censor Compliance...</span>
                        <span className="animate-pulse delay-150">Calculating Budget Impact...</span>
                    </div>
                </div>
            )}

            {activeModule ? (
                // Focused Module View (The "Opened Card")
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl animate-fade-in flex flex-col">
                    {/* Top Bar */}
                    <div className="h-16 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between px-6 shrink-0">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                            <span className="text-zinc-600">Module</span>
                            <span className="text-zinc-700">/</span>
                            <span className="text-amber-500">{modules.find(m => m.id === activeModule)?.title}</span>
                        </div>

                        <button
                            onClick={() => setActiveModule(null)}
                            className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800 hover:border-zinc-700"
                        >
                            <span>✕ Close Module</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto relative">
                        {activeModule === 'RISK' && <RiskDashboard onAnalysisUpdate={updateSharedAnalysis} initialScript={ingestedScript} />}
                        {activeModule === 'EXEC' && <ExecutiveDashboard analysisData={sharedAnalysis} />}
                        {activeModule === 'SHOOT' && <ShootingCommander scriptData={sharedAnalysis} />}
                        {activeModule === 'ROI' && <ROIPredictor />}
                        {activeModule === 'LEGAL' && <LegalIntel analysisData={sharedAnalysis} />}
                        {activeModule === 'MEM' && <DecisionMemory />}
                    </div>
                </div>
            ) : (
                // The Hub (Netflix Grid)
                <div className="relative z-10 p-10 max-w-7xl mx-auto">
                    <header className="mb-16 text-center">
                        <h1 className="text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-t from-white to-zinc-500 mb-4 tracking-tight">
                            Continuity <span className="text-amber-500">Guard</span>
                        </h1>
                        <p className="text-zinc-500 uppercase tracking-[0.3em] text-sm">The Tollywood edition</p>
                    </header>

                    {/* Quick Ingest Bar */}
                    <div
                        className="mb-16 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm flex items-center justify-between group hover:border-amber-500/50 hover:bg-zinc-900 transition-all cursor-pointer shadow-lg hover:shadow-amber-900/10"
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={handleFileInput}
                        />
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform text-zinc-400 group-hover:text-amber-500">📂</div>
                            <div>
                                <h3 className="text-lg font-bold text-zinc-200 group-hover:text-white transition-colors">Universal Ingest</h3>
                                <p className="text-zinc-500 text-xs uppercase tracking-wider group-hover:text-zinc-400">Drag Scripts, Videos, or Schedules here</p>
                            </div>
                        </div>
                        <span className="text-zinc-600 font-mono text-xs group-hover:text-amber-500/50 transition-colors">SUPPORTED: PDF, FDX, MP4, JPG</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                        {modules.map((mod, index) => (
                            <div
                                key={mod.id}
                                onClick={() => setActiveModule(mod.id as ModuleType)}
                                style={{ animationDelay: `${index * 100}ms` }}
                                className="group relative aspect-[4/5] glass-card rounded-2xl overflow-hidden cursor-pointer hover:border-amber-500/50 hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)] hover:-translate-y-2 animate-slide-up"
                            >
                                {/* Animated Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${mod.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 ease-out`} />

                                {/* Noise Texture */}
                                <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />

                                <div className="absolute inset-0 p-8 flex flex-col relative z-10">
                                    {/* Icon with Glow */}
                                    <div className="mb-auto transform transition-all duration-500 ease-out group-hover:scale-110 group-hover:translate-x-2">
                                        <div className="text-5xl filter drop-shadow-lg opacity-80 group-hover:opacity-100">{mod.icon}</div>
                                    </div>

                                    {/* Content */}
                                    <div className="transform transition-transform duration-500 group-hover:-translate-y-1">
                                        <h2 className="text-3xl font-serif font-bold text-white mb-3 leading-none tracking-tight group-hover:text-amber-400 transition-colors">
                                            {mod.title}
                                        </h2>
                                        <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500">
                                            <p className="text-zinc-400 text-sm font-medium leading-relaxed translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                                                {mod.desc}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Decorative Line */}
                                    <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${mod.color} w-0 group-hover:w-full transition-all duration-700 ease-in-out opacity-70`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
