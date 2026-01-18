import { useState } from "react";
import { Loader2, ShieldCheck, Combine, AlertTriangle, Presentation, GripVertical, Trash2, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import JSZip from "jszip";
// @ts-ignore
import PptxGenJS from "pptxgenjs";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";
import { saveAs } from "file-saver";

export function PptMerge() {
    const [fileList, setFileList] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);

    // We can't really "preprocess" PptxGenJS into a blob easily without triggers,
    // so for this flow, we'll generate inside the success callback or inside the dialog effect?
    // Actually, let's keep the generation logic.
    // PptxGenJS.writeFile() triggers auto download.
    // But PptxGenJS.write("blob") returns a promise with blob.
    // So we can use that pattern!
    const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);

    const handleFileAdded = (files: File[]) => {
        const validFiles = files.filter(f => f.name.toLowerCase().endsWith('.pptx'));
        if (validFiles.length !== files.length) {
            toast.error("Some files were skipped. Only .pptx files allowed.");
        }
        setFileList(prev => [...prev, ...validFiles]);
        setMergedBlob(null);
    };

    const performMerge = async () => {
        if (fileList.length < 2) {
            toast.error("Please select at least 2 files to merge.");
            return;
        }

        setIsProcessing(true);
        const toastId = toast.loading("Processing presentations...");

        try {
            // Create new presentation
            const pres = new PptxGenJS();
            // Optional: Set Meta
            pres.author = 'Utils Page';
            pres.company = 'Local Processing';
            pres.title = 'Merged Presentation';

            // Loop through each file
            for (const file of fileList) {
                try {
                    const zip = new JSZip();
                    await zip.loadAsync(file);

                    // 1. Find slides in order
                    const slideFiles: string[] = [];
                    zip.folder("ppt/slides")?.forEach((relativePath) => {
                        if (relativePath.match(/slide[0-9]+\.xml$/)) {
                            slideFiles.push(relativePath);
                        }
                    });

                    // Sort slides (slide1, slide2, slide10...)
                    slideFiles.sort((a, b) => {
                        const numA = parseInt(a.match(/\d+/)?.[0] || "0");
                        const numB = parseInt(b.match(/\d+/)?.[0] || "0");
                        return numA - numB;
                    });

                    // Separator Slide
                    let slide = pres.addSlide();
                    slide.background = { color: "F1F5F9" }; // Light gray separator
                    slide.addText(`Source: ${file.name}`, {
                        x: 1, y: '45%', w: '80%', fontSize: 24, bold: true, color: '334155', align: 'center'
                    });

                    // 2. Extract Text from each slide
                    for (const slidePath of slideFiles) {
                        const xml = await zip.file(`ppt/slides/${slidePath}`)?.async("string");
                        if (xml) {
                            // Extract text: <a:t>Content</a:t>
                            const textMatches = xml.match(/<a:t.*?>(.*?)<\/a:t>/g);

                            const extractedText = textMatches
                                ? textMatches.map(t => t.replace(/<\/?a:t.*?>/g, "")).join(" ")
                                : "(No text content)";

                            // Add new slide
                            const newSlide = pres.addSlide();
                            newSlide.addText(extractedText, {
                                x: 0.5, y: 0.5, w: '90%', h: '80%',
                                fontSize: 14, color: '000000',
                                valign: 'top'
                            });
                        }
                    }

                } catch (err) {
                    console.error(`Failed to parse ${file.name}`, err);
                    toast.error(`Skipped corrupt file: ${file.name}`);
                }
            }

            // Generate Blob
            const blob = await pres.write({ outputType: "blob" });
            setMergedBlob(blob as Blob);

            toast.dismiss(toastId);
            toast.success("Merged successfully!");
            setShowDownloadDialog(true);

        } catch (error) {
            console.error("Merge Error:", error);
            toast.dismiss(toastId);
            toast.error("Failed to merge.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = (filename: string) => {
        if (!mergedBlob) return;
        saveAs(mergedBlob, `${filename}.pptx`);
        setShowDownloadDialog(false);
        toast.success("Document Saved!");
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                <Combine className="w-6 h-6 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                PPT Merge
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Consolidate general text from multiple presentations into a single file.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>Client-Side</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Upload Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            className="p-8 rounded-[2.5rem] bg-slate-900/50 border border-slate-800 text-center space-y-4 shadow-xl"
                        >
                            <FileUpload
                                onChange={handleFileAdded}
                                multiple={true}
                                label="Add Presentations"
                            />
                        </motion.div>

                        {fileList.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase text-slate-500 tracking-widest px-2">
                                    Reorder Files (Drag & Drop)
                                </h3>
                                <Reorder.Group axis="y" values={fileList} onReorder={setFileList} className="space-y-3">
                                    <AnimatePresence>
                                        {fileList.map((file, idx) => (
                                            <Reorder.Item key={file.name + idx} value={file}>
                                                <motion.div
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between group cursor-grab active:cursor-grabbing hover:border-blue-500/30 transition-all shadow-sm hover:shadow-blue-500/10"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-slate-500 group-hover:text-blue-400 transition-colors">
                                                            <GripVertical className="w-4 h-4" />
                                                        </div>
                                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                            <Presentation className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-slate-200 text-sm truncate max-w-[200px]">{file.name}</p>
                                                                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">#{idx + 1}</span>
                                                            </div>
                                                            <p className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setFileList(fileList.filter(f => f !== file))}
                                                        className="p-2 hover:bg-red-500/10 rounded-xl text-slate-500 hover:text-red-400 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </motion.div>
                                            </Reorder.Item>
                                        ))}
                                    </AnimatePresence>
                                </Reorder.Group>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6 lg:col-span-1">
                        <div className="p-6 rounded-[2rem] bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl sticky top-8">
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-100 uppercase tracking-tight">Merge Info</h3>

                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                                    <div className="flex items-center gap-2 text-amber-500">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        <span className="text-xs font-black uppercase tracking-wide">Text-Based Only</span>
                                    </div>
                                    <p className="text-[11px] text-amber-200/60 leading-relaxed font-medium">
                                        This tool extracts <strong>text content</strong> into a new plain layout. Original visual themes, images, and complex animations are <strong>not preserved</strong>.
                                    </p>
                                </div>

                                <Button
                                    onClick={performMerge}
                                    disabled={isProcessing || fileList.length < 2}
                                    className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                                >
                                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <div className="flex items-center gap-2">
                                            <span>Merge {fileList.length} Files</span>
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
                    onConfirm={handleSave}
                    defaultFileName={`merged_presentation`}
                    extension="pptx"
                    isProcessing={false}
                    title="Save Merged PPTX"
                    description={`Save the consolidated presentation.`}
                />
            </div>
        </div>
    );
}
