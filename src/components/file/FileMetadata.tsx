import { useState } from "react";
import {
    FileType2,
    Info,
    ShieldCheck,
    Trash2,
    File as FileIcon,
    Calendar,
    HardDrive,
    Camera,
    MapPin,
    Smartphone,

} from "lucide-react";
import ExifReader from "exifreader";
import { saveAs } from "file-saver";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";

interface MetadataInfo {
    name: string;
    size: number;
    type: string;
    lastModified: string;
    exif?: any;
}

export function FileMetadata() {
    const [file, setFile] = useState<File | null>(null);
    const [metadata, setMetadata] = useState<MetadataInfo | null>(null);
    const [isStripping, setIsStripping] = useState(false);
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);
    const [cleanBlob, setCleanBlob] = useState<Blob | null>(null);

    const handleFileUpload = (files: File[]) => {
        const selectedFile = files[0];
        if (selectedFile) {
            setFile(selectedFile);
            readMetadata(selectedFile);
            setCleanBlob(null);
        }
    };

    const readMetadata = async (file: File) => {
        const basicMeta: MetadataInfo = {
            name: file.name,
            size: file.size,
            type: file.type || "unknown",
            lastModified: new Date(file.lastModified).toLocaleString(),
        };

        if (file.type.startsWith("image/")) {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const tags = ExifReader.load(arrayBuffer);

                // Format tags 
                const formattedTags: Record<string, any> = {};
                for (const [key, tag] of Object.entries(tags)) {
                    formattedTags[key] = tag.description;
                }

                setMetadata({ ...basicMeta, exif: formattedTags });
            } catch (error) {
                console.error("EXIF Error:", error);
                setMetadata(basicMeta);
            }
        } else {
            setMetadata(basicMeta);
        }
    };

    const prepareStripMetadata = async () => {
        if (!file || !file.type.startsWith("image/")) {
            toast.error("Metadata stripping is currently only supported for images.");
            return;
        }

        setIsStripping(true);
        try {
            const img = new Image();
            const url = URL.createObjectURL(file);

            await new Promise((resolve) => {
                img.onload = resolve;
                img.src = url;
            });

            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");

            if (!ctx) throw new Error("Could not get canvas context");

            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
                if (blob) {
                    setCleanBlob(blob);
                    setShowDownloadDialog(true);
                }
                setIsStripping(false);
                URL.revokeObjectURL(url);
            }, file.type);
        } catch (error) {
            toast.error("Failed to strip metadata");
            setIsStripping(false);
        }
    };

    const handleSaveCleanFile = (filename: string) => {
        if (!cleanBlob) return;
        saveAs(cleanBlob, filename); // Extension is handled by dialog logic if we pass it, or we append it
        // Actually dialog appends extension usually, but we need to match original type
        setShowDownloadDialog(false);
        toast.success("Metadata stripped and file saved!");
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const renderExifGroup = (title: string, Icon: any, tags: Record<string, any>) => {
        const entries = Object.entries(tags).filter(([_, v]) => v !== undefined && v !== null && String(v).trim() !== "");
        if (entries.length === 0) return null;

        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-500 uppercase font-black text-[10px] tracking-widest px-2">
                    {Icon && <Icon className="w-3 h-3" />}
                    {title}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {entries.map(([key, value]) => (
                        <div key={key} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1 hover:border-slate-700 transition-colors">
                            <span className="text-[10px] text-slate-500 font-bold uppercase">{key}</span>
                            <span className="text-sm text-slate-200 font-mono break-all line-clamp-2">{String(value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const loadSample = async () => {
        try {
            const response = await fetch("/samples/sample-exif.jpg");
            const blob = await response.blob();
            const sampleFile = new File([blob], "sample-canon-40d.jpg", { type: "image/jpeg" });
            handleFileUpload([sampleFile]);
            toast.success("Sample image loaded!");
        } catch (error) {
            toast.error("Failed to load sample image");
        }
    };

    const getDeviceMeta = (exif: any) => ({
        "Manufacturer": exif.Make,
        "Model": exif.Model,
        "Software": exif.Software,
        "Lens": exif.LensModel || exif.Lens
    });

    const getCameraMeta = (exif: any) => ({
        "Aperture": exif.FNumber,
        "ISO": exif.ISOSpeedRatings || exif.ISO,
        "Exposure": exif.ExposureTime,
        "Focal Length": exif.FocalLength,
        "Flash": exif.Flash
    });

    const getGPSMeta = (exif: any) => ({
        "Latitude": exif.GPSLatitude,
        "Longitude": exif.GPSLongitude,
        "Altitude": exif.GPSAltitude,
    });

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                <FileType2 className="w-6 h-6 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                File Metadata
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            View and strip hidden EXIF & file metadata from your images securely.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>Client-Side</span>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {!file ? (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group relative overflow-hidden rounded-[2rem] bg-slate-900/50 border border-slate-800 transition-all hover:border-blue-500/30 hover:bg-slate-900/80 p-8 space-y-8"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                                <FileUpload onChange={handleFileUpload} label="Drop any file here" />
                            </div>
                            <div className="relative flex flex-col items-center gap-4">
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                                    Don't have a photo with EXIF?
                                </p>
                                <Button
                                    onClick={loadSample}
                                    variant="outline"
                                    className="h-11 px-6 border-slate-800 bg-slate-900 hover:bg-slate-800 text-blue-400 font-bold rounded-xl transition-all"
                                >
                                    <Camera className="w-4 h-4 mr-2" />
                                    Try a sample (Canon 40D)
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="process"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            {/* Left Panel: Primary Info & Actions */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="p-6 rounded-[2rem] bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl sticky top-8">
                                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-6">
                                        <Info className="w-5 h-5 text-blue-500" />
                                        File Overview
                                    </h3>

                                    <div className="flex flex-col items-center text-center gap-4 mb-8">
                                        <div className="w-20 h-20 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 shadow-inner">
                                            <FileIcon className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold text-white break-all line-clamp-2">{file.name}</h3>
                                            <p className="text-xs font-black uppercase text-slate-500 tracking-widest">
                                                {formatSize(file.size)} • {file.type || 'file'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-800/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase">Modified</span>
                                            </div>
                                            <span className="text-xs font-mono text-slate-300">{metadata?.lastModified}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <HardDrive className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase">Raw Size</span>
                                            </div>
                                            <span className="text-xs font-mono text-slate-300">{file.size} B</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 pt-6">
                                        {file.type.startsWith("image/") && (
                                            <Button
                                                onClick={prepareStripMetadata}
                                                disabled={isStripping}
                                                className="h-14 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all w-full"
                                            >
                                                {isStripping ? (
                                                    <span className="animate-pulse">Cleaning...</span>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <Trash2 className="w-5 h-5" />
                                                        <span>Strip All EXIF</span>
                                                    </div>
                                                )}
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => { setFile(null); setMetadata(null); }}
                                            variant="outline"
                                            className="h-12 border-slate-800 hover:bg-slate-800 text-slate-400 font-bold rounded-xl"
                                        >
                                            View Another File
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Detailed Metadata */}
                            <div className="lg:col-span-2">
                                {metadata?.exif ? (
                                    <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 space-y-12 shadow-sm">
                                        <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                                <Info className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <h2 className="text-xl font-black uppercase tracking-tight text-white">Full Metadata Report</h2>
                                        </div>

                                        {renderExifGroup("Device & Software", Smartphone, getDeviceMeta(metadata.exif))}
                                        <div className="h-px bg-slate-800" />
                                        {renderExifGroup("Camera Settings", Camera, getCameraMeta(metadata.exif))}
                                        <div className="h-px bg-slate-800" />
                                        {renderExifGroup("Location (GPS)", MapPin, getGPSMeta(metadata.exif))}
                                        <div className="h-px bg-slate-800" />
                                        {renderExifGroup("All Raw Tags", Info, metadata.exif)}
                                    </div>
                                ) : (
                                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center rounded-[2rem] bg-slate-900/50 border border-slate-800 space-y-6">
                                        <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center mx-auto text-slate-600 border border-slate-800">
                                            <Info className="w-10 h-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-black uppercase tracking-widest text-slate-500 italic"> No EXIF data found </h3>
                                            <p className="text-slate-500 text-sm max-w-xs mx-auto">
                                                This file doesn't contain digital photography metadata, or it has already been stripped.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <DownloadConfirmDialog
                    isOpen={showDownloadDialog}
                    onClose={() => setShowDownloadDialog(false)}
                    onConfirm={handleSaveCleanFile}
                    defaultFileName={file ? file.name.replace(/(\.[^.]+)$/, '-clean$1') : "clean-file"}
                    extension={file ? file.name.split('.').pop() || "jpg" : "jpg"}
                    isProcessing={false}
                    title="Save Cleaned File"
                    description="Download the copy of your image with all metadata permanently removed."
                />
            </div>
        </div>
    );
}
