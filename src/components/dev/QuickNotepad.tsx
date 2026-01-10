import { useState } from "react";
import { FileCode, Download } from "lucide-react";

export function QuickNotepad() {
    const [content, setContent] = useState("");

    const download = () => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `note-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <FileCode className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold">Quick Notepad</h3>
                </div>
                <button
                    onClick={download}
                    className="p-2 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white/50 hover:text-white"
                >
                    <Download size={18} />
                </button>
            </div>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type or paste anything here... autosaves to session."
                className="w-full h-[250px] bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-sm focus:outline-none resize-none text-white"
            />
            <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                <span>Characters: {content.length}</span>
                <button onClick={() => setContent("")} className="text-red-400 hover:text-red-500">Clear</button>
            </div>
        </div>
    );
}
