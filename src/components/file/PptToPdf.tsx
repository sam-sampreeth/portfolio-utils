import { useState, useRef, useEffect } from "react";
import { Loader2, ShieldCheck, AlertTriangle, Presentation, ArrowRight, Settings2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { pptxToHtml } from "@jvmr/pptx-to-html";
import { jsPDF } from "jspdf";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";

export function PptToPdf() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isRendering, setIsRendering] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);
    const [slidesHtmlContent, setSlidesHtmlContent] = useState<string[]>([]);

    const previewContainerRef = useRef<HTMLDivElement>(null);

    // Effect to render slides into the preview container when content updates
    useEffect(() => {
        if (previewContainerRef.current && slidesHtmlContent.length > 0) {
            previewContainerRef.current.innerHTML = "";
            slidesHtmlContent.forEach((slideHtml) => {
                const slidePreview = document.createElement("div");
                slidePreview.className = "pptx-slide-page-preview";
                slidePreview.style.marginBottom = "20px";
                slidePreview.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                slidePreview.style.background = "white";
                slidePreview.style.padding = "20px";
                // We wrap the html in a safe div
                slidePreview.innerHTML = slideHtml;
                previewContainerRef.current?.appendChild(slidePreview);
            });
        }
    }, [slidesHtmlContent]);

    const handleFileAdded = async (files: File[]) => {
        const file = files[0];
        if (!file) return;
        if (!file.name.toLowerCase().endsWith('.pptx')) {
            toast.error("Please upload a valid PowerPoint (.pptx) file.");
            return;
        }
        setSelectedFile(file);
        setSlidesHtmlContent([]); // Clear previous
        renderPptx(file);
    };

    const renderPptx = async (file: File) => {
        setIsRendering(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const slidesHtml = await pptxToHtml(arrayBuffer, {
                width: 1123,
                height: 794,
                scaleToFit: true
            });
            setSlidesHtmlContent(slidesHtml);
            setIsRendering(false);
        } catch (err) {
            console.error("PPT Render Error", err);
            toast.error("Failed to render PPTX.");
            setIsRendering(false);
        }
    };

    const handleSave = async (fileName: string) => {
        if (slidesHtmlContent.length === 0) return;

        setShowDownloadDialog(false);
        setIsConverting(true);
        const toastId = toast.loading("Generating PDF...");

        try {
            // Create PDF
            const doc = new jsPDF({
                orientation: "portrait", // Text is better read in portrait usually, but slides are landscape. Let's stick to portrait for "Text List" style.
                unit: "mm",
                format: "a4"
            });

            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);

            let pageHeight = doc.internal.pageSize.height;
            let cursorY = 20;

            slidesHtmlContent.forEach((slideHtml, index) => {
                // Parse text from HTML
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = slideHtml;
                const text = tempDiv.innerText || tempDiv.textContent || "";

                // Clean up extra whitespace
                const cleanText = text.replace(/\s+/g, " ").trim();

                if (!cleanText) return;

                // Add Header for Slide
                if (cursorY > pageHeight - 30) {
                    doc.addPage();
                    cursorY = 20;
                }

                doc.setFont("helvetica", "bold");
                doc.text(`Slide ${index + 1}`, 15, cursorY);
                cursorY += 8;

                // Add Body Text
                doc.setFont("helvetica", "normal");
                const splitText = doc.splitTextToSize(cleanText, 180);

                // Check if text fits, if not add page
                const textHeight = splitText.length * 5; // approx 5mm per line (11pt is ~4mm)

                if (cursorY + textHeight > pageHeight - 20) {
                    doc.addPage();
                    cursorY = 20;
                    // Reprint header if moved to new page? No, just continue text.
                }

                doc.text(splitText, 15, cursorY);
                cursorY += textHeight + 10; // Space between slides
            });

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
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                <Presentation className="w-6 h-6 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                PPT to PDF
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Convert PowerPoint slides to a clean PDF document (Text Only).
                        </p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            <span>Client-Side</span>
                        </div>
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
                                    label="Drop PowerPoint Presentation here"
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
                                        Configuration
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                                    {isRendering ? <Loader2 className="w-5 h-5 animate-spin text-blue-400" /> : <Presentation className="w-5 h-5 text-blue-400" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-200 truncate">{selectedFile.name}</p>
                                                    <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                                            <p className="text-xs text-amber-200/70 leading-relaxed font-medium">
                                                <strong>Note:</strong> This extracts <span className="text-white font-bold">text content</span> from slides. Images and complex layouts are not included.
                                            </p>
                                        </div>

                                        <Button
                                            onClick={() => setShowDownloadDialog(true)}
                                            disabled={isRendering || isConverting}
                                            className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
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
                                            onClick={() => { setSelectedFile(null); setSlidesHtmlContent([]); }}
                                            className="w-full border-slate-800 hover:bg-slate-800 text-slate-400"
                                        >
                                            Change Presentation
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Main Preview */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="bg-slate-900 border border-slate-800 min-h-[600px] shadow-2xl rounded-[2.5rem] overflow-hidden relative group">
                                    <div className="absolute inset-0 overflow-auto p-8 custom-scrollbar">
                                        {isRendering && (
                                            <div className="absolute inset-0 z-10 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
                                                <div className="text-center space-y-4">
                                                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                                                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Rendering Slides...</p>
                                                </div>
                                            </div>
                                        )}
                                        {/* The container is where pptxToHtml dumps the slides */}
                                        <div
                                            ref={previewContainerRef}
                                            className="pptx-preview-container w-full mx-auto"
                                        />
                                    </div>
                                </div>
                                <p className="text-center text-slate-500 text-xs uppercase font-bold tracking-widest">Slide Preview</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <DownloadConfirmDialog
                    isOpen={showDownloadDialog}
                    onClose={() => setShowDownloadDialog(false)}
                    onConfirm={handleSave}
                    defaultFileName={selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, "") : "presentation"}
                    extension="pdf"
                    isProcessing={isConverting}
                    title="Save PDF"
                    description="Convert and download the presentation as a PDF."
                />
            </div>
        </div>
    );
}
