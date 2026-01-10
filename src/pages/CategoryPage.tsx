import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { toolsConfig } from "@/data/tools";
import { HoverEffect } from "@/components/ui/CardHoverEffect";

export default function CategoryPage() {
    const { id } = useParams<{ id: string }>();

    const category = toolsConfig.find(cat => cat.id === id);

    if (!category) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Category not found</h2>
                    <Link to="/" className="text-primary hover:underline">Return to Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-4">
                {/* Breadcrumbs / Back */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12"
                >
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors group">
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

                {/* Tools Grid */}
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
            </div>
        </div>
    );
}
