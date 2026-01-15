import { useState } from "react";
import { Replace, Copy, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";

export const FindReplace = () => {
    const [text, setText] = useState("");
    const [findText, setFindText] = useState("");
    const [replaceText, setReplaceText] = useState("");
    const [stats, setStats] = useState({ matchCount: 0, replacedCount: 0 });

    const [options, setOptions] = useState({
        caseSensitive: false,
        wholeWord: false,
        useRegex: false
    });

    const [viewMode, setViewMode] = useState<'edit' | 'highlight'>('edit');

    // Static classes for Black & Blue Premium UI
    const staticBgClass = "bg-[#0a0a0a]";
    const staticBorderClass = "border-white/10";
    const staticTextMain = "text-white";
    const staticTextMuted = "text-white/50";

    const getSearchPattern = () => {
        if (!findText) return null;
        try {
            let flags = 'g';
            if (!options.caseSensitive) flags += 'i';

            if (options.useRegex) {
                return new RegExp(findText, flags);
            } else {
                let escapedFind = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                if (options.wholeWord) {
                    escapedFind = `\\b${escapedFind}\\b`;
                }
                return new RegExp(escapedFind, flags);
            }
        } catch {
            return null;
        }
    };

    const handleReplaceAll = () => {
        if (!text) {
            toast.error("Please enter some text");
            return;
        }
        if (!findText) {
            toast.error("Please enter text to find");
            return;
        }

        try {
            const searchPattern = getSearchPattern();
            if (!searchPattern) {
                toast.error("Invalid search pattern");
                return;
            }

            const matches = text.match(searchPattern);
            const count = matches ? matches.length : 0;

            if (count === 0) {
                toast("No matches found", { icon: "ℹ️" });
                setStats({ matchCount: 0, replacedCount: 0 });
                return;
            }

            const newText = text.replace(searchPattern, replaceText);
            setText(newText);
            setStats({ matchCount: 0, replacedCount: count });
            setViewMode('edit'); // Switch back to edit on replace
            toast.success(`Replaced ${count} occurrences`);

        } catch (error) {
            console.error(error);
            toast.error("An error occurred during replacement");
        }
    };

    const handleFindAll = () => {
        if (!text) {
            toast.error("Please enter text to search");
            return;
        }
        if (!findText) {
            toast.error("Please enter text to find");
            return;
        }
        const count = countMatches();
        if (count > 0) {
            setViewMode('highlight');
            toast.success(`Found ${count} matches`);
        } else {
            toast("No matches found", { icon: "ℹ️" });
        }
    };

    const countMatches = () => {
        if (!text || !findText) return 0;
        const searchPattern = getSearchPattern();
        if (!searchPattern) return 0;
        const matches = text.match(searchPattern);
        return matches ? matches.length : 0;
    };

    const renderHighlightedText = () => {
        if (!findText) return text;
        const searchPattern = getSearchPattern();
        if (!searchPattern) return text;

        const parts = text.split(searchPattern);
        const matches = text.match(searchPattern);

        if (!matches) return text;

        return parts.reduce<React.ReactNode[]>((acc, part, i) => {
            acc.push(part);
            if (i < parts.length - 1) {
                acc.push(
                    <mark key={i} className="bg-blue-500 text-white rounded px-0.5 mx-0.5 animate-pulse font-bold">
                        {matches[i]}
                    </mark>
                );
            }
            return acc;
        }, []);
    };

    const handleCopy = () => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const handleClear = () => {
        setText("");
        setFindText("");
        setReplaceText("");
        setStats({ matchCount: 0, replacedCount: 0 });
        setViewMode('edit');
        toast.success("Cleared");
    };

    const currentMatchCount = countMatches();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Replace size={28} />
                    </div>
                    <div>
                        <h2 className={`text-3xl font-black tracking-tight ${staticTextMain}`}>Find & Replace</h2>
                        <p className={`${staticTextMuted} font-medium`}>Bulk text editing with advanced patterns</p>
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
                            <div className={`flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a0a] rounded-t-[1.5rem] z-10 sticky top-0`}>
                                <div className="text-sm font-medium opacity-50 flex items-center gap-4">
                                    <span>{text.length} chars</span>
                                    {currentMatchCount > 0 && <span className="text-blue-400 font-bold">{currentMatchCount} matches</span>}
                                    {viewMode === 'highlight' && (
                                        <button
                                            onClick={() => setViewMode('edit')}
                                            className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition-colors"
                                        >
                                            back to edit
                                        </button>
                                    )}
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

                            {viewMode === 'edit' ? (
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Paste your content here..."
                                    className={`flex-1 w-full bg-transparent p-6 resize-none focus:outline-none text-lg leading-relaxed text-white/90 placeholder:text-white/20 font-mono`}
                                    spellCheck={false}
                                />
                            ) : (
                                <div className="flex-1 w-full bg-transparent p-6 overflow-y-auto text-lg leading-relaxed text-white/90 font-mono whitespace-pre-wrap">
                                    {renderHighlightedText()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="space-y-6">
                    <div className={`${staticBgClass} rounded-[1.5rem] border ${staticBorderClass} p-6 space-y-6`}>
                        <div>
                            <h3 className={`text-lg font-bold ${staticTextMain} mb-1`}>Search Options</h3>
                            <p className={`text-sm ${staticTextMuted}`}>Define what to find and replace</p>
                        </div>

                        {/* Find Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-blue-400">Find</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                <input
                                    type="text"
                                    value={findText}
                                    onChange={(e) => {
                                        setFindText(e.target.value);
                                        // Auto-switch to highlight if already highlighting
                                        if (viewMode === 'highlight') {
                                            // Keep highlight active
                                        }
                                    }}
                                    placeholder="Text to find..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        {/* Replace Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-indigo-400">Replace With</label>
                            <div className="relative">
                                <Replace className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                <input
                                    type="text"
                                    value={replaceText}
                                    onChange={(e) => setReplaceText(e.target.value)}
                                    placeholder="Replacement text..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="space-y-3 pt-2">
                            <label className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${options.caseSensitive ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                <span className={`text-sm font-medium ${options.caseSensitive ? 'text-blue-200' : 'text-white/70'}`}>Case Sensitive</span>
                                <input
                                    type="checkbox"
                                    checked={options.caseSensitive}
                                    onChange={(e) => setOptions(prev => ({ ...prev, caseSensitive: e.target.checked }))}
                                    className="accent-blue-500 w-4 h-4 rounded border-white/20"
                                />
                            </label>

                            <label className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${options.wholeWord ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                <span className={`text-sm font-medium ${options.wholeWord ? 'text-blue-200' : 'text-white/70'}`}>Match Whole Word</span>
                                <input
                                    type="checkbox"
                                    checked={options.wholeWord}
                                    onChange={(e) => setOptions(prev => ({ ...prev, wholeWord: e.target.checked }))}
                                    className="accent-blue-500 w-4 h-4 rounded border-white/20"
                                />
                            </label>

                            <label className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${options.useRegex ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                <span className={`text-sm font-medium ${options.useRegex ? 'text-blue-200' : 'text-white/70'}`}>Use Regex</span>
                                <input
                                    type="checkbox"
                                    checked={options.useRegex}
                                    onChange={(e) => setOptions(prev => ({ ...prev, useRegex: e.target.checked }))}
                                    className="accent-blue-500 w-4 h-4 rounded border-white/20"
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <button
                                onClick={handleFindAll}
                                className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                            >
                                <Search size={20} className="text-blue-400" />
                                Find
                            </button>
                            <button
                                onClick={handleReplaceAll}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                            >
                                <Replace size={20} />
                                Replace All
                            </button>
                        </div>
                    </div>

                    {stats.replacedCount > 0 && (
                        <div className="bg-green-500/10 rounded-[1.5rem] border border-green-500/20 p-6 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex gap-3">
                                <div className="p-2 bg-green-500/20 rounded-lg h-fit text-green-400">
                                    <Replace size={20} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-green-100">Success!</h4>
                                    <p className="text-sm text-green-200/60 leading-relaxed">
                                        Replaced {stats.replacedCount} occurrences.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
