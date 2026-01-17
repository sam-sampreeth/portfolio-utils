import { useState } from "react";
import {
    FileText,
    Copy,
    Check,
    File as FileIcon,
    ShieldCheck,
    Download,
    Eye,
    Search
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import mammoth from "mammoth";
import { saveAs } from "file-saver";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export function TextExtract() {
    const [file, setFile] = useState<File | null>(null);
    const [extractedText, setExtractedText] = useState<string>("");
    const [isExtracting, setIsExtracting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleFileUpload = (files: File[]) => {
        const selectedFile = files[0];
        if (selectedFile) {
            setFile(selectedFile);
            extractText(selectedFile);
        }
    };

    const extractText = async (file: File) => {
        setIsExtracting(true);
        setExtractedText("");

        try {
            const ext = file.name.split('.').pop()?.toLowerCase();
            const arrayBuffer = await file.arrayBuffer();

            if (ext === 'pdf') {
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let fullText = "";

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();

                    let lastY = -1;
                    let pageText = "";

                    // Sort items by Y descending (top to bottom), then X ascending
                    const items = (content.items as any[]).sort((a, b) => {
                        if (Math.abs(a.transform[5] - b.transform[5]) < 5) {
                            return a.transform[4] - b.transform[4];
                        }
                        return b.transform[5] - a.transform[5];
                    });

                    for (const item of items) {
                        // If Y changes significantly, add a newline
                        if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) {
                            pageText += "\n";
                        }
                        pageText += item.str;
                        lastY = item.transform[5];
                    }

                    fullText += pageText + "\n";
                }
                setExtractedText(fullText.trim());
                toast.success(`Extracted ${pdf.numPages} pages from PDF!`);
            } else if (ext === 'docx') {
                const result = await mammoth.extractRawText({ arrayBuffer });
                setExtractedText(result.value.trim());
                toast.success("Word text extracted!");
            } else if (file.type === 'text/plain' || ext === 'txt') {
                const text = await file.text();
                setExtractedText(text.trim());
                toast.success("Text file loaded!");
            } else {
                toast.error("Unsupported format. Use PDF or DOCX.");
            }
        } catch (error) {
            toast.error("Failed to extract text");
            console.error(error);
        } finally {
            setIsExtracting(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(extractedText);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadTxt = () => {
        const blob = new Blob([extractedText], { type: "text/plain;charset=utf-8" });
        saveAs(blob, `${file?.name.split('.')[0] || 'extracted'}-text.txt`);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const alphabet = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + alphabet[i];
    };

    const highlightedText = () => {
        if (!searchQuery.trim()) return extractedText;
        const parts = extractedText.split(new RegExp(`(${searchQuery})`, 'gi'));
        return (
            <>
                {parts.map((part, i) => (
                    part.toLowerCase() === searchQuery.toLowerCase() ?
                        <mark key={i} className="bg-yellow-500/50 text-white rounded px-0.5">{part}</mark> :
                        part
                ))}
            </>
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">Text Extractor</h1>
                    <p className="text-white/40">Instantly scrape raw text from PDF and Word documents</p>
                </div>
            </div>

            {/* Privacy Notice */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm w-fit">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-bold uppercase tracking-tighter">🔒 OCR-Free - Extraction happens safely in-memory</span>
            </div>

            {!file ? (
                <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-6">
                    <div className="max-w-xl mx-auto">
                        <FileUpload onChange={handleFileUpload} />
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                        {['PDF', 'DOCX', 'TXT'].map(fmt => (
                            <span key={fmt} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-widest text-white/40">
                                {fmt}
                            </span>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left: Metadata & Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                                <div className="p-2 rounded-lg bg-black/40 text-blue-400">
                                    <FileIcon className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{file.name}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] text-white/20 font-black uppercase">{formatSize(file.size)}</p>
                                        <div className="w-1 h-1 rounded-full bg-white/10" />
                                        <p className="text-[10px] text-white/20 font-black uppercase">{extractedText.length} Chars</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <Input
                                        placeholder="Search text..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-black/40 border-white/10 pl-9 h-11 caret-blue-500 text-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Button
                                        onClick={copyToClipboard}
                                        disabled={!extractedText}
                                        className="h-11 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl"
                                    >
                                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                        Copy Text
                                    </Button>
                                    <Button
                                        onClick={downloadTxt}
                                        disabled={!extractedText}
                                        variant="outline"
                                        className="h-11 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Save as .txt
                                    </Button>
                                    <Button
                                        onClick={() => { setFile(null); setExtractedText(""); }}
                                        variant="ghost"
                                        className="h-11 text-white/40 hover:text-white font-bold"
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Text Viewer */}
                    <div className="lg:col-span-3 h-[600px] rounded-3xl bg-black/40 border border-white/10 flex flex-col overflow-hidden relative group">
                        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white/40 px-2">
                                <Eye className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Extracted Content Preview</span>
                            </div>
                            {isExtracting && (
                                <div className="flex items-center gap-2 text-blue-400">
                                    <div className="w-3 h-3 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Processing...</span>
                                </div>
                            )}
                        </div>

                        <ScrollArea className="flex-1 h-full w-full">
                            <div className="p-8">
                                {extractedText ? (
                                    <div className="font-mono text-sm text-white/70 leading-relaxed whitespace-pre-wrap selection:bg-blue-500/30 pb-20">
                                        {highlightedText()}
                                        <div className="mt-12 pt-8 border-t border-white/5 text-center">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/10">--- End of Document ---</span>
                                        </div>
                                    </div>
                                ) : !isExtracting && (
                                    <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
                                        <FileText className="w-16 h-16 text-white/5" />
                                        <p className="text-xl font-black uppercase tracking-tighter text-white/40">No text found</p>
                                        <p className="text-sm max-w-xs text-center text-white/20">Extraction may fail for scanned images or non-text based documents.</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Faded bottom for long text */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    </div>
                </div>
            )}
        </div>
    );
}
