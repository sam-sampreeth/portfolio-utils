import { useState, useRef } from "react";
import { Code2, Copy, Download } from "lucide-react";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { defineMonacoTheme } from "@/lib/monaco";
import * as prettier from "prettier/standalone";
import prettierPluginBabel from "prettier/plugins/babel";
import prettierPluginEstree from "prettier/plugins/estree";
import prettierPluginHtml from "prettier/plugins/html";
import prettierPluginPostcss from "prettier/plugins/postcss";
import prettierPluginTypeScript from "prettier/plugins/typescript";

export function CodeBeautifier() {
    const [code, setCode] = useState("");
    const [filename, setFilename] = useState("code");
    const [language, setLanguage] = useState("javascript");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const editorRef = useRef<any>(null);

    // Map internal language ID to file extension
    const getExtension = (lang: string) => {
        const map: Record<string, string> = {
            javascript: "js",
            typescript: "ts",
            jsx: "jsx",
            tsx: "tsx",
            css: "css",
            html: "html",
            xml: "xml",
            c: "c",
            cpp: "cpp",
            json: "json"
        };
        return map[lang] || "txt";
    };

    const detectLanguage = (value: string) => {
        const v = value.trim();
        if (v.startsWith('<')) return v.includes('<?xml') ? 'xml' : 'html';
        if (v.startsWith('{') || v.startsWith('[')) return 'json';
        if (v.includes('class ') && v.includes('{') && v.includes('}')) return 'css'; // Rough heuristic
        if (v.includes('#include') || v.includes('int main') || v.includes('std::')) return 'cpp';

        // React/TS detection
        const hasReact = v.includes('import React') || v.includes('from "react"') || v.includes('className=');
        const hasTypes = v.includes('interface ') || v.includes('type ') || v.includes(': string') || v.includes(': number') || v.includes(': React') || v.includes('<number>') || v.includes('<string>') || v.includes('<any>');

        if (hasReact && hasTypes) return 'tsx';
        if (hasReact) return 'jsx';
        if (hasTypes) return 'typescript';

        if (v.includes('function') || v.includes('const ') || v.includes('let ') || v.includes('=>')) return 'javascript';
        return 'javascript'; // Default
    };

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
    };

    // Auto-detect on first significant input if empty
    const handleCodeChange = (value: string | undefined) => {
        const newVal = value || "";
        if (!code && newVal.length > 10) {
            setLanguage(detectLanguage(newVal));
        }
        setCode(newVal);
    };

    // Custom helper for XML/HTML if Prettier fails or for better control
    const formatXML = (source: string) => {
        let formatted = '';
        let pad = 0;
        const xml = source.replace(/>\s*</g, '><'); // Remove existing whitespace between tags

        // Simple regex to find tags
        // Note: This is a basic formatter and might not handle CDATA or mixed content perfectly
        const tokens = xml.match(/<[^>]+>|[^<]+/g) || [];

        tokens.forEach(token => {
            if (token.startsWith('</')) {
                // Closing tag
                pad = Math.max(0, pad - 1);
                formatted += '  '.repeat(pad) + token.trim() + '\n';
            } else if (token.startsWith('<') && !token.startsWith('<?') && !token.startsWith('<!') && !token.endsWith('/>')) {
                // Opening tag (block)
                formatted += '  '.repeat(pad) + token.trim() + '\n';
                pad++;
            } else if (token.startsWith('<') && (token.startsWith('<?') || token.startsWith('<!') || token.endsWith('/>'))) {
                // Self-closing or declaration
                formatted += '  '.repeat(pad) + token.trim() + '\n';
            } else {
                // Content
                const content = token.trim();
                if (content.length > 0) {
                    formatted += '  '.repeat(pad) + content + '\n';
                }
            }
        });

        return formatted.trim();
    };

    // Custom helper for C/C++ since Monaco/Prettier browser support is heavy/limited
    const formatC = (source: string) => {
        // 1. Normalize spaces (collapse multiple spaces to one, but preserve newlines for now to handle directives)
        let s = source.replace(/[ \t]+/g, ' ').trim();

        // 2. Fix Includes: ensure #include is on its own line
        s = s.replace(/#include\s*<([^>]+)>/g, '\n#include <$1>\n');
        s = s.replace(/#include\s*"([^"]+)"/g, '\n#include "$1"\n');

        // 3. Handle structure
        s = s
            .replace(/\{/g, ' {\n')       // Start block
            .replace(/\}/g, '\n} ')       // End block (temp space)
            .replace(/;/g, ';\n')         // End Statement
            .replace(/\n\s*;/g, ';')      // Fix lonely semicolons created by newline logic
            .replace(/\}\s*;/g, '};\n')   // Fix }; 
            .replace(/\n\s*\}/g, '\n}')   // Fix closing brace spacing

        // 4. Split and Re-indent
        const lines = s.split('\n');
        let formatted = '';
        let indentLevel = 0;
        const indentString = '    '; // 4 spaces

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) continue;

            // Directive (no indent)
            if (line.startsWith('#')) {
                formatted += line + '\n';
                continue;
            }

            // Adjustment for closing brace
            if (line.startsWith('}') || line.startsWith('private:') || line.startsWith('public:') || line.startsWith('protected:')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }

            formatted += indentString.repeat(indentLevel) + line + '\n';

            // Adjustment for opening brace
            if (line.endsWith('{') || (line.endsWith(':') && !line.includes('case') && !line.includes('default') && !line.startsWith('public') && !line.startsWith('private') && !line.startsWith('protected'))) {
                indentLevel++;
            }
        }
        return formatted.trim();
    }

    const beautify = async () => {
        try {
            if (language === 'json') {
                const obj = JSON.parse(code);
                setCode(JSON.stringify(obj, null, 2));
                toast.success("JSON Formatted");
                return;
            }

            let formatted = code;

            if (['javascript', 'typescript', 'jsx', 'tsx'].includes(language)) {
                // Use typescript parser for all JS-family languages to handle potential types/JSX mixed in
                formatted = await prettier.format(code, {
                    parser: "typescript",
                    plugins: [prettierPluginTypeScript, prettierPluginBabel, prettierPluginEstree],
                });
            } else if (language === 'html') {
                formatted = await prettier.format(code, {
                    parser: "html",
                    plugins: [prettierPluginHtml],
                });
            } else if (language === 'xml') {
                formatted = formatXML(code);
            } else if (language === 'css') {
                formatted = await prettier.format(code, {
                    parser: "css",
                    plugins: [prettierPluginPostcss],
                });
            } else if (language === 'c' || language === 'cpp') {
                formatted = formatC(code);
            } else {
                if (editorRef.current) {
                    editorRef.current.getAction('editor.action.formatDocument').run();
                    toast.success("Triggered Default Formatter");
                    return;
                }
            }

            setCode(formatted);
            toast.success("Code Formatted");

        } catch (e) {
            console.error(e);
            toast.error("Format failed: " + (e as Error).message);
        }
    };

    const handleDownload = () => {
        if (!code) {
            toast.error("No content to download");
            return;
        }
        try {
            const ext = getExtension(language);
            const blob = new Blob([code], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${filename}.${ext}`;
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
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3 self-start md:self-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold">Code Editor</h3>
                        <p className="text-xs text-white/40">Multi-language editor</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <Select value={language} onValueChange={setLanguage} defaultValue="javascript">
                        <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white h-10 rounded-xl">
                            <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-white/10 text-white">
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="typescript">TypeScript</SelectItem>
                            <SelectItem value="jsx">JSX</SelectItem>
                            <SelectItem value="tsx">TSX</SelectItem>
                            <SelectItem value="html">HTML</SelectItem>
                            <SelectItem value="css">CSS</SelectItem>
                            <SelectItem value="xml">XML</SelectItem>
                            <SelectItem value="c">C</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                        </SelectContent>
                    </Select>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-white cursor-pointer" title="Download">
                                <Download size={18} />
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-white">
                            <DialogHeader>
                                <DialogTitle>Download Code</DialogTitle>
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
                                        <span className="text-muted-foreground font-mono text-sm">.{getExtension(language)}</span>
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

                    <button onClick={beautify} className="px-5 py-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/20 text-xs font-bold uppercase tracking-wider hover:bg-blue-500 hover:text-white transition-all cursor-pointer">
                        Format
                    </button>

                    <button
                        onClick={() => { navigator.clipboard.writeText(code); toast.success("Copied!"); }}
                        className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-white cursor-pointer"
                        title="Copy to Clipboard"
                    >
                        <Copy size={18} />
                    </button>
                </div>
            </div>

            <div className="h-[600px] border border-white/10 rounded-2xl overflow-hidden">
                <Editor
                    height="100%"
                    language={language}
                    defaultValue=""
                    value={code}
                    theme="vs-premium-dark"
                    onMount={handleEditorDidMount}
                    beforeMount={defineMonacoTheme}
                    onChange={handleCodeChange}
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
