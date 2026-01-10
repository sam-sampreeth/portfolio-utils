import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import FavoriteToggle from "@/components/FavoriteToggle";

export const HoverEffect = ({
    items,
    className,
    hoverColor,
}: {
    items: {
        title: string;
        description: string;
        link: string;
        id?: string;
        icon?: any;
        footerText?: string;
        iconSize?: number;
        color?: string;
    }[];
    className?: string;
    hoverColor?: string;
}) => {
    let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div
            className={cn(
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10 gap-4",
                className
            )}
        >
            {items.map((item, idx) => (
                <Link
                    to={item?.link}
                    key={item?.link}
                    className="relative group block p-2 h-full w-full"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <AnimatePresence>
                        {hoveredIndex === idx && (
                            <motion.span
                                className="absolute inset-0 h-full w-full bg-slate-800/[0.8] block rounded-3xl"
                                layoutId="hoverBackground"
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: 1,
                                    transition: { duration: 0.15 },
                                }}
                                exit={{
                                    opacity: 0,
                                    transition: { duration: 0.15, delay: 0.2 },
                                }}
                            />
                        )}
                    </AnimatePresence>
                    <Card>
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4 min-h-[28px]">
                                {item.icon ? (
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110",
                                        hoverColor || "bg-blue-500/10 border-blue-500/20 text-blue-400 group-hover:bg-blue-500/20 group-hover:border-blue-500/30",
                                        item.color
                                    )}>
                                        <item.icon size={item.iconSize || 24} />
                                    </div>
                                ) : <div />}
                                {item.id && (
                                    <div className="relative z-30">
                                        <FavoriteToggle toolId={item.id} />
                                    </div>
                                )}
                            </div>
                            <CardTitle>{item.title}</CardTitle>
                            <CardDescription>{item.description}</CardDescription>
                            {item.footerText && (
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mt-6">
                                    {item.footerText}
                                </div>
                            )}
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
};

export const Card = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "rounded-2xl h-full w-full p-4 overflow-hidden bg-[#0A0A0A] border border-white/[0.1] group-hover:border-slate-700 relative z-20 transition-all duration-500",
                className
            )}
        >
            <div className="relative z-50">
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
};

export const CardTitle = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <h4 className={cn("text-zinc-100 font-bold tracking-wide mt-4", className)}>
            {children}
        </h4>
    );
};

export const CardDescription = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <p
            className={cn(
                "mt-4 text-zinc-400 tracking-wide leading-relaxed text-sm",
                className
            )}
        >
            {children}
        </p>
    );
};
