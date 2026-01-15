import { useState, useEffect, useRef } from "react";
import { BookOpen, Copy, Trash2, Download, Save, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const MAX_BYTES = 100 * 1024; // 100KB
const STORAGE_KEY = "quick-notepad-content-compressed";

export const QuickNotepad = () => {
    const [text, setText] = useState("");
    const [byteSize, setByteSize] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Static classes for Premium UI
    const staticBgClass = "bg-[#0a0a0a]";
    const staticBorderClass = "border-white/10";
    const staticTextMain = "text-white";
    const staticTextMuted = "text-white/50";

    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Download Dialog State
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    const [downloadName, setDownloadName] = useState("");

    // Load from storage
    useEffect(() => {
        const loadContent = async () => {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    setLastSaved(new Date()); // Assess as valid save on load
                    // Try to decompress
                    try {
                        // Base64 -> Uint8Array
                        const binaryString = atob(stored);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }

                        // Decompress
                        const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
                        const response = await new Response(stream).text();
                        setText(response);
                    } catch (e) {
                        // Fallback for uncompressed legacy data
                        console.warn("Failed to decompress, trying raw text", e);
                        setText(stored);
                    }
                }
            } catch (error) {
                console.error("Failed to load note", error);
                toast.error("Failed to load saved note");
            }
        };
        loadContent();
    }, []);

    // Calculate size
    useEffect(() => {
        setByteSize(new Blob([text]).size);
    }, [text]);

    const saveContent = async (content: string) => {
        if (!content) {
            localStorage.removeItem(STORAGE_KEY);
            setIsSaving(false);
            setHasUnsavedChanges(false);
            setLastSaved(new Date());
            return;
        }

        setIsSaving(true);
        try {
            const stream = new Blob([content]).stream().pipeThrough(new CompressionStream("gzip"));
            const compressedResponse = await new Response(stream).arrayBuffer();

            let binary = '';
            const bytes = new Uint8Array(compressedResponse);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);

            localStorage.setItem(STORAGE_KEY, base64);
            setLastSaved(new Date());
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error("Compression failed", error);
            localStorage.setItem(STORAGE_KEY, content);
            setLastSaved(new Date());
            setHasUnsavedChanges(false);
        } finally {
            setIsSaving(false);
        }
    };

    // Auto-save debounced
    useEffect(() => {
        const saveTimeout = setTimeout(() => {
            saveContent(text);
        }, 3500);
        return () => clearTimeout(saveTimeout);
    }, [text]);

    const handleManualSync = () => {
        saveContent(text);
        toast.success("Synced successfully");
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        const newSize = new Blob([newText]).size;

        if (newSize > MAX_BYTES) {
            toast.error("Maximum size limit (100KB) reached!");
            return;
        }
        setText(newText);
        setHasUnsavedChanges(true);
    };

    const handleCopy = () => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const handleClear = () => {
        if (window.confirm("Are you sure you want to delete your note?")) {
            setText("");
            setHasUnsavedChanges(false);
            toast.success("Cleared");
        }
    };

    const openDownloadDialog = () => {
        if (!text) return;
        setDownloadName(`note-${new Date().toISOString().slice(0, 10)}`);
        setIsDownloadOpen(true);
    };

    const performDownload = () => {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${downloadName}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Downloaded");
        setIsDownloadOpen(false);
    };

    const usagePercent = Math.min(100, (byteSize / MAX_BYTES) * 100);

    const getStatusText = () => {
        if (isSaving) return "Syncing...";
        if (hasUnsavedChanges) return "Unsaved Changes";
        return "Synced Locally";
    };

    const getStatusColor = () => {
        if (isSaving) return "bg-blue-500 animate-pulse";
        if (hasUnsavedChanges) return "bg-orange-500";
        return "bg-green-500";
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <BookOpen size={28} />
                    </div>
                    <div>
                        <h2 className={`text-3xl font-black tracking-tight ${staticTextMain}`}>Quick Notepad</h2>
                        <div className="flex items-center gap-2">
                            <p className={`${staticTextMuted} font-medium`}>Auto-saving local workspace</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isSaving ? (
                        <span className="text-xs text-blue-400 animate-pulse flex items-center gap-1">
                            <Save size={12} /> Saving...
                        </span>
                    ) : (
                        <span className={`text-xs flex items-center gap-1 ${hasUnsavedChanges ? 'text-orange-400' : 'text-white/30'}`}>
                            <Save size={12} /> {hasUnsavedChanges ? 'Unsaved' : 'Saved'}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Editor */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="relative group min-h-[600px] h-full">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                        <div className={`relative bg-[#0a0a0a] border-white/10 rounded-[1.8rem] border p-1 h-full flex flex-col transition-colors duration-300`}>
                            {/* Toolbar */}
                            <div className={`flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a0a] rounded-t-[1.5rem] z-10 sticky top-0`}>
                                <div className="flex items-center gap-4 text-sm font-medium">
                                    <span className={byteSize > MAX_BYTES * 0.9 ? "text-red-400" : "opacity-50"}>
                                        {(byteSize / 1024).toFixed(2)} KB / 100 KB
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={openDownloadDialog}
                                        className={`p-2 rounded-lg transition-colors hover:bg-white/10 text-white/60 hover:text-blue-400`}
                                        title="Download .txt"
                                    >
                                        <Download size={18} />
                                    </button>
                                    <button
                                        onClick={handleCopy}
                                        className={`p-2 rounded-lg transition-colors hover:bg-white/10 text-white/60 hover:text-white`}
                                        title="Copy All"
                                    >
                                        <Copy size={18} />
                                    </button>
                                    <button
                                        onClick={handleClear}
                                        className={`p-2 rounded-lg transition-colors hover:bg-white/10 text-white/60 hover:text-blue-400`}
                                        title="Clear All"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Editor */}
                            <textarea
                                ref={textareaRef}
                                value={text}
                                onChange={handleChange}
                                placeholder="Start typing your notes..."
                                className={`flex-1 w-full bg-transparent p-6 resize-none focus:outline-none text-lg leading-relaxed text-white/90 placeholder:text-white/20 font-mono`}
                                spellCheck={false}
                            />

                            {/* Usage Bar */}
                            <div className="h-1 bg-white/5 w-full">
                                <div
                                    className={`h-full transition-all duration-300 ${usagePercent > 90 ? 'bg-red-500' : 'bg-blue-600'}`}
                                    style={{ width: `${usagePercent}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className={`${staticBgClass} rounded-[1.5rem] border ${staticBorderClass} p-6 space-y-6`}>
                        <h3 className={`text-lg font-bold ${staticTextMain} mb-1 flex items-center gap-2`}>
                            <AlertCircle size={18} className="text-blue-400" />
                            Details
                        </h3>

                        <div className="space-y-4">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs text-white/40 uppercase font-bold tracking-wider">Sync Status</p>
                                    <button
                                        onClick={handleManualSync}
                                        className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors"
                                    >
                                        SYNC NOW
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-white font-mono flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${getStatusColor()}`}></span>
                                        {getStatusText()}
                                    </p>
                                    {lastSaved && (
                                        <p className="text-xs text-white/30">
                                            Last: {lastSaved.toLocaleTimeString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <p className="text-xs text-white/40 uppercase font-bold tracking-wider mb-1">Characters</p>
                                <p className="text-white font-mono">{text.length}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <p className="text-xs text-blue-200/80 leading-relaxed">
                                Content is securely stored in your browser's local storage.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Download Dialog */}
            <Dialog open={isDownloadOpen} onOpenChange={setIsDownloadOpen}>
                <DialogContent className="bg-[#0a0a0a] border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Download Note</DialogTitle>
                        <DialogDescription className="text-white/50">
                            Enter a name for your file. It will be saved as a plain text document.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 py-4">
                        <div className="flex-1 relative">
                            <input
                                value={downloadName}
                                onChange={(e) => setDownloadName(e.target.value)}
                                placeholder="File name"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                autoFocus
                            />
                        </div>
                        <span className="text-white/50 font-mono bg-white/5 px-3 py-2 rounded-lg border border-white/5">.txt</span>
                    </div>
                    <DialogFooter className="sm:justify-end gap-2">
                        <button
                            onClick={() => setIsDownloadOpen(false)}
                            className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 text-white/70 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={performDownload}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
                        >
                            Download
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
