import { useState } from "react";
import { ImageIcon, Download, Loader2, ShieldCheck, Plus, Image as IconImage, Settings2, Grid, Layers, ArrowRight } from "lucide-react";
import { saveAs } from "file-saver";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import JSZip from "jszip";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";

export function WordExtract() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [extractedImages, setExtractedImages] = useState<Array<{ name: string; blob: Blob }>>([]);
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);

    const handleFileAdded = (files: File[]) => {
        const file = files[0];
        if (!file) return;
        if (!file.name.toLowerCase().endsWith('.docx')) {
            toast.error("Please upload a valid Word (.docx) file.");
            return;
        }
        setSelectedFile(file);
        setExtractedImages([]);
    };

    const handleExtract = async () => {
        if (!selectedFile) return;

        setIsProcessing(true);
        try {
            const zip = new JSZip();
            await zip.loadAsync(selectedFile);
            const mediaFolder = zip.folder("word/media");

            if (!mediaFolder) {
                toast.error("No images found in this document.");
                setIsProcessing(false);
                return;
            }

            const images: Array<{ name: string; blob: Blob }> = [];
            const promises: Promise<void>[] = [];

            mediaFolder.forEach((relativePath, file) => {
                const promise = file.async("blob").then((blob) => {
                    images.push({ name: relativePath, blob });
                });
                promises.push(promise);
            });

            await Promise.all(promises);

            if (images.length === 0) {
                toast.error("No extractable images found.");
            } else {
                setExtractedImages(images);
                toast.success(`Found ${images.length} images!`);
            }

        } catch (error) {
            console.error("Extraction Error:", error);
            toast.error("Failed to extract images. Ensure valid DOCX format.");
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadImage = (img: { name: string; blob: Blob }) => {
        saveAs(img.blob, img.name);
    };

    const handleDownloadAll = (filename: string) => {
        if (extractedImages.length === 0 || !selectedFile) return;

        const zip = new JSZip();
        extractedImages.forEach(img => {
            zip.file(img.name, img.blob);
        });
        zip.generateAsync({ type: "blob" }).then(content => {
            saveAs(content, `${filename}.zip`);
            setShowDownloadDialog(false);
            toast.success("Images ZIP downloaded!");
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                <ImageIcon className="w-6 h-6 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                Extract Images
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Scrape all embedded photos and graphics from your documents.
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
                            className="group relative overflow-hidden rounded-[2rem] bg-slate-900/50 border border-slate-800 transition-all hover:border-blue-500/30 hover:bg-slate-900/80 p-8"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                                        <Settings2 className="w-5 h-5 text-blue-500" />
                                        Extraction
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <IconImage className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-200 truncate">{selectedFile.name}</p>
                                                <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleExtract}
                                            disabled={isProcessing || extractedImages.length > 0}
                                            className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                                        >
                                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : extractedImages.length > 0 ? "Images Ready" : "Find Images"}
                                        </Button>

                                        {extractedImages.length > 0 && (
                                            <div className="pt-4 border-t border-slate-800">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-xs font-bold uppercase text-slate-500">Found</span>
                                                    <span className="text-sm font-bold text-white bg-slate-950 px-2 py-1 rounded border border-slate-800">{extractedImages.length} items</span>
                                                </div>
                                                <Button
                                                    onClick={() => setShowDownloadDialog(true)}
                                                    variant="outline"
                                                    className="w-full h-14 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 font-black rounded-xl uppercase tracking-widest"
                                                >
                                                    Download All (ZIP)
                                                </Button>
                                            </div>
                                        )}

                                        <Button
                                            variant="ghost"
                                            onClick={() => { setSelectedFile(null); setExtractedImages([]); }}
                                            className="w-full text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Main Grid */}
                            <div className="lg:col-span-2 space-y-6">
                                {extractedImages.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {extractedImages.map((img, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.02 }}
                                                className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md hover:border-blue-500/50 hover:shadow-blue-500/20 transition-all"
                                            >
                                                {/* Checkerboard Pattern for Transparency */}
                                                <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dvvnyw58q/image/upload/v1706616056/checkerboard_vj85s0.png')] opacity-10 bg-repeat bg-[length:20px_20px]" />

                                                <img
                                                    src={URL.createObjectURL(img.blob)}
                                                    alt={img.name}
                                                    className="relative z-10 w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                                />

                                                <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-2">
                                                    <p className="text-[10px] text-slate-400 font-mono truncate max-w-full px-2">{img.name}</p>
                                                    <Button
                                                        onClick={() => downloadImage(img)}
                                                        size="sm"
                                                        className="rounded-full w-10 h-10 p-0 bg-white text-black hover:bg-blue-50 hover:text-blue-600 hover:scale-110 transition-all shadow-xl"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 md:p-12 rounded-[2.5rem] bg-slate-900/50 border border-slate-800 flex flex-col justify-center min-h-[500px] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />
                                        <div className="relative z-10 text-center space-y-6">
                                            <div className="w-24 h-24 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto text-blue-400 border border-blue-500/20">
                                                <Grid className="w-12 h-12" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black uppercase tracking-tight text-white">No Images Yet</h3>
                                                <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                                                    Click "Find Images" to scan the document structure for media files.
                                                </p>
                                            </div>
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
                    onConfirm={handleDownloadAll}
                    defaultFileName={selectedFile ? `${selectedFile.name.replace(/\.[^/.]+$/, "")}_images` : "images"}
                    extension="zip"
                    isProcessing={false}
                    title="Download All Images"
                    description={`Save all ${extractedImages.length} extracted images as a ZIP archive.`}
                />
            </div>
        </div>
    );
}
