import { useState, useEffect } from "react";
import { FileText, Copy, RefreshCw, AlignLeft } from "lucide-react";
import toast from "react-hot-toast";

const SAMPLE_WORDS = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
    "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "ut",
    "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris",
    "nisi", "ut", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "dolor",
    "in", "reprehenderit", "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat",
    "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt",
    "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
];

export const LoremGenerator = () => {
    const [count, setCount] = useState(3);
    const [unit, setUnit] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
    const [startWithLorem, setStartWithLorem] = useState(true);
    const [generatedText, setGeneratedText] = useState("");

    // Static classes for Black & Blue Premium UI
    const staticBgClass = "bg-[#0a0a0a]";
    const staticBorderClass = "border-white/10";
    const staticTextMain = "text-white";
    const staticTextMuted = "text-white/50";

    const generateText = () => {
        let text = "";

        const generateSentence = () => {
            const length = Math.floor(Math.random() * 10) + 5; // 5-15 words
            let sentence = [];
            for (let i = 0; i < length; i++) {
                sentence.push(SAMPLE_WORDS[Math.floor(Math.random() * SAMPLE_WORDS.length)]);
            }
            return sentence.join(" ").charAt(0).toUpperCase() + sentence.join(" ").slice(1) + ".";
        };

        const generateParagraph = () => {
            const length = Math.floor(Math.random() * 5) + 3; // 3-8 sentences
            let paragraph = [];
            for (let i = 0; i < length; i++) {
                paragraph.push(generateSentence());
            }
            return paragraph.join(" ");
        };

        if (unit === 'words') {
            let words = [];
            for (let i = 0; i < count; i++) {
                words.push(SAMPLE_WORDS[Math.floor(Math.random() * SAMPLE_WORDS.length)]);
            }
            text = words.join(" ");
            if (startWithLorem) {
                // Ensure starts with Lorem ipsum dolor sit amet if enough words
                const prefix = ["Lorem", "ipsum", "dolor", "sit", "amet"];
                if (count >= 5) {
                    text = prefix.join(" ") + " " + words.slice(5).join(" ");
                } else {
                    text = prefix.slice(0, count).join(" ");
                }
            }
        } else if (unit === 'sentences') {
            let sentences = [];
            for (let i = 0; i < count; i++) {
                sentences.push(generateSentence());
            }
            text = sentences.join(" ");
            if (startWithLorem) {
                text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + text.slice(text.indexOf(".") + 1).trim();
            }
        } else {
            // Paragraphs
            let paragraphs = [];
            for (let i = 0; i < count; i++) {
                paragraphs.push(generateParagraph());
            }
            text = paragraphs.join("\n\n");
            if (startWithLorem) {
                // Actually simpler: just ensure first paragraph starts correctly
                // Regenerate first paragraph to be standard lorem ipsum
                paragraphs[0] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
                text = paragraphs.join("\n\n");
            }
        }

        setGeneratedText(text);
    };

    // Generate on mount and when interactions occur (debounced usually, but acceptable here)
    useEffect(() => {
        generateText();
    }, []); // Run once on mount

    const handleCopy = () => {
        if (!generatedText) return;
        navigator.clipboard.writeText(generatedText);
        toast.success("Copied to clipboard");
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <FileText size={28} />
                    </div>
                    <div>
                        <h2 className={`text-3xl font-black tracking-tight ${staticTextMain}`}>Lorem Ipsum Generator</h2>
                        <p className={`${staticTextMuted} font-medium`}>Generate placeholder text for generic layouting</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Generator Controls and Preview */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="relative group min-h-[500px] h-full">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                        <div className={`relative bg-[#0a0a0a] border-white/10 rounded-[1.8rem] border p-1 h-full flex flex-col transition-colors duration-300`}>
                            {/* Toolbar */}
                            <div className={`flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a0a] rounded-t-[1.5rem] z-10 sticky top-0`}>
                                <div className="text-sm font-medium opacity-50 flex items-center gap-4">
                                    <span>{generatedText.length} chars</span>
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
                                        onClick={generateText}
                                        className={`p-2 rounded-lg transition-colors hover:bg-white/10 text-white/60 hover:text-blue-400`}
                                        title="Regenerate"
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                </div>
                            </div>

                            <textarea
                                value={generatedText}
                                readOnly
                                className="flex-1 w-full bg-transparent p-6 resize-none focus:outline-none text-lg leading-relaxed text-white/90 font-serif whitespace-pre-wrap cursor-text"
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="space-y-6">
                    <div className={`${staticBgClass} rounded-[1.5rem] border ${staticBorderClass} p-6 space-y-6`}>
                        <div>
                            <h3 className={`text-lg font-bold ${staticTextMain} mb-1`}>Configuration</h3>
                            <p className={`text-sm ${staticTextMuted}`}>Customize your placeholder text</p>
                        </div>

                        {/* Count & Unit */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-blue-400">Generate</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={count}
                                        onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                                        className="w-20 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-center font-bold focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <div className="flex-1 flex bg-white/5 p-1 rounded-xl border border-white/10">
                                        <button
                                            onClick={() => setUnit('paragraphs')}
                                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${unit === 'paragraphs' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
                                        >
                                            Paras
                                        </button>
                                        <button
                                            onClick={() => setUnit('sentences')}
                                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${unit === 'sentences' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
                                        >
                                            sentences
                                        </button>
                                        <button
                                            onClick={() => setUnit('words')}
                                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${unit === 'words' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
                                        >
                                            words
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="space-y-3 pt-2">
                            <label className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${startWithLorem ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                <div className="flex items-center gap-3">
                                    <AlignLeft size={18} className={startWithLorem ? "text-blue-400" : "text-white/30"} />
                                    <span className={`text-sm font-medium ${startWithLorem ? 'text-blue-200' : 'text-white/70'}`}>Start with "Lorem ipsum..."</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={startWithLorem}
                                    onChange={(e) => setStartWithLorem(e.target.checked)}
                                    className="accent-blue-500 w-4 h-4 rounded border-white/20"
                                />
                            </label>
                        </div>

                        <button
                            onClick={generateText}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 mt-4"
                        >
                            <RefreshCw size={20} />
                            Generate
                        </button>
                    </div>

                    <div className="bg-blue-500/10 rounded-[1.5rem] border border-blue-500/20 p-6">
                        <div className="flex gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg h-fit text-blue-400">
                                <FileText size={20} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-blue-100">Did you know?</h4>
                                <p className="text-sm text-blue-200/60 leading-relaxed">
                                    Lorem Ipsum is not randomly generated text; it has roots in a piece of classical Latin literature from 45 BC.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
