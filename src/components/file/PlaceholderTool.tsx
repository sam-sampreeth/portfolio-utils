import { ArrowLeft, Clock, Construction } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PlaceholderToolProps {
    title: string;
    description: string;
}

export function PlaceholderTool({ title, description }: PlaceholderToolProps) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8 p-4">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-white/5 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5 blur-xl" />
                <Construction className="w-10 h-10 text-blue-400 relative z-10" />
            </div>

            <div className="space-y-4 max-w-md">
                <h1 className="text-3xl font-black uppercase tracking-tight text-white">
                    {title}
                </h1>
                <p className="text-white/40 leading-relaxed font-medium">
                    {description}
                </p>
            </div>

            <div className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/10 max-w-sm w-full">
                <div className="flex items-center gap-3 text-orange-400 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-bold uppercase tracking-widest text-xs">Coming Soon</span>
                </div>
                <p className="text-[10px] text-orange-300/60 font-medium leading-relaxed text-left">
                    We're working hard to bring you high-quality client-side conversion for this format. Stay tuned for updates!
                </p>
            </div>

            <Button asChild variant="ghost" className="text-white/40 hover:text-white uppercase tracking-widest text-xs font-bold">
                <Link to="/files">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tools
                </Link>
            </Button>
        </div>
    );
}
