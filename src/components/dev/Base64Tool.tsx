import { useState, useCallback } from "react";
import { Binary, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export function Base64Tool() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [mode, setMode] = useState<"encode" | "decode">("encode");

    const process = useCallback(() => {
        try {
            if (mode === "encode") {
                setOutput(btoa(input));
            } else {
                setOutput(atob(input));
            }
        } catch (e) {
            setOutput("Invalid Base64 string");
        }
    }, [input, mode]);

    return (
        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400">
                        <Binary className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold">Base64 Tool</h3>
                </div>
                <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                    <button
                        onClick={() => setMode("encode")}
                        className={cn("px-3 py-1 text-xs rounded-md transition-all", mode === "encode" ? "bg-primary text-white" : "text-white/50 hover:text-white")}
                    >
                        Encode
                    </button>
                    <button
                        onClick={() => setMode("decode")}
                        className={cn("px-3 py-1 text-xs rounded-md transition-all", mode === "decode" ? "bg-primary text-white" : "text-white/50 hover:text-white")}
                    >
                        Decode
                    </button>
                </div>
            </div>

            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Text to ${mode}...`}
                className="flex-grow min-h-[100px] bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary mb-4 resize-none text-white"
            />
            <button
                onClick={process}
                className="w-full py-3 rounded-xl bg-primary/20 text-primary border border-primary/20 font-bold hover:bg-primary hover:text-white transition-all mb-4"
            >
                Run {mode}
            </button>

            <div className="relative group p-4 bg-black/40 border border-white/10 rounded-xl font-mono text-xs break-all min-h-[60px] text-white">
                {output || "Output will appear here..."}
                {output && (
                    <button
                        onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied!"); }}
                        className="absolute right-2 top-2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-md transition-all"
                    >
                        <Copy className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>
    );
}
