import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EMOJI_CATEGORIES } from "@/data/emojis";
import { Check, Smile, Search, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export const EmojiPicker = () => {
    const [search, setSearch] = useState("");
    const [copiedEmoji, setCopiedEmoji] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("smileys");

    const handleCopy = (emoji: string) => {
        navigator.clipboard.writeText(emoji);
        setCopiedEmoji(emoji);
        setTimeout(() => setCopiedEmoji(null), 1500);
    };

    const filteredCategories = useMemo(() => {
        if (!search.trim()) return EMOJI_CATEGORIES;
        const term = search.toLowerCase();

        return EMOJI_CATEGORIES.map(cat => ({
            ...cat,
            // Search in both name and char (though char is minimal, name is key)
            // Use cat.emojis which is now EmojiData[] { char, name }
            emojis: cat.emojis.filter(e => e.name.toLowerCase().includes(term) || e.char.includes(term))
        })).filter(cat => cat.emojis.length > 0);
    }, [search]);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20">
                    <Smile className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white">Emoji Picker</h2>
                <p className="text-white/60 max-w-lg">
                    Browse through thousands of emojis and copy them with a single click.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-blue-300">
                    <Info size={16} />
                    <span>Tap any emoji to copy</span>
                </div>
            </div>

            {/* Main Picker Area */}
            <div className="bg-gradient-to-br from-blue-900/20 via-black/40 to-blue-900/20 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col h-[700px]">

                {/* Search Bar */}
                <div className="relative mb-6 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search emojis..."
                        className="pl-10 pr-10 bg-[#0a0a0a] border-white/20 text-white placeholder:text-white/20 h-12 rounded-xl focus-visible:ring-offset-0 focus-visible:ring-blue-500/50 shadow-inner"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {search ? (
                    // Search Results View
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {filteredCategories.length > 0 ? (
                            <div className="space-y-6">
                                {filteredCategories.map(cat => (
                                    <div key={cat.id}>
                                        <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-3 px-1">{cat.name}</h3>
                                        {/* Use fixed width columns to ensure perfect consistency */}
                                        <div className="grid grid-cols-[repeat(auto-fill,3.5rem)] justify-center gap-3">
                                            {cat.emojis.map((emoji, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleCopy(emoji.char)}
                                                    className={cn(
                                                        "aspect-square flex items-center justify-center text-3xl rounded-xl transition-all duration-200",
                                                        "hover:bg-white/10 hover:scale-110 active:scale-95 cursor-pointer relative group",
                                                        copiedEmoji === emoji.char ? "bg-green-500/20 ring-2 ring-green-500/50" : "bg-white/5 border border-white/5"
                                                    )}
                                                    title={emoji.name}
                                                >
                                                    <span className={cn("transition-opacity", copiedEmoji === emoji.char && "opacity-0")}>{emoji.char}</span>
                                                    {copiedEmoji === emoji.char && (
                                                        <div className="absolute inset-0 flex items-center justify-center animate-in fade-in zoom-in duration-200">
                                                            <Check size={20} className="text-green-400" strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-white/40">
                                <Search size={48} className="mb-4 opacity-20" />
                                <p>No emojis found for "{search}"</p>
                            </div>
                        )}
                    </div>
                ) : (
                    // Tabs View
                    <Tabs defaultValue="smileys" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                        <TabsList className="w-full flex overflow-x-auto no-scrollbar bg-black/20 p-1 rounded-xl mb-6 gap-1 shrink-0">
                            {EMOJI_CATEGORIES.map(cat => (
                                <TabsTrigger
                                    key={cat.id}
                                    value={cat.id}
                                    className="flex-1 min-w-[fit-content] px-4 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 whitespace-nowrap"
                                >
                                    {cat.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {EMOJI_CATEGORIES.map(cat => (
                            <TabsContent key={cat.id} value={cat.id} className="flex-1 mt-0 focus-visible:outline-none min-h-0">
                                <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="grid grid-cols-[repeat(auto-fill,3.5rem)] justify-center gap-3 pb-4">
                                        {cat.emojis.map((emoji, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleCopy(emoji.char)}
                                                className={cn(
                                                    "aspect-square flex items-center justify-center text-3xl rounded-xl transition-all duration-200",
                                                    "hover:bg-white/10 hover:scale-110 active:scale-95 cursor-pointer relative group",
                                                    copiedEmoji === emoji.char ? "bg-green-500/20 ring-2 ring-green-500/50" : "bg-white/5 border border-white/5"
                                                )}
                                                title={emoji.name}
                                            >
                                                <span className={cn("transition-opacity", copiedEmoji === emoji.char && "opacity-0")}>{emoji.char}</span>

                                                {copiedEmoji === emoji.char && (
                                                    <div className="absolute inset-0 flex items-center justify-center animate-in fade-in zoom-in duration-200">
                                                        <Check size={20} className="text-green-400" strokeWidth={3} />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
            </div>
        </div>
    );
};
