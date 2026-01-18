import { useState, useRef } from "react";
import { Crop as CropIcon, Sparkles, Settings2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";

export function ImageCrop() {
    const [imgSrc, setImgSrc] = useState("");
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [aspect, setAspect] = useState<number | undefined>(undefined);
    const imgRef = useRef<HTMLImageElement>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);

    const onSelectFile = (files: File[]) => {
        const file = files[0];
        if (!file) return;

        setOriginalFile(file);
        setCrop(undefined);
        const reader = new FileReader();
        reader.addEventListener("load", () =>
            setImgSrc(reader.result?.toString() || "")
        );
        reader.readAsDataURL(file);
    };

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        if (aspect) {
            const { width, height } = e.currentTarget;
            setCrop(centerCrop(
                makeAspectCrop(
                    {
                        unit: "%",
                        width: 90,
                    },
                    aspect,
                    width,
                    height
                ),
                width,
                height
            ));
        }
    };

    const getCroppedImg = async (image: HTMLImageElement, crop: PixelCrop): Promise<Blob | null> => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const pixelRatio = window.devicePixelRatio;

        canvas.width = crop.width * pixelRatio * scaleX;
        canvas.height = crop.height * pixelRatio * scaleY;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width * scaleX,
            crop.height * scaleY
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, originalFile?.type || "image/png");
        });
    };

    const saveFile = async (filename: string) => {
        if (!imgRef.current || !completedCrop) return;

        setIsCropping(true);
        const blob = await getCroppedImg(imgRef.current, completedCrop);
        if (blob) {
            const ext = originalFile?.name.split('.').pop() || 'png';
            const finalFilename = `${filename}.${ext}`;

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = finalFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("Downloaded!");
        }
        setShowDownloadDialog(false);
        setIsCropping(false);
    };

    const reset = () => {
        setImgSrc("");
        setOriginalFile(null);
        setCrop(undefined);
        setCompletedCrop(undefined);
    };

    return (
        <>
            <style>
                {`
                .ReactCrop__crop-selection {
                    border: 2px solid #3b82f6 !important;
                    box-shadow: 0 0 0 1px rgba(255,255,255,0.2), 0 0 0 4px rgba(0,0,0,0.5) !important;
                }
                .ReactCrop__handle {
                    background-color: #3b82f6 !important;
                    border: 2px solid white !important;
                    width: 10px !important;
                    height: 10px !important;
                    box-shadow: 0 0 4px rgba(0,0,0,0.5) !important;
                }
                .ReactCrop__drag-handle::after {
                    background-color: #3b82f6 !important;
                    border: 1px solid white !important;
                }
                `}
            </style>
            <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                    <CropIcon className="w-6 h-6 text-blue-400" />
                                </div>
                                <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                    Image Cropper
                                </h1>
                            </div>
                            <p className="text-slate-400 max-w-lg leading-relaxed">
                                Select the area you want to keep and remove the rest.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                            <Sparkles className="w-3 h-3 text-emerald-500" />
                            <span>100% Client-Side</span>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!imgSrc ? (
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
                                        onChange={onSelectFile}
                                        accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] }}
                                        label="Drop image here to crop"
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
                                            Crop Settings
                                        </h3>

                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { label: "Free", value: undefined },
                                                    { label: "1:1 Square", value: 1 },
                                                    { label: "16:9", value: 16 / 9 },
                                                    { label: "4:3", value: 4 / 3 },
                                                ].map((opt) => (
                                                    <Button
                                                        key={opt.label}
                                                        onClick={() => setAspect(opt.value)}
                                                        variant="outline"
                                                        className={`h-12 border-slate-800 hover:bg-slate-800 font-bold transition-all ${aspect === opt.value ? "bg-blue-600 text-white border-blue-500 hover:bg-blue-500" : "bg-slate-950 text-slate-400"}`}
                                                    >
                                                        {opt.label}
                                                    </Button>
                                                ))}
                                            </div>

                                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Selection</span>
                                                <span className="text-sm font-bold text-blue-400">
                                                    {completedCrop ? `${Math.round(completedCrop.width)} x ${Math.round(completedCrop.height)} px` : "Select area"}
                                                </span>
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
                                                    disabled={!completedCrop || isCropping}
                                                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                                                >
                                                    {isCropping ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span>Crop & Save</span>
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

                                        <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-8 overflow-hidden shadow-2xl relative z-10 min-h-[500px]">
                                            <ReactCrop
                                                crop={crop}
                                                onChange={(c) => setCrop(c)}
                                                onComplete={(c) => setCompletedCrop(c)}
                                                aspect={aspect}
                                                className="max-w-full"
                                            >
                                                <img
                                                    ref={imgRef}
                                                    alt="Crop me"
                                                    src={imgSrc}
                                                    onLoad={onImageLoad}
                                                    className="max-h-[600px] object-contain rounded-lg"
                                                />
                                            </ReactCrop>
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
                        defaultFileName={originalFile ? `cropped-${originalFile.name.replace(/\.[^/.]+$/, "")}` : "cropped-image"}
                        extension={originalFile?.name.split('.').pop() || 'png'}
                        isProcessing={isCropping}
                        title="Save Cropped Image"
                        description={`Save the selected ${completedCrop ? Math.round(completedCrop.width) + "x" + Math.round(completedCrop.height) : ""} crop area.`}
                    />
                </div>
            </div>
        </>
    );
}
