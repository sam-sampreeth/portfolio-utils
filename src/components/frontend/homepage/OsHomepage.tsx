import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Plus,
    Settings as SettingsIcon,
    Cloud,
    Download,
    Trash2,
    X,
    Maximize2,
    Minimize2,
    CheckCircle2,
    Circle,
    Folder as FolderIcon,
    Terminal,
    Clock as ClockIcon,
    Quote,
    Newspaper,
    ExternalLink,
    Timer as TimerIcon,
    Hourglass,
    Brain,
    Sun,
    Moon
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useHomepageState } from "@/hooks/useHomepageState";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export function OsHomepage() {
    const {
        state,
        updateSettings,
        addBookmark,
        removeBookmark,
        addFolder,
        updateNotes,
        addTodo,
        toggleTodo,
        removeTodo,
        resetData,
        exportData,
        importData,
        completeOnboarding
    } = useHomepageState();

    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [isIdle, setIsIdle] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAddBookmarkOpen, setIsAddBookmarkOpen] = useState(false);
    const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [newBookmark, setNewBookmark] = useState({ title: '', url: '', folderId: 'root' });
    const [newFolderName, setNewFolderName] = useState('');
    const [todoInput, setTodoInput] = useState('');

    // Onboarding form state
    const [obName, setObName] = useState('');
    const [obLocation, setObLocation] = useState('');

    const idleTimerRef = useRef<number | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fullscreen change listener
    useEffect(() => {
        const handleFsChange = () => {
            const isFs = !!document.fullscreenElement;
            setIsFullscreen(isFs);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFsChange);
            document.body.style.overflow = '';
        };
    }, []);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            if ((e.altKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'f' && (e.altKey || e.metaKey)) {
                e.preventDefault();
                toggleFullscreen();
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, []);

    const resetIdle = useCallback(() => {
        setIsIdle(false);
        if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = window.setTimeout(() => {
            setIsIdle(true);
        }, (state.settings?.screensaverTimeout || 5) * 60 * 1000);
    }, [state.settings?.screensaverTimeout]);

    useEffect(() => {
        window.addEventListener('mousemove', resetIdle);
        window.addEventListener('keydown', resetIdle);
        resetIdle();
        return () => {
            window.removeEventListener('mousemove', resetIdle);
            window.removeEventListener('keydown', resetIdle);
            if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
        };
    }, [resetIdle]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(() => {
                document.documentElement.requestFullscreen();
            });
        } else {
            document.exitFullscreen();
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
                importData(content);
            }
        };
        reader.readAsText(file);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        const engines = {
            google: 'https://google.com/search?q=',
            duckduckgo: 'https://duckduckgo.com/?q=',
            bing: 'https://bing.com/search?q='
        };
        window.open(engines[state.settings?.searchEngine || 'google'] + encodeURIComponent(searchQuery), '_blank');
        setSearchQuery('');
    };

    const themeConfigs = {
        dark: {
            container: "bg-[#020408]",
            bgBase: "bg-[#020202]",
            bgGlowPrimary: "bg-blue-600/[0.05]",
            bgGlowSecondary: "bg-blue-400/10",
            bgGradient: "from-blue-500/10 via-transparent to-transparent",
            card: "bg-white/[0.03] backdrop-blur-3xl border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]",
            subCard: "bg-white/[0.02] backdrop-blur-sm border-white/10",
            btn: "bg-white/[0.02] border-white/5 hover:bg-white hover:text-black",
            textMain: "text-white",
            accent: "text-white/60",
            muted: "text-white/30",
            input: "bg-white/[0.03] border-white/10 text-white placeholder:text-white/10",
            searchBg: "bg-white/[0.02]"
        },
        light: {
            container: "bg-[#f3f4f6]",
            bgBase: "bg-[#f3f4f6]",
            bgGlowPrimary: "bg-blue-400/[0.04]",
            bgGlowSecondary: "bg-indigo-400/[0.03]",
            bgGradient: "from-blue-200/40 via-transparent to-transparent",
            card: "bg-white border-black/[0.05] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)]",
            subCard: "bg-black/[0.02] border-black/[0.03]",
            btn: "bg-white border-black/[0.08] hover:bg-black hover:text-white text-black/70",
            textMain: "text-gray-950",
            accent: "text-gray-600",
            muted: "text-gray-400",
            input: "bg-black/[0.02] border-black/[0.05] text-black placeholder:text-black/20",
            searchBg: "bg-black/[0.01]"
        }
    };

    const currentTheme = (state.settings?.theme as 'light' | 'dark') || 'dark';
    const theme = themeConfigs[currentTheme];

    const getFavicon = (url: string) => {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
        } catch {
            return null;
        }
    };

    const navigate = useNavigate();


    const unorganizedBookmarks = state.bookmarks.filter(b => !b.folderId);

    const quotes = [
        { t: "Simplicity is the ultimate sophistication.", a: "Leonardo da Vinci" },
        { t: "The best way to predict the future is to invent it.", a: "Alan Kay" },
        { t: "Precision is the soul of elegance.", a: "Massimo Vignelli" },
        { t: "Design is not just what it looks like, it's how it works.", a: "Steve Jobs" },
        { t: "Less is more, but effective is better.", a: "Dieter Rams" },
        { t: "Focus is a matter of deciding what things you're not going to do.", a: "John Carmack" },
        { t: "The details make the product.", a: "Charles Eames" }
    ];
    const dailyQuote = quotes[currentTime.getDate() % quotes.length];

    const news = [
        { t: "International energy transition accelerates as solar efficiency hits record peak.", s: "Global-Feed", u: "https://news.google.com" },
        { t: "New advancements in biomedical engineering show promise for neural repair.", s: "Sci-Journal", u: "https://news.google.com" },
        { t: "Semiconductor industry projects major shift toward specialized AI accelerators.", s: "Tech-Intel", u: "https://news.google.com" }
    ];

    // Onboarding View
    if (!state.settings?.onboarded) {
        return (
            <div className="fixed inset-0 z-[1000] bg-[#020202] flex items-center justify-center p-6 overflow-hidden select-none">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/5 blur-[250px] rounded-full" />
                    <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-600/5 blur-[250px] rounded-full" />
                </div>
                <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-1000">
                    <div className="text-center mb-10 space-y-4">
                        <h1 className="text-4xl font-light tracking-[0.2em] text-white uppercase">Initialize</h1>
                        <p className="text-white/20 text-xs font-medium tracking-widest uppercase">System Core Configuration</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] backdrop-blur-3xl space-y-6 shadow-2xl">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 ml-1">Identity</label>
                            <input type="text" placeholder="Username" value={obName} onChange={(e) => setObName(e.target.value)} className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-4 px-5 text-sm font-medium focus:outline-none focus:ring-1 ring-white/20 text-white placeholder:text-white/10" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 ml-1">Node</label>
                            <input type="text" placeholder="City, Country" value={obLocation} onChange={(e) => setObLocation(e.target.value)} className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-4 px-5 text-sm font-medium focus:outline-none focus:ring-1 ring-white/20 text-white placeholder:text-white/10" />
                        </div>
                        <Button onClick={() => completeOnboarding(obName || 'User', obLocation || 'Earth', true)} disabled={!obName} className="w-full py-7 rounded-xl bg-white text-black font-bold uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-all">Begin Session</Button>
                    </div>
                </div>
            </div>
        );
    }

    // Screensaver View
    if (isIdle) {
        return (
            <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center cursor-none animate-in fade-in duration-1000 overflow-hidden" onClick={() => setIsIdle(false)}>
                <div className="text-[12rem] font-light tracking-tighter text-white/[0.03] select-none tabular-nums animate-pulse">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={cn("h-screen text-white font-sans selection:bg-blue-500/30 overflow-hidden p-4 md:p-6 flex flex-col relative transition-colors duration-1000", !isFullscreen && "rounded-[3rem]", theme.container)}
        >
            {/* Background Aesthetics (Enhanced Gradient Version) */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className={cn("absolute inset-0 transition-colors duration-1000", theme.bgBase)} />
                <div className={cn("absolute inset-0 bg-gradient-to-b transition-all duration-1000", theme.bgGradient)} />
                <div className={cn("absolute top-1/4 left-1/2 -translate-x-1/2 w-[120%] h-[120%] blur-[180px] rounded-full opacity-50 transition-colors duration-1000", theme.bgGlowPrimary)} />
                <div className={cn("absolute -top-[10%] -left-[10%] w-[40%] h-[40%] blur-[150px] rounded-full transition-colors duration-1000", theme.bgGlowSecondary)} />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex-1 flex flex-col max-w-6xl mx-auto w-full min-h-0">


                <div className="flex-shrink-0 flex items-center justify-between h-12 mb-3 animate-in fade-in duration-1000">
                    <button onClick={() => setIsSettingsOpen(true)} className={cn("flex items-center gap-3 group px-4 py-2 rounded-xl border transition-all", theme.btn)}>
                        <SettingsIcon size={14} className={cn("transition-all duration-500", theme.accent, "group-hover:text-current")} />
                        <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", theme.accent, "group-hover:text-current")}>Settings</span>
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => updateSettings({ theme: currentTheme === 'dark' ? 'light' : 'dark' })}
                            className={cn("w-10 h-10 rounded-xl border flex items-center justify-center transition-all", theme.btn)}
                        >
                            {currentTheme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                        </button>
                        <button onClick={toggleFullscreen} className={cn("flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all shadow-xl active:scale-95", theme.btn)}>
                            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                            <span className="text-[10px] font-black uppercase tracking-widest">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
                        </button>
                    </div>
                </div>

                {/* 2. Compact Hero Section */}
                <div className="flex-shrink-0 flex flex-col items-center gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000 delay-100">
                    <div className="text-center space-y-1">
                        <h1 className={cn("text-2xl md:text-3xl font-light tracking-tight transition-colors", theme.textMain)}>
                            {currentTime.getHours() < 12 ? 'Good morning' : currentTime.getHours() < 18 ? 'Good afternoon' : 'Good evening'}, {state.settings?.greetingName}
                        </h1>
                    </div>

                    <form onSubmit={handleSearch} className={cn("relative group w-full max-w-xl flex items-center border rounded-xl overflow-hidden focus-within:ring-1 transition-all backdrop-blur-3xl", theme.subCard, currentTheme === 'dark' ? 'focus-within:ring-white/20' : 'focus-within:ring-black/10')}>
                        <div className={cn("pl-5", theme.accent)}><Search size={16} /></div>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn("flex-1 bg-transparent border-none py-4 px-5 text-sm font-bold outline-none ring-0 placeholder:text-current/40", theme.textMain)}
                        />
                        <div className="pr-3">
                            <Select value={state.settings?.searchEngine} onValueChange={(val) => updateSettings({ searchEngine: val as any })}>
                                <SelectTrigger className={cn("h-8 border-none text-[9px] font-black uppercase tracking-widest px-4 rounded-lg transition-all", theme.accent, "hover:text-current", currentTheme === 'dark' ? "hover:bg-white/10" : "hover:bg-black/5")}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className={cn("border-white/10 rounded-xl backdrop-blur-3xl", currentTheme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-white text-black border-black/5')}>
                                    <SelectItem value="google" className={cn("cursor-pointer", currentTheme === 'dark' ? "focus:bg-white/10 focus:text-white" : "focus:bg-black/5 focus:text-black")}>Google</SelectItem>
                                    <SelectItem value="duckduckgo" className={cn("cursor-pointer", currentTheme === 'dark' ? "focus:bg-white/10 focus:text-white" : "focus:bg-black/5 focus:text-black")}>Duck</SelectItem>
                                    <SelectItem value="bing" className={cn("cursor-pointer", currentTheme === 'dark' ? "focus:bg-white/10 focus:text-white" : "focus:bg-black/5 focus:text-black")}>Bing</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </form>
                </div>


                {/* 3. Balanced Dynamic Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pb-8">

                    <div className="md:col-span-5 flex flex-col gap-3 h-full min-h-0">
                        {/* Time Card - Fixed Height */}
                        <div className={cn("h-48 p-4 rounded-[2rem] border flex flex-col relative group shadow-2xl transition-all flex-shrink-0", theme.card)}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <ClockIcon size={12} className={theme.muted} />
                                    <span className={cn("text-[9px] font-black uppercase tracking-[0.4em]", theme.accent)}>Time</span>
                                </div>
                                <span className={cn("text-[10px] uppercase tracking-widest", theme.muted)}>
                                    {currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })}
                                </span>
                            </div>

                            <div className="flex-1 flex items-center justify-center gap-4">
                                <span className={cn("text-4xl md:text-5xl font-light tracking-tighter tabular-nums drop-shadow-2xl leading-[0.8]", theme.textMain)}>
                                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </span>
                                <div className={cn("h-8 w-px", currentTheme === 'dark' ? 'bg-white/5' : 'bg-black/5')} />
                                <span className={cn("text-xl font-light tracking-widest tabular-nums opacity-50", theme.textMain)}>
                                    {currentTime.getSeconds().toString().padStart(2, '0')}
                                </span>
                            </div>
                        </div>

                        {/* Daily Quote - Fixed Auto Height */}
                        <div className="flex-shrink-0 relative group">
                            <div className={cn("absolute -inset-1 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl")} />
                            <div className={cn("relative p-4 rounded-[1.5rem] border backdrop-blur-md transition-all", theme.subCard)}>
                                <Quote size={12} className={cn("mb-2 opacity-50", theme.accent)} />
                                <p className={cn("text-[11px] leading-relaxed font-medium italic opacity-80", theme.textMain)}>
                                    "{dailyQuote.t}"
                                </p>
                                <p className={cn("text-[9px] font-black uppercase tracking-widest mt-2 opacity-50 text-right", theme.accent)}>
                                    — {dailyQuote.a}
                                </p>
                            </div>
                        </div>

                        {/* Weather Card - Fixed Height */}
                        <div className={cn("h-28 p-4 rounded-[2rem] border flex flex-col relative group shadow-2xl flex-shrink-0", theme.card)}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Cloud size={12} className="text-blue-400/40" />
                                    <span className={cn("text-[9px] font-black uppercase tracking-[0.4em]", theme.accent)}>Weather</span>
                                </div>
                                <div className="flex bg-white/[0.03] p-0.5 rounded-lg border border-white/5">
                                    <button
                                        onClick={() => updateSettings({ tempUnit: 'C' })}
                                        className={cn("px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all", state.settings?.tempUnit === 'C' ? "bg-white text-black" : "text-white/20 hover:text-white")}
                                    >C°</button>
                                    <button
                                        onClick={() => updateSettings({ tempUnit: 'F' })}
                                        className={cn("px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all", state.settings?.tempUnit === 'F' ? "bg-white text-black" : "text-white/20 hover:text-white")}
                                    >F°</button>
                                </div>
                            </div>
                            <div className="flex-1 flex items-center justify-center gap-6">
                                <Cloud size={32} className="text-blue-400 drop-shadow-lg" />
                                <div className="text-center">
                                    <span className={cn("text-3xl font-light tracking-tighter block leading-none", theme.textMain)}>
                                        {state.settings?.tempUnit === 'C' ? '22°' : '72°'}
                                    </span>
                                    <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] opacity-50", theme.accent)}>Bangalore</span>
                                </div>
                            </div>
                        </div>

                        {/* Time Utilities (Fullscreen Only) - Fixed Height */}
                        {isFullscreen && (
                            <div className={cn("h-40 p-4 rounded-[2rem] border flex flex-col relative group shadow-2xl animate-in fade-in slide-in-from-left-8 duration-700 flex-shrink-0", theme.card)}>
                                <div className="flex items-center gap-2 mb-4">
                                    <ClockIcon size={12} className={theme.muted} />
                                    <span className={cn("text-[9px] font-black uppercase tracking-[0.4em]", theme.accent)}>Time Tools</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 flex-1">
                                    <button onClick={() => navigate('/time/clock')} className={cn("flex items-center gap-3 p-2 rounded-xl border transition-all group/btn", theme.btn)}>
                                        <div className="p-1.5 rounded-lg bg-white/5 group-hover/btn:bg-white/10 transition-colors text-blue-400"><ClockIcon size={12} /></div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-black uppercase tracking-widest leading-none">Clock</p>
                                        </div>
                                    </button>
                                    <button onClick={() => navigate('/time/stopwatch')} className={cn("flex items-center gap-3 p-2 rounded-xl border transition-all group/btn", theme.btn)}>
                                        <div className="p-1.5 rounded-lg bg-white/5 group-hover/btn:bg-white/10 transition-colors text-emerald-400"><TimerIcon size={12} /></div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-black uppercase tracking-widest leading-none">Watch</p>
                                        </div>
                                    </button>
                                    <button onClick={() => navigate('/time/timer')} className={cn("flex items-center gap-3 p-2 rounded-xl border transition-all group/btn", theme.btn)}>
                                        <div className="p-1.5 rounded-lg bg-white/5 group-hover/btn:bg-white/10 transition-colors text-orange-400"><Hourglass size={12} /></div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-black uppercase tracking-widest leading-none">Timer</p>
                                        </div>
                                    </button>
                                    <button onClick={() => navigate('/time/pomodoro')} className={cn("flex items-center gap-3 p-2 rounded-xl border transition-all group/btn", theme.btn)}>
                                        <div className="p-1.5 rounded-lg bg-white/5 group-hover/btn:bg-white/10 transition-colors text-rose-400"><Brain size={12} /></div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-black uppercase tracking-widest leading-none">Focus</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-7 flex flex-col gap-3 h-full min-h-0">
                        {/* Quick Notes Card - Fixed Height */}
                        <div className={cn("h-32 p-4 rounded-[2rem] border flex flex-col min-h-0 relative shadow-2xl flex-shrink-0", theme.card)}>
                            <div className="flex items-center justify-between mb-4 flex-shrink-0 font-black text-[9px] tracking-[0.4em] uppercase">
                                <div className="flex items-center gap-3">
                                    <Terminal size={12} className={theme.muted} />
                                    <span className={cn("text-[9px] font-black uppercase tracking-[0.4em]", theme.accent)}>Quick Notes</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                                </div>
                            </div>
                            <div className="flex-1 relative group/input">
                                <div className="absolute inset-0 bg-white/[0.02] rounded-xl border border-white/5 opacity-0 group-hover/input:opacity-100 transition-opacity" />
                                <div className="relative h-full p-2">
                                    <textarea
                                        value={state.quickNotes}
                                        onChange={(e) => updateNotes(e.target.value)}
                                        placeholder="Write a note..."
                                        className={cn("w-full h-full bg-transparent border-none focus:ring-0 text-xs font-bold resize-none custom-scrollbar transition-colors", theme.accent, "placeholder:text-current/20")}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* To-Do List Card - Flexible Height (Elastic) */}
                        <div className={cn("flex-1 p-4 rounded-[2rem] border flex flex-col min-h-0 relative shadow-2xl", theme.card)}>
                            <div className="flex items-center justify-between mb-4 flex-shrink-0 font-black text-[9px] tracking-[0.4em] uppercase">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={12} className={theme.muted} />
                                    <span className={cn("text-[9px] font-black uppercase tracking-[0.4em]", theme.accent)}>To-Do List</span>
                                </div>
                                <div className="text-emerald-500/80 px-2 py-0.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">Active</div>
                            </div>

                            <div className="flex-1 flex flex-col min-h-0">
                                <form onSubmit={(e) => { e.preventDefault(); if (todoInput.trim()) { addTodo(todoInput.trim()); setTodoInput(''); } }} className="relative mb-2 flex-shrink-0">
                                    <input type="text" placeholder="Add a task..." value={todoInput} onChange={(e) => setTodoInput(e.target.value)} className={cn("w-full border rounded-xl py-2 pl-4 pr-10 text-xs font-bold focus:outline-none focus:ring-1 transition-all", theme.subCard, theme.accent, "placeholder:text-current/10", currentTheme === 'dark' ? 'focus:ring-white/10' : 'focus:ring-black/5')} />
                                    <button type="submit" className={cn("absolute right-3 top-1/2 -translate-y-1/2 transition-all", theme.muted, "hover:text-current")}><Plus size={16} /></button>
                                </form>

                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                    {state.todos?.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-white/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/10 mb-2" />
                                            <span className="text-[10px] uppercase tracking-widest">No Tasks</span>
                                        </div>
                                    ) : (
                                        state.todos?.map(todo => (
                                            <div key={todo.id} className={cn("group flex items-center justify-between py-2 px-3 rounded-xl border transition-all",
                                                currentTheme === 'dark'
                                                    ? "bg-white/[0.02] border-white/5 hover:bg-white/10 hover:border-white/20"
                                                    : "bg-white border-black/[0.05] hover:bg-black/5 hover:border-black/10 text-gray-950"
                                            )}>
                                                <div className="flex items-center gap-3 w-[85%]">
                                                    <button onClick={() => toggleTodo(todo.id)} className={cn("shrink-0 transition-all active:scale-90", theme.muted, "hover:text-emerald-500")}>
                                                        {todo.completed ? <CheckCircle2 size={14} className="text-emerald-500/60" /> : <Circle size={14} />}
                                                    </button>
                                                    <span className={cn("text-[11px] font-semibold tracking-wide truncate transition-all w-full", todo.completed ? cn(theme.muted, "line-through") : theme.textMain)}>{todo.text}</span>
                                                </div>
                                                <button onClick={() => removeTodo(todo.id)} className="opacity-0 group-hover:opacity-100 text-rose-500/30 hover:text-rose-500 transition-all"><X size={12} /></button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Fullscreen News Feed - Fixed Height */}
                        {isFullscreen && (
                            <div className={cn("flex-shrink-0 h-40 p-4 rounded-[2rem] border shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000", theme.card)}>
                                <div className="flex items-center gap-3 mb-4 font-black text-[9px] tracking-[0.4em] uppercase">
                                    <Newspaper size={12} className="text-blue-400/40" />
                                    <span className={cn("text-[9px] font-black uppercase tracking-[0.4em]", theme.accent)}>News</span>
                                </div>
                                <div className="space-y-3">
                                    {news.slice(0, 2).map((item, i) => (
                                        <button
                                            key={i}
                                            onClick={() => window.open(item.u, '_blank')}
                                            className={cn("w-full flex items-center justify-between group text-left p-2.5 rounded-xl transition-all border border-transparent", theme.btn, "bg-transparent")}
                                        >
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <span className={cn("text-[8px] font-black uppercase tracking-widest shrink-0", theme.muted)}>{item.s}</span>
                                                <p className={cn("text-[10px] font-bold transition-all truncate", theme.accent, "group-hover:text-current")}>
                                                    {item.t}
                                                </p>
                                            </div>
                                            <ExternalLink size={10} className={cn("transition-all shrink-0 opacity-0 group-hover:opacity-20")} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Launcher Context */}
                <div className="flex-shrink-0 mt-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
                    <div className="flex items-center gap-4 mb-5">
                        <div className={cn("h-px flex-1", currentTheme === 'dark' ? 'bg-white/5' : 'bg-black/5')} />
                        <span className={cn("text-[9px] font-black uppercase tracking-[0.4em]", theme.muted)}>Quick Links</span>
                        <div className={cn("h-px flex-1", currentTheme === 'dark' ? 'bg-white/5' : 'bg-black/5')} />
                    </div>

                    <div className="flex items-center justify-center gap-6 md:gap-10 h-16">
                        {state.folders.map(folder => {
                            const folderBookmarks = state.bookmarks.filter(b => b.folderId === folder.id);
                            return (
                                <Popover key={folder.id}>
                                    <PopoverTrigger asChild>
                                        <button className="group relative flex flex-col items-center gap-2">
                                            <div className={cn("w-11 h-11 md:w-12 md:h-12 rounded-xl border transition-all flex items-center justify-center shadow-lg group-hover:-translate-y-1.5", theme.btn)}>
                                                <FolderIcon size={18} className="transition-colors group-hover:text-current" />
                                                <span className={cn("absolute -top-1 -right-1 text-[8px] font-black px-1 rounded shadow-xl", currentTheme === 'dark' ? 'bg-white text-black' : 'bg-black text-white')}>{folderBookmarks.length}</span>
                                            </div>
                                            <span className={cn("text-[8px] font-black uppercase tracking-widest transition-colors", theme.muted, "group-hover:text-current")}>{folder.title}</span>
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent side="top" sideOffset={12} className={cn("w-64 p-5 rounded-[2rem] shadow-3xl backdrop-blur-3xl border-white/10", currentTheme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-white text-black border-black/5')}>
                                        <div className="grid grid-cols-4 gap-4">
                                            {folderBookmarks.map(b => (
                                                <div
                                                    key={b.id}
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => window.open(b.url, '_blank')}
                                                    className={cn("group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer", theme.subCard, "hover:bg-current/10")}
                                                    onKeyDown={(e) => e.key === 'Enter' && window.open(b.url, '_blank')}
                                                >
                                                    <img src={getFavicon(b.url) || ''} alt="" className={cn("w-5 h-5 object-contain grayscale transition-all pointer-events-none group-hover:grayscale-0", currentTheme === 'light' && "opacity-60 group-hover:opacity-100")} />
                                                    <button onClick={(e) => { e.stopPropagation(); removeBookmark(b.id); }} className="absolute -top-1 -right-1 bg-rose-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100"><X size={8} className="text-white" /></button>
                                                </div>
                                            ))}
                                            <button onClick={() => { setNewBookmark({ ...newBookmark, folderId: folder.id }); setIsAddBookmarkOpen(true); }} className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95", theme.btn, "bg-transparent")}><Plus size={14} /></button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            );
                        })}

                        {unorganizedBookmarks.map(app => (
                            <div key={app.id} className="group flex flex-col items-center gap-2 relative">
                                <button onClick={() => window.open(app.url, '_blank')} className={cn("w-11 h-11 md:w-12 md:h-12 rounded-xl border transition-all flex items-center justify-center shadow-lg group-hover:-translate-y-1.5", theme.btn)}>
                                    <img src={getFavicon(app.url) || ''} alt={app.title} className={cn("w-5 h-5 object-contain grayscale transition-all group-hover:grayscale-0 group-hover:opacity-100", currentTheme === 'dark' ? 'opacity-30' : 'opacity-50')} />
                                </button>
                                <span className={cn("text-[8px] font-black uppercase tracking-widest transition-colors", theme.muted, "group-hover:text-current")}>{app.title}</span>
                                <button onClick={() => removeBookmark(app.id)} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100 shadow-xl"><Trash2 size={8} /></button>
                            </div>
                        ))}

                        <div className="w-px h-6 bg-white/5 mx-2" />

                        <button onClick={() => setIsAddBookmarkOpen(true)} className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-white/[0.05] border border-white/10 text-white/40 hover:bg-white hover:text-black transition-all flex items-center justify-center group shadow-lg active:scale-95">
                            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                        </button>
                    </div>
                </div>

            </div>

            {/* Settings Dialog */}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="max-w-xl bg-[#080808] border-white/10 text-white rounded-[2.5rem] p-8 md:p-10 overflow-hidden shadow-3xl">
                    <DialogHeader className="mb-8 text-center">
                        <DialogTitle className="text-3xl font-light uppercase tracking-widest italic">Settings</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-8 py-6 border-y border-white/5">
                        {/* 1. Profile Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1">Display Name</label>
                                <input
                                    type="text"
                                    value={state.settings?.greetingName}
                                    onChange={(e) => updateSettings({ greetingName: e.target.value })}
                                    placeholder="Enter your name..."
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-4 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1">Location</label>
                                <input
                                    type="text"
                                    value={state.settings?.location}
                                    onChange={(e) => updateSettings({ location: e.target.value })}
                                    placeholder="e.g. London, UK"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-4 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* 2. Aesthetics & Units */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1">Temperature</label>
                                <Select value={state.settings?.tempUnit} onValueChange={(val) => updateSettings({ tempUnit: val as any })}>
                                    <SelectTrigger className="w-full bg-white/[0.03] border border-white/5 rounded-xl h-12 text-xs font-semibold focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0a0a0a] border-white/10 text-white rounded-xl backdrop-blur-3xl">
                                        <SelectItem value="C">Celsius (°C)</SelectItem>
                                        <SelectItem value="F">Fahrenheit (°F)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1">Interface Theme</label>
                                <Select value={currentTheme} onValueChange={(val) => updateSettings({ theme: val as any })}>
                                    <SelectTrigger className="w-full bg-white/[0.03] border border-white/5 rounded-xl h-12 text-xs font-semibold focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0a0a0a] border-white/10 text-white rounded-xl backdrop-blur-3xl">
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="light">Light</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* 3. Data Control */}
                        <div className="space-y-4">
                            <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1">Data Management</label>
                            <div className="grid grid-cols-2 gap-3">
                                <Button onClick={exportData} className="justify-between h-12 rounded-xl bg-white/[0.02] hover:bg-white hover:text-black transition-all border border-white/5 text-[10px] uppercase font-black tracking-widest">
                                    Export <Download size={14} />
                                </Button>
                                <Button onClick={handleImportClick} className="justify-between h-12 rounded-xl bg-white/[0.02] hover:bg-white hover:text-black transition-all border border-white/5 text-[10px] uppercase font-black tracking-widest">
                                    Import <Plus size={14} className="rotate-45" />
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".json"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <Button
                                onClick={() => { if (confirm('This will reset your dashboard to factory defaults. Are you sure?')) resetData(); }}
                                variant="ghost"
                                className="w-full justify-between h-12 rounded-xl text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/5 text-[10px] uppercase font-black tracking-widest"
                            >
                                Reset Dashboard <Trash2 size={14} />
                            </Button>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button onClick={() => setIsSettingsOpen(false)} className="text-[9px] font-black uppercase tracking-[0.6em] text-white/20 hover:text-white transition-all">Close Panel</button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isAddBookmarkOpen} onOpenChange={setIsAddBookmarkOpen}>
                <DialogContent className="max-w-md bg-[#080808] border-white/10 text-white rounded-[2.5rem] p-10 shadow-3xl">
                    <DialogHeader className="mb-8 text-center font-light uppercase italic">
                        <DialogTitle className="text-2xl">New Link</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (newBookmark.title && newBookmark.url) {
                            let url = newBookmark.url;
                            if (!url.startsWith('http')) url = `https://${url}`;
                            // Convert "root" sentinel back to undefined for state
                            addBookmark({
                                ...newBookmark,
                                url,
                                folderId: newBookmark.folderId === 'root' ? undefined : newBookmark.folderId
                            });
                            setNewBookmark({ title: '', url: '', folderId: 'root' });
                            setIsAddBookmarkOpen(false);
                        }
                    }} className="space-y-6">
                        <div className="space-y-2 text-[9px] font-black uppercase tracking-widest text-white/40">
                            <label className="ml-1">Title</label>
                            <input autoFocus type="text" value={newBookmark.title} onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-xs font-semibold text-white focus:outline-none ring-1 ring-white/10" />
                        </div>
                        <div className="space-y-2 text-[9px] font-black uppercase tracking-widest text-white/40">
                            <label className="ml-1">URL</label>
                            <input type="text" value={newBookmark.url} onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-xs font-semibold text-white focus:outline-none ring-1 ring-white/10" />
                        </div>
                        <div className="space-y-2 text-[9px] font-black uppercase tracking-widest text-white/40">
                            <label className="ml-1">Directory</label>
                            <Select value={newBookmark.folderId} onValueChange={(val) => setNewBookmark({ ...newBookmark, folderId: val })}>
                                <SelectTrigger className="w-full bg-white/[0.03] border border-white/10 rounded-xl h-12 text-xs font-semibold"><SelectValue placeholder="Root" /></SelectTrigger>
                                <SelectContent className="bg-[#0a0a0a] border-white/10 text-white rounded-xl">
                                    <SelectItem value="root">Root</SelectItem>
                                    {state.folders.map(f => <SelectItem key={f.id} value={f.id}>{f.title}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="w-full py-6 rounded-xl bg-white text-black font-black uppercase tracking-widest text-[10px]">Initialize</Button>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isAddFolderOpen} onOpenChange={setIsAddFolderOpen}>
                <DialogContent className="max-w-md bg-[#080808] border-white/10 text-white rounded-[2.5rem] p-10 shadow-3xl">
                    <DialogHeader className="mb-8 text-center font-light uppercase italic">
                        <DialogTitle className="text-2xl">New Folder</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); if (newFolderName.trim()) { addFolder(newFolderName.trim()); setNewFolderName(''); setIsAddFolderOpen(false); } }} className="space-y-6">
                        <div className="space-y-2 text-[9px] font-black uppercase tracking-widest text-white/40">
                            <label className="ml-1">Identifier</label>
                            <input autoFocus type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-xs font-semibold text-white focus:outline-none ring-1 ring-white/10" />
                        </div>
                        <Button type="submit" className="w-full py-6 rounded-xl bg-white text-black font-black uppercase tracking-widest text-[10px]">Create</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div >
    );
}
