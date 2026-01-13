import { useParams, Link } from "react-router-dom";
import { toolsConfig } from "@/data/tools";
import { ChevronLeft, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// Import all tool components
import { DigitalClock } from "@/components/clock/DigitalClock";
import { Timers } from "@/components/clock/Timers";
import { Stopwatch } from "@/components/clock/Stopwatch";
import { TimezoneConverter } from "@/components/clock/TimezoneConverter";
import { DateCalculator } from "@/components/clock/DateCalculator";
import { Pomodoro } from "@/components/clock/Pomodoro";
import { HashGen } from "@/components/dev/HashGen";
import { Base64Tool } from "@/components/dev/Base64Tool";
import { JwtDecoder } from "@/components/dev/JwtDecoder";
import { CodeBeautifier } from "@/components/dev/CodeBeautifier";
import { QuickNotepad } from "@/components/dev/QuickNotepad";
import { ColorPicker } from "@/components/frontend/ColorPicker";
import { GradientGen } from "@/components/frontend/GradientGen";
import { ShadowGen } from "@/components/frontend/ShadowGen";
import { TypeTest } from "@/components/frontend/TypeTest";
import { KeyboardTester } from "@/components/hardware/KeyboardTester";
import { MouseTester } from "@/components/hardware/MouseTester";
import { ControllerTester } from "@/components/hardware/ControllerTester";
import { SpeakerTester } from "@/components/hardware/SpeakerTester";
import { MicTester } from "@/components/hardware/MicTester";
import { WebcamTester } from "@/components/hardware/WebcamTester";
import { DeadPixelTester } from "@/components/hardware/DeadPixelTester";

const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
    // Time tools
    "clock": DigitalClock,
    "timer": Timers,
    "stopwatch": Stopwatch,
    "converter": TimezoneConverter,
    "calculator": DateCalculator,
    "pomodoro": Pomodoro,

    // Hardware tools
    "keyboard": KeyboardTester,
    "mouse": MouseTester,
    "controller": ControllerTester,
    "speaker": SpeakerTester,
    "mic": MicTester,
    "webcam": WebcamTester,
    "pixels": DeadPixelTester,

    // Dev tools
    "hash": HashGen,
    "base64": Base64Tool,
    "jwt": JwtDecoder,
    "beautifier": CodeBeautifier,
    "json": CodeBeautifier, // Reusing for now

    // Frontend tools
    "color": ColorPicker,
    "gradient": GradientGen,
    "shadow": ShadowGen,
    "counter": TypeTest, // Mapping counter to typography test for now since it has word counts

    // Notes
    "notepad": QuickNotepad,
};

export default function ToolPage() {
    const { categoryId, toolId } = useParams<{ categoryId: string; toolId: string }>();

    const category = toolsConfig.find(c => c.id === categoryId);
    const tool = category?.tools.find(t => t.id === toolId);

    const Component = toolId ? TOOL_COMPONENTS[toolId] : null;

    if (!category || !tool) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4">Tool not found</h1>
                <Link to="/" className="text-primary hover:underline">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 pb-20">
            <div className="container mx-auto px-4">
                {/* Header / Breadcrumbs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30">
                            <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
                                <Home size={12} /> Home
                            </Link>
                            <span>/</span>
                            <Link to={`/category/${categoryId}`} className="hover:text-primary transition-colors">
                                {category.title}
                            </Link>
                            <span>/</span>
                            <span className="text-white/60">{tool.name}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                            {tool.name}
                        </h1>
                        <p className="text-lg text-white/50 max-w-2xl">
                            {tool.desc}
                        </p>
                    </div>

                    <Link
                        to={`/category/${categoryId}`}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all self-start md:self-center"
                    >
                        <ChevronLeft size={18} />
                        Back to {category.title}
                    </Link>
                </div>

                {/* Tool Area */}
                <div className="relative">
                    {/* Background glow for the tool */}
                    <div className={cn(
                        "absolute -inset-20 bg-gradient-to-tr opacity-10 blur-[100px] -z-10",
                        category.color
                    )} />

                    {Component ? (
                        <Component />
                    ) : (
                        <div className="p-20 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 rounded-[2rem] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-8 font-black text-3xl shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                                ?
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
                            <p className="text-muted-foreground max-w-sm">
                                We're working hard to bring {tool.name} to you. Check back shortly!
                            </p>
                            <Link to={`/category/${categoryId}`} className="mt-8 text-primary hover:underline font-bold text-xs uppercase tracking-wider cursor-pointer">
                                See other {category.title} tools
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
