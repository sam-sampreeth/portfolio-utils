import { useState } from "react";
import { ImageIcon, Download, Trash, Sparkles, Loader2, Settings2, BarChart3, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AnimatePresence, motion } from "framer-motion";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";

export function ImageCompress() {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [compressedFile, setCompressedFile] = useState<Blob | null>(null);
    const [originalPreview, setOriginalPreview] = useState<string>("");
    const [compressedPreview, setCompressedPreview] = useState<string>("");
    const [quality, setQuality] = useState(80);
    const [maxWidth, setMaxWidth] = useState(1920);
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressionRatio, setCompressionRatio] = useState<number | null>(null);
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);

    const handleFileUpload = async (files: File[]) => {
        const file = files[0];
        if (!file || !file.type.startsWith('image/')) {
            toast.error("Please upload an image file");
            return;
        }

        setOriginalFile(file);
        setCompressedFile(null);
        setCompressionRatio(null);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setOriginalPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Auto-compress
        await compressImage(file);
    };

    const compressImage = async (file: File) => {
        setIsCompressing(true);
        try {
            const options = {
                maxSizeMB: 10,
                maxWidthOrHeight: maxWidth,
                useWebWorker: true,
                quality: quality / 100,
            };

            const compressed = await imageCompression(file, options);
            setCompressedFile(compressed);

            // Create compressed preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setCompressedPreview(e.target?.result as string);
            };
            reader.readAsDataURL(compressed);

            // Calculate compression ratio
            const ratio = ((1 - compressed.size / file.size) * 100).toFixed(1);
            setCompressionRatio(parseFloat(ratio));

            toast.success(`Compressed by ${ratio}%`);
        } catch (error) {
            toast.error("Compression failed");
            console.error(error);
        } finally {
            setIsCompressing(false);
        }
    };

    const saveFile = (filename: string) => {
        if (!compressedFile || !originalFile) return;

        const ext = originalFile.name.split('.').pop() || 'jpg';
        const finalFilename = `${filename}.${ext}`;

        const url = URL.createObjectURL(compressedFile);
        const a = document.createElement("a");
        a.href = url;
        a.download = finalFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setShowDownloadDialog(false);
        toast.success("Downloaded!");
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
    };

    const reset = () => {
        setOriginalFile(null);
        setCompressedFile(null);
        setOriginalPreview("");
        setCompressedPreview("");
        setCompressionRatio(null);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                <ImageIcon className="w-6 h-6 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                Image Compressor
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Reduce file size intelligently while maintaining visual quality.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                        <span>100% Client-Side</span>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {!originalFile ? (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group relative overflow-hidden rounded-[2rem] bg-slate-900/50 border border-slate-800 transition-all hover:border-blue-500/30 hover:bg-slate-900/80 p-8"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                                <FileUpload
                                    onChange={handleFileUpload}
                                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] }}
                                    label="Drop image here to compress"
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="workspace"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            {/* Sidebar Controls */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="p-6 rounded-[2rem] bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl sticky top-8">
                                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-6">
                                        <Settings2 className="w-5 h-5 text-blue-500" />
                                        Configuration
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500">
                                                    <Label>Quality</Label>
                                                    <span className="text-blue-400">{quality}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="10"
                                                    max="100"
                                                    value={quality}
                                                    onChange={(e) => setQuality(parseInt(e.target.value))}
                                                    onMouseUp={() => originalFile && compressImage(originalFile)}
                                                    onTouchEnd={() => originalFile && compressImage(originalFile)}
                                                    className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500">
                                                    <Label>Max Width</Label>
                                                    <span className="text-blue-400">{maxWidth}px</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="640"
                                                    max="3840"
                                                    step="320"
                                                    value={maxWidth}
                                                    onChange={(e) => setMaxWidth(parseInt(e.target.value))}
                                                    onMouseUp={() => originalFile && compressImage(originalFile)}
                                                    onTouchEnd={() => originalFile && compressImage(originalFile)}
                                                    className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                                            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                                <span className="text-xs font-medium text-slate-500">Original Size</span>
                                                <span className="text-sm font-bold text-white">{formatFileSize(originalFile.size)}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                                <span className="text-xs font-medium text-slate-500">New Size</span>
                                                <span className="text-sm font-bold text-blue-400">{isCompressing ? "..." : formatFileSize(compressedFile?.size || 0)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-medium text-slate-500">Saved</span>
                                                <span className="text-sm font-bold text-emerald-400">{compressionRatio ? `${compressionRatio}%` : "-"}</span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={reset}
                                            className="w-full border-slate-800 hover:bg-slate-800 text-slate-400"
                                        >
                                            Change Image
                                        </Button>

                                        <div className="pt-4 border-t border-slate-800">
                                            <Button
                                                onClick={() => setShowDownloadDialog(true)}
                                                disabled={!compressedFile || isCompressing}
                                                className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                                            >
                                                {isCompressing ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span>Download</span>
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Preview */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="p-8 rounded-[2.5rem] bg-slate-900/50 border border-slate-800 min-h-[500px] flex flex-col gap-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full relative z-10">
                                        <div className="flex flex-col gap-3">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 text-center">Original</h4>
                                            <div className="flex-1 bg-slate-950/50 rounded-2xl border border-slate-800 flex items-center justify-center p-4 overflow-hidden">
                                                <img src={originalPreview} className="max-w-full max-h-[400px] object-contain opacity-50 contrast-75" alt="original" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 text-center">Compressed Result</h4>
                                            <div className="flex-1 bg-slate-950 rounded-2xl border border-blue-500/20 flex items-center justify-center p-4 overflow-hidden shadow-2xl relative">
                                                {isCompressing ? (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                                        <span className="text-xs uppercase font-bold text-slate-500">Optimizing...</span>
                                                    </div>
                                                ) : (
                                                    <img src={compressedPreview} className="max-w-full max-h-[400px] object-contain" alt="compressed" />
                                                )}

                                                {!isCompressing && compressedFile && (
                                                    <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                                                        OPTIMIZED
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <DownloadConfirmDialog
                    isOpen={showDownloadDialog}
                    onClose={() => setShowDownloadDialog(false)}
                    onConfirm={saveFile}
                    defaultFileName={originalFile ? `compressed-${originalFile.name.replace(/\.[^/.]+$/, "")}` : "compressed-image"}
                    extension={originalFile?.name.split('.').pop() || 'jpg'}
                    isProcessing={false}
                    title="Save Compressed Image"
                    description={`Save the optimized version of your image.`}
                />
            </div>
        </div>
    );
}
