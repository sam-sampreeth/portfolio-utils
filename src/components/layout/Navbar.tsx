import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Shield, Sparkles, Zap, Github, Menu, X, ArrowUpRight, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Home", href: "/", id: "home" },
    { name: "Tools", href: "/#tools", id: "tools" },
    { name: "Security", href: "/#security", id: "security" },
    { name: "Benefits", href: "/#benefits", id: "benefits" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("home");
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Scroll Spy Logic
    useEffect(() => {
        const handleScrollSpy = () => {
            const sections = ["tools", "security", "benefits"];
            const scrollY = window.scrollY;
            // Trigger point: Middle of the viewport
            const triggerPoint = scrollY + (window.innerHeight / 2);

            // Default to home
            let currentSection = "home";

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    if (element.offsetTop <= triggerPoint) {
                        currentSection = section;
                    }
                }
            }

            setActiveSection(currentSection);
        };

        window.addEventListener("scroll", handleScrollSpy);
        handleScrollSpy(); // Initial check

        return () => window.removeEventListener("scroll", handleScrollSpy);
    }, [location.pathname]);

    const isActive = (item: typeof navItems[0]) => {
        if (location.pathname !== "/") return location.pathname === item.href;
        return activeSection === item.id;
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-50 px-4 py-4 pointer-events-none">
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={cn(
                    "container mx-auto max-w-5xl rounded-full border transition-all duration-500 pointer-events-auto",
                    isScrolled
                        ? "bg-black/60 backdrop-blur-xl border-white/10 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                        : "bg-white/[0.02] backdrop-blur-sm border-white/5 py-3"
                )}
            >
                <div className="px-6 flex items-center justify-between">
                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] group-hover:scale-110 transition-transform">
                            <Zap size={20} className="fill-white" />
                        </div>
                        <span className="font-extrabold tracking-tighter text-xl text-white leading-none">
                            Utils<span className="text-primary">.</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const active = isActive(item);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={cn(
                                        "relative px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all overflow-hidden group",
                                        active ? "text-primary" : "text-white/50 hover:text-white"
                                    )}
                                >
                                    {active && (
                                        <motion.div
                                            layoutId="nav-bg"
                                            className="absolute inset-0 bg-primary/10 -z-10"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10">{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <a
                            href="https://sampreeth.in"
                            target="_blank"
                            rel="noreferrer"
                            className="hidden md:flex items-center gap-2 pr-4 border-r border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary transition-colors group"
                        >
                            <User size={14} className="group-hover:scale-110 transition-transform" />
                            Portfolio
                        </a>

                        <a
                            href="https://github.com/sam-sampreeth/portfolio-utils"
                            target="_blank"
                            rel="noreferrer"
                            className="hidden md:flex items-center gap-2 p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <Github size={16} />
                        </a>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden overflow-hidden"
                        >
                            <div className="px-6 py-8 flex flex-col gap-6 border-t border-white/5 mt-2">
                                {navItems.map((item) => {
                                    const Icon = item.id === "features" ? Zap : item.id === "security" ? Shield : item.id === "benefits" ? Sparkles : LayoutGrid;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                                    <Icon size={20} />
                                                </div>
                                                <span className="text-xl font-bold text-white group-hover:translate-x-2 transition-transform">
                                                    {item.name}
                                                </span>
                                            </div>
                                            <ArrowUpRight className="text-white/20 group-hover:text-primary transition-colors" />
                                        </Link>
                                    );
                                })}
                                {/* Mobile Portfolio Link */}
                                <a
                                    href="https://sampreeth.in"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between group border-t border-white/5 pt-6"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <User size={20} />
                                        </div>
                                        <span className="text-xl font-bold text-white">Main Portfolio</span>
                                    </div>
                                    <ArrowUpRight className="text-primary" />
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>
        </div>
    );
}
