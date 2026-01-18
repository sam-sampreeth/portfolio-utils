import React, { useRef, useEffect, useState } from "react";
import {
    CaseUpper,
    ArrowUp,
    ArrowDown,
    ALargeSmall,
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Copy,
    Trash2,
    Undo,
    Redo,
    Sun,
    Moon
} from "lucide-react";
import toast from "react-hot-toast";

export const TextTransformer = () => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false
    });

    // Initial focus
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.focus();
        }
    }, []);

    // Check active formats on selection change
    const checkFormats = () => {
        setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            strikethrough: document.queryCommandState('strikeThrough')
        });
    };

    // Helper to execute commands
    const execCmd = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        checkFormats();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    };

    const handleCase = (type: string) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.toString().length === 0) {
            if (editorRef.current && editorRef.current.innerText.trim().length > 0) {
                document.execCommand('selectAll', false);
            } else {
                toast.error("Select text to transform");
                return;
            }
        }

        const currentSelection = window.getSelection();
        if (!currentSelection) return;

        const text = currentSelection.toString();
        let newText = text;

        switch (type) {
            case 'upper': newText = text.toUpperCase(); break;
            case 'lower': newText = text.toLowerCase(); break;
            case 'title':
                newText = text.replace(
                    /\w\S*/g,
                    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
                break;
            case 'sentence':
                newText = text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, (c) => c.toUpperCase());
                break;
        }

        execCmd('insertText', newText);
    };

    const isDark = theme === 'dark';
    // Editor-specific classes (Dynamic)
    const editorBgClass = isDark ? "bg-[#0a0a0a]" : "bg-white";
    const editorBorderClass = isDark ? "border-white/20" : "border-zinc-200";
    const editorTextMain = isDark ? "text-white" : "text-zinc-900";
    const editorHoverClass = isDark ? "hover:bg-white/10" : "hover:bg-zinc-100";
    const editorInactiveIconClass = isDark ? "text-white/60" : "text-zinc-500";

    // Static classes for Header and Sidebar (Always Dark "Premium")
    const staticBgClass = "bg-gradient-to-br from-blue-900/20 via-black/40 to-blue-900/20";
    const staticBorderClass = "border-white/20";
    const staticTextMain = "text-white";
    const staticTextMuted = "text-white/50";

    const activeIconClass = "text-blue-500";

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <CaseUpper size={28} />
                    </div>
                    <div>
                        <h2 className={`text-3xl font-black tracking-tight ${staticTextMain}`}>Text Transformer</h2>
                        <p className={`${staticTextMuted} font-medium`}>Rich text editor with case conversion</p>
                    </div>
                </div>

                <button
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    className={`p-3 rounded-xl border transition-all duration-300 ${isDark
                        ? 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                        : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 shadow-sm'
                        }`}
                    title="Toggle Editor Theme"
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Editor (Dynamic Theme) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="relative group min-h-[600px] h-full">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                        <div className={`relative ${editorBgClass} rounded-[1.8rem] border ${editorBorderClass} p-1 h-full flex flex-col transition-colors duration-300`}>
                            {/* Toolbar */}
                            <div className={`flex items-center justify-between px-6 py-3 border-b ${editorBorderClass} sticky top-0 ${editorBgClass} z-10 rounded-t-[1.5rem] transition-colors duration-300`}>
                                <div className="flex gap-1 overflow-x-auto no-scrollbar scroll-smooth">
                                    {/* History */}
                                    <button onClick={() => execCmd('undo')} className={`p-2 ${editorHoverClass} rounded-lg ${editorInactiveIconClass} hover:${editorTextMain} transition-colors`} title="Undo">
                                        <Undo size={18} />
                                    </button>
                                    <button onClick={() => execCmd('redo')} className={`p-2 ${editorHoverClass} rounded-lg ${editorInactiveIconClass} hover:${editorTextMain} transition-colors`} title="Redo">
                                        <Redo size={18} />
                                    </button>
                                    <div className={`w-px h-5 ${isDark ? 'bg-white/10' : 'bg-zinc-200'} mx-2 self-center`}></div>

                                    {/* Styles */}
                                    <button
                                        onClick={() => execCmd('bold')}
                                        className={`p-2 ${editorHoverClass} rounded-lg transition-colors font-bold ${activeFormats.bold ? activeIconClass : editorInactiveIconClass} hover:${editorTextMain}`}
                                        title="Bold"
                                    >
                                        <Bold size={18} />
                                    </button>
                                    <button
                                        onClick={() => execCmd('italic')}
                                        className={`p-2 ${editorHoverClass} rounded-lg transition-colors italic ${activeFormats.italic ? activeIconClass : editorInactiveIconClass} hover:${editorTextMain}`}
                                        title="Italic"
                                    >
                                        <Italic size={18} />
                                    </button>
                                    <button
                                        onClick={() => execCmd('underline')}
                                        className={`p-2 ${editorHoverClass} rounded-lg transition-colors underline ${activeFormats.underline ? activeIconClass : editorInactiveIconClass} hover:${editorTextMain}`}
                                        title="Underline"
                                    >
                                        <UnderlineIcon size={18} />
                                    </button>
                                    <button
                                        onClick={() => execCmd('strikeThrough')}
                                        className={`p-2 ${editorHoverClass} rounded-lg transition-colors line-through ${activeFormats.strikethrough ? activeIconClass : editorInactiveIconClass} hover:${editorTextMain}`}
                                        title="Strikethrough"
                                    >
                                        <Strikethrough size={18} />
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <div className={`w-px h-5 ${isDark ? 'bg-white/10' : 'bg-zinc-200'} mx-1 self-center`}></div>
                                    <button
                                        onClick={() => {
                                            if (editorRef.current) {
                                                const selection = window.getSelection();
                                                const range = document.createRange();
                                                range.selectNodeContents(editorRef.current);
                                                selection?.removeAllRanges();
                                                selection?.addRange(range);
                                                document.execCommand('copy');
                                                toast.success("Content copied!");
                                            }
                                        }}
                                        className={`p-2 ${editorHoverClass} rounded-lg ${isDark ? 'text-white/40' : 'text-zinc-400'} hover:text-blue-400 transition-colors`}
                                        title="Copy All"
                                    >
                                        <Copy size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (editorRef.current) {
                                                editorRef.current.innerHTML = "";
                                                editorRef.current.focus();
                                                toast.success("Cleared");
                                            }
                                        }}
                                        className={`p-2 ${editorHoverClass} rounded-lg ${isDark ? 'text-white/40' : 'text-zinc-400'} hover:text-red-400 transition-colors`}
                                        title="Clear All"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Editor Area */}
                            <div
                                className="flex-1 p-8 overflow-y-auto cursor-text focus:outline-none"
                                onClick={() => editorRef.current?.focus()}
                            >
                                <div
                                    ref={editorRef}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onPaste={handlePaste}
                                    onKeyUp={checkFormats}
                                    onMouseUp={checkFormats}
                                    className={`min-h-full text-lg leading-relaxed ${isDark ? 'text-white/90' : 'text-zinc-900'} outline-none whitespace-pre-wrap`}
                                    style={{ fontFamily: '"Times New Roman", Times, serif' }}
                                    data-placeholder="Start typing..."
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Controls (Case) - Static Dark */}
                <div className="space-y-6">
                    {/* Transformer Operations */}
                    <div className={`${staticBgClass} rounded-[1.5rem] border ${staticBorderClass} p-6 space-y-6`}>
                        <div>
                            <h3 className={`text-lg font-bold ${staticTextMain} mb-1`}>Case & Format</h3>
                            <p className={`text-sm ${staticTextMuted}`}>Select text to apply changes</p>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            <button onClick={() => handleCase('upper')} className={`flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group text-left`}>
                                <span className={`font-medium text-white/80 group-hover:text-white`}>UPPERCASE</span>
                                <ArrowUp size={18} className={`text-white/40 group-hover:text-blue-400`} />
                            </button>
                            <button onClick={() => handleCase('lower')} className={`flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group text-left`}>
                                <span className={`font-medium text-white/80 group-hover:text-white`}>lowercase</span>
                                <ArrowDown size={18} className={`text-white/40 group-hover:text-blue-400`} />
                            </button>
                            <button onClick={() => handleCase('title')} className={`flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group text-left`}>
                                <span className={`font-medium text-white/80 group-hover:text-white`}>Title Case</span>
                                <CaseUpper size={18} className={`text-white/40 group-hover:text-purple-400`} />
                            </button>
                            <button onClick={() => handleCase('sentence')} className={`flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group text-left`}>
                                <span className="font-medium text-white/80 group-hover:text-white">Sentence case</span>
                                <ALargeSmall size={18} className="text-white/40 group-hover:text-purple-400" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-500/10 rounded-[1.5rem] border border-blue-500/20 p-6">
                        <div className="flex gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg h-fit text-blue-400">
                                <CaseUpper size={20} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-blue-100">Rich Text Mode</h4>
                                <p className="text-sm text-blue-200/60 leading-relaxed">
                                    MS Word-like rich text editor.
                                    <br />
                                    <strong>Font:</strong> Times New Roman
                                    <br />
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
