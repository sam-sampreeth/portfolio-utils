import { useState } from "react";
import { FileDown, Loader2, FileText, ShieldCheck, CheckCircle, ArrowRight, Settings2 } from "lucide-react";
import { saveAs } from "file-saver";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";

export function PdfCompress() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [originalSize, setOriginalSize] = useState(0);
    const [compressionLevel, setCompressionLevel] = useState<"standard" | "high">("standard");
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);

    const handleFileAdded = (files: File[]) => {
        const file = files[0];
        if (!file) return;
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
            toast.error("Please upload a valid PDF file.");
            return;
        }
        setSelectedFile(file);
        setOriginalSize(file.size);
    };

    const handleCompress = async (filename: string) => {
        if (!selectedFile) return;

        setIsProcessing(true);
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();

            // @ts-ignore
            const { default: loadQPDF } = await import("@neslinesli93/qpdf-wasm");

            const qpdf: any = await loadQPDF({
                locateFile: (path: string) => {
                    if (path.endsWith('.wasm')) {
                        return '/qpdf.wasm';
                    }
                    return path;
                }
            } as any);

            const inputFile = 'input.pdf';
            const outputFile = 'output.pdf';

            qpdf.FS.writeFile(inputFile, new Uint8Array(arrayBuffer));

            const flags = [
                '--linearize',
                '--object-streams=generate',
                inputFile,
                outputFile
            ];

            if (compressionLevel === 'high') {
                flags.splice(2, 0, '--stream-data=compress');
                flags.splice(2, 0, '--recompress-flate');
            }

            const exitCode = await qpdf.callMain(flags);

            if (exitCode !== 0) {
                throw new Error("Compression failed");
            }

            const compressedBytes = qpdf.FS.readFile(outputFile);
            const blob = new Blob([compressedBytes], { type: "application/pdf" });

            saveAs(blob, `${filename}.pdf`);

            const savedSize = (originalSize - blob.size) / 1024 / 1024;
            const savedPercent = ((1 - blob.size / originalSize) * 100).toFixed(0);

            if (blob.size < originalSize) {
                toast.success(`Compressed! Saved ${savedSize.toFixed(2)} MB (${savedPercent}%)`);
            } else {
                toast('File was already optimized.', { icon: '✨' });
            }

            // Cleanup
            try {
                qpdf.FS.unlink(inputFile);
                qpdf.FS.unlink(outputFile);
            } catch (e) { /* ignore */ }

            setShowDownloadDialog(false);

        } catch (error) {
            console.error("Compression Error:", error);
            toast.error("Failed to compress PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + ["B", "KB", "MB", "GB"][i];
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                <FileDown className="w-6 h-6 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                PDF Compress
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Reduce PDF file size securely. Choose "Standard" for documents or "Max" for image-heavy files.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>100% Client-Side Processing</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <AnimatePresence mode="wait">
                            {!selectedFile ? (
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group relative overflow-hidden rounded-[2rem] bg-slate-900/50 border border-slate-800 transition-all hover:border-blue-500/30 hover:bg-slate-900/80 p-8"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative">
                                        <FileUpload onChange={handleFileAdded} multiple={false} label="Drop PDF file here" />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="preview"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-8 md:p-12 rounded-[2.5rem] bg-slate-900/50 border border-slate-800 flex flex-col justify-center min-h-[400px] relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />
                                    <div className="relative z-10 text-center space-y-8">
                                        <div className="relative w-24 h-24 mx-auto">
                                            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                                            <div className="relative w-full h-full rounded-2xl bg-slate-950 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-2xl">
                                                <FileText className="w-10 h-10" />
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1.5 border-4 border-slate-900">
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-2xl font-black uppercase tracking-tight text-white">Ready to Compress</h3>
                                            <p className="text-slate-400 font-medium">{selectedFile.name}</p>
                                            <p className="text-slate-500 text-sm font-mono">{formatSize(originalSize)}</p>
                                        </div>
                                        <div className="pt-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => setSelectedFile(null)}
                                                className="border-slate-700 hover:bg-slate-800 text-slate-300"
                                            >
                                                Change File
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            <div className="p-6 rounded-[2rem] bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl">
                                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-6">
                                    <Settings2 className="w-5 h-5 text-blue-500" />
                                    Configuration
                                </h3>

                                <div className="space-y-6 mb-8">
                                    {/* Settings Form */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Compression Mode</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setCompressionLevel("standard")}
                                                className={`p-3 rounded-xl border text-sm font-bold transition-all ${compressionLevel === "standard"
                                                    ? "bg-blue-500/20 border-blue-500 text-blue-400"
                                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                                                    }`}
                                            >
                                                Standard
                                            </button>
                                            <button
                                                onClick={() => setCompressionLevel("high")}
                                                className={`p-3 rounded-xl border text-sm font-bold transition-all ${compressionLevel === "high"
                                                    ? "bg-blue-500/20 border-blue-500 text-blue-400"
                                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                                                    }`}
                                            >
                                                Max
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                                        <p className="text-[10px] uppercase font-black tracking-wider text-slate-500">Estimated New Size</p>
                                        <p className="text-lg font-bold text-emerald-400">
                                            {compressionLevel === 'standard'
                                                ? `~${formatSize(originalSize * 0.8)}`
                                                : `~${formatSize(originalSize * 0.4)}`}
                                        </p>
                                        <p className="text-[10px] text-slate-500 leading-tight px-2">
                                            {compressionLevel === 'standard'
                                                ? "Optimizes safe structures (~20% savings)."
                                                : "Aggressively recompresses (~60% savings)."}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setShowDownloadDialog(true)}
                                    disabled={!selectedFile || isProcessing}
                                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                                >
                                    {isProcessing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span>Compress Now</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <DownloadConfirmDialog
                    isOpen={showDownloadDialog}
                    onClose={() => setShowDownloadDialog(false)}
                    onConfirm={handleCompress}
                    defaultFileName={selectedFile?.name.replace('.pdf', '') + '-min' || "compressed"}
                    extension="pdf"
                    isProcessing={isProcessing}
                    title="Save Compressed PDF"
                    description="Enter a name for your optimized file."
                />
            </div>
        </div>
    );
}
