import { useState } from "react";
import { Eraser, Copy, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export const RemoveSpaces = () => {
    const [text, setText] = useState("");
    const [options, setOptions] = useState({
        trim: true,
        multipleSpaces: true,
        emptyLines: true,
        trimLines: true
    });

    // Static classes for Premium UI
    const staticBgClass = "bg-[#0a0a0a]";
    const staticBorderClass = "border-white/10";
    const staticTextMain = "text-white";
    const staticTextMuted = "text-white/50";

    const processText = () => {
        let result = text;

        if (!result) {
            toast.error("Please enter some text");
            return;
        }

        if (options.trimLines) {
            result = result.split('\n').map(line => line.trim()).join('\n');
        }

        if (options.multipleSpaces) {
            result = result.replace(/[ \t]+/g, ' ');
        }

        if (options.emptyLines) {
            result = result.replace(/^\s*[\r\n]/gm, '');
        }

        if (options.trim) {
            result = result.trim();
        }

        setText(result);
        toast.success("Text cleaned!");
    };

    const handleCopy = () => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const handleClear = () => {
        setText("");
        toast.success("Cleared");
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Eraser size={28} />
                    </div>
                    <div>
                        <h2 className={`text-3xl font-black tracking-tight ${staticTextMain}`}>Remove Extra Spaces</h2>
                        <p className={`${staticTextMuted} font-medium`}>Clean up disorderly text formatting</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Editor Area */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="relative group min-h-[500px] h-full">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                        <div className={`relative bg-[#0a0a0a] border-white/10 rounded-[1.8rem] border p-1 h-full flex flex-col transition-colors duration-300`}>
                            {/* Toolbar */}
                            <div className={`flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a0a] rounded-t-[1.5rem] z-10 sticky top-0 transition-colors`}>
                                <div className="text-sm font-medium opacity-50">
                                    {text.length} chars • {text.split(/\s+/).filter(Boolean).length} words
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCopy}
                                        className={`p-2 rounded-lg transition-colors hover:bg-white/10 text-white/60 hover:text-white`}
                                        title="Copy All"
                                    >
                                        <Copy size={18} />
                                    </button>
                                    <button
                                        onClick={handleClear}
                                        className={`p-2 rounded-lg transition-colors hover:bg-white/10 text-white/60 hover:text-blue-400`}
                                        title="Clear All"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Paste your text here..."
                                className={`flex-1 w-full bg-transparent p-6 resize-none focus:outline-none text-lg leading-relaxed text-white/90 placeholder:text-white/20 font-mono`}
                                spellCheck={false}
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="space-y-6">
                    <div className={`${staticBgClass} rounded-[1.5rem] border ${staticBorderClass} p-6 space-y-6`}>
                        <div>
                            <h3 className={`text-lg font-bold ${staticTextMain} mb-1`}>Cleanup Options</h3>
                            <p className={`text-sm ${staticTextMuted}`}>Select filters to apply</p>
                        </div>

                        <div className="space-y-3">
                            <label className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border ${options.trim ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                <span className={`font-medium ${options.trim ? 'text-blue-200' : 'text-white/70'}`}>Trim Ends</span>
                                <input
                                    type="checkbox"
                                    checked={options.trim}
                                    onChange={(e) => setOptions(prev => ({ ...prev, trim: e.target.checked }))}
                                    className="accent-blue-500 w-5 h-5 rounded border-white/20"
                                />
                            </label>

                            <label className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border ${options.multipleSpaces ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                <span className={`font-medium ${options.multipleSpaces ? 'text-blue-200' : 'text-white/70'}`}>Remove Extra Spaces</span>
                                <input
                                    type="checkbox"
                                    checked={options.multipleSpaces}
                                    onChange={(e) => setOptions(prev => ({ ...prev, multipleSpaces: e.target.checked }))}
                                    className="accent-blue-500 w-5 h-5 rounded border-white/20"
                                />
                            </label>

                            <label className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border ${options.emptyLines ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                <span className={`font-medium ${options.emptyLines ? 'text-blue-200' : 'text-white/70'}`}>Remove Empty Lines</span>
                                <input
                                    type="checkbox"
                                    checked={options.emptyLines}
                                    onChange={(e) => setOptions(prev => ({ ...prev, emptyLines: e.target.checked }))}
                                    className="accent-blue-500 w-5 h-5 rounded border-white/20"
                                />
                            </label>

                            <label className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border ${options.trimLines ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                <span className={`font-medium ${options.trimLines ? 'text-blue-200' : 'text-white/70'}`}>Trim Each Line</span>
                                <input
                                    type="checkbox"
                                    checked={options.trimLines}
                                    onChange={(e) => setOptions(prev => ({ ...prev, trimLines: e.target.checked }))}
                                    className="accent-blue-500 w-5 h-5 rounded border-white/20"
                                />
                            </label>
                        </div>

                        <button
                            onClick={processText}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            <Eraser size={20} />
                            Clean Text
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
