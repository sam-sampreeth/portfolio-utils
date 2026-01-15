import {
    Clock,
    Monitor,
    FileText,
    Palette,
    Wrench,
    Type,
    Smile,
    Edit3,
    MousePointer2,
    Gamepad2,
    Speaker,
    Mic,
    Webcam,
    Square,
    Zap,
    Files,
    Scissors,
    FileDown,
    Image as ImageIcon,
    ShieldCheck,
    Sparkles,
    RefreshCw,
    Timer,
    Pipette,
    Layers,
    Box,
    FileCode,
    Terminal,
    Fingerprint,
    Hash,
    Binary,
    Coins,
    BookOpen,
    Eraser,
    Replace,
    PenTool,
    MoreHorizontal,
} from "lucide-react";


export interface Tool {
    id: string;
    name: string;
    desc: string;
    path: string;
    icon?: any;
    iconSize?: number;
}

export interface Category {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    tools: Tool[];
}

export const toolsConfig: Category[] = [
    {
        id: "time",
        title: "Time & Date",
        description: "Global clocks, stopwatch, and precision timers.",
        icon: Clock,
        color: "from-blue-500 to-cyan-500",
        tools: [
            { id: "clock", name: "Digital Clock", desc: "A clean digital clock with full-screen mode that syncs once and verifies system time accuracy locally.", path: "/time/clock", icon: Clock },
            { id: "stopwatch", name: "Stopwatch", desc: "A precise stopwatch with start, pause, stop, lap tracking, and reset controls for accurate time measurement.", path: "/time/stopwatch", icon: Timer },
            { id: "timer", name: "Timer", desc: "A flexible countdown timer with quick presets, custom durations, editable presets, and completion notifications.", path: "/time/timer", icon: Timer },
            { id: "pomodoro", name: "Pomodoro Timer", desc: "Focus sessions with customizable work and break intervals, distraction-free mode, and cycle tracking.", path: "/time/pomodoro", icon: Timer },
            { id: "converter", name: "Timezone Converter", desc: "Convert times across timezones in live or manual mode, including UTC/GMT event times, with clear offsets.", path: "/time/converter", icon: RefreshCw },
            { id: "calculator", name: "Date & Time Calculator", desc: "Add, subtract, or compare dates and times with clear duration breakdowns and precise calculations.", path: "/time/calculator", icon: Edit3 },
        ]
    },
    {
        id: "hardware",
        title: "Hardware & Device",
        description: "Verify your peripherals and display health.",
        icon: Monitor,
        color: "from-slate-500 to-slate-700",
        tools: [
            { id: "keyboard", name: "Keyboard Tester", desc: "Test your keyboard in real time to detect stuck keys, key rollover, and ghosting across Windows and Mac layouts", path: "/hardware/keyboard", icon: Type },
            { id: "mouse", name: "Mouse Tester", desc: "Buttons & scroll speed", path: "/hardware/mouse", icon: MousePointer2 },
            { id: "controller", name: "Controller Tester", desc: "Gamepad input check", path: "/hardware/controller", icon: Gamepad2 },
            { id: "speaker", name: "Speaker Tester", desc: "Precision Audio Lab with 3D spatial panning, frequency sweeps, and acoustic samples.", path: "/hardware/speaker", icon: Speaker },
            { id: "mic", name: "Microphone Tester", desc: "Professional Voice Studio with real-time spectral analysis, noise floor detection, and pro-level metering.", path: "/hardware/mic", icon: Mic },
            { id: "webcam", name: "Webcam Tester", desc: "Optical Diagnostic Lab with FPS tracking, resolution validation, and pro-grade flash calibration.", path: "/hardware/webcam", icon: Webcam },
            { id: "pixels", name: "Dead Pixel Checker", desc: "Chromatic Shield with pure spectral shifts, full-screen diagnostic mode, and interactive HUD.", path: "/hardware/pixels", icon: Square },
        ]
    },
    {
        id: "files",
        title: "File Tools",
        description: "Complete suite for PDF, Image, and Document manipulation.",
        icon: FileText,
        color: "from-emerald-500 to-teal-500",
        tools: [
            { id: "pdf-merge", name: "PDF Merge", desc: "Combine multiple PDFs", path: "/files/pdf-merge", icon: Files },
            { id: "pdf-split", name: "PDF Split", desc: "Extract PDF pages", path: "/files/pdf-split", icon: Scissors },
            { id: "pdf-compress", name: "PDF Compress", desc: "Reduce file size", path: "/files/pdf-compress", icon: FileDown },
            { id: "img-compress", name: "Image Compress", desc: "Optimize PNG/JPG/WEBP", path: "/files/img-compress", icon: ImageIcon },
            { id: "redact", name: "Redact Content", desc: "Sensitive info removal", path: "/files/redact", icon: ShieldCheck },
            { id: "converter", name: "Format Converter", desc: "Convert between popular types", path: "/files/converter", icon: RefreshCw },
        ]
    },
    {
        id: "frontend",
        title: "Frontend Helpers",
        description: "Design tools and CSS utilities.",
        icon: Palette,
        color: "from-orange-500 to-yellow-500",
        tools: [
            { id: "color", name: "Color Format Converter", desc: "Hex, RGB, HSL", path: "/frontend/color", icon: Pipette },
            { id: "gradient", name: "Gradient Generator", desc: "Visual CSS gradients", path: "/frontend/gradient", icon: Layers },
            { id: "shadow", name: "Box Shadow Gen", desc: "Neumorphic & glass shadows", path: "/frontend/shadow", icon: Box },
            { id: "units", name: "CSS Units Converter", desc: "PX, REM, EM, VW", path: "/frontend/units", icon: RefreshCw },
            { id: "image-picker", name: "Image Color Picker", desc: "Extract pixel colors", path: "/frontend/image-picker", icon: ImageIcon },
            { id: "svg", name: "SVG Viewer", desc: "Preview and optimize SVGs", path: "/frontend/svg", icon: ImageIcon },
        ]
    },
    {
        id: "dev",
        title: "Developer Tools",
        description: "Formatting, encoding, and data generation.",
        icon: Wrench,
        color: "from-purple-500 to-pink-500",
        tools: [
            { id: "json", name: "JSON Formatter", desc: "Validate and beautify", path: "/dev/json", icon: FileCode },
            { id: "beautifier", name: "Code Beautifier", desc: "Format JS/TS/CSS/HTML", path: "/dev/beautifier", icon: Sparkles },
            { id: "regex", name: "Regex Tester", desc: "Test expressions live", path: "/dev/regex", icon: Terminal },
            { id: "uuid", name: "UUID Generator", desc: "Bulk v4/v6 IDs", path: "/dev/uuid", icon: Fingerprint },
            { id: "hash", name: "Hash Generator", desc: "SHA, MD5, etc.", path: "/dev/hash", icon: Hash },
            { id: "base64", name: "Base64 Encoder", desc: "Convert binary data", path: "/dev/base64", icon: Binary },
            { id: "jwt", name: "JWT Decoder", desc: "Inspect tokens locally", path: "/dev/jwt", icon: Coins },
        ]
    },
    {
        id: "text",
        title: "Text Tools",
        description: "Content analysis and manipulation.",
        icon: Type,
        color: "from-rose-500 to-orange-500",
        tools: [
            { id: "counter", name: "Character Counter", desc: "Words, Lines, Paragraphs", path: "/text/counter", icon: Type },
            { id: "transformer", name: "Text Transformer", desc: "Case conversion & Styling", path: "/text/transformer", icon: Type },
            { id: "spaces", name: "Remove Extra Spaces", desc: "Clean up text", path: "/text/spaces", icon: Eraser },
            { id: "replace", name: "Find & Replace", desc: "Bulk text updates", path: "/text/replace", icon: Replace },
            { id: "lorem-ipsum", name: "Lorem Ipsum", desc: "Generate placeholder text", path: "/text/lorem-ipsum", icon: FileText },
        ]
    },
    {
        id: "emoji",
        title: "Emoji & Symbols",
        description: "Quick access to icons and special characters.",
        icon: Smile,
        color: "from-yellow-400 to-orange-500",
        tools: [
            { id: "picker", name: "Emoji Picker", desc: "Find emojis quickly", path: "/emoji/picker", icon: Smile },
            { id: "unicodes", name: "Unicode Symbols", desc: "Special characters", path: "/emoji/symbols", icon: Type },
        ]
    },
    {
        id: "notes",
        title: "Notes & Canvas",
        description: "Quick ideas and sketching tools.",
        icon: Edit3,
        color: "from-teal-400 to-emerald-600",
        tools: [
            { id: "notepad", name: "Quick Notepad", desc: "Persisted local notes", path: "/notes/notepad", icon: BookOpen },
            { id: "whiteboard", name: "Quick Whiteboard", desc: "Freehand sketching", path: "/notes/whiteboard", icon: PenTool },
        ]
    },
    {
        id: "others",
        title: "Other Utilities",
        description: "Miscellaneous tools and helpers.",
        icon: MoreHorizontal,
        color: "from-gray-500 to-slate-500",
        tools: [
            { id: "homepage", name: "OS-style Homepage", desc: "Custom tool dashboard", path: "/others/homepage", icon: Monitor },
            { id: "speedtest", name: "Network Speed Test", desc: "Download, Upload, Ping", path: "/others/speedtest", icon: Zap },
        ]
    }
];
