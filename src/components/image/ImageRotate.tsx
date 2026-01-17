import { useState } from "react";
import { RotateCw, Download, Trash, Sparkles, Undo2, Redo2, Settings2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";

export function ImageRotate() {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [rotatedBlob, setRotatedBlob] = useState<Blob | null>(null);
    const [originalPreview, setOriginalPreview] = useState<string>("");
    const [rotatedPreview, setRotatedPreview] = useState<string>("");

    const [rotation, setRotation] = useState(0);
    const [isRotating, setIsRotating] = useState(false);
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);

    const handleFileUpload = (files: File[]) => {
        const file = files[0];
        if (!file || !file.type.startsWith('image/')) {
            toast.error("Please upload an image file");
            return;
        }

        setOriginalFile(file);
        setRotatedBlob(null);
        setRotation(0);

        const reader = new FileReader();
        reader.onload = (e) => {
            setOriginalPreview(e.target?.result as string);
            setRotatedPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const rotateImage = (degrees: number) => {
        if (!originalFile || !originalPreview) return;
        setIsRotating(true);

        const newRotation = (rotation + degrees) % 360;
        setRotation(newRotation);

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Calculate new canvas size for non-90 deg rotations (though we stick to 90/180/270/360)
            const rads = (newRotation * Math.PI) / 180;
            const width = Math.abs(Math.cos(rads) * img.width) + Math.abs(Math.sin(rads) * img.height);
            const height = Math.abs(Math.sin(rads) * img.width) + Math.abs(Math.cos(rads) * img.height);

            canvas.width = width;
            canvas.height = height;

            // Move origin to center
            ctx.translate(width / 2, height / 2);
            ctx.rotate(rads);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);

            canvas.toBlob((blob) => {
                if (blob) {
                    setRotatedBlob(blob);
                    setRotatedPreview(canvas.toDataURL(originalFile.type));
                }
                setIsRotating(false);
            }, originalFile.type);
        };
        img.src = originalPreview;
    };

    const saveFile = (filename: string) => {
        if (!rotatedBlob || !originalFile) return;
        const ext = originalFile.name.split('.').pop() || 'png';
        const finalFilename = `${filename}.${ext}`;

        const url = URL.createObjectURL(rotatedBlob);
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
        setRotatedBlob(null);
        setOriginalPreview("");
        setRotatedPreview("");
        setRotation(0);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                <RotateCw className="w-6 h-6 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                Image Rotator
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Correct orientation or create artistic angles instantly.
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
                                    label="Drop image here to rotate"
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
                                        Rotation Controls
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-3">
                                            <Button
                                                onClick={() => rotateImage(-90)}
                                                variant="outline"
                                                className="h-14 bg-slate-950 border-slate-800 hover:bg-slate-800 hover:text-white text-slate-300 font-bold rounded-xl flex items-center justify-between px-6"
                                            >
                                                <span>Rotate Left</span>
                                                <Undo2 className="w-5 h-5 text-blue-400" />
                                            </Button>

                                            <Button
                                                onClick={() => rotateImage(90)}
                                                variant="outline"
                                                className="h-14 bg-slate-950 border-slate-800 hover:bg-slate-800 hover:text-white text-slate-300 font-bold rounded-xl flex items-center justify-between px-6"
                                            >
                                                <span>Rotate Right</span>
                                                <Redo2 className="w-5 h-5 text-blue-400" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Angle</span>
                                            <div className="flex items-center gap-2 text-blue-400 font-bold">
                                                <RotateCw className="w-4 h-4" />
                                                <span>{rotation}°</span>
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
                                                disabled={!rotatedBlob || isRotating}
                                                className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                                            >
                                                {isRotating ? (
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

                                    <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-8 overflow-hidden shadow-2xl relative z-10 h-[500px]">
                                        {isRotating ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                                <span className="text-xs uppercase font-bold text-slate-500">Rotating...</span>
                                            </div>
                                        ) : rotatedPreview ? (
                                            <img
                                                src={rotatedPreview}
                                                className="max-w-full max-h-full object-contain transition-all duration-300 ease-in-out"
                                                alt="rotated"
                                            />
                                        ) : (
                                            <img src={originalPreview} className="max-w-full max-h-full object-contain" alt="original" />
                                        )}

                                        {!isRotating && rotatedBlob && rotation !== 0 && (
                                            <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
                                                <RotateCw className="w-3 h-3" /> {rotation}°
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
                    defaultFileName={originalFile ? `rotated-${rotation}-${originalFile.name.replace(/\.[^/.]+$/, "")}` : "rotated-image"}
                    extension={originalFile?.name.split('.').pop() || 'png'}
                    isProcessing={false}
                    title="Save Rotated Image"
                    description={`Save image with ${rotation}° rotation.`}
                />
            </div>
        </div>
    );
}
