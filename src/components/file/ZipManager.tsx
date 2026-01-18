import { useState } from "react";
import {
    FileArchive,
    Download,
    File as FileIcon,
    Search,
    Trash,
    FolderOpen,
    Archive,
    FolderArchive,
    ShieldCheck
} from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";
import { motion } from "framer-motion";

interface ZipFileItem {
    name: string;
    size: number;
    file: File;
}

interface ExtractedFile {
    name: string;
    size: number;
    relativePath: string;
    dir: boolean;
    data: JSZip.JSZipObject;
}

export function ZipManager() {
    // Creation State
    const [filesToZip, setFilesToZip] = useState<ZipFileItem[]>([]);
    const [isZipping, setIsZipping] = useState(false);
    const [showZipDialog, setShowZipDialog] = useState(false);
    const [createdZipBlob, setCreatedZipBlob] = useState<Blob | null>(null);

    // Extraction State
    const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
    const [extractSearch, setExtractSearch] = useState("");
    const [originalZipName, setOriginalZipName] = useState("");

    // Create ZIP Logic
    const handleFilesAddedToZip = (newFiles: File[]) => {
        const items = newFiles.map(file => ({
            name: file.name,
            size: file.size,
            file
        }));
        setFilesToZip(prev => [...prev, ...items]);
    };

    const removeFileToZip = (index: number) => {
        setFilesToZip(prev => prev.filter((_, i) => i !== index));
    };

    const prepareZip = async () => {
        if (filesToZip.length === 0) return;
        setIsZipping(true);
        try {
            const zip = new JSZip();
            filesToZip.forEach(item => {
                zip.file(item.name, item.file);
            });
            const content = await zip.generateAsync({ type: "blob" });
            setCreatedZipBlob(content);
            setShowZipDialog(true);
        } catch (error) {
            toast.error("Failed to create ZIP");
            console.error(error);
        } finally {
            setIsZipping(false);
        }
    };

    const handleSaveZip = (filename: string) => {
        if (!createdZipBlob) return;
        saveAs(createdZipBlob, `${filename}.zip`);
        setShowZipDialog(false);
        toast.success("ZIP saved successfully!");
    };

    // Extract ZIP Logic
    const handleZipUpload = async (files: File[]) => {
        const file = files[0];
        if (!file) return;
        if (!file.name.endsWith('.zip')) {
            toast.error("Please upload a .zip file");
            return;
        }

        setOriginalZipName(file.name.replace('.zip', ''));
        try {
            const zip = new JSZip();
            const contents = await zip.loadAsync(file);
            const files: ExtractedFile[] = [];

            contents.forEach((relativePath, data) => {
                // Skip Mac metadata
                if (relativePath.startsWith('__MACOSX/')) return;

                files.push({
                    name: relativePath.split('/').pop() || relativePath,
                    size: (data as any)._data?.uncompressedSize || 0,
                    relativePath,
                    dir: data.dir,
                    data
                });
            });

            setExtractedFiles(files);
            toast.success("ZIP loaded!");
        } catch (error) {
            toast.error("Failed to read ZIP");
            console.error(error);
        }
    };

    const downloadExtractedFile = async (file: ExtractedFile) => {
        if (file.dir) return;
        try {
            const blob = await file.data.async("blob");
            saveAs(blob, file.name);
            toast.success(`Downloaded ${file.name}`);
        } catch (error) {
            toast.error("Failed to download file");
        }
    };

    const downloadAllExtracted = async () => {
        let count = 0;
        for (const file of extractedFiles) {
            if (!file.dir) {
                await downloadExtractedFile(file);
                count++;
            }
        }
        if (count > 0) toast.success(`Downloaded ${count} files.`);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const filteredExtracted = extractedFiles.filter(f =>
        f.relativePath.toLowerCase().includes(extractSearch.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                <FileArchive className="w-6 h-6 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                ZIP Manager
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Create compressed archives from multiple files or extract existing ZIP files securely.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>Client-Side</span>
                    </div>
                </div>

                <Tabs defaultValue="create" className="w-full">
                    <div className="flex justify-center mb-8">
                        <TabsList className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl h-16 w-full max-w-md grid grid-cols-2 shadow-lg">
                            <TabsTrigger
                                value="create"
                                className="rounded-xl h-full font-bold uppercase tracking-wide text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Archive className="w-4 h-4" />
                                Create ZIP
                            </TabsTrigger>
                            <TabsTrigger
                                value="extract"
                                className="rounded-xl h-full font-bold uppercase tracking-wide text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <FolderOpen className="w-4 h-4" />
                                Extract ZIP
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="create">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            {/* Left: Actions */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="p-6 rounded-[2rem] bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl sticky top-8">
                                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-6">
                                        <Archive className="w-5 h-5 text-blue-500" />
                                        Archive Actions
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                                            <span className="text-xs font-bold uppercase text-slate-500">File Count</span>
                                            <span className="text-xl font-bold text-white">{filesToZip.length}</span>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                                            <span className="text-xs font-bold uppercase text-slate-500">Total Size</span>
                                            <span className="text-xl font-bold text-white">
                                                {formatSize(filesToZip.reduce((acc, curr) => acc + curr.size, 0))}
                                            </span>
                                        </div>

                                        <Button
                                            onClick={prepareZip}
                                            disabled={isZipping || filesToZip.length === 0}
                                            className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Download className="w-5 h-5" />
                                                <span>Save Archive</span>
                                            </div>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Right: File List & Upload */}
                            <div className="lg:col-span-2 space-y-6">
                                <FileUpload
                                    onChange={handleFilesAddedToZip}
                                    multiple={true}
                                    label="Add files to the archive"
                                />

                                {filesToZip.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-bold uppercase text-slate-500 tracking-widest px-2">
                                            Included Files
                                        </h3>
                                        <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-4 max-h-[500px] overflow-auto custom-scrollbar">
                                            {filesToZip.map((item, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 mb-2 rounded-xl bg-slate-900 border border-slate-800 group hover:border-blue-500/30 transition-all">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                                                            <FileIcon className="w-5 h-5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-slate-200 truncate">{item.name}</p>
                                                            <p className="text-[10px] text-slate-500 uppercase font-black">{formatSize(item.size)}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFileToZip(index)}
                                                        className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-500 transition-all shrink-0"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="extract">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            {/* Left: Archive Info */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="space-y-4">
                                    {extractedFiles.length === 0 ? (
                                        <div className="p-8 rounded-[2rem] bg-slate-900/50 border border-slate-800 border-dashed min-h-[300px] flex flex-col items-center justify-center text-center space-y-4">
                                            <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center text-slate-700">
                                                <FolderArchive className="w-8 h-8" />
                                            </div>
                                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                                                Upload ZIP to browse
                                            </p>
                                            <div className="w-full">
                                                <FileUpload
                                                    onChange={handleZipUpload}
                                                    accept={{ 'application/zip': ['.zip'] }}
                                                    label="Select ZIP"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 rounded-[2rem] bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl sticky top-8">
                                            <h3 className="text-lg font-bold text-white break-all mb-1">{originalZipName}.zip</h3>
                                            <div className="text-slate-500 text-xs font-medium mb-6">Archive Info</div>

                                            <div className="space-y-4">
                                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                                                    <span className="text-xs font-bold uppercase text-slate-500">Items</span>
                                                    <span className="text-xl font-bold text-white">{extractedFiles.length}</span>
                                                </div>

                                                <div className="relative">
                                                    <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                                                    <Input
                                                        placeholder="Filter files..."
                                                        value={extractSearch}
                                                        onChange={(e) => setExtractSearch(e.target.value)}
                                                        className="bg-slate-950 border-slate-800 pl-10 h-11 text-sm font-medium"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-2 pt-2">
                                                    <Button
                                                        onClick={downloadAllExtracted}
                                                        disabled={extractedFiles.length === 0}
                                                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                                                    >
                                                        Download All
                                                    </Button>
                                                    <Button
                                                        onClick={() => { setExtractedFiles([]); setExtractSearch(""); }}
                                                        variant="ghost"
                                                        className="h-12 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl"
                                                    >
                                                        Close Archive
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Content Browser */}
                            <div className="lg:col-span-2">
                                <div className="bg-slate-900 border border-slate-800 rounded-[2rem] min-h-[500px] flex flex-col">
                                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <FolderOpen className="w-5 h-5 text-blue-500" />
                                            <span className="text-sm font-bold text-white uppercase tracking-wide">Archive Content</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{filteredExtracted.length} Matches</span>
                                    </div>

                                    <div className="flex-1 p-4 overflow-auto max-h-[600px] custom-scrollbar space-y-2">
                                        {extractedFiles.length > 0 ? (
                                            filteredExtracted.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/50 hover:bg-slate-900 hover:border-blue-500/30 transition-all group">
                                                    <div className="flex items-center gap-4 overflow-hidden">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                                            file.dir ? "bg-amber-500/10 text-amber-500" : "bg-slate-800 text-slate-500 group-hover:text-blue-400"
                                                        )}>
                                                            {file.dir ? <FolderArchive className="w-5 h-5" /> : <FileIcon className="w-5 h-5" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors truncate">{file.relativePath}</p>
                                                            {!file.dir && <p className="text-[10px] text-slate-600 uppercase font-black">{formatSize(file.size)}</p>}
                                                        </div>
                                                    </div>
                                                    {!file.dir && (
                                                        <button
                                                            onClick={() => downloadExtractedFile(file)}
                                                            className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-blue-400 hover:border-blue-500/50 transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-700 space-y-4 py-20">
                                                <Search className="w-12 h-12 opacity-20" />
                                                <p className="text-sm font-bold uppercase tracking-widest">No items found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </TabsContent>
                </Tabs>

                <DownloadConfirmDialog
                    isOpen={showZipDialog}
                    onClose={() => setShowZipDialog(false)}
                    onConfirm={handleSaveZip}
                    defaultFileName="archive"
                    extension="zip"
                    isProcessing={false}
                    title="Save New Archive"
                    description="Enter a name for your compressed ZIP file."
                />
            </div>
        </div>
    );
}
