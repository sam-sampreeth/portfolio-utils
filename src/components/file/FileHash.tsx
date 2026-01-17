import { useState } from "react";
import {
    Fingerprint,
    Copy,
    Check,
    File as FileIcon,
    ShieldCheck,
    Cpu,
    Hash
} from "lucide-react";
import CryptoJS from "crypto-js";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface HashResult {
    md5: string;
    sha1: string;
    sha256: string;
    sha512: string;
}

export function FileHash() {
    const [file, setFile] = useState<File | null>(null);
    const [hashes, setHashes] = useState<HashResult | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const handleFileUpload = (files: File[]) => {
        const selectedFile = files[0];
        if (selectedFile) {
            setFile(selectedFile);
            calculateHashes(selectedFile);
        }
    };

    const calculateHashes = async (file: File) => {
        setIsCalculating(true);
        setHashes(null);

        try {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);

                // MD5 & SHA1 (CryptoJS)
                const md5 = CryptoJS.MD5(wordArray).toString();
                const sha1 = CryptoJS.SHA1(wordArray).toString();

                // SHA256 & SHA512 (Native Web Crypto - Faster for large files)
                const sha256Buffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
                const sha512Buffer = await crypto.subtle.digest("SHA-512", arrayBuffer);

                const bufferToHex = (buffer: ArrayBuffer) => {
                    return Array.from(new Uint8Array(buffer))
                        .map(b => b.toString(16).padStart(2, '0'))
                        .join('');
                };

                setHashes({
                    md5,
                    sha1,
                    sha256: bufferToHex(sha256Buffer),
                    sha512: bufferToHex(sha512Buffer)
                });

                toast.success("Hashes generated!");
                setIsCalculating(false);
            };

            reader.readAsArrayBuffer(file);
        } catch (error) {
            toast.error("Failed to calculate hashes");
            setIsCalculating(false);
        }
    };

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        toast.success(`${key.toUpperCase()} copied!`);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                <Fingerprint className="w-6 h-6 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                File Hash
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Calculate secure MD5, SHA-1, SHA-256, and SHA-512 checksums for any file.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>Client-Side</span>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {!file ? (
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
                                    onChange={handleFileUpload}
                                    multiple={false}
                                    label="Drop any file for fingerprinting"
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            {/* Left Panel: File Info */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="p-6 rounded-[2rem] bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl sticky top-8">
                                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-6">
                                        <FileIcon className="w-5 h-5 text-blue-500" />
                                        File Details
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-400">
                                                    <FileIcon className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-200 truncate">{file.name}</p>
                                                    <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                                            <ShieldCheck className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-xs text-emerald-200/90 font-bold mb-1">Secure Calculation</p>
                                                <p className="text-[11px] text-emerald-200/60 leading-relaxed font-medium">
                                                    Checksums are generated locally in your browser. No data is uploaded to any server.
                                                </p>
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={() => { setFile(null); setHashes(null); }}
                                            className="w-full h-12 border-slate-800 hover:bg-slate-800 text-slate-400 font-bold rounded-xl"
                                        >
                                            Analyze Another File
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Hashes */}
                            <div className="lg:col-span-2 space-y-4">
                                {isCalculating ? (
                                    <div className="border border-slate-800 bg-slate-900/50 rounded-[2rem] p-12 flex flex-col items-center justify-center min-h-[400px] space-y-8">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full border-4 border-slate-800" />
                                            <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                                            <Cpu className="absolute inset-0 m-auto w-8 h-8 text-blue-500 animate-pulse" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <h3 className="text-xl font-bold text-white uppercase tracking-widest">Calculating</h3>
                                            <p className="text-slate-500 text-sm">Generating cryptographic signatures...</p>
                                        </div>
                                    </div>
                                ) : hashes ? (
                                    <div className="space-y-4">
                                        {Object.entries(hashes).map(([key, value]) => (
                                            <motion.div
                                                key={key}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="group relative p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-900/80 transition-all overflow-hidden"
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                            <Hash className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-sm font-black uppercase tracking-widest text-slate-400">{key}</span>
                                                    </div>
                                                    <Button
                                                        onClick={() => copyToClipboard(value, key)}
                                                        className={cn(
                                                            "h-9 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all",
                                                            copiedKey === key
                                                                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                                                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                                                        )}
                                                    >
                                                        {copiedKey === key ? (
                                                            <>
                                                                <Check className="w-3 h-3 mr-2" /> Copied
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-3 h-3 mr-2" /> Copy Hash
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                                <div className="pt-2">
                                                    <code className="text-sm md:text-base font-mono text-slate-200 break-all leading-relaxed block bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                                                        {value}
                                                    </code>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
