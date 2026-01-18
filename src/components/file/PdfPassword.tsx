import { useState } from "react";
import { ShieldCheck, Lock, Unlock, Loader2, FileText, Eye, EyeOff, KeyRound, AlertTriangle } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";

export function PdfPassword() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState<"lock" | "unlock">("lock");
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);

    const handleFileAdded = async (files: File[]) => {
        const file = files[0];
        if (!file) return;
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
            toast.error("Please upload a valid PDF file.");
            return;
        }
        setSelectedFile(file);

        // Auto-detect if file is likely encrypted (simple heuristic)
        // We can't know for sure without trying to parse, but usually we default to 'lock'
        // If the user drags a file, we can try to "peek"
        detectState(file);
    };

    const detectState = async (file: File) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            try {
                await PDFDocument.load(arrayBuffer);
                // If it loads, it's not encrypted -> Switch to Lock tab
                setActiveTab("lock");
            } catch (e: any) {
                if (e.message.includes("encrypted")) {
                    setActiveTab("unlock");
                    toast("This PDF is encrypted. Switched to Unlock mode.", { icon: "🔒" });
                }
            }
        } catch (e) {
            // Ignore
        }
    }

    const handleAction = async (filename: string) => {
        if (!selectedFile || !password.trim()) {
            toast.error("Please enter a password");
            return;
        }

        setIsProcessing(true);
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();

            if (activeTab === "unlock") {
                // UNLOCK MODE
                try {
                    // @ts-ignore
                    const { default: loadQPDF } = await import("@neslinesli93/qpdf-wasm");
                    const qpdf: any = await loadQPDF({
                        locateFile: (path: string) => path.endsWith('.wasm') ? '/qpdf.wasm' : path
                    } as any);

                    const inputFile = 'input.pdf';
                    const outputFile = 'output.pdf';

                    qpdf.FS.writeFile(inputFile, new Uint8Array(arrayBuffer));

                    const exitCode = await qpdf.callMain([
                        `--password=${password}`,
                        '--decrypt',
                        inputFile,
                        outputFile
                    ]);

                    if (exitCode !== 0) throw new Error("Incorrect password");

                    const decryptedBytes = qpdf.FS.readFile(outputFile);
                    const blob = new Blob([decryptedBytes], { type: "application/pdf" });
                    saveAs(blob, `${filename}.pdf`);
                    toast.success("PDF unlocked successfully!");
                    setShowDownloadDialog(false);

                } catch (error) {
                    toast.error("Failed to unlock. Incorrect password?");
                }
            } else {
                // LOCK MODE
                try {
                    const pdfDoc = await PDFDocument.load(arrayBuffer);
                    const pdfBytes = await pdfDoc.save();

                    const { encryptPDF } = await import("@pdfsmaller/pdf-encrypt-lite");
                    const encryptedBytes = await encryptPDF(pdfBytes, password, password);

                    const blob = new Blob([encryptedBytes as any], { type: "application/pdf" });
                    saveAs(blob, `${filename}.pdf`);
                    toast.success("PDF locked successfully!");
                    setShowDownloadDialog(false);
                } catch (e) {
                    toast.error("Encryption failed.");
                }
            }

        } catch (error) {
            console.error(error);
            toast.error("An error occurred.");
        } finally {
            setIsProcessing(false);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + ["B", "KB", "MB", "GB"][i];
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                <KeyRound className="w-6 h-6 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                Lock / Unlock PDF
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Secure your documents with strong encryption or remove passwords from files you own.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>100% Client-Side Processing</span>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-8">
                    <div className="flex justify-center">
                        <TabsList className="bg-slate-900/50 border border-slate-800 p-1 rounded-2xl h-auto">
                            <TabsTrigger
                                value="lock"
                                className="px-6 py-3 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 font-bold uppercase tracking-wider transition-all"
                            >
                                <Lock className="w-4 h-4 mr-2" />
                                Lock PDF
                            </TabsTrigger>
                            <TabsTrigger
                                value="unlock"
                                className="px-6 py-3 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 font-bold uppercase tracking-wider transition-all"
                            >
                                <Unlock className="w-4 h-4 mr-2" />
                                Unlock PDF
                            </TabsTrigger>
                        </TabsList>
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
                                    <FileUpload onChange={handleFileAdded} multiple={false} label="Drop PDF file here" />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="workspace"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                            >
                                {/* Sidebar */}
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="p-6 rounded-[2rem] bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl sticky top-8">
                                        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-6">
                                            <FileText className="w-5 h-5 text-blue-500" />
                                            Target File
                                        </h3>

                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 mb-4">
                                            <p className="text-sm font-bold text-white line-clamp-2">{selectedFile.name}</p>
                                            <p className="text-[10px] uppercase font-black text-slate-500">{formatSize(selectedFile.size)}</p>
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={() => setSelectedFile(null)}
                                            className="w-full border-slate-800 hover:bg-slate-800 text-slate-400"
                                        >
                                            Change File
                                        </Button>

                                        <div className="mt-8 pt-8 border-t border-slate-800">
                                            <Button
                                                onClick={() => setShowDownloadDialog(true)}
                                                disabled={!password.trim() || isProcessing}
                                                className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                                            >
                                                {isProcessing ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : activeTab === 'lock' ? "Encrypt PDF" : "Decrypt PDF"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Area */}
                                <div className="lg:col-span-2">
                                    <div className="p-8 md:p-12 rounded-[2.5rem] bg-slate-900/50 border border-slate-800 relative overflow-hidden flex flex-col justify-center min-h-[400px]">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />

                                        <div className="relative z-10 max-w-md mx-auto w-full space-y-8">
                                            <div className="text-center space-y-2">
                                                <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                                                    {activeTab === 'lock' ? <Lock className="w-8 h-8" /> : <Unlock className="w-8 h-8" />}
                                                </div>
                                                <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                                                    {activeTab === 'lock' ? "Protect Document" : "Remove Protection"}
                                                </h2>
                                                <p className="text-slate-400 text-sm">
                                                    {activeTab === 'lock'
                                                        ? "Set a password to prevent unauthorized access."
                                                        : "Enter the current password to unlock permanently."}
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                                                    {activeTab === 'lock' ? "Set Password" : "Current Password"}
                                                </Label>
                                                <div className="relative group">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="bg-slate-950/50 border-slate-800 h-16 pl-6 pr-14 caret-blue-500 font-bold focus:border-blue-500/50 text-xl rounded-2xl transition-all placeholder:text-slate-700 text-white"
                                                        placeholder="••••••••"
                                                    />
                                                    <button
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-blue-400 transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {activeTab === 'unlock' && (
                                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                                                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                                    <p className="text-xs text-amber-200/80 leading-relaxed">
                                                        Warning: Unlocking will create a copy of the file with security removed. Only do this for files you own.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <DownloadConfirmDialog
                        isOpen={showDownloadDialog}
                        onClose={() => setShowDownloadDialog(false)}
                        onConfirm={handleAction}
                        defaultFileName={selectedFile?.name.replace('.pdf', '') + (activeTab === 'lock' ? '-protected' : '-unlocked') || "secure"}
                        extension="pdf"
                        isProcessing={isProcessing}
                        title={activeTab === 'lock' ? "Save Protected PDF" : "Save Unlocked PDF"}
                        description="Download your processed secure document."
                    />
                </Tabs>
            </div>
        </div>
    );
}
