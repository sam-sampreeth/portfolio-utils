import { useState } from "react";
import { FileText, Loader2, ShieldCheck, Plus, FileType, CheckCircle, ArrowRight } from "lucide-react";
import { saveAs } from "file-saver";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun } from "docx";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

export function PdfToWord() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);

    const handleFileAdded = (files: File[]) => {
        const file = files[0];
        if (!file) return;
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
            toast.error("Please upload a valid PDF file.");
            return;
        }
        setSelectedFile(file);
    };

    const handleConvert = async (filename: string) => {
        if (!selectedFile) return;

        setIsProcessing(true);
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument(arrayBuffer);
            const pdf = await loadingTask.promise;

            const docChildren: Paragraph[] = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const items: any[] = textContent.items;

                // Sort items by Y (descending) then X (ascending)
                items.sort((a: any, b: any) => {
                    const yDiff = b.transform[5] - a.transform[5];
                    if (Math.abs(yDiff) > 5) return yDiff;
                    return a.transform[4] - b.transform[4];
                });

                let lastY = -1;
                let currentLineText = "";

                items.forEach((item: any) => {
                    const y = item.transform[5];
                    const text = item.str;

                    if (lastY === -1) lastY = y;

                    if (Math.abs(y - lastY) > 10) {
                        if (currentLineText.trim()) {
                            docChildren.push(new Paragraph({
                                children: [new TextRun(currentLineText)]
                            }));
                        }
                        currentLineText = text;
                        lastY = y;
                    } else {
                        currentLineText += (currentLineText ? " " : "") + text;
                    }
                });

                if (currentLineText.trim()) {
                    docChildren.push(new Paragraph({
                        children: [new TextRun(currentLineText)]
                    }));
                }

                if (i < pdf.numPages) {
                    docChildren.push(new Paragraph({
                        children: [new TextRun({ text: "", break: 1 })]
                    }));
                }
            }

            const doc = new Document({
                sections: [{
                    properties: {},
                    children: docChildren,
                }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `${filename}.docx`);

            toast.success("Converted to Word successfully!");
            setShowDownloadDialog(false);

        } catch (error) {
            console.error("Conversion Error:", error);
            toast.error("Failed to convert PDF. The file might be protected or complex.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                <FileText className="w-6 h-6 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                PDF to Word
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Extract text from PDF documents and convert them to editable Word files.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>100% Client-Side Processing</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
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
                                    key="preview"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-8 md:p-12 rounded-[2.5rem] bg-slate-900/50 border border-slate-800 flex flex-col justify-center min-h-[400px] relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />
                                    <div className="relative z-10 text-center space-y-8">
                                        <div className="relative w-24 h-24 mx-auto">
                                            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                                            <div className="relative w-full h-full rounded-2xl bg-slate-950 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-2xl">
                                                <FileType className="w-10 h-10" />
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1.5 border-4 border-slate-900">
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-2xl font-black uppercase tracking-tight text-white">Ready to Convert</h3>
                                            <p className="text-slate-400 font-medium">{selectedFile.name}</p>
                                            <p className="text-slate-500 text-sm font-mono">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <div className="pt-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => setSelectedFile(null)}
                                                className="border-slate-700 hover:bg-slate-800 text-slate-300"
                                            >
                                                Change File
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            <div className="p-6 rounded-[2rem] bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl">
                                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-6">
                                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                                    Action
                                </h3>

                                <div className="space-y-4 mb-8">
                                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 mb-4">
                                        <p className="text-xs text-blue-300 leading-relaxed">
                                            <strong>Note:</strong> We extract raw text and paragraphs. Complex formatting like tables or images might not be preserved perfectly.
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setShowDownloadDialog(true)}
                                    disabled={!selectedFile || isProcessing}
                                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                                >
                                    {isProcessing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span>Convert to Word</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <DownloadConfirmDialog
                    isOpen={showDownloadDialog}
                    onClose={() => setShowDownloadDialog(false)}
                    onConfirm={handleConvert}
                    defaultFileName={selectedFile?.name.replace('.pdf', '') || "document"}
                    extension="docx"
                    isProcessing={isProcessing}
                    title="Save Word Document"
                    description="Enter a name for your converted Word file."
                />
            </div>
        </div>
    );
}
