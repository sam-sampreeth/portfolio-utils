import { useState, useRef, useEffect } from "react";
import { Terminal, AlertTriangle, CheckCircle2, Flag } from "lucide-react";
import Editor, { type OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

import { defineMonacoTheme } from "@/lib/monaco";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function RegexTester() {
    const [regexPattern, setRegexPattern] = useState("([A-Z])\\w+");
    const [regexFlags, setRegexFlags] = useState("gm");
    const [testString, setTestString] = useState("Hello World\nThis is a Test String\nWith Some Matches");
    const [matches, setMatches] = useState<RegExpExecArray[]>([]);
    const [error, setError] = useState<string | null>(null);

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const decorationsRef = useRef<string[]>([]);

    const flags = [
        { key: 'g', name: 'Global search', desc: 'Find all matches rather than stopping after the first match' },
        { key: 'i', name: 'Case insensitive', desc: 'Case insensitive match' },
        { key: 'm', name: 'Multiline', desc: '^ and $ match start/end of line' },
        { key: 's', name: 'Dot all', desc: 'Dot (.) matches newlines' },
        { key: 'u', name: 'Unicode', desc: 'Treat pattern as a sequence of unicode code points' },
        { key: 'y', name: 'Sticky', desc: 'Matches only from the index indicated by the lastIndex property' },
    ];

    const toggleFlag = (flag: string) => {
        setRegexFlags(prev =>
            prev.includes(flag)
                ? prev.replace(flag, '')
                : prev + flag
        );
    };

    const handleEditorDidMount: OnMount = (editor) => {
        editorRef.current = editor;
        updateHighlights();
    };

    const updateHighlights = () => {
        if (!editorRef.current) return;

        try {
            setError(null);
            if (!regexPattern) {
                setMatches([]);
                decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
                return;
            }

            const regex = new RegExp(regexPattern, regexFlags);
            const text = editorRef.current.getValue();
            const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];

            // Collect all matches
            const allMatches: RegExpExecArray[] = [];
            let match;

            // Prevent infinite loops with empty matches
            if (regex.global) {
                while ((match = regex.exec(text)) !== null) {
                    allMatches.push(match);
                    if (match.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }
                }
            } else {
                match = regex.exec(text);
                if (match) allMatches.push(match);
            }

            setMatches(allMatches);

            // Create decorations
            allMatches.forEach(m => {
                const startPos = editorRef.current?.getModel()?.getPositionAt(m.index);
                const endPos = editorRef.current?.getModel()?.getPositionAt(m.index + m[0].length);

                if (startPos && endPos) {
                    newDecorations.push({
                        range: new monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column),
                        options: {
                            isWholeLine: false,
                            className: 'bg-blue-500/30 border-b-2 border-blue-500',
                            hoverMessage: { value: `Match: ${m[0]}\nIndex: ${m.index}` }
                        }
                    });
                }
            });

            decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, newDecorations);

        } catch (e) {
            setError((e as Error).message);
            setMatches([]);
            if (editorRef.current) {
                decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
            }
        }
    };

    useEffect(() => {
        updateHighlights();
    }, [regexPattern, regexFlags, testString]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {/* Header & Controls */}
                {/* Header & Controls */}
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <Terminal className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Regex Tester</h3>
                            <p className="text-xs text-white/40">Test regular expressions in real-time</p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-stretch">
                        <div className="flex-1 relative flex items-center">
                            <div className="absolute left-4 text-white/40 font-mono text-lg select-none">/</div>
                            <Input
                                value={regexPattern}
                                onChange={(e) => setRegexPattern(e.target.value)}
                                className={`pl-8 pr-16 font-mono text-lg h-14 bg-black/20 border-white/10 rounded-xl ${error ? 'border-red-500/50 focus-visible:ring-red-500/50' : 'focus-visible:ring-blue-500/50'}`}
                                placeholder="pattern"
                            />
                            <div className="absolute right-4 text-white/40 font-mono text-lg select-none">/{regexFlags}</div>
                        </div>

                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="px-5 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-blue-400 flex items-center justify-center gap-2 font-bold text-sm">
                                    <Flag size={18} />
                                    <span>FLAGS</span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 bg-zinc-950 border-white/10 p-4" align="end">
                                <h4 className="font-bold mb-4 text-sm">Flags</h4>
                                <div className="space-y-3">
                                    {flags.map(flag => (
                                        <div key={flag.key} className="flex items-start space-x-3">
                                            <Checkbox
                                                id={`flag-${flag.key}`}
                                                checked={regexFlags.includes(flag.key)}
                                                onCheckedChange={() => toggleFlag(flag.key)}
                                                className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <Label
                                                    htmlFor={`flag-${flag.key}`}
                                                    className="font-medium text-sm cursor-pointer"
                                                >
                                                    {flag.name} (<span className="font-mono text-blue-400">{flag.key}</span>)
                                                </Label>
                                                <p className="text-xs text-white/40">{flag.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                            <AlertTriangle size={16} />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Editor Area */}
                <div className="h-[500px] border border-white/10 rounded-3xl overflow-hidden bg-[#1e1e1e]">
                    <Editor
                        height="100%"
                        defaultLanguage="plaintext"
                        value={testString}
                        theme="vs-premium-dark"
                        beforeMount={defineMonacoTheme}
                        onMount={handleEditorDidMount}
                        onChange={(val) => setTestString(val || "")}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            padding: { top: 16 },
                            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                            fontLigatures: true,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            renderWhitespace: 'all',
                        }}
                    />
                </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 h-full">
                    <h4 className="font-bold mb-6 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-blue-400" />
                        Matches found: <span className="text-white">{matches.length}</span>
                    </h4>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                        {matches.length === 0 ? (
                            <div className="text-center py-10 text-white/30 text-sm italic">
                                No matches found
                            </div>
                        ) : (
                            matches.slice(0, 50).map((match, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">Match #{i + 1}</span>
                                        <span className="text-xs text-white/30">Index: {match.index}</span>
                                    </div>
                                    <div className="font-mono text-sm break-all bg-black/20 p-2 rounded border border-white/5">
                                        {match[0]}
                                    </div>
                                    {match.length > 1 && (
                                        <div className="mt-3 space-y-2">
                                            <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Groups</p>
                                            {Array.from(match).slice(1).map((group, groupIndex) => (
                                                <div key={groupIndex} className="flex gap-2 text-xs">
                                                    <span className="text-white/30 min-w-[20px]">${groupIndex + 1}:</span>
                                                    <span className="font-mono text-white/70 break-all">{group || "undefined"}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        {matches.length > 50 && (
                            <div className="text-center py-4 text-xs text-white/40">
                                Showing first 50 matches...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegexTester;
