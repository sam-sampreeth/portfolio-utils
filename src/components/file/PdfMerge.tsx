import { useState } from "react";
import { Loader2, ShieldCheck, Combine, FileText, Search, GripVertical, Trash2, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { PDFDocument } from "pdf-lib";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";

export function PdfMerge() {
    const [fileList, setFileList] = useState<File[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Dialog State
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);

    const handleFileAdded = (files: File[]) => {
        const validFiles = files.filter(f => f.type === 'application/pdf');
        if (validFiles.length !== files.length) {
            toast.error("Only PDF files are allowed.");
        }
        setFileList(prev => [...prev, ...validFiles]);
    };

    const handleRemove = (indexToRemove: number) => {
        setFileList(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    // Filtered list for display, but we MUST keep the original indices for Reorder to work (conceptually)
    // However, Reorder requires the full list to function correctly as a drag source.
    // Search + Drag & Drop is tricky. Best practice: Disable Drag when searching.
    const filteredFiles = fileList.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const isSearching = searchTerm.length > 0;

    const handleMergeConfirm = async (fileName: string) => {
        setIsProcessing(true);
        // Toast is handled by the Dialog technically, or we can show status here.

        try {
            const mergedPdf = await PDFDocument.create();

            for (const file of fileList) {
                const fileBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(fileBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes as any], { type: "application/pdf" });

            // Download logic
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${fileName}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("PDFs merged successfully!");
            setShowDownloadDialog(false);
        } catch (error) {
            console.error("Merge failed", error);
            toast.error("Failed to merge PDFs.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                <Combine className="w-6 h-6 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                PDF Merge <span className="text-blue-500">Pro</span>
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Combine multiple PDF documents into a single file. Drag to reorder, search to find specific files.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>100% Client-Side Processing</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content: File List & Upload */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Upload Area */}
                        <div className="group relative overflow-hidden rounded-[2rem] bg-slate-900/50 border border-slate-800 transition-all hover:border-blue-500/30 hover:bg-slate-900/80">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative p-2">
                                <FileUpload onChange={handleFileAdded} multiple={true} label="Drop PDF files here" />
                            </div>
                        </div>

                        {/* Search & Toolbar */}
                        {fileList.length > 0 && (
                            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search files..."
                                        className="pl-9 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-500/50"
                                    />
                                </div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {fileList.length} Files
                                </div>
                            </div>
                        )}

                        {/* File List */}
                        <div className="space-y-3 min-h-[200px]">
                            {fileList.length === 0 ? (
                                <div className="h-40 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl">
                                    <p className="text-sm font-medium">No files added yet</p>
                                </div>
                            ) : (
                                <Reorder.Group axis="y" values={fileList} onReorder={setFileList} className="space-y-3">
                                    <AnimatePresence initial={false}>
                                        {filteredFiles.map((file) => (
                                            <Reorder.Item key={file.name + file.size} value={file} dragListener={!isSearching}>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="group relative flex items-center gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/30 transition-colors"
                                                >
                                                    {/* Drag Handle */}
                                                    <div className={`cursor-grab active:cursor-grabbing p-2 text-slate-600 hover:text-slate-400 ${isSearching ? 'opacity-20 cursor-not-allowed' : ''}`}>
                                                        <GripVertical className="w-5 h-5" />
                                                    </div>

                                                    {/* Icon */}
                                                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/10">
                                                        <FileText className="w-5 h-5" />
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-slate-200 truncate">{file.name}</h4>
                                                        <p className="text-xs text-slate-500 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>

                                                    {/* Actions */}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => handleRemove(fileList.indexOf(file))}
                                                        className="text-slate-600 hover:text-red-400 hover:bg-red-500/10"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </motion.div>
                                            </Reorder.Item>
                                        ))}
                                    </AnimatePresence>
                                </Reorder.Group>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Actions */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            <div className="p-6 rounded-[2rem] bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl">
                                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-6">
                                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                                    Summary
                                </h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Total Files</span>
                                        <span className="font-mono font-bold text-slate-200">{fileList.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Est. Size</span>
                                        <span className="font-mono font-bold text-slate-200">
                                            {(fileList.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setShowDownloadDialog(true)}
                                    disabled={fileList.length < 2 || isProcessing}
                                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                                >
                                    {isProcessing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span>Merge PDFs</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    )}
                                </Button>

                                {fileList.length < 2 && (
                                    <p className="text-xs text-center text-slate-500 mt-4">
                                        Add at least 2 files to merge
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DownloadConfirmDialog
                isOpen={showDownloadDialog}
                onClose={() => setShowDownloadDialog(false)}
                onConfirm={handleMergeConfirm}
                defaultFileName="merged_document"
                extension="pdf"
                isProcessing={isProcessing}
                title="Save Merged PDF"
                description={`Ready to merge ${fileList.length} documents. Name your output file.`}
            />
        </div>
    );
}
