import { useState } from "react";
import { Copy, Download, ZoomIn, ZoomOut, RotateCcw, Sun, Moon, Trash2, Code2 } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import toast from "react-hot-toast";

export function SvgViewer() {
    const [svgContent, setSvgContent] = useState<string>("");
    const [zoom, setZoom] = useState(1);
    const [bgTheme, setBgTheme] = useState<'dark' | 'light'>('dark');

    const handleFileUpload = (files: File[]) => {
        const file = files[0];
        if (file && file.type === "image/svg+xml") {
            const reader = new FileReader();
            reader.onload = (e) => setSvgContent(e.target?.result as string);
            reader.readAsText(file);
        } else {
            toast.error("Please upload a valid SVG file");
        }
    };



    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text.trim().toLowerCase().includes("<svg") && text.trim().toLowerCase().includes("</svg>")) {
                setSvgContent(text);
                toast.success("SVG pasted from clipboard");
            } else {
                toast.error("Clipboard does not contain valid SVG code");
            }
        } catch (err) {
            toast.error("Failed to read clipboard");
        }
    };

    const downloadSvg = () => {
        if (!svgContent) return;
        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "optimized.svg";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <Code2 size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">SVG Viewer</h2>
                    <p className="text-white/50 font-medium">View, Inspect, and Optimize SVG files</p>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
                {/* Left Panel: Preview */}
                <div className="flex flex-col gap-4">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-1">
                            <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"><ZoomOut size={16} /></button>
                            <span className="text-xs font-mono text-white/40 w-12 text-center">{Math.round(zoom * 100)}%</span>
                            <button onClick={() => setZoom(z => Math.min(5, z + 0.1))} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"><ZoomIn size={16} /></button>
                            <button onClick={() => setZoom(1)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors ml-2" title="Reset Zoom"><RotateCcw size={16} /></button>
                        </div>
                    </div>

                    {/* Canvas */}
                    <div
                        className={`flex-1 min-h-[400px] rounded-[2.5rem] border border-white/10 relative overflow-hidden flex items-center justify-center transition-colors duration-300
                            ${bgTheme === 'dark'
                                ? 'bg-[#0a0a0a] [background-image:radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px]'
                                : 'bg-[#e5e7eb] [background-image:radial-gradient(#00000008_1px,transparent_1px)] [background-size:20px_20px]'
                            }`}
                    >
                        {/* Theme Toggle Overlay */}
                        {svgContent && (
                            <div className="absolute top-6 right-6 flex gap-2 z-20">
                                <button
                                    onClick={() => setBgTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                                    className={`p-3 rounded-xl border transition-all duration-300 ${bgTheme === 'dark'
                                        ? 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                                        : 'bg-white/60 border-black/5 text-black/60 hover:text-black hover:bg-white'
                                        }`}
                                    title="Toggle Background Theme"
                                >
                                    {bgTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                                </button>
                                <button
                                    onClick={() => setSvgContent("")}
                                    className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl transition-colors"
                                    title="Clear SVG"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        )}
                        {!svgContent ? (
                            <div className="w-full h-full flex items-center justify-center p-6">
                                <div className="w-full max-w-sm px-6">
                                    <FileUpload
                                        onChange={handleFileUpload}
                                        accept={{ "image/svg+xml": [".svg"] }}
                                    />
                                    <div className="my-6 flex items-center gap-4">
                                        <div className="h-px bg-white/10 flex-1" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">OR</span>
                                        <div className="h-px bg-white/10 flex-1" />
                                    </div>
                                    <button
                                        onClick={handlePaste}
                                        className="w-full py-4 rounded-xl border border-dashed border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 text-white/40 hover:text-blue-400 transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 group"
                                    >
                                        <Copy size={16} className="group-hover:scale-110 transition-transform" />
                                        Paste SVG Code from Clipboard
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                style={{ transform: `scale(${zoom})`, transition: 'transform 0.1s ease-out' }}
                                className="w-full h-full flex items-center justify-center p-8"
                                dangerouslySetInnerHTML={{ __html: svgContent }}
                            />
                        )}
                    </div>
                </div>

                {/* Right Panel: Code */}
                <div className="flex flex-col gap-4 h-full min-h-[400px] lg:min-h-auto">
                    <div className="flex items-center justify-between p-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-white/60">Source Code</span>
                        <div className="flex gap-2">
                            <button
                                onClick={downloadSvg}
                                disabled={!svgContent}
                                className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Download"
                            >
                                <Download size={16} />
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(svgContent);
                                    toast.success("Code copied!");
                                }}
                                disabled={!svgContent}
                                className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Copy Code"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 bg-gradient-to-br from-blue-900/20 via-black/40 to-blue-900/20 rounded-3xl border border-white/20 overflow-hidden relative group h-full shadow-2xl">
                        <textarea
                            value={svgContent}
                            onChange={(e) => setSvgContent(e.target.value)}
                            className="w-full h-full bg-transparent p-6 font-mono text-xs text-blue-300 resize-none focus:outline-none"
                            placeholder="<!-- SVG code will appear here -->"
                            spellCheck={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
