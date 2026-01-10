import { useRef, useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    Zap,
    Shield,
    Cpu,
    Sparkles,
    Command as CommandIcon,
    Layout,
    Github,
    Search,
    X,
    ChevronRight,
    Monitor,
    Terminal,
} from "lucide-react";
import { toolsConfig } from "@/data/tools";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { HoverEffect } from "@/components/ui/CardHoverEffect";
import FavoriteToggle from "@/components/FavoriteToggle";
import { useFavorites } from "@/hooks/useFavorites.tsx";

export default function LandingPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const resultsContainerRef = useRef<HTMLDivElement>(null);
    const { favorites } = useFavorites();
    const navigate = useNavigate();

    const allTools = useMemo(() => {
        return toolsConfig.flatMap(cat =>
            cat.tools.map(tool => ({
                ...tool,
                category: cat.title,
                categoryId: cat.id,
                icon: tool.icon || cat.icon,
                color: cat.color
            }))
        );
    }, []);

    const filteredTools = useMemo(() => {
        if (!searchQuery) return allTools;
        return allTools.filter((tool: any) =>
            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.desc.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, allTools]);

    // Reset selected index when search query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [searchQuery]);

    const favoriteTools = useMemo(() => {
        return allTools.filter(tool => favorites.includes(tool.id));
    }, [allTools, favorites]);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsSearchModalOpen(false);
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsSearchModalOpen(true);
            }

            if (isSearchModalOpen && filteredTools.length > 0) {
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev + 1) % filteredTools.length);
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev - 1 + filteredTools.length) % filteredTools.length);
                } else if (e.key === "Enter") {
                    e.preventDefault();
                    const selectedTool = filteredTools[selectedIndex];
                    if (selectedTool) {
                        navigate(selectedTool.path);
                        setIsSearchModalOpen(false);
                    }
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isSearchModalOpen, filteredTools, selectedIndex, navigate]);

    // Scroll selected item into view
    useEffect(() => {
        if (isSearchModalOpen && resultsContainerRef.current) {
            const selectedElement = resultsContainerRef.current.children[1]?.children[selectedIndex] as HTMLElement;
            if (selectedElement) {
                selectedElement.scrollIntoView({
                    block: "nearest",
                    behavior: "smooth",
                });
            }
        }
    }, [selectedIndex, isSearchModalOpen]);

    return (
        <div ref={containerRef} className="min-h-screen pt-32 pb-20 overflow-hidden selection:bg-primary/20">
            {/* Background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-primary/30 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* --- Hero Section --- */}
                <div className="max-w-4xl mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold mb-6">
                            <Sparkles className="w-3 h-3 fill-primary" />
                            <span>THE ALL-IN-ONE UTILITIES HUB</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]">
                            TOOLS FOR <br />
                            <span className="text-primary italic">MODERN MINDS.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground/80 leading-relaxed max-w-2xl font-medium">
                            A premium suite of web utilities designed to simplify your workflow.
                            No ads, no tracking, just pure utility.
                        </p>
                    </motion.div>
                </div>

                {/* --- Modal Trigger Search Bar --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-xl mb-32"
                >
                    <button
                        onClick={() => setIsSearchModalOpen(true)}
                        className="w-full h-16 px-6 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4 text-white/40 hover:bg-white/[0.05] hover:border-white/20 transition-all group"
                    >
                        <Search className="w-5 h-5 group-hover:text-primary transition-colors" />
                        <span className="text-lg">Type a command or search...</span>
                        <div className="ml-auto flex items-center gap-1.5 font-sans text-[10px] font-black text-white/20 border border-white/10 px-2 py-1 rounded-lg">
                            <span className="text-xs">⌘</span> K
                        </div>
                    </button>
                </motion.div>

                {/* --- SEARCH MODAL --- */}
                <AnimatePresence>
                    {isSearchModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSearchModalOpen(false)}
                                className="absolute inset-0 bg-black/40 backdrop-blur-xl"
                            />

                            {/* Modal Content */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_32px_128px_rgba(0,0,0,0.8)] overflow-hidden relative z-10"
                            >
                                {/* Search Input */}
                                <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Type to filter tools..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-transparent pl-12 pr-4 py-3 text-lg text-white placeholder:text-white/20 focus:outline-none"
                                        />
                                        <button
                                            onClick={() => setIsSearchModalOpen(false)}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white/20 hover:text-white"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Results List */}
                                <div
                                    ref={resultsContainerRef}
                                    className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2"
                                >
                                    <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                                        {searchQuery ? `Search Results (${filteredTools.length})` : "Quick Access"}
                                    </div>

                                    {filteredTools.length > 0 ? (
                                        <div className="flex flex-col gap-1">
                                            {filteredTools.map((tool: any, idx: number) => (
                                                <button
                                                    key={tool.name}
                                                    onClick={() => {
                                                        navigate(tool.path);
                                                        setIsSearchModalOpen(false);
                                                    }}
                                                    className={cn(
                                                        "flex items-center justify-between p-3 rounded-xl transition-all group/tool text-left",
                                                        selectedIndex === idx
                                                            ? "bg-white/10"
                                                            : "hover:bg-white/5"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "transition-colors",
                                                            selectedIndex === idx ? "text-primary" : "text-white"
                                                        )}>
                                                            <tool.icon size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-white">{tool.name}</div>
                                                            <div className="text-xs text-white/40">{tool.desc}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover/tool:opacity-100 transition-opacity">
                                                        <FavoriteToggle toolId={tool.id} />
                                                        <div className="h-4 w-px bg-white/10 mx-1" />
                                                        <span className="text-[10px] font-black uppercase text-white/20 tracking-tighter">Open Tool</span>
                                                        <ChevronRight size={14} className={cn(
                                                            "transition-transform",
                                                            selectedIndex === idx ? "text-primary translate-x-1" : "text-primary"
                                                        )} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center">
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                                                <X size={24} className="text-white/20" />
                                            </div>
                                            <p className="text-muted-foreground font-medium">No tools found matching your search</p>
                                            <button
                                                onClick={() => setSearchQuery("")}
                                                className="mt-4 text-primary text-sm font-bold hover:underline"
                                            >
                                                Clear search
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="p-3 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                        <span className="flex items-center gap-1"><Terminal size={12} /> Enter to select</span>
                                        <span className="flex items-center gap-1"><Monitor size={12} /> ESC to close</span>
                                    </div>
                                    <div className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em]">
                                        Search v1.0
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* --- Favorites Section --- */}
                {favoriteTools.length > 0 && (
                    <div id="favorites" className="mb-32">
                        <div className="flex items-center justify-between mb-12">
                            <h2 className="text-3xl font-bold tracking-tight">Your Favorites</h2>
                            <div className="h-px flex-grow mx-8 bg-gradient-to-r from-white/10 to-transparent" />
                        </div>
                        <HoverEffect
                            items={favoriteTools.map(tool => ({
                                id: tool.id,
                                title: tool.name,
                                description: tool.desc,
                                link: tool.path,
                                icon: tool.icon,
                                footerText: tool.category
                            }))}
                        />
                    </div>
                )}

                {/* --- Categories Grid --- */}
                <div id="tools" className="mb-40">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-3xl font-bold tracking-tight">Main Categories</h2>
                        <div className="h-px flex-grow mx-8 bg-gradient-to-r from-white/10 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {toolsConfig.map((cat, idx) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ y: -5 }}
                                className="group"
                            >
                                <SpotlightCard
                                    className="h-full border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-8 cursor-pointer"
                                    spotlightColor="rgba(59, 130, 246, 0.15)"
                                >
                                    <div className="relative z-10">
                                        <div className="text-white mb-6">
                                            <cat.icon className="w-8 h-8" />
                                        </div>

                                        <h3 className="text-2xl font-bold mb-3">{cat.title}</h3>
                                        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                                            {cat.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-8 lowercase">
                                            {cat.tools.slice(0, 3).map(tool => (
                                                <span key={tool.id} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black tracking-widest text-white/40 uppercase">
                                                    {tool.name}
                                                </span>
                                            ))}
                                            {cat.tools.length > 3 && (
                                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black tracking-widest text-white/40 uppercase">
                                                    +{cat.tools.length - 3} More
                                                </span>
                                            )}
                                        </div>

                                        <Link
                                            to={`/category/${cat.id}`}
                                            className="inline-flex items-center gap-2 font-bold text-xs uppercase tracking-[0.2em] group/btn text-primary hover:text-white transition-colors"
                                        >
                                            Explore Category
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                        </Link>
                                    </div>
                                </SpotlightCard>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* --- Security & Privacy Feature Block --- */}
                <div id="security" className="mb-40 p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-blue-500/10 via-primary/5 to-transparent border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                        <Shield size={300} strokeWidth={0.5} />
                    </div>

                    <div className="max-w-2xl relative z-10">
                        <div className="text-white mb-8 animate-pulse">
                            <Shield size={48} />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Your data belongs to you. Period.</h2>
                        <p className="text-lg text-muted-foreground/80 leading-relaxed mb-10">
                            Unlike other utility websites, we never upload your content to a server.
                            Whether you're decoding a JWT, formatting JSON, or generating UUIDs,
                            <strong> everything happens locally in your browser.</strong>
                        </p>
                        <div className="grid grid-cols-2 gap-8 text-sm font-bold uppercase tracking-widest text-white/40">
                            <div className="flex items-center gap-3"><Zap size={16} className="text-white" /> Offline Ready</div>
                            <div className="flex items-center gap-3"><CommandIcon size={16} className="text-white" /> Open Source</div>
                            <div className="flex items-center gap-3"><Cpu size={16} className="text-white" /> Client-Side</div>
                            <div className="flex items-center gap-3"><Layout size={16} className="text-white" /> No Tracking</div>
                        </div>
                    </div>
                </div>

                {/* --- Final CTA --- */}
                <div className="relative p-12 md:p-24 rounded-[3rem] bg-white/[0.02] border border-white/10 text-center overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full translate-y-1/2" />
                    <div className="relative z-10">
                        <Sparkles className="w-12 h-12 text-white mx-auto mb-8 opacity-50" />
                        <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to boost your <br /> productivity?</h2>
                        <p className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto">
                            Join thousands of developers who use our premium suite of tools every day.
                            Keep it simple, keep it secure.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white">
                            <Link to="/dev" className="px-10 py-4 rounded-full bg-primary text-white font-bold hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all">
                                Get Started
                            </Link>
                            <a
                                href="https://github.com/sam-sampreeth/portfolio-utils"
                                className="px-10 py-4 rounded-full bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all flex items-center gap-2"
                            >
                                <Github size={20} />
                                View on GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
