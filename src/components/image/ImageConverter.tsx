import { useState } from "react";
import { RefreshCw, Download, Trash, Sparkles, FileType, CheckCircle2, ArrowRight, Settings2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";

export function ImageConverter() {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
    const [originalPreview, setOriginalPreview] = useState<string>("");
    const [convertedPreview, setConvertedPreview] = useState<string>("");

    const [targetFormat, setTargetFormat] = useState("image/png");
    const [isConverting, setIsConverting] = useState(false);
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);

    const handleFileUpload = (files: File[]) => {
        const file = files[0];
        if (!file || !file.type.startsWith('image/')) {
            toast.error("Please upload an image file");
            return;
        }

        setOriginalFile(file);
        setConvertedBlob(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            setOriginalPreview(e.target?.result as string);
            // Auto-convert to current target format
            autoConvert(e.target?.result as string, targetFormat);
        };
        reader.readAsDataURL(file);
    };

    const autoConvert = (src: string, format: string) => {
        setIsConverting(true);
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Fill white background for transparent images converting to JPEG
            if (format === 'image/jpeg') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) {
                    setConvertedBlob(blob);
                    setConvertedPreview(canvas.toDataURL(format));
                }
                setIsConverting(false);
            }, format);
        };
        img.src = src;
    };

    const handleFormatChange = (newFormat: string) => {
        setTargetFormat(newFormat);
        if (originalPreview) {
            autoConvert(originalPreview, newFormat);
        }
    };

    const saveFile = (filename: string) => {
        if (!convertedBlob || !originalFile) return;
        const ext = targetFormat.split('/')[1].replace('x-icon', 'ico');
        const finalFilename = `${filename}.${ext}`;

        const url = URL.createObjectURL(convertedBlob);
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

    const reset = () => {
        setOriginalFile(null);
        setConvertedBlob(null);
        setOriginalPreview("");
        setConvertedPreview("");
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                <RefreshCw className="w-6 h-6 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                Image Converter
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Convert images to PNG, JPG, WEBP, or ICO instantly.
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
                                    label="Drop image here to convert"
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
                                        Conversion
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Format</Label>
                                                <Select value={targetFormat} onValueChange={handleFormatChange}>
                                                    <SelectTrigger className="w-full h-12 bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:ring-blue-500/30">
                                                        <SelectValue placeholder="Select format" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-950 border-slate-800 text-slate-300">
                                                        <SelectItem value="image/png">PNG</SelectItem>
                                                        <SelectItem value="image/jpeg">JPG</SelectItem>
                                                        <SelectItem value="image/webp">WEBP</SelectItem>
                                                        <SelectItem value="image/x-icon">ICO</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                                                <FileType className="w-5 h-5 text-slate-500" />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Source Format</span>
                                                    <span className="text-sm font-bold text-slate-300">{originalFile.type.split('/')[1].toUpperCase()}</span>
                                                </div>
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
                                                disabled={!convertedBlob || isConverting}
                                                className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                                            >
                                                {isConverting ? (
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
                                            <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 text-center">Converted Result</h4>
                                            <div className="flex-1 bg-slate-950 rounded-2xl border border-blue-500/20 flex items-center justify-center p-4 overflow-hidden shadow-2xl relative">
                                                {isConverting ? (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                                        <span className="text-xs uppercase font-bold text-slate-500">Converting...</span>
                                                    </div>
                                                ) : (
                                                    <img src={convertedPreview} className="max-w-full max-h-[400px] object-contain" alt="converted" />
                                                )}

                                                {!isConverting && convertedBlob && (
                                                    <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                                                        {targetFormat.split('/')[1].toUpperCase()}
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
                    defaultFileName={originalFile ? `converted-${originalFile.name.replace(/\.[^/.]+$/, "")}` : "converted-image"}
                    extension={targetFormat.split('/')[1].replace('x-icon', 'ico')}
                    isProcessing={false}
                    title="Save Converted Image"
                    description={`Save the image in ${targetFormat.split('/')[1].toUpperCase()} format.`}
                />
            </div>
        </div>
    );
}
