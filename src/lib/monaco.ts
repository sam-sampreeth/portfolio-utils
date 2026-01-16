export const defineMonacoTheme = (monaco: any) => {
    monaco.editor.defineTheme("vs-premium-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
            { token: "comment", foreground: "64748b", fontStyle: "italic" },
            { token: "keyword", foreground: "3b82f6", fontStyle: "bold" },
            { token: "string", foreground: "10b981" },
            { token: "number", foreground: "f59e0b" },
            { token: "type", foreground: "a855f7" },
            { token: "class", foreground: "8b5cf6" },
            { token: "function", foreground: "ec4899" },
            { token: "variable", foreground: "e2e8f0" },
            { token: "operator", foreground: "94a3b8" },
        ],
        colors: {
            "editor.background": "#00000000", // Transparent background
            "editor.foreground": "#e2e8f0",
            "editor.lineHighlightBackground": "#ffffff05",
            "editorCursor.foreground": "#3b82f6",
            "editorWhitespace.foreground": "#ffffff10",
            "editorIndentGuide.background": "#ffffff10",
            "editorIndentGuide.activeBackground": "#3b82f630",
            "editor.selectionBackground": "#3b82f620",
            "editor.inactiveSelectionBackground": "#3b82f610",
        },
    });
};
