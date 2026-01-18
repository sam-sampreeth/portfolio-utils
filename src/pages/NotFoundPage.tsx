import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { BackgroundBeams } from "@/components/ui/BackgroundBeams";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0a0a0a] selection:bg-blue-500/20">
            {/* Background decoration */}
            <BackgroundBeams />

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-blue-500/30 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-center gap-12 max-w-6xl">
                {/* SVG Illustration */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-md md:max-w-lg"
                >
                    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                        <defs>
                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                            </linearGradient>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="5" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* Constellations / Background Elements */}
                        <g className="animate-pulse" style={{ animationDuration: '3s' }}>
                            <circle cx="50" cy="50" r="2" fill="#fff" opacity="0.5" />
                            <circle cx="80" cy="120" r="1.5" fill="#fff" opacity="0.3" />
                            <circle cx="450" cy="80" r="2" fill="#fff" opacity="0.6" />
                            <circle cx="400" cy="400" r="1" fill="#fff" opacity="0.4" />
                        </g>

                        {/* Connected Nodes (Constellation) */}
                        <g stroke="#8b5cf6" strokeWidth="1" opacity="0.4">
                            <line x1="100" y1="100" x2="150" y2="150" />
                            <line x1="150" y1="150" x2="120" y2="200" />
                            <line x1="150" y1="150" x2="200" y2="120" />
                            <circle cx="100" cy="100" r="4" fill="#8b5cf6" />
                            <circle cx="150" cy="150" r="4" fill="#3b82f6" />
                            <circle cx="120" cy="200" r="4" fill="#8b5cf6" />
                            <circle cx="200" cy="120" r="4" fill="#3b82f6" />
                        </g>

                        {/* Planet/Moon in background */}
                        <circle cx="400" cy="100" r="30" fill="url(#grad1)" opacity="0.2" />
                        <path d="M 380 90 Q 420 80 440 120" stroke="white" strokeWidth="1" fill="none" opacity="0.3" />

                        {/* Portal / Doorway */}
                        <g transform="translate(250, 250)">
                            <path d="M 50 0 L 50 150 L -50 150 L -50 0 A 50 25 0 0 1 50 0" fill="#18181b" stroke="url(#grad1)" strokeWidth="3" />
                            <ellipse cx="0" cy="0" rx="50" ry="25" fill="#18181b" stroke="url(#grad1)" strokeWidth="3" />
                            <circle cx="40" cy="75" r="5" fill="#3b82f6" />

                            {/* Light spill from doorway */}
                            <path d="M -50 150 L -150 250 L 150 250 L 50 150" fill="url(#grad1)" opacity="0.3" />
                        </g>

                        {/* Astronaut Figure */}
                        <g transform="translate(180, 280)">
                            {/* Legs */}
                            <path d="M 0 0 L -10 40 L -20 80 L -10 90" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M 0 0 L 10 40 L 20 80 L 30 90" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Body */}
                            <path d="M -15 -40 L 15 -40 L 20 10 L -20 10 Z" fill="#18181b" stroke="white" strokeWidth="3" />
                            <path d="M 0 -40 L 0 10" stroke="white" strokeWidth="1" opacity="0.5" />

                            {/* Head/Helmet */}
                            <circle cx="0" cy="-55" r="15" fill="#18181b" stroke="white" strokeWidth="3" />
                            <path d="M -8 -55 Q 0 -65 8 -55" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.8" />

                            {/* Arms */}
                            <path d="M -15 -35 L -30 -10 L -30 10" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M 15 -35 L 30 -10 L 30 10" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </g>

                    </svg>
                </motion.div>

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-xl text-center md:text-left"
                >
                    <h1 className="text-8xl md:text-9xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 relative inline-block">
                        404
                        <span className="absolute -top-4 -right-8 w-12 h-12 text-blue-500 animate-spin-slow opacity-80">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" style={{ strokeDasharray: '4 4' }} />
                            </svg>
                        </span>
                    </h1>

                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
                        Lost in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Void?</span>
                    </h2>

                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                        The page you're seeking seems to have drifted into unknown space.
                        While we investigate the coordinates, let's get you back on course.
                    </p>

                    <button
                        onClick={() => navigate('/')}
                        className="group relative inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-full font-bold transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                    >
                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        Return to Home Base
                    </button>

                </motion.div>
            </div>
        </div>
    );
}
