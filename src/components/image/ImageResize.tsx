import { useState } from "react";
import { Maximize2, Sparkles, Link as LinkIcon, Unlink, Settings2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatePresence, motion } from "framer-motion";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";

export function ImageResize() {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
    const [originalPreview, setOriginalPreview] = useState<string>("");
    const [resizedPreview, setResizedPreview] = useState<string>("");

    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);
    const [originalWidth, setOriginalWidth] = useState<number>(0);
    const [originalHeight, setOriginalHeight] = useState<number>(0);
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

    const [isResizing, setIsResizing] = useState(false);
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);

    const handleFileUpload = (files: File[]) => {
        const file = files[0];
        if (!file || !file.type.startsWith('image/')) {
            toast.error("Please upload an image file");
            return;
        }

        setOriginalFile(file);
        setResizedBlob(null);

        const img = new Image();
        img.onload = () => {
            setOriginalWidth(img.width);
            setOriginalHeight(img.height);
            setWidth(img.width);
            setHeight(img.height);
            setOriginalPreview(img.src);
            autoResize(img, img.width, img.height);
        };
        img.src = URL.createObjectURL(file);
    };

    const autoResize = (img: HTMLImageElement, w: number, h: number) => {
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => {
            if (blob) {
                setResizedBlob(blob);
                setResizedPreview(canvas.toDataURL(originalFile?.type || "image/png"));
            }
        }, originalFile?.type || "image/png");
    };

    const handleWidthChange = (val: number) => {
        setWidth(val);
        if (maintainAspectRatio && originalWidth > 0) {
            setHeight(Math.round((val / originalWidth) * originalHeight));
        }
    };

    const handleHeightChange = (val: number) => {
        setHeight(val);
        if (maintainAspectRatio && originalHeight > 0) {
            setWidth(Math.round((val / originalHeight) * originalWidth));
        }
    };

    const applyResize = () => {
        if (!originalFile || width <= 0 || height <= 0) return;
        setIsResizing(true);

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                if (blob) {
                    setResizedBlob(blob);
                    setResizedPreview(canvas.toDataURL(originalFile.type));
                    toast.success(`Resized to ${width}x${height}`);
                }
                setIsResizing(false);
            }, originalFile.type);
        };
        img.src = originalPreview;
    };

    const saveFile = (filename: string) => {
        if (!resizedBlob || !originalFile) return;
        const ext = originalFile.name.split('.').pop() || 'png';
        const finalFilename = `${filename}.${ext}`;

        const url = URL.createObjectURL(resizedBlob);
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
        setResizedBlob(null);
        setOriginalPreview("");
        setResizedPreview("");
        setWidth(0);
        setHeight(0);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                <Maximize2 className="w-6 h-6 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                Image Resizer
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Change image dimensions pixel-perfectly without losing quality.
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
                                    label="Drop image here to resize"
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
                                        Dimensions
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Width (px)</Label>
                                                <Input
                                                    type="number"
                                                    value={width}
                                                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                                                    className="bg-slate-950 border-slate-800 h-10 font-bold text-slate-200 focus:ring-blue-500/30 text-center"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Height (px)</Label>
                                                <Input
                                                    type="number"
                                                    value={height}
                                                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                                                    className="bg-slate-950 border-slate-800 h-10 font-bold text-slate-200 focus:ring-blue-500/30 text-center"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Maintain Aspect Ratio</Label>
                                            <button
                                                onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                                                className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-all ${maintainAspectRatio ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-900 border-slate-700 text-slate-600"}`}
                                                title="Toggle Aspect Ratio Lock"
                                            >
                                                {maintainAspectRatio ? <LinkIcon size={16} /> : <Unlink size={16} />}
                                            </button>
                                        </div>

                                        <Button
                                            onClick={applyResize}
                                            disabled={isResizing}
                                            variant="secondary"
                                            className="w-full h-12 font-bold rounded-xl border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
                                        >
                                            Apply Resize
                                        </Button>

                                        <div className="pt-4 border-t border-slate-800 flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={reset}
                                                className="flex-1 border-slate-800 hover:bg-slate-800 text-slate-400"
                                            >
                                                Close
                                            </Button>

                                            <Button
                                                onClick={() => setShowDownloadDialog(true)}
                                                disabled={!resizedBlob || isResizing}
                                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black border-0 shadow-lg shadow-blue-500/20"
                                            >
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Preview */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="p-8 rounded-[2.5rem] bg-slate-900/50 border border-slate-800 min-h-[500px] flex flex-col gap-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />

                                    <div className="flex justify-between items-center z-10 relative">
                                        <div className="flex gap-4">
                                            <div>
                                                <span className="block text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Original</span>
                                                <span className="text-sm font-bold text-slate-300 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">{originalWidth} x {originalHeight}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] uppercase font-black tracking-widest text-blue-500 mb-1">Target</span>
                                                <span className="text-sm font-bold text-blue-300 bg-blue-950/30 px-3 py-1 rounded-lg border border-blue-500/30">{width} x {height}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-4 overflow-hidden shadow-2xl relative z-10 h-[400px]">
                                        {isResizing ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                                <span className="text-xs uppercase font-bold text-slate-500">Resizing...</span>
                                            </div>
                                        ) : resizedPreview ? (
                                            <img src={resizedPreview} className="max-w-full max-h-full object-contain" alt="resized" />
                                        ) : (
                                            <img src={originalPreview} className="max-w-full max-h-full object-contain" alt="original" />
                                        )}

                                        {!isResizing && resizedBlob && (
                                            <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                                                RESIZED
                                            </div>
                                        )}
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
                    defaultFileName={originalFile ? originalFile.name.split('.')[0] + "-resized" : "resized-image"}
                    extension={originalFile?.name.split('.').pop() || 'png'}
                    isProcessing={false}
                    title="Save Resized Image"
                    description={`Save image as ${width}x${height}px.`}
                />
            </div>
        </div>
    );
}
