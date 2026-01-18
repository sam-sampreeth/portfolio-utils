import { useParams, Link } from "react-router-dom";
import { toolsConfig } from "@/data/tools";
import { ChevronLeft, Home } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useHomepageState } from "@/hooks/useHomepageState";

// Import all tool components
import { DigitalClock } from "@/components/clock/DigitalClock";
import { Timers } from "@/components/clock/Timers";
import { Stopwatch } from "@/components/clock/Stopwatch";
import { TimezoneConverter } from "@/components/clock/TimezoneConverter";
import { DateCalculator } from "@/components/clock/DateCalculator";
import { Pomodoro } from "@/components/clock/Pomodoro";
import { Generators } from "@/components/dev/Generators";
import { Base64Tool } from "@/components/dev/Base64Tool";
import { JwtTool } from "@/components/dev/JwtTool";
import { CodeBeautifier } from "@/components/dev/CodeBeautifier";
import { JsonFormatter } from "@/components/dev/JsonFormatter";
import { RegexTester } from "@/components/dev/RegexTester";
import ScientificCalculator from "@/components/others/ScientificCalculator";
import TemperatureConverter from "@/components/others/TemperatureConverter";
import { QuickNotepad } from "@/components/notes/QuickNotepad";


import { ColorPicker } from "@/components/frontend/ColorPicker";
import { UIVisualizer } from "@/components/frontend/UIVisualizer";
import { GradientGen } from "@/components/frontend/GradientGen";
import { ShadowGen } from "@/components/frontend/ShadowGen";
import { KeyboardTester } from "@/components/hardware/KeyboardTester";
import { MouseTester } from "@/components/hardware/MouseTester";
import { ControllerTester } from "@/components/hardware/ControllerTester";
import { SpeakerTester } from "@/components/hardware/SpeakerTester";
import { MicTester } from "@/components/hardware/MicTester";
import { WebcamTester } from "@/components/hardware/WebcamTester";
import { DeadPixelTester } from "@/components/hardware/DeadPixelTester";
import { SpeedTest } from "@/components/network/SpeedTest";
import { OsHomepage } from "@/components/frontend/homepage/OsHomepage";

import { CssUnitsConverter } from "@/components/frontend/CssUnitsConverter";
import { SvgViewer } from "@/components/frontend/SvgViewer";
import { ImageColorPicker } from "@/components/frontend/ImageColorPicker";
import { TextCounter } from "@/components/frontend/TextCounter";
import { TextTransformer } from "@/components/frontend/TextTransformer";
import { QuickWhiteboard } from "@/components/notes/QuickWhiteboard";
import { RemoveSpaces } from "@/components/text/RemoveSpaces";
import { FindReplace } from "@/components/text/FindReplace";
import { LoremGenerator } from "@/components/text/LoremGenerator";

import { EmojiPicker } from "@/components/emoji/EmojiPicker";
import { UnicodeSymbols } from "@/components/emoji/UnicodeSymbols";

import { FileConverter } from "@/components/file/FileConverter";
import { ImageCompress } from "@/components/image/ImageCompress";
import { ImageResize } from "@/components/image/ImageResize";
import { ImageRotate } from "@/components/image/ImageRotate";
import { ImageConverter } from "@/components/image/ImageConverter";
import { ZipManager } from "@/components/file/ZipManager";
import { FileHash } from "@/components/file/FileHash";
import { FileMetadata } from "@/components/file/FileMetadata";
import { FileCheck } from "@/components/file/FileCheck";
import { TextExtract } from "@/components/file/TextExtract";
import { ImageCrop } from "@/components/image/ImageCrop";
import { PdfMerge } from "@/components/file/PdfMerge";
import { PdfSplit } from "@/components/file/PdfSplit";
import { PdfOrganize } from "@/components/file/PdfOrganize";
import { PdfPassword } from "@/components/file/PdfPassword";

import { PdfCompress } from "@/components/file/PdfCompress";
import { PdfExtractImages } from "@/components/file/PdfExtractImages";

import { PdfToWord } from "@/components/file/PdfToWord";
import { PdfToPpt } from "@/components/file/PdfToPpt";
import { PdfToExcel } from "@/components/file/PdfToExcel";

import { WordToPdf } from "@/components/file/WordToPdf";
import { WordCompress } from "@/components/file/WordCompress";
import { WordExtract } from "@/components/file/WordExtract";
import { WordMerge } from "@/components/file/WordMerge";
import { PptToPdf } from "@/components/file/PptToPdf";
import { PptCompress } from "@/components/file/PptCompress";
import { PptMerge } from "@/components/file/PptMerge";
import { PptExportImages } from "@/components/file/PptExportImages";

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
    "scientific-calculator": ScientificCalculator,
    "temperature-converter": TemperatureConverter,
    "generators": Generators,
    "base64": Base64Tool,
    "jwt": JwtTool,
    "beautifier": CodeBeautifier,
    "json": JsonFormatter,
    "regex": RegexTester,



    // Frontend tools
    "ui-visualizer": UIVisualizer,
    "color": ColorPicker,
    "gradient": GradientGen,
    "shadow": ShadowGen,
    "units": CssUnitsConverter,
    "image-picker": ImageColorPicker,
    "svg": SvgViewer,
    "counter": TextCounter,
    "transformer": TextTransformer,
    "homepage": OsHomepage,

    // Network tools
    "speedtest": SpeedTest,

    // Notes
    "notepad": QuickNotepad,
    "whiteboard": QuickWhiteboard,
    "spaces": RemoveSpaces,
    "replace": FindReplace,
    "lorem-ipsum": LoremGenerator,

    // Files
    "file-converter": FileConverter,
    "img-compress": ImageCompress,
    "img-resize": ImageResize,
    "img-rotate": ImageRotate,
    "img-crop": ImageCrop,
    "img-converter": ImageConverter,
    "zip-manager": ZipManager,
    "file-hash": FileHash,
    "file-metadata": FileMetadata,
    "file-check": FileCheck,
    "text-extract": TextExtract,
    "pdf-merge": PdfMerge,
    "pdf-split": PdfSplit,
    "pdf-organize": PdfOrganize,
    "pdf-password": PdfPassword,
    "pdf-compress": PdfCompress,
    "pdf-extract-images": PdfExtractImages,
    "pdf-to-word": PdfToWord,
    "pdf-to-ppt": PdfToPpt,
    "pdf-to-excel": PdfToExcel,

    // Word Tools
    "word-to-pdf": WordToPdf,
    "word-compress": WordCompress,
    "word-extract": WordExtract,
    'word-merge': WordMerge,
    'ppt-to-pdf': PptToPdf,
    'ppt-compress': PptCompress,
    'ppt-merge': PptMerge,
    'ppt-export': PptExportImages,

    // Emoji & Symbols
    "picker": EmojiPicker,
    "unicodes": UnicodeSymbols,
};

export default function ToolPage() {
    const { categoryId, toolId } = useParams<{ categoryId: string; toolId: string }>();
    // const { state } = useHomepageState();

    const category = toolsConfig.find(c => c.id === categoryId);
    const tool = category?.tools.find(t => t.id === toolId);

    const Component = toolId ? TOOL_COMPONENTS[toolId] : null;

    // const theme = themeConfigs[currentTheme];

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
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 relative z-50">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30">
                            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
                                <Home size={12} /> Home
                            </Link>
                            <span>/</span>
                            <Link to={`/category/${categoryId}`} className="hover:text-white transition-colors">
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
                        {tool.id === "clock" && (
                            <p className="text-xs text-blue-200/50 font-medium pt-2">
                                Want to compare time live? Visit <Link to="/time/converter" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">Timezone Converter</Link>
                            </p>
                        )}
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
                    {/* Tool Component */}
                    <div className="relative z-10">
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
        </div>
    );
}
