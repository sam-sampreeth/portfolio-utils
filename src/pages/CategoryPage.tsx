import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, FileArchive, Image as ImageIcon, FileText, FileType2, MoreHorizontal, Search, X, ArrowRight, ChevronDown } from "lucide-react";
import { toolsConfig } from "@/data/tools";
import { HoverEffect } from "@/components/ui/CardHoverEffect";
import { FileConverter } from "@/components/file/FileConverter";
import { cn } from "@/lib/utils";

// Helper for file groups
const FILE_GROUPS = [
    {
        id: "pdf",
        title: "PDF Tools",
        icon: FileText,
        description: "Merge, split, compress, and edit PDFs",
        tools: [
            "pdf-to-word", "pdf-to-ppt", "pdf-to-excel",
            "pdf-merge", "pdf-split",
            "pdf-password",
            "pdf-organize",
            "pdf-compress", "pdf-extract-images"
        ]
    },
    {
        id: "image",
        title: "Image Tools",
        icon: ImageIcon,
        description: "Convert, resize, and optimize images",
        tools: [
            "img-compress", "img-resize", "img-crop",
            "img-rotate", "img-converter", "file-metadata"
        ]
    },
    {
        id: "word",
        title: "Word & PPT Tools",
        icon: FileType2,
        description: "Document conversion and editing",
        tools: [
            "word-to-pdf", "word-compress", "word-extract", "word-merge",
            "ppt-to-pdf", "ppt-compress", "ppt-merge", "ppt-export"
        ]
    },
    {
        id: "others",
        title: "Other Utilities",
        icon: MoreHorizontal,
        description: "Miscellaneous file operations",
        tools: [
            "file-hash", "file-check",
            "zip-manager", "text-extract", "redact"
        ]
    }
];

export default function CategoryPage() {
    const { id } = useParams<{ id: string }>();
    const category = toolsConfig.find(cat => cat.id === id);
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Ctrl + K shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === "Escape") {
                searchInputRef.current?.blur();
                setSearchQuery("");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    if (!category) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Category not found</h2>
                    <Link to="/#tools" className="text-primary hover:underline">Return to Categories</Link>
                </div>
            </div>
        );
    }

    const isFiles = category.id === 'files';

    // Helper to get tools for a group
    const getGroupTools = (toolIds: string[]) => {
        return category.tools.filter(t => toolIds.includes(t.id));
    };

    // Helper for Search Results (Categorized List)
    const getSearchResults = () => {
        if (!searchQuery) return [];
        const query = searchQuery.toLowerCase();

        return FILE_GROUPS.map(group => {
            const matches = category.tools.filter(t =>
                group.tools.includes(t.id) &&
                (t.name.toLowerCase().includes(query) || t.desc.toLowerCase().includes(query))
            );

            if (matches.length === 0) return null;

            return (
                <div key={group.id} className="mb-8 last:mb-0">
                    <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <group.icon className="w-4 h-4" />
                        {group.title}
                    </h3>
                    <div className="space-y-2">
                        {matches.map(tool => (
                            <Link
                                key={tool.id}
                                to={tool.path}
                                className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-blue-500/20 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-black/40 text-white/60 group-hover:text-blue-400 transition-colors">
                                        <tool.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white group-hover:text-blue-300 transition-colors">
                                            {tool.name}
                                        </h4>
                                        <p className="text-sm text-white/40">
                                            {tool.desc}
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-4">
                {/* Breadcrumbs / Back */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12"
                >
                    <Link to="/#tools" className="inline-flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        BACK TO CATEGORIES
                    </Link>
                </motion.div>

                {/* Category Header */}
                <div className="mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-black tracking-widest uppercase mb-4">
                                <Sparkles className="w-3 h-3 fill-primary" />
                                <span>Tools Suite</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4">
                                {category.title}
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl">
                                {category.description}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {isFiles ? (
                    <div className="space-y-16">
                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto relative group z-20">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                            <div className={cn(
                                "relative flex items-center bg-black/40 border border-white/10 rounded-full px-6 py-4 transition-all",
                                "focus-within:border-blue-500/50 focus-within:bg-black/60 focus-within:ring-2 focus-within:ring-blue-500/10"
                            )}>
                                <Search className="w-5 h-5 text-white/40 mr-4" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search tools... (Ctrl + K)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none outline-none text-white placeholder:text-white/20 w-full text-lg"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors ml-2"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                {!searchQuery && (
                                    <div className="hidden sm:flex items-center gap-1 ml-4 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-white/30 pointer-events-none select-none">
                                        <span className="text-lg">⌘</span> K
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SEARCH RESULTS VIEW */}
                        {searchQuery ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="max-w-3xl mx-auto"
                            >
                                {FILE_GROUPS.some(g => category.tools.some(t => g.tools.includes(t.id) && t.name.toLowerCase().includes(searchQuery.toLowerCase()))) ? (
                                    <div className="bg-black/20 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                                        {getSearchResults()}
                                    </div>
                                ) : (
                                    <div className="text-center py-20">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-6">
                                            <Search className="w-6 h-6 text-white/20" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">No tools found</h3>
                                        <p className="text-white/40">Try searching for "PDF", "Image", or "Convert"</p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            /* DEFAULT VIEW */
                            <>
                                {/* 1. Fan Favorites */}
                                <section>
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-yellow-500" />
                                        Fan Favorites
                                    </h3>
                                    <HoverEffect
                                        hoverColor="bg-blue-500/10 border-blue-500/20 text-blue-400 group-hover:bg-blue-500/20 group-hover:border-blue-500/30"
                                        items={category.tools
                                            .filter(t => ["pdf-merge", "pdf-split", "img-compress", "pdf-compress"].includes(t.id))
                                            .map(tool => ({
                                                id: tool.id,
                                                title: tool.name,
                                                description: tool.desc,
                                                link: tool.path,
                                                icon: tool.icon,
                                                footerText: "Launch Utility"
                                            }))}
                                    />
                                </section>

                                {/* Divider */}
                                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                                {/* 2. Universal Converter */}
                                <section>
                                    <div className="text-center mb-8">
                                        <h2 className="text-3xl font-black text-white">Universal Converter</h2>
                                        <p className="text-white/40">Drag, drop, and convert anything instantly.</p>
                                    </div>
                                    <div className="bg-black/20 rounded-3xl p-4 md:p-8 border border-white/5">
                                        <FileConverter />
                                    </div>
                                </section>

                                {/* Divider */}
                                <div className="flex items-center gap-4 text-white/20">
                                    <div className="h-px bg-white/10 flex-1" />
                                    <span className="text-xs font-bold uppercase tracking-widest">File Utilities</span>
                                    <div className="h-px bg-white/10 flex-1" />
                                </div>

                                {/* 3. Collapsible File Tools */}
                                <div className="space-y-4 max-w-4xl mx-auto">
                                    {FILE_GROUPS.map((group) => {
                                        const isOpen = expandedGroup === group.id;
                                        const groupTools = getGroupTools(group.tools);

                                        return (
                                            <div key={group.id} className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                                                <button
                                                    onClick={() => setExpandedGroup(isOpen ? null : group.id)}
                                                    className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn("p-2 rounded-lg bg-gradient-to-br from-white/5 to-transparent border border-white/5", isOpen ? "text-blue-400" : "text-white/40")}>
                                                            <group.icon className="w-6 h-6" />
                                                        </div>
                                                        <div className="text-left">
                                                            <h3 className={cn("text-lg font-bold transition-colors", isOpen ? "text-white" : "text-white/60")}>
                                                                {group.title}
                                                            </h3>
                                                            <p className="text-sm text-white/40">{group.description}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronDown className={cn("w-5 h-5 text-white/40 transition-transform duration-300", isOpen && "rotate-180 text-blue-400")} />
                                                </button>

                                                <AnimatePresence>
                                                    {isOpen && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                                        >
                                                            <div className="p-6 pt-0 border-t border-white/5 bg-black/20">
                                                                <div className="pt-6">
                                                                    <HoverEffect
                                                                        hoverColor="bg-blue-500/10 border-blue-500/20 text-blue-400 group-hover:bg-blue-500/20 group-hover:border-blue-500/30"
                                                                        items={groupTools.map(tool => ({
                                                                            id: tool.id,
                                                                            title: tool.name,
                                                                            description: tool.desc,
                                                                            link: tool.path,
                                                                            icon: tool.icon,
                                                                            footerText: "Launch Utility"
                                                                        }))}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    /* Standard Tools Grid for other categories */
                    <HoverEffect
                        hoverColor={category.id === 'time' ? "bg-blue-500/10 border-blue-500/20 text-blue-400 group-hover:bg-blue-500/20 group-hover:border-blue-500/30" : undefined}
                        items={category.tools.map(tool => ({
                            id: tool.id,
                            title: tool.name,
                            description: tool.desc,
                            link: tool.path,
                            icon: tool.icon,
                            footerText: "Launch Utility"
                        }))}
                    />
                )}
            </div>
        </div>
    );
}
