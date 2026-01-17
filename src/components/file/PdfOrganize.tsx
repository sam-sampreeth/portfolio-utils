import { useState } from "react";
import { Layers, Loader2, ShieldCheck, MousePointer2, GripVertical, FileText, Plus, X, Maximize2, ArrowRight } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import { saveAs } from "file-saver";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PageThumbnail {
    index: number;
    url: string;
    id: string;
}

export function PdfOrganize() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
    const [isRendering, setIsRendering] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);
    const [progress, setProgress] = useState(0);
    const [maximizedImage, setMaximizedImage] = useState<string | null>(null);

    const handleFileAdded = async (files: File[]) => {
        const file = files[0];
        if (!file) return;

        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
            toast.error("Please upload a valid PDF file.");
            return;
        }

        setSelectedFile(file);
        generateThumbnails(file);
    };

    const generateThumbnails = async (file: File) => {
        setIsRendering(true);
        setProgress(0);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            const thumbs: PageThumbnail[] = [];

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.3 }); // Thumbnail scale
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context!, viewport, canvas }).promise;
                thumbs.push({
                    index: i - 1,
                    url: canvas.toDataURL(),
                    id: Math.random().toString(36).substr(2, 9)
                });
                setProgress(Math.round((i / numPages) * 100));
            }

            setThumbnails(thumbs);
            toast.success("Ready to organize!");
        } catch (error) {
            console.error("Thumbnail rendering error:", error);
            toast.error("Failed to load PDF pages.");
        } finally {
            setIsRendering(false);
        }
    };

    const removePage = (id: string) => {
        setThumbnails(prev => prev.filter(t => t.id !== id));
    };

    const runOrganize = async (filename: string) => {
        if (!selectedFile || thumbnails.length === 0) return;

        setIsSaving(true);
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const originalDoc = await PDFDocument.load(arrayBuffer);
            const newDoc = await PDFDocument.create();

            const indices = thumbnails.map(t => t.index);
            const copiedPages = await newDoc.copyPages(originalDoc, indices);
            copiedPages.forEach(page => newDoc.addPage(page));

            const pdfBytes = await newDoc.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            saveAs(blob, `${filename}.pdf`);

            toast.success("PDF organized successfully!");
            setShowDownloadDialog(false);
        } catch (error) {
            console.error("Organize Error:", error);
            toast.error("Failed to save PDF.");
        } finally {
            setIsSaving(false);
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
                                <Layers className="w-6 h-6 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                Organize PDF
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Drag and drop to reorder pages, or remove unwanted ones.
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
                            {/* Sidebar Left */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="p-6 rounded-[2rem] bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl sticky top-8">
                                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-6">
                                        <FileText className="w-5 h-5 text-blue-500" />
                                        Project Info
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                            <p className="text-sm font-bold text-white line-clamp-2">{selectedFile.name}</p>
                                            <div className="flex items-center gap-2 text-[10px] uppercase font-black text-slate-500">
                                                <span>{formatSize(selectedFile.size)}</span>
                                                <span>•</span>
                                                <span>{thumbnails.length} Pages</span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setThumbnails([]);
                                            }}
                                            className="w-full border-slate-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 text-slate-400"
                                        >
                                            Reset Project
                                        </Button>

                                        <div className="pt-4 border-t border-slate-800 mt-4">
                                            <Button
                                                onClick={() => setShowDownloadDialog(true)}
                                                disabled={thumbnails.length === 0 || isRendering}
                                                className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                                            >
                                                {isSaving ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span>Save PDF</span>
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Grid */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="p-8 md:p-12 rounded-[2.5rem] bg-slate-900/50 border border-slate-800 relative overflow-hidden min-h-[600px]">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />

                                    <div className="relative z-10">
                                        {isRendering ? (
                                            <div className="h-[500px] flex flex-col items-center justify-center space-y-6">
                                                <div className="relative w-24 h-24">
                                                    <Loader2 className="w-24 h-24 text-blue-500 animate-spin absolute inset-0 opacity-20" />
                                                    <div className="absolute inset-0 flex items-center justify-center text-blue-400 font-bold text-xl">
                                                        {progress}%
                                                    </div>
                                                </div>
                                                <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Rendering Thumbnails...</p>
                                            </div>
                                        ) : (
                                            <Reorder.Group
                                                axis="y"
                                                values={thumbnails}
                                                onReorder={setThumbnails}
                                                className="space-y-3"
                                            >
                                                <AnimatePresence initial={false}>
                                                    {thumbnails.map((thumb, index) => (
                                                        <Reorder.Item
                                                            key={thumb.id}
                                                            value={thumb}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            whileDrag={{ scale: 1.02, zIndex: 50 }}
                                                            className="relative group cursor-grab active:cursor-grabbing select-none"
                                                        >
                                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/40 border border-slate-800 group-hover:bg-slate-900/60 group-hover:border-blue-500/20 transition-all">
                                                                <div className="flex items-center gap-6 flex-1">
                                                                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-blue-400 shrink-0 font-black text-sm">
                                                                        {index + 1}
                                                                    </div>

                                                                    <div className="relative w-16 h-20 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 group-hover:border-blue-500/30 shrink-0">
                                                                        <img src={thumb.url} alt="page" className="w-full h-full object-contain" />
                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                            <Button
                                                                                size="icon"
                                                                                variant="ghost"
                                                                                className="h-6 w-6 text-white hover:text-blue-400 hover:bg-transparent"
                                                                                onClick={() => setMaximizedImage(thumb.url)}
                                                                            >
                                                                                <Maximize2 className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>

                                                                    <div className="min-w-0">
                                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Source</p>
                                                                        <p className="text-sm font-bold text-slate-300">Original Page {thumb.index + 1}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-4 pl-4 border-l border-slate-800">
                                                                    <button onClick={() => removePage(thumb.id)} className="p-3 text-slate-600 hover:text-red-400 transition-colors">
                                                                        <X className="w-5 h-5" />
                                                                    </button>
                                                                    <GripVertical className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />
                                                                </div>
                                                            </div>
                                                        </Reorder.Item>
                                                    ))}
                                                </AnimatePresence>
                                            </Reorder.Group>
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
                    onConfirm={runOrganize}
                    defaultFileName={selectedFile?.name.replace('.pdf', '') + '-organized' || "organized"}
                    extension="pdf"
                    isProcessing={isSaving}
                    title="Save Organized PDF"
                    description={`Saving ${thumbnails.length} pages in new order.`}
                />

                <Dialog open={!!maximizedImage} onOpenChange={() => setMaximizedImage(null)}>
                    <DialogContent className="max-w-4xl bg-slate-950 border-slate-800 p-0 overflow-hidden">
                        {maximizedImage && (
                            <div className="relative w-full h-[80vh] flex items-center justify-center bg-black/50 p-4">
                                <img src={maximizedImage} alt="Maximized" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                            </div>
                        )}
                        <DialogTitle className="sr-only">Page Preview</DialogTitle>
                        <DialogDescription className="sr-only">Detailed view of the selected page.</DialogDescription>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
