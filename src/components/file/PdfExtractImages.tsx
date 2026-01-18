import { useState } from "react";
import { ImageIcon, Download, Loader2, ShieldCheck, Image as LucideImage, Settings2, ArrowRight } from "lucide-react";
import { saveAs } from "file-saver";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface ExtractedImage {
    id: string;
    url: string;
    blob: Blob;
    width: number;
    height: number;
    extension: string;
    index: number;
}

export function PdfExtractImages() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [images, setImages] = useState<ExtractedImage[]>([]);
    const [format, setFormat] = useState<"png" | "jpeg">("png");
    const [scale, setScale] = useState<number>(2); // 2 = HighRes (approx 150-200 DPI equivalent usually)

    const handleFileAdded = (files: File[]) => {
        const file = files[0];
        if (!file) return;
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
            toast.error("Please upload a valid PDF file.");
            return;
        }
        setSelectedFile(file);
        setImages([]);
    };

    const convertToImages = async () => {
        if (!selectedFile) return;
        setIsProcessing(true);
        setImages([]);

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            const extracted: ExtractedImage[] = [];

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: scale });
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context!, viewport, canvas }).promise;

                const blob = await new Promise<Blob | null>(resolve =>
                    canvas.toBlob(resolve, `image/${format}`, 0.9) // 0.9 qual for jpeg
                );

                if (blob) {
                    extracted.push({
                        id: Math.random().toString(36).substr(2, 9),
                        url: canvas.toDataURL(`image/${format}`),
                        blob,
                        width: viewport.width,
                        height: viewport.height,
                        extension: format,
                        index: i
                    });
                }
            }

            setImages(extracted);
            toast.success(`Converted ${numPages} pages to images!`);

        } catch (error) {
            console.error("Conversion Error:", error);
            toast.error("Failed to convert PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadAll = async () => {
        const zip = new JSZip();
        images.forEach((img) => {
            zip.file(`page_${img.index}.${img.extension}`, img.blob);
        });
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${selectedFile?.name.replace('.pdf', '')}-images.zip`);
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
                                <ImageIcon className="w-6 h-6 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                PDF to Images
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Convert every page of your PDF into high-quality images (PNG/JPG).
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>100% Client-Side Processing</span>
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
                                <FileUpload onChange={handleFileAdded} multiple={false} label="Drop PDF file here" />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="workspace"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            {/* Sidebar - Settings */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="p-6 rounded-[2rem] bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl sticky top-8">
                                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-6">
                                        <Settings2 className="w-5 h-5 text-blue-500" />
                                        Configuration
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                            <p className="text-sm font-bold text-white line-clamp-2">{selectedFile.name}</p>
                                            <p className="text-[10px] uppercase font-black text-slate-500">{formatSize(selectedFile.size)}</p>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Output Format</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => setFormat("png")}
                                                    className={`p-3 rounded-xl border text-sm font-bold transition-all ${format === "png"
                                                        ? "bg-blue-500/20 border-blue-500 text-blue-400"
                                                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                                                        }`}
                                                >
                                                    PNG (Crisp)
                                                </button>
                                                <button
                                                    onClick={() => setFormat("jpeg")}
                                                    className={`p-3 rounded-xl border text-sm font-bold transition-all ${format === "jpeg"
                                                        ? "bg-blue-500/20 border-blue-500 text-blue-400"
                                                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                                                        }`}
                                                >
                                                    JPG (Small)
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Image Quality</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => setScale(1.5)}
                                                    className={`p-3 rounded-xl border text-sm font-bold transition-all ${scale === 1.5
                                                        ? "bg-blue-500/20 border-blue-500 text-blue-400"
                                                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                                                        }`}
                                                >
                                                    Standard
                                                </button>
                                                <button
                                                    onClick={() => setScale(3)}
                                                    className={`p-3 rounded-xl border text-sm font-bold transition-all ${scale === 3
                                                        ? "bg-blue-500/20 border-blue-500 text-blue-400"
                                                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                                                        }`}
                                                >
                                                    High (HD)
                                                </button>
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setImages([]);
                                            }}
                                            className="w-full border-slate-800 hover:bg-slate-800 text-slate-400"
                                        >
                                            Change File
                                        </Button>

                                        <div className="pt-4 border-t border-slate-800">
                                            <Button
                                                onClick={convertToImages}
                                                disabled={isProcessing}
                                                className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                                            >
                                                {isProcessing ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span>Convert Pages</span>
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Output Area */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="p-8 pb-20 md:p-12 rounded-[2.5rem] bg-slate-900/50 border border-slate-800 relative min-h-[600px] flex flex-col">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />

                                    <div className="flex items-center justify-between mb-8 relative z-10">
                                        <h3 className="text-xl font-bold uppercase tracking-tighter text-white">Preview Results</h3>
                                        {images.length > 0 && (
                                            <Button
                                                onClick={downloadAll}
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Download ZIP ({images.length})
                                            </Button>
                                        )}
                                    </div>

                                    {isProcessing ? (
                                        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                                            <p className="text-slate-400 font-bold uppercase tracking-widest">Processing pages...</p>
                                        </div>
                                    ) : images.length > 0 ? (
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                                            {images.map((img) => (
                                                <div key={img.id} className="group relative aspect-[3/4] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                                                    <img src={img.url} alt={`Page ${img.index}`} className="w-full h-full object-contain" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                                                        <p className="text-white font-bold mb-2">Page {img.index}</p>
                                                        <Button size="sm" variant="outline" onClick={() => saveAs(img.blob, `page_${img.index}.${img.extension}`)}>
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-40">
                                            <LucideImage className="w-16 h-16 text-slate-500" />
                                            <p className="text-slate-500 font-medium">No images generated yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
