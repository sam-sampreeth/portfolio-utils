import { useState } from "react";
import { Plus, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

export function HashGen() {
    const [uuid, setUuid] = useState("");
    const [copied, setCopied] = useState(false);

    const generateUuid = () => {
        const newUuid = crypto.randomUUID();
        setUuid(newUuid);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <Plus className="w-5 h-5" />
                </div>
                <h3 className="font-bold">UUID Generator</h3>
            </div>

            <div className="flex flex-col gap-4">
                <div className="relative group">
                    <input
                        readOnly
                        value={uuid}
                        placeholder="Click generate for UUID"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary text-white"
                    />
                    {uuid && (
                        <button
                            onClick={() => copyToClipboard(uuid)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-white/50" />}
                        </button>
                    )}
                </div>
                <button
                    onClick={generateUuid}
                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all"
                >
                    Generate v4 UUID
                </button>
            </div>
        </div>
    );
}
