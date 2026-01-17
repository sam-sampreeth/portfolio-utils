import { useState } from "react";
import { Scissors, FileText, Loader2, ShieldCheck, Download, CheckCircle2, AlertCircle, Trash2, Plus, ArrowRight } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatePresence, motion } from "framer-motion";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";

export function PdfSplit() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [ranges, setRanges] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);

    const handleFileAdded = async (files: File[]) => {
        const file = files[0];
        if (!file) return;

        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
            toast.error("Please upload a valid PDF file.");
            return;
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            setPageCount(pdfDoc.getPageCount());
            setSelectedFile(file);
            toast.success("PDF loaded successfully");
        } catch (error) {
            toast.error("Failed to read PDF. It might be protected or corrupted.");
        }
    };

    const parseRanges = (maxPage: number): number[] => {
        const pages = new Set<number>();
        const parts = ranges.split(',').map(p => p.trim());

        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(Number);
                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = Math.max(1, start); i <= Math.min(maxPage, end); i++) {
                        pages.add(i - 1); // 0-indexed for pdf-lib
                    }
                }
            } else {
                const page = Number(part);
                if (!isNaN(page) && page >= 1 && page <= maxPage) {
                    pages.add(page - 1);
                }
            }
        }
        return Array.from(pages).sort((a, b) => a - b);
    };

    const runSplit = async (filename: string) => {
        if (!selectedFile) return;

        const indices = parseRanges(pageCount);
        if (indices.length === 0) {
            toast.error("Please enter valid page numbers or ranges (e.g., 1-3, 5).");
            return;
        }

        setIsProcessing(true);
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const originalDoc = await PDFDocument.load(arrayBuffer);
            const newDoc = await PDFDocument.create();

            const copiedPages = await newDoc.copyPages(originalDoc, indices);
            copiedPages.forEach(page => newDoc.addPage(page));

            const pdfBytes = await newDoc.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            saveAs(blob, `${filename}.pdf`);

            toast.success("PDF split successfully!");
            setShowDownloadDialog(false);
        } catch (error) {
            console.error("Split Error:", error);
            toast.error("Failed to split PDF.");
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

    const selectedPagesCount = parseRanges(pageCount).length;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                <Scissors className="w-6 h-6 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                PDF Split
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Extract pages, separate documents, or remove unwanted sections.
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
                            {/* Sidebar - File Info & Actions (Moved to Right implementation preference if keeping Layout consistent with Merge) 
                               Wait, Merge has Sidebar LEFT in my previous code?
                               "Sidebar: File Info ... lg:col-span-1"
                               "Main: lg:col-span-2"
                               
                               Let's stick to the consistent 1:2 ratio.
                            */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="p-6 rounded-[2rem] bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl sticky top-8">
                                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-6">
                                        <FileText className="w-5 h-5 text-blue-500" />
                                        Source File
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                            <p className="text-sm font-bold text-white line-clamp-2">{selectedFile.name}</p>
                                            <div className="flex items-center gap-2 text-[10px] uppercase font-black text-slate-500">
                                                <span>{formatSize(selectedFile.size)}</span>
                                                <span>•</span>
                                                <span>{pageCount} Pages</span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={() => setSelectedFile(null)}
                                            className="w-full border-slate-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 text-slate-400"
                                        >
                                            Change File
                                        </Button>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-black tracking-wider text-slate-500">Selected Output</p>
                                            <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>{selectedPagesCount} Pages</span>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => setShowDownloadDialog(true)}
                                            disabled={!ranges.trim() || isProcessing}
                                            className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span>Split PDF</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Main - Split Controls */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="p-8 md:p-12 rounded-[2.5rem] bg-slate-900/50 border border-slate-800 relative overflow-hidden flex flex-col justify-center min-h-[400px]">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />

                                    <div className="relative z-10 space-y-8">
                                        <div className="space-y-4">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Page Ranges</Label>
                                            <div className="relative group">
                                                <Input
                                                    placeholder="e.g. 1, 3-5, 8"
                                                    value={ranges}
                                                    onChange={(e) => setRanges(e.target.value)}
                                                    className="bg-slate-950/50 border-slate-800 h-20 px-6 caret-blue-500 font-bold focus:border-blue-500/50 text-2xl rounded-2xl transition-all placeholder:text-slate-700 text-white"
                                                    autoFocus
                                                />
                                                <div className="absolute top-1/2 -translate-y-1/2 right-6 text-slate-700 pointer-events-none">
                                                    <Scissors className="w-6 h-6" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-2">
                                                <div className="flex items-center gap-2 text-blue-400">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-300">Quick Tip</h4>
                                                </div>
                                                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                                    Use commas for individual pages (1, 3) and hyphens for consecutive ranges (5-10).
                                                </p>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <FileText className="w-4 h-4" />
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest">Example</h4>
                                                </div>
                                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                                    <span className="text-blue-400 font-bold">1, 3-5</span> extracts pages 1, 3, 4, and 5.
                                                </p>
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
                    onConfirm={runSplit}
                    defaultFileName={selectedFile?.name.replace('.pdf', '') + '-split' || "split"}
                    extension="pdf"
                    isProcessing={isProcessing}
                    title="Save Split PDF"
                    description={`Extracting ${selectedPagesCount} pages to a new PDF.`}
                />
            </div>
        </div>
    );
}
