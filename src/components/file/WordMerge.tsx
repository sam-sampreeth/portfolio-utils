import { useState } from "react";
import { Loader2, ShieldCheck, Combine, FileText, AlertTriangle, GripVertical, Trash2, ArrowRight } from "lucide-react";
import { saveAs } from "file-saver";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import JSZip from "jszip";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";

export function WordMerge() {
    const [fileList, setFileList] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);
    const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);

    const handleFileAdded = (files: File[]) => {
        const validFiles = files.filter(f => f.name.toLowerCase().endsWith('.docx'));
        if (validFiles.length !== files.length) {
            toast.error("Some files were skipped. Only .docx files allowed.");
        }
        setFileList(prev => [...prev, ...validFiles]);
        setMergedBlob(null); // Reset prev merge result if changed
    };

    const performMerge = async () => {
        if (fileList.length < 2) {
            toast.error("Please select at least 2 files to merge.");
            return;
        }

        setIsProcessing(true);
        try {
            // Load the first file as the "Master" container
            const masterBlob = await fileList[0].arrayBuffer();
            const masterZip = new JSZip();
            await masterZip.loadAsync(masterBlob);

            let masterXml = await masterZip.file("word/document.xml")?.async("string");
            if (!masterXml) throw new Error("Could not parse master document structure.");

            // Find the end of the Master's body
            const bodyEndIndex = masterXml.lastIndexOf("</w:body>");
            if (bodyEndIndex === -1) throw new Error("Invalid Master DOCX format.");

            let newContent = "";
            const pageBreakXml = `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;

            // Loop through subsequent files
            for (let i = 1; i < fileList.length; i++) {
                const childFile = fileList[i];
                const childZip = new JSZip();
                await childZip.loadAsync(await childFile.arrayBuffer());

                const childXml = await childZip.file("word/document.xml")?.async("string");
                if (childXml) {
                    const match = childXml.match(/<w:body>(.*?)<\/w:body>/s);
                    if (match && match[1]) {
                        let extractedBody = match[1];

                        // SANITIZATION (as per original logic to avoid corruption)
                        extractedBody = extractedBody.replace(/<w:drawing>.*?<\/w:drawing>/g, "");
                        extractedBody = extractedBody.replace(/<w:pict>.*?<\/w:pict>/g, "");
                        extractedBody = extractedBody.replace(/r:id=".*?"/g, "");
                        extractedBody = extractedBody.replace(/r:embed=".*?"/g, "");

                        newContent += pageBreakXml + extractedBody;
                    }
                }
            }

            // Inject content before the closing </body> tag
            const finalXml = masterXml.slice(0, bodyEndIndex) + newContent + masterXml.slice(bodyEndIndex);
            masterZip.file("word/document.xml", finalXml);

            const resultBlob = await masterZip.generateAsync({ type: "blob" });
            setMergedBlob(resultBlob);
            setIsProcessing(false);

            // Trigger dialog immediately for smooth flow
            setShowDownloadDialog(true);
            toast.success("Merged successfully!");

        } catch (error) {
            console.error("Merge Error:", error);
            toast.error("Failed to merge. Ensure all files are valid DOCX.");
            setIsProcessing(false);
        }
    };

    const handleSave = (filename: string) => {
        if (!mergedBlob) return;
        saveAs(mergedBlob, `${filename}.docx`);
        setShowDownloadDialog(false);
        toast.success("Document Saved!");
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-purple-500/30">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-600/20 rounded-2xl border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                <Combine className="w-6 h-6 text-purple-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                Word Merge
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Combine multiple DOCX files into one document.
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
                                label="Add Word Docs to Merge"
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
                                                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between group cursor-grab active:cursor-grabbing hover:border-purple-500/30 transition-all shadow-sm hover:shadow-purple-500/10"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-slate-500 group-hover:text-purple-400 transition-colors">
                                                            <GripVertical className="w-4 h-4" />
                                                        </div>
                                                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-slate-200 text-sm truncate max-w-[200px]">{file.name}</p>
                                                                {idx === 0 && (
                                                                    <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wide">
                                                                        MASTER
                                                                    </span>
                                                                )}
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
                                        <span className="text-xs font-black uppercase tracking-wide">Format Warning</span>
                                    </div>
                                    <p className="text-[11px] text-amber-200/60 leading-relaxed font-medium">
                                        To prevent file corruption, <strong>images and special objects</strong> from appended files are stripped. The "Master" file (first in list) retains all data.
                                    </p>
                                </div>

                                <div className="text-xs text-slate-500 leading-relaxed">
                                    <p>The top file defines the headers, footers, and styles for the merged document.</p>
                                </div>

                                <Button
                                    onClick={performMerge}
                                    disabled={isProcessing || fileList.length < 2}
                                    className="w-full h-14 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all"
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
                    defaultFileName={`merged_${fileList.length}_files`}
                    extension="docx"
                    isProcessing={false}
                    title="Save Merged DOCX"
                    description={`Save the combination of ${fileList.length} documents.`}
                />
            </div>
        </div>
    );
}
