import { useState, useEffect } from "react";
import { Binary, Copy, Download, Trash } from "lucide-react";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";

export function Base64Tool() {
    const [mode, setMode] = useState<"text" | "file">("text");
    const [action, setAction] = useState<"encode" | "decode">("encode");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [fileName, setFileName] = useState("");

    // Real-time processing for Text Mode
    useEffect(() => {
        if (mode === "text") {
            try {
                if (!input) {
                    setOutput("");
                    return;
                }

                if (action === "encode") {
                    // Handling UTF-8: encodeURIComponent -> unescape (deprecated but standard hack) -> btoa
                    const utf8Bytes = encodeURIComponent(input).replace(/%([0-9A-F]{2})/g,
                        function (_, p1) {
                            return String.fromCharCode(parseInt(p1, 16))
                        });
                    setOutput(btoa(utf8Bytes));
                } else {
                    // Decode
                    const str = atob(input);
                    // Handling UTF-8: escape -> decodeURIComponent
                    const utf8Str = decodeURIComponent(Array.prototype.map.call(str, function (c: string) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                    }).join(''));
                    setOutput(utf8Str);
                }
            } catch (e) {
                setOutput("Invalid input");
            }
        }
    }, [input, action, mode]);

    const handleFileUpload = (files: File[]) => {
        const file = files[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            // result is like "data:image/png;base64,....."
            const base64 = result.split(',')[1] || result;
            setOutput(base64);
            setInput(`File: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
        };
        reader.readAsDataURL(file);
    };

    const copyToClipboard = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const downloadOutput = () => {
        if (!output) return;
        const blob = new Blob([output], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName ? `${fileName}.base64.txt` : `base64_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Binary className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Base64 Converter</h1>
                    <p className="text-white/40">Encode and decode text or files in real-time</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-br from-blue-900/20 via-black/40 to-blue-900/20 p-2 rounded-2xl border border-white/20 shadow-lg">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setMode("text"); setInput(""); setOutput(""); }}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === "text" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25" : "text-white/40 hover:text-white hover:bg-white/5"}`}
                    >
                        Text Mode
                    </button>
                    <button
                        onClick={() => { setMode("file"); setInput(""); setOutput(""); setAction("encode"); }}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === "file" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25" : "text-white/40 hover:text-white hover:bg-white/5"}`}
                    >
                        File Mode
                    </button>
                </div>

                {mode === "text" && (
                    <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
                        <button
                            onClick={() => setAction("encode")}
                            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${action === "encode" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
                        >
                            Encode
                        </button>
                        <button
                            onClick={() => setAction("decode")}
                            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${action === "decode" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
                        >
                            Decode
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Area */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white/80 flex items-center gap-2">
                            {mode === "file" ? "Input File" : (action === "encode" ? "Plain Text Input" : "Base64 Input")}
                        </h2>
                        {mode === "text" && (
                            <button
                                onClick={() => setInput("")}
                                className="text-xs text-white/40 hover:text-red-400 transition-colors flex items-center gap-1"
                            >
                                <Trash size={12} /> Clear
                            </button>
                        )}
                    </div>

                    {mode === "text" ? (
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={action === "encode" ? "Type text to encode..." : "Paste Base64 to decode..."}
                            className="w-full h-[500px] bg-black/40 border border-white/20 rounded-2xl p-6 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all placeholder:text-white/20 shadow-inner"
                            spellCheck={false}
                        />
                    ) : (
                        <div className="w-full h-[500px] bg-black/40 border border-white/20 rounded-2xl flex flex-col justify-center p-6 overflow-hidden shadow-inner">
                            <FileUpload onChange={handleFileUpload} />
                        </div>
                    )}
                </div>

                {/* Output Area */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white/80 flex items-center gap-2">
                            {mode === "file" ? "Base64 Output" : (action === "encode" ? "Base64 Output" : "Decoded Text")}
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => downloadOutput()}
                                disabled={!output}
                                className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-white/60 hover:text-white transition-colors flex items-center gap-2 disabled:opacity-30"
                            >
                                <Download size={12} /> Save
                            </button>
                            <button
                                onClick={() => copyToClipboard(output)}
                                disabled={!output}
                                className="text-xs bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 disabled:opacity-30"
                            >
                                <Copy size={12} /> Copy
                            </button>
                        </div>
                    </div>

                    <textarea
                        readOnly
                        value={output}
                        placeholder="Result will appear here..."
                        className="w-full h-[500px] bg-black/40 border border-white/20 rounded-2xl p-6 font-mono text-sm leading-relaxed focus:outline-none resize-none text-white/70 shadow-inner"
                    />
                </div>
            </div>
        </div>
    );
}
