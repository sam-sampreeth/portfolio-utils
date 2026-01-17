import { useState } from "react";
import { FileText, Loader2, Sparkles, AlertTriangle, ArrowRight, Settings2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";

export function WordToPdf() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [htmlContent, setHtmlContent] = useState<string>("");
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);

    // Function to handle file upload
    const handleFileAdded = async (files: File[]) => {
        const file = files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.docx')) {
            toast.error("Please upload a valid Word (.docx) file.");
            return;
        }

        setSelectedFile(file);
        setHtmlContent("");

        // Generate Preview (using HTML)
        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            setHtmlContent(result.value);
        } catch (error) {
            console.error("Preview Error:", error);
            toast.error("Failed to load document preview.");
        }
    };

    const handleSave = async (fileName: string) => {
        if (!selectedFile) return;

        setShowDownloadDialog(false);
        setIsConverting(true);
        const toastId = toast.loading("Generating PDF...");

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();

            // 1. Extract Raw Text for reliable PDF generation
            const result = await mammoth.extractRawText({ arrayBuffer });
            const text = result.value;

            // 2. Create PDF
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            // 3. Add Text
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);

            // splitTextToSize handles line wrapping automatically
            const splitText = doc.splitTextToSize(text, 180); // 180mm width (leaving ~15mm margins)

            // Add text with margins (15mm left, 15mm top)
            doc.text(splitText, 15, 15);

            // 4. Save
            doc.save(`${fileName}.pdf`);

            toast.dismiss(toastId);
            toast.success("PDF Downloaded!");

        } catch (err) {
            console.error("PDF Gen Error:", err);
            toast.dismiss(toastId);
            toast.error("Failed to generate PDF.");
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-600/20 rounded-2xl border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                                <FileText className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                Word to PDF
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Convert DOCX to PDF (Text Only) for reliable archiving.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                        <Sparkles className="w-3 h-3 text-emerald-500" />
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
                            className="group relative overflow-hidden rounded-[2rem] bg-slate-900/50 border border-slate-800 transition-all hover:border-indigo-500/30 hover:bg-slate-900/80 p-8"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                                        <Settings2 className="w-5 h-5 text-indigo-500" />
                                        Configuration
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                                                    <FileText className="w-5 h-5 text-indigo-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-200 truncate">{selectedFile.name}</p>
                                                    <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                                            <p className="text-xs text-amber-200/70 leading-relaxed font-medium">
                                                <strong>Note:</strong> This tool extracts <span className="text-white font-bold">text only</span>. Images and complex formatting will not be included in the PDF.
                                            </p>
                                        </div>

                                        <Button
                                            onClick={() => setShowDownloadDialog(true)}
                                            disabled={isConverting}
                                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
                                        >
                                            {isConverting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                                <div className="flex items-center gap-2">
                                                    <span>Save PDF</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            )}
                                        </Button>

                                        <Button
                                            variant="outline"
                                            onClick={() => { setSelectedFile(null); setHtmlContent(""); }}
                                            className="w-full border-slate-800 hover:bg-slate-800 text-slate-400"
                                        >
                                            Change File
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Main Preview */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="bg-slate-900 border border-slate-800 min-h-[600px] shadow-2xl rounded-[2.5rem] overflow-hidden relative group">
                                    <div className="absolute inset-0 overflow-auto p-8 custom-scrollbar">
                                        <div className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-100 prose-p:text-slate-300 prose-strong:text-slate-100">
                                            {htmlContent ? (
                                                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 mt-20">
                                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                                    <p className="text-sm font-medium uppercase tracking-widest">Loading Preview...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-center text-slate-500 text-xs uppercase font-bold tracking-widest">Document Preview</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <DownloadConfirmDialog
                    isOpen={showDownloadDialog}
                    onClose={() => setShowDownloadDialog(false)}
                    onConfirm={handleSave}
                    defaultFileName={selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, "") : "document"}
                    extension="pdf"
                    isProcessing={isConverting}
                    title="Save PDF"
                    description="Extract text and save as a clean PDF document."
                />
            </div>
        </div>
    );
}
