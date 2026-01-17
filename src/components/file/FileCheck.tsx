import { useState } from "react";
import {
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Search,
    BadgeAlert,
    HelpCircle
} from "lucide-react";
import JSZip from "jszip";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CheckResult {
    id: string;
    name: string;
    status: 'pass' | 'fail' | 'warning' | 'pending';
    message: string;
    details?: string;
}

export function FileCheck() {
    const [file, setFile] = useState<File | null>(null);
    const [results, setResults] = useState<CheckResult[]>([]);
    const [overallStatus, setOverallStatus] = useState<'healthy' | 'warning' | 'corrupt' | null>(null);

    const handleFileUpload = (files: File[]) => {
        const selectedFile = files[0];
        if (selectedFile) {
            setFile(selectedFile);
            runChecks(selectedFile);
        }
    };

    const handleLoadExample = async () => {
        try {
            const response = await fetch('/corrupt_sample.pdf');
            const blob = await response.blob();
            const sampleFile = new File([blob], "corrupt_sample.pdf", { type: "application/pdf" });
            setFile(sampleFile);
            runChecks(sampleFile);
        } catch (error) {
            console.error("Failed to load example:", error);
        }
    };

    const runChecks = async (file: File) => {
        setOverallStatus(null);

        const initialResults: CheckResult[] = [
            { id: 'size', name: 'File Size', status: 'pending', message: 'Checking size...' },
            { id: 'read', name: 'File Readability', status: 'pending', message: 'Attempting to read...' },
            { id: 'type', name: 'MIME Consistency', status: 'pending', message: 'Verifying extension vs type...' },
            { id: 'structure', name: 'Internal Structure', status: 'pending', message: 'Analyzing headers...' },
        ];
        setResults(initialResults);

        const newResults: CheckResult[] = [...initialResults];

        // 1. Size Check
        if (file.size === 0) {
            newResults[0] = { id: 'size', name: 'File Size', status: 'fail', message: 'Empty File', details: 'The file is 0 bytes and contain no data.' };
        } else {
            newResults[0] = { id: 'size', name: 'File Size', status: 'pass', message: 'Valid Size', details: `File contains ${file.size} bytes of data.` };
        }

        // 2. Readability Check
        try {
            const buffer = await file.arrayBuffer();
            newResults[1] = { id: 'read', name: 'File Readability', status: 'pass', message: 'Readable', details: 'Browser successfully accessed the file memory.' };

            // 3. Structure / Magic Numbers
            const header = new Uint8Array(buffer.slice(0, 8));
            const headerHex = Array.from(header).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

            let structStatus: 'pass' | 'fail' | 'warning' = 'pass';
            let structMsg = 'Header looks valid';
            let structDetails = `Magic numbers detected: ${headerHex.slice(0, 8)}`;

            const ext = file.name.split('.').pop()?.toLowerCase();

            if (ext === 'pdf' && !headerHex.startsWith('25504446')) {
                structStatus = 'fail';
                structMsg = 'Invalid PDF Header';
                structDetails = 'File lacks the required %PDF signature at the start.';
            } else if (ext === 'png' && !headerHex.startsWith('89504E47')) {
                structStatus = 'fail';
                structMsg = 'Invalid PNG Header';
                structDetails = 'PNG signature (89 50 4E 47) not found.';
            } else if ((ext === 'jpg' || ext === 'jpeg') && !headerHex.startsWith('FFD8')) {
                structStatus = 'fail';
                structMsg = 'Invalid JPEG Header';
                structDetails = 'JPEG SOI marker (FF D8) missing.';
            } else if (ext === 'zip') {
                try {
                    const zip = new JSZip();
                    await zip.loadAsync(file);
                    structStatus = 'pass';
                    structMsg = 'Valid ZIP Structure';
                    structDetails = 'ZIP central directory parsed successfully.';
                } catch (e) {
                    structStatus = 'fail';
                    structMsg = 'Corrupt ZIP Archive';
                    structDetails = 'The ZIP index is malformed or missing.';
                }
            } else {
                structMsg = 'Generic Header Check';
                structDetails = `File signature: ${headerHex.slice(0, 16)}... (Verification limited for this format)`;
            }
            newResults[3] = { id: 'structure', name: 'Internal Structure', status: structStatus, message: structMsg, details: structDetails };

            // 4. MIME Consistency
            const type = file.type;
            if (type && ext && !type.includes(ext) && !(['jpg', 'jpeg'].includes(ext) && type.includes('jpeg'))) {
                newResults[2] = { id: 'type', name: 'MIME Consistency', status: 'warning', message: 'Type Mismatch', details: `Extension .${ext} does not perfectly match reported type ${type}.` };
            } else {
                newResults[2] = { id: 'type', name: 'MIME Consistency', status: 'pass', message: 'Consistent', details: 'Extension matches the detected MIME type.' };
            }

        } catch (error) {
            newResults[1] = { id: 'read', name: 'File Readability', status: 'fail', message: 'Unreadable', details: 'The file could not be read. It might be locked or corrupted.' };
            newResults[3] = { id: 'structure', name: 'Internal Structure', status: 'fail', message: 'Analysis Failed', details: 'Cannot analyze structure if file is unreadable.' };
        }

        setResults(newResults);

        const hasFail = newResults.some(r => r.status === 'fail');
        const hasWarn = newResults.some(r => r.status === 'warning');

        if (hasFail) setOverallStatus('corrupt');
        else if (hasWarn) setOverallStatus('warning');
        else setOverallStatus('healthy');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">Corrupt File Checker</h1>
                    <p className="text-white/40">Analyze file headers and structure for integrity errors</p>
                </div>
            </div>

            {!file ? (
                <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-6">
                    <div className="max-w-xl mx-auto">
                        <FileUpload onChange={handleFileUpload} />
                    </div>
                    <p className="text-white/20 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                        <BadgeAlert className="w-4 h-4" />
                        Verify download health before opening
                    </p>

                    <button
                        onClick={handleLoadExample}
                        className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-4 opacity-60 hover:opacity-100 transition-opacity"
                    >
                        Load example corrupt file
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Overall Status Banner */}
                    <div className={cn(
                        "p-8 rounded-[2rem] border flex items-center justify-between overflow-hidden relative transition-all duration-500",
                        overallStatus === 'healthy' && "bg-blue-500/[0.03] border-blue-500/20 text-blue-400 shadow-[0_8px_32px_rgba(59,130,246,0.1)]",
                        overallStatus === 'warning' && "bg-amber-500/[0.03] border-amber-500/20 text-amber-400 shadow-[0_8px_32px_rgba(245,158,11,0.1)]",
                        overallStatus === 'corrupt' && "bg-red-500/[0.03] border-red-500/20 text-red-500 shadow-[0_8px_32px_rgba(239,68,68,0.15)]",
                        !overallStatus && "bg-white/5 border-white/10 text-white/40"
                    )}>
                        {/* Gradient Mesh Effect */}
                        <div className={cn(
                            "absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-1000",
                            overallStatus === 'healthy' && "bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.4),transparent_50%)]",
                            overallStatus === 'warning' && "bg-[radial-gradient(circle_at_20%_50%,rgba(245,158,11,0.4),transparent_50%)]",
                            overallStatus === 'corrupt' && "bg-[radial-gradient(circle_at_20%_50%,rgba(239,68,68,0.4),transparent_50%)]",
                        )} />

                        <div className="relative z-10 flex items-center gap-6">
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500",
                                overallStatus === 'healthy' && "bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]",
                                overallStatus === 'warning' && "bg-amber-400/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]",
                                overallStatus === 'corrupt' && "bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                            )}>
                                {overallStatus === 'healthy' && <CheckCircle2 className="w-8 h-8" />}
                                {overallStatus === 'warning' && <AlertTriangle className="w-8 h-8" />}
                                {overallStatus === 'corrupt' && <XCircle className="w-8 h-8" />}
                                {!overallStatus && <Search className="w-8 h-8 animate-pulse text-white/20" />}
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">
                                    {overallStatus === 'healthy' && "File is Healthy"}
                                    {overallStatus === 'warning' && "Potential Issues"}
                                    {overallStatus === 'corrupt' && "Corrupted or Invalid"}
                                    {!overallStatus && "Checking Integrity..."}
                                </h2>
                                <p className="opacity-40 text-[10px] font-black uppercase tracking-widest truncate max-w-sm">{file.name}</p>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => { setFile(null); setResults([]); setOverallStatus(null); }}
                            className="relative z-10 border-white/5 bg-white/[0.03] hover:bg-white/10 text-white/60 hover:text-white transition-all rounded-xl h-10 px-6"
                        >
                            Select Another
                        </Button>

                        {/* Decorative BG Glow */}
                        <div className={cn(
                            "absolute top-1/2 -right-20 -translate-y-1/2 w-64 h-64 blur-[120px] opacity-20 transition-colors duration-1000",
                            overallStatus === 'healthy' && "bg-blue-500",
                            overallStatus === 'warning' && "bg-amber-500",
                            overallStatus === 'corrupt' && "bg-red-500",
                        )} />
                    </div>

                    {/* Check Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.map((req) => (
                            <div key={req.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{req.name}</span>
                                    {req.status === 'pass' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                                    {req.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-300" />}
                                    {req.status === 'fail' && <XCircle className="w-4 h-4 text-red-500" />}
                                    {req.status === 'pending' && <div className="w-4 h-4 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />}
                                </div>
                                <div>
                                    <p className="font-bold text-white/90">{req.message}</p>
                                    <p className="text-xs text-white/40 leading-relaxed mt-1">{req.details}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pro Tip */}
                    <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/5">
                        <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
                        <div>
                            <h4 className="text-sm font-bold text-white/80">How does this work?</h4>
                            <p className="text-xs text-white/40 mt-1 leading-relaxed">
                                This tool performs "Magic Number" validation. Every file has a specific byte signature at the beginning. If these bytes don't match the file extension, it usually indicates corruption or a deliberate attempt to hide the file type.
                            </p>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
}
