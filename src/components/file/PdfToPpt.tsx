import { useState } from "react";
import { Presentation, Loader2, ShieldCheck, Plus, MonitorPlay, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import * as pdfjsLib from 'pdfjs-dist';
import PptxGenJS from "pptxgenjs";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

export function PdfToPpt() {
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

            const pptx = new PptxGenJS();
            // pptx.layout = 'LAYOUT_16x9'; // Default. We will override per slide if possible or set global if all same.

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);

                // Get page dimensions at 1.0 scale to determine inch size
                const viewportRaw = page.getViewport({ scale: 1.0 });
                // PDF units are usually 72 DPI. PPTX usually expects inches or percentage.
                // PptxGenJS uses inches by default. 1 inch = 72 points.
                const widthInches = viewportRaw.width / 72;
                const heightInches = viewportRaw.height / 72;

                // Create slide
                // To fix alignment, we define the slide layout to MATCH the PDF page exactly.
                pptx.defineLayout({ name: `PAGE_${i}`, width: widthInches, height: heightInches });
                const slide = pptx.addSlide(`PAGE_${i}`);

                // Render at high resolution (scale 2.0 or 3.0) for clarity
                const scale = 2.0;
                const viewport = page.getViewport({ scale });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                if (!context) throw new Error("Canvas context not available");

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                } as any).promise;

                const imgData = canvas.toDataURL('image/png');

                // Add image filling the entire matching slide
                slide.addImage({
                    data: imgData,
                    x: 0,
                    y: 0,
                    w: widthInches,
                    h: heightInches
                });
            }

            await pptx.writeFile({ fileName: `${filename}.pptx` });
            toast.success("Converted to PowerPoint successfully!");
            setShowDownloadDialog(false);

        } catch (error) {
            console.error("Conversion Error:", error);
            toast.error("Failed to convert PDF. Ensure the file is not corrupted.");
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
                                <Presentation className="w-6 h-6 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                PDF to PPT
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Convert PDF pages into high-fidelity PowerPoint slides.
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
                                            <div className="relative w-full h-full rounded-2xl bg-slate-950 border border-orange-500/30 flex items-center justify-center text-blue-400 shadow-2xl">
                                                <MonitorPlay className="w-10 h-10" />
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
                                            <strong>Note:</strong> We convert pages to images to preserve exact layout. Text in the resulting PPT will NOT be editable.
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
                                            <span>Convert to PPT</span>
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
                    defaultFileName={selectedFile?.name.replace('.pdf', '') || "presentation"}
                    extension="pptx"
                    isProcessing={isProcessing}
                    title="Save PowerPoint"
                    description="Enter a name for your converted PowerPoint file."
                />
            </div>
        </div>
    );
}
