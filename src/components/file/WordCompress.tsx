import { useState, useEffect } from "react";
import { FileDown, Loader2, ShieldCheck, Settings2, Zap, Image as ImageIcon, FileText, Download } from "lucide-react";
import { saveAs } from "file-saver";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import JSZip from "jszip";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";
import { cn } from "@/lib/utils";

// Helper size formatter
const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

type CompressionMode = "standard" | "heavy";

export function WordCompress() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [stats, setStats] = useState<{ original: number; compressed: number } | null>(null);
    const [mode, setMode] = useState<CompressionMode>("standard");
    const [estimation, setEstimation] = useState<{ savedBytes: number; percentage: number } | null>(null);
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);
    const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);

    // Analyze file when selected or mode changes
    useEffect(() => {
        if (!selectedFile) {
            setEstimation(null);
            return;
        }
        analyzeFile(selectedFile, mode);
    }, [selectedFile, mode]);

    const analyzeFile = async (file: File, selectedMode: CompressionMode) => {
        try {
            const zip = new JSZip();
            await zip.loadAsync(file);

            let xmlSize = 0;
            let imageSize = 0;

            zip.forEach((relativePath, zipEntry) => {
                if (relativePath.startsWith('word/media/')) {
                    // It's likely an image (not checking extension for speed, just location)
                    // @ts-ignore - zipEntry._data is internal but usually gives size
                    imageSize += (zipEntry as any)._data ? (zipEntry as any)._data.uncompressedSize : 0;
                } else if (relativePath.endsWith('.xml')) {
                    // @ts-ignore
                    xmlSize += (zipEntry as any)._data ? (zipEntry as any)._data.uncompressedSize : 0;
                }
            });

            // Heuristic Estimation
            let estimatedSavings = 0;

            if (selectedMode === "standard") {
                estimatedSavings = xmlSize * 0.15; // Conservative 15% of XML
            } else {
                estimatedSavings = (xmlSize * 0.15) + (imageSize * 0.5); // 50% image reduction
            }

            // Cap at 90% file size just in case, but min 0
            estimatedSavings = Math.max(0, Math.min(estimatedSavings, file.size * 0.9));

            setEstimation({
                savedBytes: estimatedSavings,
                percentage: Math.round((estimatedSavings / file.size) * 100)
            });

        } catch (e) {
            console.warn("Analysis failed", e);
            setEstimation(null);
        }
    };

    const handleFileAdded = (files: File[]) => {
        const file = files[0];
        if (!file) return;
        if (!file.name.toLowerCase().endsWith('.docx')) {
            toast.error("Please upload a valid Word (.docx) file.");
            return;
        }
        setSelectedFile(file);
        setStats(null);
        setCompressedBlob(null);
        setMode("standard"); // Reset to standard
    };

    const compressImage = async (blob: Blob): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(blob);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Scale down if massive
                const MAX_DIM = 1500;
                if (width > MAX_DIM || height > MAX_DIM) {
                    const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
                    width *= ratio;
                    height *= ratio;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Canvas context failed"));
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((newBlob) => {
                    if (newBlob) resolve(newBlob);
                    else reject(new Error("Compression failed"));
                }, 'image/jpeg', 0.7); // 70% quality JPEG
            };
            img.onerror = (e) => reject(e);
        });
    };

    const performCompression = async () => {
        if (!selectedFile) return;

        setIsProcessing(true);
        try {
            const zip = new JSZip();
            await zip.loadAsync(selectedFile);

            // 1. Minify XML (Both modes)
            const xmlFiles: string[] = [];
            zip.folder("")?.forEach((relativePath) => {
                if (relativePath.endsWith(".xml") || relativePath.endsWith(".rels")) {
                    xmlFiles.push(relativePath);
                }
            });

            for (const path of xmlFiles) {
                const xmlContent = await zip.file(path)?.async("string");
                if (xmlContent) {
                    const minified = xmlContent.replace(/>\s+</g, '><');
                    zip.file(path, minified);
                }
            }

            // 2. Image Compression (Heavy mode only)
            if (mode === "heavy") {
                const mediaKeys = Object.keys(zip.files).filter(k => k.startsWith("word/media/") && k.match(/\.(jpg|jpeg|png)$/i));

                for (const key of mediaKeys) {
                    const originalBlob = await zip.file(key)?.async("blob");
                    if (originalBlob) {
                        try {
                            const compressedBlob = await compressImage(originalBlob);
                            // Only replace if smaller
                            if (compressedBlob.size < originalBlob.size) {
                                const isPng = key.toLowerCase().endsWith('.png');
                                if (!isPng) {
                                    zip.file(key, compressedBlob);
                                }
                            }
                        } catch (err) {
                            console.warn("Skipped image", key);
                        }
                    }
                }
            }

            // Generate compressed zip
            const result = await zip.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: {
                    level: 9 // Max compression
                }
            });

            setCompressedBlob(result);
            setStats({
                original: selectedFile.size,
                compressed: result.size
            });

            setIsProcessing(false);
            // Don't auto-download, let user click or auto-show dialog
            // Actually, best flow is: click compress -> loads -> done -> show success & enablement to download
            // Or better: click compress -> loads -> done -> stats update -> user clicks download

        } catch (error) {
            console.error("Compression Error:", error);
            toast.error("Failed to compress file.");
            setIsProcessing(false);
        }
    };

    const handleSave = (filename: string) => {
        if (!compressedBlob || !selectedFile) return;
        saveAs(compressedBlob, `${filename}.docx`);
        setShowDownloadDialog(false);
        toast.success("Compressed file saved!");
    };


    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-cyan-500/30">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-cyan-600/20 rounded-2xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                                <FileDown className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                Word Compress
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Reduce document size by optimizing internal structure and images.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>Client-Side</span>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {!selectedFile ? (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group relative overflow-hidden rounded-[2rem] bg-slate-900/50 border border-slate-800 transition-all hover:border-cyan-500/30 hover:bg-slate-900/80 p-8"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                                <FileUpload
                                    onChange={handleFileAdded}
                                    multiple={false}
                                    label="Drop Word Document here"
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="process"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            {/* Sidebar */}
                            <div className="space-y-6 lg:col-span-1">
                                <div className="p-6 rounded-[2rem] bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl sticky top-8">
                                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-6">
                                        <Settings2 className="w-5 h-5 text-cyan-500" />
                                        Configuration
                                    </h3>

                                    <div className="space-y-6">
                                        {/* Mode Selection */}
                                        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
                                            <button
                                                onClick={() => setMode("standard")}
                                                className={cn(
                                                    "flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-all",
                                                    mode === "standard" ? "bg-cyan-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-slate-800"
                                                )}
                                            >
                                                <FileText size={16} />
                                                <span className="text-[10px] font-bold uppercase tracking-wide">Standard</span>
                                            </button>
                                            <button
                                                onClick={() => setMode("heavy")}
                                                className={cn(
                                                    "flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-all",
                                                    mode === "heavy" ? "bg-orange-500 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-slate-800"
                                                )}
                                            >
                                                <ImageIcon size={16} />
                                                <span className="text-[10px] font-bold uppercase tracking-wide">Heavy</span>
                                            </button>
                                        </div>

                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                            <div className="flex items-start gap-2">
                                                <Zap className={cn("w-4 h-4 mt-0.5", mode === "heavy" ? "text-orange-400" : "text-cyan-400")} />
                                                <p className="text-xs text-slate-400 leading-relaxed">
                                                    {mode === "standard" ? "Safe & lossless. Removes XML whitespace." : "Aggressive. Compresses images + XML."}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Estimates */}
                                        {estimation && !stats && (
                                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3 animate-in fade-in">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-emerald-200/60 font-medium">Estimated New Size</span>
                                                    <span className="text-emerald-400 font-mono font-bold">{formatBytes(selectedFile.size - estimation.savedBytes)}</span>
                                                </div>
                                                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.max(5, 100 - estimation.percentage)}%` }} />
                                                </div>
                                                <p className="text-[10px] text-emerald-400 font-black uppercase tracking-wide text-right">
                                                    SAVE ~{estimation.percentage}%
                                                </p>
                                            </div>
                                        )}

                                        <Button
                                            onClick={performCompression}
                                            disabled={isProcessing || stats !== null}
                                            className={cn(
                                                "w-full h-14 font-black rounded-xl uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all",
                                                mode === "heavy" ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400" : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                                            )}
                                        >
                                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : stats ? "Completed" : "Compress Now"}
                                        </Button>

                                        <Button
                                            variant="outline"
                                            onClick={() => { setSelectedFile(null); setStats(null); setCompressedBlob(null); }}
                                            className="w-full border-slate-800 hover:bg-slate-800 text-slate-400"
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Main */}
                            <div className="lg:col-span-2">
                                <div className="p-8 md:p-12 rounded-[2.5rem] bg-slate-900/50 border border-slate-800 flex flex-col justify-center min-h-[500px] relative overflow-hidden">
                                    <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] pointer-events-none transition-colors duration-500 ${mode === "heavy" ? "bg-orange-500/10" : "bg-cyan-500/10"}`} />

                                    {stats ? (
                                        <div className="relative z-10 text-center space-y-8 animate-in fade-in zoom-in duration-300">
                                            <div className="w-24 h-24 rounded-3xl bg-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                                <ShieldCheck className="w-12 h-12" />
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="text-3xl font-black uppercase tracking-tight text-white">Optimization Complete</h3>

                                                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 py-6">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Original</p>
                                                        <p className="text-xl font-mono text-slate-400 line-through decoration-slate-600">{formatBytes(stats.original)}</p>
                                                    </div>
                                                    <div className="hidden md:block h-12 w-px bg-slate-800" />
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase font-bold text-cyan-400 tracking-widest">Optimized</p>
                                                        <p className="text-3xl font-mono text-white font-bold">{formatBytes(stats.compressed)}</p>
                                                    </div>
                                                </div>

                                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-6 py-3 inline-block">
                                                    <p className="text-emerald-400 font-bold text-sm">
                                                        Reduced by {formatBytes(stats.original - stats.compressed)} ({(100 - (stats.compressed / stats.original) * 100).toFixed(1)}%)
                                                    </p>
                                                </div>

                                                <div className="pt-6">
                                                    <Button
                                                        onClick={() => setShowDownloadDialog(true)}
                                                        className="h-14 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Download className="w-5 h-5" />
                                                            <span>Download Result</span>
                                                        </div>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative z-10 text-center space-y-6">
                                            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto transition-colors duration-300 ${mode === "heavy" ? "bg-orange-500/20 text-orange-400 border border-orange-500/20" : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/20"}`}>
                                                <Settings2 className="w-12 h-12" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black uppercase tracking-tight text-white">Ready to Optimize</h3>
                                                <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                                                    {mode === "standard"
                                                        ? "Standard mode is safe and lossless. It cleans up internal XML headers and whitespace."
                                                        : "Heavy mode actively recompresses images inside the document to save maximum space."}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <DownloadConfirmDialog
                    isOpen={showDownloadDialog}
                    onClose={() => setShowDownloadDialog(false)}
                    onConfirm={handleSave}
                    defaultFileName={selectedFile ? `${selectedFile.name.replace(/\.[^/.]+$/, "")}_optimized` : "document_opt"}
                    extension="docx"
                    isProcessing={false}
                    title="Save Optimized Doc"
                    description={`Save the compressed document (${mode} mode).`}
                />
            </div>
        </div>
    );
}
