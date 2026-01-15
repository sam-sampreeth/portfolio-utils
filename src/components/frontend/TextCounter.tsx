import { useState, useMemo } from "react";
import { AlignLeft, Type, Hash, GripVertical, FileText, Copy, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export function TextCounter() {
    const [text, setText] = useState("");

    const stats = useMemo(() => {
        const chars = text.length;
        const charsNoSpaces = text.replace(/\s/g, "").length;
        const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
        const lines = text === "" ? 0 : text.split(/\r\n|\r|\n/).length;
        // Simple paragraph split by double newline
        const paragraphs = text.trim() === "" ? 0 : text.split(/\n\s*\n/).filter(p => p.trim() !== "").length;

        return { chars, charsNoSpaces, words, lines, paragraphs };
    }, [text]);

    const statCards = [
        { label: "Characters", value: stats.chars, icon: Type, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        { label: "Words", value: stats.words, icon: FileText, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
        { label: "Lines", value: stats.lines, icon: AlignLeft, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
        { label: "Paragraphs", value: stats.paragraphs, icon: GripVertical, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
        { label: "Spaces", value: stats.charsNoSpaces, icon: Hash, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
    ];

    const copyText = () => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success("Text copied to clipboard");
    };

    const clearText = () => {
        setText("");
        toast.success("Text cleared");
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <AlignLeft size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Text Counter</h2>
                    <p className="text-white/50 font-medium">Real-time character, word, and line counting</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {statCards.map((stat, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border ${stat.border} ${stat.bg} backdrop-blur-sm relative overflow-hidden group`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                            <stat.icon size={48} />
                        </div>
                        <div className="relative z-10">
                            <p className={`text-xs font-bold uppercase tracking-wider mb-1 opacity-70 ${stat.color}`}>{stat.label}</p>
                            <p className="text-2xl font-black text-white">{stat.value.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-[#0a0a0a] rounded-[1.8rem] border border-white/10 p-1">
                    <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Input Text</span>
                        <div className="flex gap-2">
                            <button
                                onClick={copyText}
                                disabled={!text}
                                className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-blue-400 disabled:opacity-50 transition-colors"
                                title="Copy Text"
                            >
                                <Copy size={16} />
                            </button>
                            <button
                                onClick={clearText}
                                disabled={!text}
                                className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-red-400 disabled:opacity-50 transition-colors"
                                title="Clear Text"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Start typing or paste your text here..."
                        className="w-full min-h-[400px] bg-transparent p-6 text-white/80 placeholder:text-white/20 resize-y focus:outline-none font-sans leading-relaxed selection:bg-blue-500/30"
                        spellCheck={false}
                    />
                </div>
            </div>
        </div>
    );
}
