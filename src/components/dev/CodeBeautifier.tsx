import { useState } from "react";
import { Code2, Copy } from "lucide-react";
import toast from "react-hot-toast";

export function CodeBeautifier() {
    const [code, setCode] = useState("");

    const beautify = () => {
        try {
            const obj = JSON.parse(code);
            setCode(JSON.stringify(obj, null, 2));
            toast.success("JSON Formatted");
        } catch (e) {
            toast.error("Invalid JSON format");
        }
    };

    return (
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Code2 className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold">Code Beautifier</h3>
                </div>
                <div className="flex gap-2">
                    <button onClick={beautify} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 text-sm font-bold hover:bg-emerald-500 hover:text-white transition-all">
                        Format JSON
                    </button>
                    <button
                        onClick={() => { navigator.clipboard.writeText(code); toast.success("Copied!"); }}
                        className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-white"
                    >
                        <Copy size={18} />
                    </button>
                </div>
            </div>

            <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your messy JSON here..."
                className="w-full h-[300px] bg-black/60 border border-white/10 rounded-2xl p-6 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 custom-scrollbar text-white"
            />
        </div>
    );
}
