import { Link } from "react-router-dom";
import { toolsConfig } from "@/data/tools";
import { Zap, Github, User, Mail, ArrowUpRight } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="border-t border-white/10 bg-black/20 backdrop-blur-xl relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
                    {/* Brand Column */}
                    {/* Brand Column */}
                    <div className="col-span-1">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold transform group-hover:rotate-12 transition-transform">
                                <Zap size={18} fill="currentColor" />
                            </div>
                            <span className="text-xl font-black tracking-tight">Utils.</span>
                        </Link>
                        <p className="text-muted-foreground leading-relaxed mb-8 text-sm">
                            A privacy-first collection of essential web utilities.
                            Built for developers who value speed.
                        </p>
                        <div className="flex items-center gap-4">
                            <a
                                href="https://github.com/sam-sampreeth/portfolio-utils"
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/60 hover:text-white"
                            >
                                <Github size={20} />
                            </a>
                            <a
                                href="https://sampreeth.in"
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/60 hover:text-white"
                            >
                                <User size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Community Column */}
                    <div>
                        <h3 className="font-bold text-white mb-6">Community</h3>
                        <ul className="space-y-4">
                            <li>
                                <a href="https://github.com/sam-sampreeth/portfolio-utils/issues" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-white transition-colors text-sm">
                                    Report an Issue
                                </a>
                            </li>
                            <li>
                                <a href="https://github.com/sam-sampreeth/portfolio-utils/discussions" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-white transition-colors text-sm">
                                    Request Feature
                                </a>
                            </li>
                            <li>
                                <Link to="/category/dev" className="text-muted-foreground hover:text-white transition-colors text-sm">
                                    For Developers
                                </Link>
                            </li>
                            <li>
                                <a href="https://github.com/sam-sampreeth/portfolio-utils" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-white transition-colors text-sm">
                                    Source Code
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Categories Column */}
                    {/* Essentials Column */}
                    <div>
                        <h3 className="font-bold text-white mb-6">Essentials</h3>
                        <ul className="space-y-4">
                            {toolsConfig.slice(0, Math.ceil(toolsConfig.length / 2)).map((cat) => (
                                <li key={cat.id}>
                                    <Link
                                        to={`/category/${cat.id}`}
                                        className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2 group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-primary transition-colors shrink-0" />
                                        <span className="truncate">{cat.title}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Toolkit Column */}
                    <div>
                        <h3 className="font-bold text-white mb-6">Toolkit</h3>
                        <ul className="space-y-4">
                            {toolsConfig.slice(Math.ceil(toolsConfig.length / 2)).map((cat) => (
                                <li key={cat.id}>
                                    <Link
                                        to={`/category/${cat.id}`}
                                        className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2 group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-primary transition-colors shrink-0" />
                                        <span className="truncate">{cat.title}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>


                    {/* Creator Column */}
                    <div>
                        <h3 className="font-bold text-white mb-6">Creator</h3>
                        <ul className="space-y-4">
                            <li>
                                <a
                                    href="https://sampreeth.in"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-muted-foreground hover:text-white transition-colors text-sm flex items-center gap-2 group"
                                >
                                    Portfolio
                                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://sampreeth.in/#contact"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-muted-foreground hover:text-white transition-colors text-sm flex items-center gap-2"
                                >
                                    Contact Me
                                </a>
                            </li>
                            <li className="pt-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Email</div>
                                    <a href="mailto:hello@sampreeth.in" className="text-sm font-medium text-white hover:text-primary transition-colors flex items-center gap-2">
                                        <Mail size={14} />
                                        hello@sampreeth.in
                                    </a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} Sampreeth. All rights reserved.</p>
                    <div className="flex items-center gap-8 font-medium">
                        <span>Privacy First</span>
                        <span>Open Source</span>
                        <span>No Cookies</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
