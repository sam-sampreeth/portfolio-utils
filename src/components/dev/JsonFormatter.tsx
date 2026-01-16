import { useState } from "react";
import { Code2, Copy, Download } from "lucide-react";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { defineMonacoTheme } from "@/lib/monaco";

export function JsonFormatter() {
    const [code, setCode] = useState("");
    const [filename, setFilename] = useState("data");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const beautify = () => {
        try {
            const obj = JSON.parse(code);
            setCode(JSON.stringify(obj, null, 2));
            toast.success("JSON Formatted");
        } catch (e) {
            toast.error("Invalid JSON format");
        }
    };

    const handleDownload = () => {
        if (!code) {
            toast.error("No content to download");
            return;
        }
        try {
            const blob = new Blob([code], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${filename}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("Downloaded!");
            setIsDialogOpen(false);
        } catch (error) {
            toast.error("Download failed");
        }
    };

    return (
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Code2 className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold">JSON Formatter</h3>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <button className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-white cursor-pointer" title="Download">
                                <Download size={18} />
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-white">
                            <DialogHeader>
                                <DialogTitle>Download JSON</DialogTitle>
                            </DialogHeader>
                            <div className="flex items-center space-x-2 py-4">
                                <div className="grid flex-1 gap-2">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="filename"
                                            value={filename}
                                            onChange={(e) => setFilename(e.target.value)}
                                            className="bg-zinc-900 border-white/10 focus-visible:ring-blue-500/50"
                                            placeholder="filename"
                                        />
                                        <span className="text-muted-foreground font-mono text-sm">.json</span>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="sm:justify-end gap-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="hover:bg-white/10 hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDownload}
                                    className="bg-blue-600 hover:bg-blue-500 text-white"
                                >
                                    Download
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <button onClick={beautify} className="px-5 py-3 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/20 text-xs font-bold uppercase tracking-wider hover:bg-blue-500 hover:text-white transition-all cursor-pointer">
                        Format JSON
                    </button>
                    <button
                        onClick={() => { navigator.clipboard.writeText(code); toast.success("Copied!"); }}
                        className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-white cursor-pointer"
                    >
                        <Copy size={18} />
                    </button>
                </div>
            </div>

            <div className="h-[600px] border border-white/10 rounded-2xl overflow-hidden">
                <Editor
                    height="100%"
                    defaultLanguage="json"
                    defaultValue=""
                    value={code}
                    theme="vs-premium-dark"
                    beforeMount={defineMonacoTheme}
                    onChange={(value) => setCode(value || "")}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                        fontLigatures: true,
                        formatOnPaste: true,
                        formatOnType: true,
                    }}
                />
            </div>
        </div>
    );
}

export default JsonFormatter;
