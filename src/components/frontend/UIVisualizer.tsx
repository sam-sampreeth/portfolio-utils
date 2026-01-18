import { useState, useEffect } from "react";
import { RefreshCw, Type, Palette, Layout, ArrowRight, Maximize2, Minimize2 } from "lucide-react";


const POPULAR_FONTS = [
    "Inter",
    "Roboto",
    "Open Sans",
    "Montserrat",
    "Lato",
    "Poppins",
    "Playfair Display",
    "Merriweather",
    "Nunito",
    "Raleway"
];

const SAMPLE_PALETTES = [
    { primary: "#3b82f6", bg: "#0f172a" }, // Blue / Slate
    { primary: "#10b981", bg: "#022c22" }, // Emerald / Dark Green
    { primary: "#f43f5e", bg: "#2a0a10" }, // Rose / Dark Rose
    { primary: "#8b5cf6", bg: "#1e1b4b" }, // Violet / Indigo
    { primary: "#f59e0b", bg: "#1e1005" }, // Amber / Brown
    { primary: "#ec4899", bg: "#1f0f18" }, // Pink / Dark Pink
    { primary: "#06b6d4", bg: "#081c24" }, // Cyan / Dark Cyan
];

export const UIVisualizer = () => {
    const [font, setFont] = useState("Inter");
    const [primaryColor, setPrimaryColor] = useState("#3b82f6");
    const [bgColor, setBgColor] = useState("#0f172a");
    const [useGradient, setUseGradient] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Load font dynamically
    useEffect(() => {
        const link = document.createElement("link");
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(" ", "+")}:wght@400;700;900&display=swap`;
        link.rel = "stylesheet";
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link);
        };
    }, [font]);

    const randomize = () => {
        const randomFont = POPULAR_FONTS[Math.floor(Math.random() * POPULAR_FONTS.length)];
        const randomPalette = SAMPLE_PALETTES[Math.floor(Math.random() * SAMPLE_PALETTES.length)];

        setFont(randomFont);
        setPrimaryColor(randomPalette.primary);
        setBgColor(randomPalette.bg);
        setUseGradient(Math.random() > 0.5);
    };

    // Calculate contrast text color (simple version)
    // For a dark bg, we usually want light text.
    // We'll stick to white/slate-200 for text in this dark-themed visualizer mostly,
    // but we can adjust if the User picks a light bg.
    // For now, assuming dark mode aesthetic like the rest of the app.

    return (
        <div className="flex flex-col xl:flex-row gap-8 min-h-[800px]">
            {/* Sidebar Controls */}
            {!isFullScreen && (
                <div className="w-full xl:w-80 flex-shrink-0 space-y-8">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                        <button
                            onClick={randomize}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-bold transition-all shadow-lg shadow-blue-500/20 mb-8"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Randomize Style
                        </button>

                        <div className="space-y-6">
                            {/* Font Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-white/60 flex items-center gap-2">
                                    <Type className="w-4 h-4" />
                                    Typography
                                </label>
                                <select
                                    value={font}
                                    onChange={(e) => setFont(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                                >
                                    {POPULAR_FONTS.map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="w-full h-px bg-white/10" />

                            {/* Primary Color */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-white/60 flex items-center gap-2">
                                    <Palette className="w-4 h-4" />
                                    Primary Color
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden relative">
                                        <input
                                            type="color"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm uppercase focus:ring-2 focus:ring-blue-500/50 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Background Color */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-white/60 flex items-center gap-2">
                                    <Layout className="w-4 h-4" />
                                    Background Color
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden relative">
                                        <input
                                            type="color"
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm uppercase focus:ring-2 focus:ring-blue-500/50 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Gradient Toggle */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                                <label className="text-sm font-bold text-white/60">
                                    Use Gradient Background
                                </label>
                                <button
                                    onClick={() => setUseGradient(!useGradient)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${useGradient ? "bg-blue-500" : "bg-white/10"}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${useGradient ? "translate-x-6" : ""}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Window */}
            <div className="flex-1 bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
                {/* Visualizer Frame */}
                <div
                    className="absolute inset-0 overflow-y-auto"
                    style={{
                        background: useGradient
                            ? `linear-gradient(135deg, ${bgColor}, ${primaryColor}40)`
                            : bgColor,
                        fontFamily: `"${font}", sans-serif`,
                        color: "#fff" // Defaulting text to white for now as mostly dark inputs
                    }}
                >
                    {/* Full Screen Toggle */}
                    <button
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className="absolute top-6 right-8 z-50 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
                    >
                        {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>

                    {/* Mock Navbar */}
                    <nav className="flex items-center justify-between px-8 py-6 border-b border-white/10">
                        <div className="text-xl font-bold flex items-center gap-2">
                            <div style={{ backgroundColor: primaryColor }} className="w-8 h-8 rounded-lg" />
                            <span>Brand</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium opacity-70">
                            <span>Products</span>
                            <span>Solutions</span>
                            <span>Pricing</span>
                            <span>About</span>
                        </div>
                        <button
                            style={{ backgroundColor: primaryColor }}
                            className="px-5 py-2 rounded-full text-sm font-bold text-white hover:opacity-90 transition-opacity"
                        >
                            Get Started
                        </button>
                    </nav>

                    {/* Mock Hero */}
                    <div className="px-8 py-20 md:py-32 max-w-5xl mx-auto text-center">
                        <div
                            style={{ color: primaryColor }}
                            className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest mb-8"
                        >
                            The Future of Design
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
                            Create something <br />
                            <span style={{ color: primaryColor }}>extraordinary.</span>
                        </h1>
                        <p className="text-xl opacity-60 max-w-2xl mx-auto mb-12 leading-relaxed">
                            Elevate your digital presence with tools that adapt to your vision.
                            Simple, powerful, and built for modern creators.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                style={{ backgroundColor: primaryColor }}
                                className="w-full sm:w-auto px-8 py-4 rounded-full text-lg font-bold text-white hover:opacity-90 transition-all hover:scale-105"
                            >
                                Start Building Free
                            </button>
                            <button
                                className="w-full sm:w-auto px-8 py-4 rounded-full text-lg font-bold border border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                            >
                                View Documentation
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Mock Features */}
                    <div className="px-8 py-20 border-t border-white/5">
                        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                    <div
                                        style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                                    >
                                        <Layout className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">Feature Section {i}</h3>
                                    <p className="opacity-60 leading-relaxed">
                                        Seamlessly integrate powerful features into your workflow with our intuitive tools designed for performance.
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gradient Cards Section */}
                    <div className="px-8 py-20 border-t border-white/5 bg-black/20">
                        <div className="max-w-6xl mx-auto">
                            <h3 className="text-2xl font-bold mb-12 text-center">Premium Cards</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div
                                    className="p-8 rounded-3xl relative overflow-hidden group"
                                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${bgColor})` }}
                                >
                                    <div className="relative z-10">
                                        <h4 className="text-2xl font-bold mb-4 text-white">Glass Effect</h4>
                                        <p className="text-white/80 mb-8">
                                            Beautiful gradients that make your content pop with style and depth.
                                        </p>
                                        <button className="px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold hover:bg-white/20 transition-all">
                                            Learn More
                                        </button>
                                    </div>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-white/20 transition-colors" />
                                </div>

                                <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 relative overflow-hidden group">
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{ background: `linear-gradient(45deg, transparent, ${primaryColor}20)` }}
                                    />
                                    <div className="relative z-10 flex items-start justify-between">
                                        <div>
                                            <h4 className="text-2xl font-bold mb-2">Hover Glow</h4>
                                            <p className="opacity-60">Interact to reveal the magic.</p>
                                        </div>
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="mt-12 h-32 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};
