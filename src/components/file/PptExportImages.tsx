import { useState, useRef } from "react";
import { Image as ImageIcon, Download, Loader2, ShieldCheck, AlertTriangle, Settings2, Presentation, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { pptxToHtml } from "@jvmr/pptx-to-html";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toPng } from "html-to-image";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";

export function PptExportImages() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isRendering, setIsRendering] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);

    const previewContainerRef = useRef<HTMLDivElement>(null);
    const printContainerRef = useRef<HTMLDivElement>(null);

    const handleFileAdded = async (files: File[]) => {
        const file = files[0];
        if (!file) return;
        if (!file.name.toLowerCase().endsWith('.pptx')) {
            toast.error("Please upload a valid PowerPoint (.pptx) file.");
            return;
        }
        setSelectedFile(file);

        setTimeout(() => {
            if (previewContainerRef.current) {
                renderPptx(file);
            }
        }, 100);
    };

    const renderPptx = async (file: File) => {
        setIsRendering(true);
        const previewContainer = previewContainerRef.current;
        const printContainer = printContainerRef.current;

        if (!previewContainer || !printContainer) return;

        previewContainer.innerHTML = ""; // Clear
        printContainer.innerHTML = "";   // Clear

        try {
            const arrayBuffer = await file.arrayBuffer();
            // Render slides
            const slidesHtml = await pptxToHtml(arrayBuffer, {
                width: 1280,
                height: 720,
                scaleToFit: true
            });

            if (slidesHtml.length === 0) {
                toast.error("No slides found in this presentation.");
                setIsRendering(false);
                return;
            }

            slidesHtml.forEach((slideHtml: string) => {
                // Preview Slide
                const slidePreview = document.createElement("div");
                slidePreview.className = "pptx-slide-page-preview";
                slidePreview.style.marginBottom = "20px";
                slidePreview.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                slidePreview.style.background = "white";
                slidePreview.innerHTML = slideHtml;
                previewContainer.appendChild(slidePreview);

                // Capture Slide (Clean)
                const slideCapture = document.createElement("div");
                slideCapture.className = "pptx-slide-page-capture";
                slideCapture.style.width = "1280px";
                slideCapture.style.height = "720px";
                slideCapture.style.marginBottom = "0";
                slideCapture.style.background = "white";
                slideCapture.style.overflow = "hidden";
                slideCapture.innerHTML = slideHtml;
                printContainer.appendChild(slideCapture);
            });

            setIsRendering(false);

        } catch (err) {
            console.error("PPT Render Error", err);
            toast.error("Failed to render PPTX.");
            setIsRendering(false);
        }
    };

    const handleExportImages = async (baseFilename: string) => {
        const container = printContainerRef.current;
        if (!container || !selectedFile) return;

        setShowDownloadDialog(false);
        setIsExporting(true);
        setGeneratedImages([]); // Reset
        const toastId = toast.loading("Capturing slides (High Res)...");
        const zip = new JSZip();
        const images: string[] = [];

        try {
            // Find our custom wrappers in the CLEAN CAPTURE container
            const slides = container.querySelectorAll('.pptx-slide-page-capture');

            if (slides.length === 0) {
                throw new Error("No slides found to export");
            }

            let count = 0;
            // Iterate and capture
            for (let i = 0; i < slides.length; i++) {
                const node = slides[i] as HTMLElement;

                try {
                    // Capture
                    const dataUrl = await toPng(node, {
                        backgroundColor: '#ffffff',
                        // pixelRatio: 1 // Capture at native 1280x720 
                    });
                    const base64Info = dataUrl.split(',')[1];
                    zip.file(`Slide_${i + 1}.png`, base64Info, { base64: true });
                    images.push(dataUrl);
                    count++;
                } catch (e) {
                    console.error("Slide capture failed", e);
                }
            }

            if (count === 0) throw new Error("Capture failed");

            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `${baseFilename}.zip`);

            setGeneratedImages(images);
            toast.dismiss(toastId);
            toast.success(`Exported ${count} slides!`);

        } catch (err) {
            console.error("Export Error:", err);
            toast.dismiss(toastId);
            toast.error("Failed to export images.");
        } finally {
            setIsExporting(false);
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
                                <ImageIcon className="w-6 h-6 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                Export Slides
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Convert every slide in your presentation to a high-quality PNG image.
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
                                                <strong>Note:</strong> Rendering simulates the browser view. Some fonts or effects might differ from desktop PowerPoint.
                                            </p>
                                        </div>

                                        <Button
                                            onClick={() => setShowDownloadDialog(true)}
                                            disabled={isRendering || isExporting}
                                            className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                                        >
                                            {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                                <div className="flex items-center gap-2">
                                                    <Download className="w-5 h-5" />
                                                    <span>Download Images</span>
                                                </div>
                                            )}
                                        </Button>

                                        <Button
                                            variant="outline"
                                            onClick={() => { setSelectedFile(null); }}
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
                                    <div className="absolute inset-0 overflow-auto p-4 md:p-8 custom-scrollbar">
                                        {isRendering && (
                                            <div className="absolute inset-0 z-10 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
                                                <div className="text-center space-y-4">
                                                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                                                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Processing Slides...</p>
                                                </div>
                                            </div>
                                        )}
                                        <div
                                            ref={previewContainerRef}
                                            className="pptx-preview-container w-full mx-auto"
                                        />
                                    </div>
                                </div>
                                <p className="text-center text-slate-500 text-xs uppercase font-bold tracking-widest">Slide Preview</p>
                            </div>

                            {/* Hidden Capture Container */}
                            <div
                                ref={printContainerRef}
                                className="fixed top-0 left-0 -z-50 pointer-events-none opacity-0"
                            />

                            {/* Result Grid */}
                            {generatedImages.length > 0 && (
                                <div className="lg:col-span-3 space-y-6 pt-8 border-t border-slate-800">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <ImageIcon className="w-5 h-5 text-blue-400" />
                                        Generated Images ({generatedImages.length})
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {generatedImages.map((img, idx) => (
                                            <div key={idx} className="group relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-lg hover:ring-2 hover:ring-blue-500 transition-all">
                                                <img src={img} alt={`Slide ${idx + 1}`} className="w-full h-auto object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <a
                                                        href={img}
                                                        download={`Slide_${idx + 1}.png`}
                                                        className="p-2 bg-white rounded-full text-slate-900 hover:scale-110 transition-transform"
                                                        title="Download Image"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                </div>
                                                <div className="absolute bottom-0 inset-x-0 bg-black/50 p-2 text-center text-xs text-white font-mono backdrop-blur-sm">
                                                    Slide {idx + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <DownloadConfirmDialog
                    isOpen={showDownloadDialog}
                    onClose={() => setShowDownloadDialog(false)}
                    onConfirm={handleExportImages}
                    defaultFileName={selectedFile ? `${selectedFile.name.replace(/\.[^/.]+$/, "")}_slides` : "slides"}
                    extension="zip"
                    isProcessing={isExporting}
                    title="Download Slide Images"
                    description="Save all rendered slides as high-quality PNGs in a ZIP archive."
                />
            </div>
        </div>
    );
}
